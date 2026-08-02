from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user
from ..email_service import EmailSendError, send_otp_email
from ..otp import create_otp, verify_otp
from ..security import create_access_token, hash_password, verify_password
from ..seed_data import seed_new_user

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.MessageResponse, status_code=status.HTTP_201_CREATED)
async def signup(payload: schemas.SignupRequest, db: Session = Depends(get_db)):
    email = payload.email.lower()
    existing = db.scalar(select(models.User).where(models.User.email == email))

    if existing and existing.is_verified:
        raise HTTPException(status_code=400, detail="An account with this email already exists.")

    if existing and not existing.is_verified:
        # Re-signup attempt before verifying — just refresh their details/OTP.
        existing.name = payload.name.strip()
        existing.hashed_password = hash_password(payload.password)
        user = existing
    else:
        user = models.User(
            name=payload.name.strip(),
            email=email,
            hashed_password=hash_password(payload.password),
            is_verified=False,
        )
        db.add(user)
        db.flush()
        seed_new_user(db, user)

    otp = create_otp(db, user, models.OtpPurpose.signup)

    try:
        await send_otp_email(user.email, otp.code, purpose="signup")
    except EmailSendError as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    db.commit()
    return schemas.MessageResponse(message="We've emailed you a 6-digit code.", email=user.email)


@router.post("/verify-signup-otp", response_model=schemas.TokenResponse)
def verify_signup_otp(payload: schemas.VerifyOtpRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))
    if not user or user.is_verified:
        raise HTTPException(status_code=400, detail="Invalid request.")

    if not verify_otp(db, user, models.OtpPurpose.signup, payload.code):
        raise HTTPException(status_code=400, detail="That code is invalid or has expired.")

    user.is_verified = True
    db.commit()
    db.refresh(user)

    token = create_access_token(subject=user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/resend-otp", response_model=schemas.MessageResponse)
async def resend_signup_otp(payload: schemas.ResendOtpRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))
    if not user or user.is_verified:
        # Don't reveal whether the account exists/is verified.
        return schemas.MessageResponse(message="If that account needs verifying, a new code was sent.", email=payload.email)

    otp = create_otp(db, user, models.OtpPurpose.signup)
    try:
        await send_otp_email(user.email, otp.code, purpose="signup")
    except EmailSendError as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    db.commit()
    return schemas.MessageResponse(message="A new code has been sent.", email=user.email)


@router.post("/login", response_model=schemas.TokenResponse)
def login(payload: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect email or password.")

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Please verify your email before logging in.")

    token = create_access_token(subject=user.id)
    return schemas.TokenResponse(access_token=token, user=schemas.UserOut.model_validate(user))


@router.post("/forgot-password", response_model=schemas.MessageResponse)
async def forgot_password(payload: schemas.ForgotPasswordRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))

    # Always respond the same way whether or not the account exists, so
    # this endpoint can't be used to check which emails are registered.
    generic_message = schemas.MessageResponse(
        message="If an account with that email exists, we've sent a reset code.",
        email=payload.email,
    )

    if not user or not user.is_verified:
        return generic_message

    otp = create_otp(db, user, models.OtpPurpose.password_reset)
    try:
        await send_otp_email(user.email, otp.code, purpose="password_reset")
    except EmailSendError as exc:
        db.rollback()
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    db.commit()
    return generic_message


@router.post("/reset-password", response_model=schemas.MessageResponse)
def reset_password(payload: schemas.ResetPasswordRequest, db: Session = Depends(get_db)):
    user = db.scalar(select(models.User).where(models.User.email == payload.email.lower()))
    if not user:
        raise HTTPException(status_code=400, detail="That code is invalid or has expired.")

    if not verify_otp(db, user, models.OtpPurpose.password_reset, payload.code):
        raise HTTPException(status_code=400, detail="That code is invalid or has expired.")

    user.hashed_password = hash_password(payload.new_password)
    db.commit()

    return schemas.MessageResponse(message="Your password has been reset. You can log in now.", email=user.email)


@router.get("/me", response_model=schemas.UserOut)
def me(current_user: models.User = Depends(get_current_user)):
    return current_user


@router.patch("/me", response_model=schemas.UserOut)
def update_me(
    payload: schemas.UserUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    current_user.name = payload.name.strip()
    db.commit()
    db.refresh(current_user)
    return current_user
