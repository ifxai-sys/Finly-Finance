"""
Thin proxy in front of CoinGecko and Frankfurter.

Mirrors the exact request/response shape the frontend's src/api/crypto.js and
src/api/currency.js already expect (see comments in those files), so flipping
USE_BACKEND_PROXY = true in src/config/apiConfig.js is all that's needed on
the frontend side. Also gives us one place to add caching / rate-limit
protection in front of the free public APIs, and keeps the browser from
talking to third-party hosts directly.
"""

import time

import httpx
from fastapi import APIRouter, HTTPException, Request
from fastapi.responses import JSONResponse

from ..config import get_settings

settings = get_settings()

router = APIRouter(tags=["market-data"])

_CACHE_TTL_SECONDS = 60
_cache: dict[str, tuple[float, int, dict]] = {}


async def _proxy_get(url: str) -> JSONResponse:
    cached = _cache.get(url)
    if cached and time.monotonic() - cached[0] < _CACHE_TTL_SECONDS:
        _, status_code, body = cached
        return JSONResponse(status_code=status_code, content=body)

    async with httpx.AsyncClient(timeout=10) as client:
        try:
            res = await client.get(url)
        except httpx.HTTPError as exc:
            raise HTTPException(status_code=502, detail=f"Upstream request failed: {exc}") from exc

    try:
        body = res.json()
    except ValueError:
        raise HTTPException(status_code=502, detail="Upstream returned a non-JSON response.")

    if res.status_code == 200:
        _cache[url] = (time.monotonic(), res.status_code, body)

    return JSONResponse(status_code=res.status_code, content=body)


# ---------- Crypto (CoinGecko) ----------

@router.get("/api/crypto/coins/markets")
async def crypto_markets(request: Request):
    query = request.url.query
    url = f"{settings.coingecko_base_url}/coins/markets?{query}"
    return await _proxy_get(url)


# ---------- Currency: latest rates (ExchangeRate-API open access) ----------
# This endpoint has much broader currency coverage than Frankfurter/ECB —
# notably it includes PKR, AED, and SAR, which Frankfurter does not.
# No API key required. Docs: https://www.exchangerate-api.com/docs/free
EXCHANGERATE_API_BASE_URL = "https://open.er-api.com/v6"


@router.get("/api/currency/latest/{base}")
async def currency_latest(base: str):
    url = f"{EXCHANGERATE_API_BASE_URL}/latest/{base.upper()}"
    return await _proxy_get(url)


# ---------- Currency: rate history (Frankfurter / ECB) ----------
# Used only for the small trend sparkline. Frankfurter has a narrower
# currency list (~31) — if a requested currency isn't covered, this will
# 404 and the frontend simply hides the sparkline (conversion itself keeps
# working via the endpoint above).

@router.get("/api/currency/history/{date_range}")
async def currency_history(date_range: str, request: Request):
    """Handles the `/api/currency/history/2026-07-19..2026-07-26?base=USD&symbols=EUR`
    time-series shape used by getRateHistory() in src/api/currency.js."""
    query = request.url.query
    url = f"{settings.frankfurter_base_url}/{date_range}?{query}"
    return await _proxy_get(url)


# ---------- Stocks (Finnhub) ----------
# The API key lives only in the backend's .env (FINNHUB_API_KEY), never in
# the browser bundle. Mirrors the raw Finnhub /quote response shape so
# src/api/finnhub.js doesn't need to change how it parses the result.

@router.get("/api/market/quote/{symbol}")
async def market_quote(symbol: str):
    if not settings.finnhub_api_key:
        raise HTTPException(
            status_code=503,
            detail="Stock quotes aren't configured yet: set FINNHUB_API_KEY in backend/.env.",
        )

    url = f"{settings.finnhub_base_url}/quote?symbol={symbol.upper()}&token={settings.finnhub_api_key}"
    return await _proxy_get(url)
