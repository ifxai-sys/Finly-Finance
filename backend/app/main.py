from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .config import get_settings
from .database import Base, engine
from .routers import auth, expenses, goals, market

settings = get_settings()

# Creates tables if they don't exist yet. Fine for getting started; once this
# is running for real, switch to Alembic migrations instead of relying on
# create_all (see README "Next steps").
Base.metadata.create_all(bind=engine)

app = FastAPI(title="Finance Tracker API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origin_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(expenses.router)
app.include_router(goals.router)
app.include_router(market.router)


@app.get("/api/health")
def health():
    return {"status": "ok"}
