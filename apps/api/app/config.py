from functools import lru_cache
from os import getenv

from dotenv import load_dotenv
from sqlalchemy.engine import URL

load_dotenv()


class Settings:
    def __init__(self) -> None:
        explicit_database_url = getenv("DATABASE_URL")
        if explicit_database_url:
            if not explicit_database_url.startswith(("postgresql://", "postgresql+psycopg://")):
                raise RuntimeError("DATABASE_URL debe apuntar a PostgreSQL de Supabase; SQLite no está permitido")
            self.database_url = explicit_database_url
        elif getenv("SUPABASE_DB_HOST"):
            required = ("SUPABASE_DB_USER", "SUPABASE_DB_PASSWORD", "SUPABASE_DB_NAME")
            missing = [name for name in required if not getenv(name)]
            if missing:
                raise RuntimeError(f"Faltan variables obligatorias de Supabase: {', '.join(missing)}")
            self.database_url = URL.create(
                drivername="postgresql+psycopg",
                username=getenv("SUPABASE_DB_USER", "postgres"),
                password=getenv("SUPABASE_DB_PASSWORD", ""),
                host=getenv("SUPABASE_DB_HOST"),
                port=int(getenv("SUPABASE_DB_PORT", "5432")),
                database=getenv("SUPABASE_DB_NAME", "postgres"),
            ).render_as_string(hide_password=False)
        else:
            raise RuntimeError("La configuración de Supabase es obligatoria; no se permite usar SQLite")
        self.environment = getenv("ENVIRONMENT", "development")
        self.frontend_origin = getenv("FRONTEND_ORIGIN", "http://localhost:3000")
        self.app_auth_username = getenv("APP_AUTH_USERNAME", "")
        self.app_auth_password_hash = getenv("APP_AUTH_PASSWORD_HASH", "")
        if self.environment == "production":
            missing = [
                name
                for name, value in (
                    ("APP_AUTH_USERNAME", self.app_auth_username),
                    ("APP_AUTH_PASSWORD_HASH", self.app_auth_password_hash),
                )
                if not value
            ]
            if missing:
                raise RuntimeError(
                    "Faltan variables obligatorias de autenticacion en produccion: " + ", ".join(missing)
                )


@lru_cache
def get_settings() -> Settings:
    return Settings()
