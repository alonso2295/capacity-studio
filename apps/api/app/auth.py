from __future__ import annotations

import base64
import hashlib
import hmac
import json
import time

from fastapi import Depends, Header, HTTPException, Request, status

from .config import Settings, get_settings
from .schemas import CurrentUser


def _decode_hs256(token: str, secret: str) -> dict:
    parts = token.split(".")
    if len(parts) != 3:
        raise ValueError("Formato de token inválido")
    header_segment, payload_segment, signature_segment = parts

    def decode_segment(segment: str) -> bytes:
        return base64.urlsafe_b64decode(segment + "=" * (-len(segment) % 4))

    header = json.loads(decode_segment(header_segment))
    if header.get("alg") != "HS256":
        raise ValueError("Algoritmo no soportado")
    expected = hmac.new(
        secret.encode(),
        f"{header_segment}.{payload_segment}".encode(),
        hashlib.sha256,
    ).digest()
    if not hmac.compare_digest(expected, decode_segment(signature_segment)):
        raise ValueError("Firma inválida")
    payload = json.loads(decode_segment(payload_segment))
    if payload.get("exp") and payload["exp"] < time.time():
        raise ValueError("Token expirado")
    return payload


async def get_current_user(
    request: Request,
    authorization: str | None = Header(default=None),
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    # El bypass local es únicamente para desarrollo; producción exige JWT.
    dev_role = request.headers.get("X-User-Role")
    if settings.environment != "production":
        return CurrentUser(user_id="local-user", role=dev_role or "Chapter Lead")

    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autenticación requerida")
    if not settings.supabase_jwt_secret:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Autenticación no configurada")
    try:
        payload = _decode_hs256(authorization.removeprefix("Bearer ").strip(), settings.supabase_jwt_secret)
    except (ValueError, json.JSONDecodeError, KeyError, TypeError):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Token inválido") from None

    role = payload.get("app_metadata", {}).get("role") or payload.get("role")
    if not role:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="El usuario no tiene un rol asignado")
    return CurrentUser(user_id=str(payload.get("sub", "")), role=role)


async def require_chapter_lead(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "Chapter Lead":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere el rol Chapter Lead")
    return user
