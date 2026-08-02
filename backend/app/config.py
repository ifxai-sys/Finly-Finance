from functools import lru_cache

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """
    All configuration lives here and is read from environment variables
    (or a .env file in the backend/ folder — see .env.example).
    """

    # --- Postgres ---
    database_url: str = "postgresql+psycopg2://finance:finance@localhost:5432/finance_tracker"

    # --- JWT ---
    # Generate a real one with: python -c "import secrets; print(secrets.token_hex(32))"
    jwt_secret_key: str = "change-me-to-a-long-random-string"
    jwt_algorithm: str = "HS256"
    jwt_expires_minutes: int = 60 * 24 * 7  # 7 days — token is stored client-side (localStorage)

    # --- CORS ---
    # Comma-separated list of origins allowed to call this API.
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    # --- Upstream public APIs (proxied so the frontend never calls them directly) ---
    coingecko_base_url: str = "https://api.coingecko.com/api/v3"
    frankfurter_base_url: str = "https://api.frankfurter.dev/v1"
    finnhub_base_url: str = "https://finnhub.io/api/v1"

    # Get a free key at https://finnhub.io/register (no credit card required).
    # Kept server-side only so it never has to be shipped to the browser.
    finnhub_api_key: str = ""

    # --- Gmail API (OAuth2) — used to send OTP emails for signup & password reset ---
    # See backend/README.md "Gmail OTP setup" for how to get these values.
    gmail_client_id: str = ""
    gmail_client_secret: str = ""
    gmail_refresh_token: str = ""
    gmail_sender_email: str = ""

    # --- OTP settings ---
    otp_expire_minutes: int = 10
    otp_resend_cooldown_seconds: int = 60

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


@lru_cache
def get_settings() -> Settings:
    return Settings()
