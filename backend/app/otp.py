import secrets
from datetime import datetime, timedelta, timezone

from sqlalchemy import select
from sqlalchemy.orm import Session

from . import models
from .config import get_settings

settings = get_settings()


def generate_otp_code() -> str:
    """6-digit numeric OTP, e.g. '042817'. Uses secrets for unpredictability."""
    return f"{secrets.randbelow(1_000_000):06d}"


def create_otp(db: Session, user: models.User, purpose: models.OtpPurpose) -> models.OtpCode:
    """
    Invalidates any previous unconsumed OTPs of the same purpose for this user,
    then creates and returns a fresh one. Caller is responsible for commit().
    """
    db.query(models.OtpCode).filter(
        models.OtpCode.user_id == user.id,
        models.OtpCode.purpose == purpose,
        models.OtpCode.consumed.is_(False),
    ).update({"consumed": True})

    otp = models.OtpCode(
        user_id=user.id,
        code=generate_otp_code(),
        purpose=purpose,
        expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.otp_expire_minutes),
    )
    db.add(otp)
    db.flush()
    return otp


def get_latest_otp(db: Session, user: models.User, purpose: models.OtpPurpose) -> models.OtpCode | None:
    return db.scalar(
        select(models.OtpCode)
        .where(
            models.OtpCode.user_id == user.id,
            models.OtpCode.purpose == purpose,
            models.OtpCode.consumed.is_(False),
        )
        .order_by(models.OtpCode.created_at.desc())
    )


def _as_aware_utc(dt: datetime) -> datetime:
    """Some DB backends (e.g. SQLite, used for local testing) return naive
    datetimes even though the column is timezone-aware. Normalize so
    comparisons against datetime.now(timezone.utc) never crash."""
    if dt.tzinfo is None:
        return dt.replace(tzinfo=timezone.utc)
    return dt


def verify_otp(db: Session, user: models.User, purpose: models.OtpPurpose, code: str) -> bool:
    """Checks the code against the latest unconsumed OTP. Consumes it on success."""
    otp = get_latest_otp(db, user, purpose)
    if not otp:
        return False
    if _as_aware_utc(otp.expires_at) < datetime.now(timezone.utc):
        return False
    if not secrets.compare_digest(otp.code, code.strip()):
        return False

    otp.consumed = True
    db.flush()
    return True
