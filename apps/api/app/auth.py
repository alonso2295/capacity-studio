from __future__ import annotations

import secrets

from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError
from fastapi import Depends, HTTPException, Request, status
from fastapi.security import HTTPBasic, HTTPBasicCredentials

from .config import Settings, get_settings
from .schemas import CurrentUser

basic_security = HTTPBasic(auto_error=False)
password_hasher = PasswordHasher()


def _authentication_error() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Autenticacion requerida",
        headers={"WWW-Authenticate": "Basic"},
    )


def _is_valid_credential(credentials: HTTPBasicCredentials, settings: Settings) -> bool:
    username_matches = secrets.compare_digest(credentials.username, settings.app_auth_username)
    if not username_matches:
        return False
    try:
        return password_hasher.verify(settings.app_auth_password_hash, credentials.password)
    except (VerifyMismatchError, VerificationError):
        return False


async def get_current_user(
    request: Request,
    credentials: HTTPBasicCredentials | None = Depends(basic_security),
    settings: Settings = Depends(get_settings),
) -> CurrentUser:
    if settings.environment != "production":
        # Solo desarrollo: permite levantar el prototipo sin configurar secretos.
        # X-User-Role nunca se consulta en produccion.
        dev_role = request.headers.get("X-User-Role")
        return CurrentUser(user_id="local-user", role=dev_role or "Chapter Lead")

    if credentials is None or not _is_valid_credential(credentials, settings):
        raise _authentication_error()

    return CurrentUser(user_id=settings.app_auth_username, role="Chapter Lead")


async def require_chapter_lead(user: CurrentUser = Depends(get_current_user)) -> CurrentUser:
    if user.role != "Chapter Lead":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Se requiere el rol Chapter Lead")
    return user
