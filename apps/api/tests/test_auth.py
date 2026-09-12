from types import SimpleNamespace
from typing import cast

import pytest
from argon2 import PasswordHasher
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app.auth import get_current_user
from app.config import Settings, get_settings
from app.routes import router

PASSWORD = "correct-password"


def make_client() -> TestClient:
    settings = SimpleNamespace(
        environment="production",
        app_auth_username="capacity-admin",
        app_auth_password_hash=PasswordHasher().hash(PASSWORD),
        frontend_origin="http://localhost:3000",
    )
    application = FastAPI()
    application.add_middleware(
        CORSMiddleware,
        allow_origins=[settings.frontend_origin],
        allow_credentials=True,
        allow_methods=["GET", "OPTIONS"],
        allow_headers=["Authorization", "Content-Type"],
    )
    application.include_router(router)
    application.dependency_overrides[get_settings] = lambda: settings
    return TestClient(application)


def test_auth_verify_requires_basic_credentials_and_returns_chapter_lead() -> None:
    with make_client() as client:
        missing = client.get("/api/v1/auth/verify")
        invalid = client.get("/api/v1/auth/verify", auth=("capacity-admin", "wrong-password"))
        valid = client.get(
            "/api/v1/auth/verify",
            auth=("capacity-admin", PASSWORD),
            headers={"X-User-Role": "Miembro de Equipo"},
        )

    assert missing.status_code == 401
    assert missing.headers["www-authenticate"] == "Basic"
    assert invalid.status_code == 401
    assert valid.status_code == 200
    assert valid.json() == {"user_id": "capacity-admin", "role": "Chapter Lead"}


def test_cors_allows_only_configured_frontend_origin() -> None:
    with make_client() as client:
        allowed = client.options(
            "/api/v1/auth/verify",
            headers={
                "Origin": "http://localhost:3000",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )
        denied = client.options(
            "/api/v1/auth/verify",
            headers={
                "Origin": "https://untrusted.example",
                "Access-Control-Request-Method": "GET",
                "Access-Control-Request-Headers": "Authorization",
            },
        )

    assert allowed.status_code == 200
    assert allowed.headers["access-control-allow-origin"] == "http://localhost:3000"
    assert "access-control-allow-origin" not in denied.headers


def test_production_settings_require_authentication_variables(monkeypatch: pytest.MonkeyPatch) -> None:
    monkeypatch.setenv("DATABASE_URL", "postgresql://user:password@localhost:5432/postgres")
    monkeypatch.setenv("ENVIRONMENT", "production")
    monkeypatch.delenv("APP_AUTH_USERNAME", raising=False)
    monkeypatch.delenv("APP_AUTH_PASSWORD_HASH", raising=False)

    with pytest.raises(RuntimeError, match="APP_AUTH_USERNAME.*APP_AUTH_PASSWORD_HASH"):
        Settings()


def test_development_mode_does_not_use_production_basic_credentials() -> None:
    request = type("Request", (), {"headers": {"X-User-Role": "Chapter Lead"}})()
    settings = cast(
        Settings,
        SimpleNamespace(environment="development", app_auth_username="", app_auth_password_hash=""),
    )

    import asyncio

    user = asyncio.run(get_current_user(request, credentials=None, settings=settings))

    assert user.user_id == "local-user"
    assert user.role == "Chapter Lead"
