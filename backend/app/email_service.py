"""
Sends transactional emails (OTP codes) through the Gmail API using OAuth2.

Why Gmail API + OAuth2 instead of plain SMTP:
- Render's free tier blocks outbound SMTP ports (25/465/587), so a normal
  smtplib connection will just hang / time out there.
- Gmail API calls go over regular HTTPS (443), which isn't blocked.
- A refresh token (obtained once, offline) is exchanged for a short-lived
  access token on every send — no password stored anywhere.

See backend/README.md → "Gmail OTP setup" for how to generate
GMAIL_CLIENT_ID / GMAIL_CLIENT_SECRET / GMAIL_REFRESH_TOKEN.
"""

import base64
from email.mime.text import MIMEText

import httpx

from .config import get_settings

settings = get_settings()

_TOKEN_URL = "https://oauth2.googleapis.com/token"
_SEND_URL = "https://gmail.googleapis.com/gmail/v1/users/me/messages/send"


class EmailSendError(Exception):
    pass


async def _get_access_token() -> str:
    if not (settings.gmail_client_id and settings.gmail_client_secret and settings.gmail_refresh_token):
        raise EmailSendError(
            "Gmail API isn't configured yet — set GMAIL_CLIENT_ID, GMAIL_CLIENT_SECRET, "
            "GMAIL_REFRESH_TOKEN and GMAIL_SENDER_EMAIL in backend/.env (see README)."
        )

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(
            _TOKEN_URL,
            data={
                "client_id": settings.gmail_client_id,
                "client_secret": settings.gmail_client_secret,
                "refresh_token": settings.gmail_refresh_token,
                "grant_type": "refresh_token",
            },
        )
    if res.status_code != 200:
        raise EmailSendError(f"Failed to refresh Gmail access token: {res.text}")

    return res.json()["access_token"]


def _build_raw_message(to: str, subject: str, body: str) -> str:
    message = MIMEText(body)
    message["to"] = to
    message["from"] = settings.gmail_sender_email
    message["subject"] = subject
    return base64.urlsafe_b64encode(message.as_bytes()).decode()


async def send_email(to: str, subject: str, body: str) -> None:
    access_token = await _get_access_token()
    raw = _build_raw_message(to, subject, body)

    async with httpx.AsyncClient(timeout=10) as client:
        res = await client.post(
            _SEND_URL,
            headers={"Authorization": f"Bearer {access_token}"},
            json={"raw": raw},
        )
    if res.status_code >= 300:
        raise EmailSendError(f"Gmail API send failed: {res.text}")


async def send_otp_email(to: str, code: str, purpose: str) -> None:
    if purpose == "signup":
        subject = "Verify your Finly account"
        heading = "Confirm your email"
        line = "Use the code below to finish creating your Finly account."
    else:
        subject = "Reset your Finly password"
        heading = "Reset your password"
        line = "Use the code below to reset your Finly password."

    body = (
        f"{heading}\n\n"
        f"{line}\n\n"
        f"Your code: {code}\n\n"
        f"This code expires in {settings.otp_expire_minutes} minutes. "
        f"If you didn't request this, you can safely ignore this email.\n"
    )
    await send_email(to, subject, body)
