from datetime import date
from typing import Literal

from pydantic import BaseModel, EmailStr, Field, field_validator


# ---------- Auth ----------

class SignupRequest(BaseModel):
    name: str = Field(min_length=1, max_length=120)
    email: EmailStr
    password: str = Field(min_length=6, max_length=128)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: str
    name: str
    email: str

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: str = Field(min_length=1, max_length=120)


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class MessageResponse(BaseModel):
    message: str
    email: str


class VerifyOtpRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)


class ResendOtpRequest(BaseModel):
    email: EmailStr


class ForgotPasswordRequest(BaseModel):
    email: EmailStr


class ResetPasswordRequest(BaseModel):
    email: EmailStr
    code: str = Field(min_length=6, max_length=6)
    new_password: str = Field(min_length=6, max_length=128)


# ---------- Transactions ----------

TransactionType = Literal["income", "expense"]


class TransactionCreate(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    category: str = Field(min_length=1, max_length=80)
    icon: str = "wallet"
    type: TransactionType
    amount: float = Field(gt=0)
    occurred_on: date

    @field_validator("amount")
    @classmethod
    def round_amount(cls, v: float) -> float:
        return round(v, 2)


class TransactionUpdate(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=160)
    category: str | None = Field(default=None, min_length=1, max_length=80)
    icon: str | None = None
    type: TransactionType | None = None
    amount: float | None = Field(default=None, gt=0)
    occurred_on: date | None = None


class TransactionOut(BaseModel):
    id: str
    title: str
    category: str
    icon: str
    type: TransactionType
    amount: float
    occurred_on: date

    model_config = {"from_attributes": True}


# ---------- Budgets ----------

class BudgetCreate(BaseModel):
    category: str = Field(min_length=1, max_length=80)
    icon: str = "home"
    monthly_limit: float = Field(gt=0)


class BudgetOut(BaseModel):
    id: str
    category: str
    icon: str
    monthly_limit: float
    spent: float
    pct: float

    model_config = {"from_attributes": True}


# ---------- Goals ----------

class GoalCreate(BaseModel):
    title: str = Field(min_length=1, max_length=120)
    icon: str = "shield-check"
    target_amount: float = Field(gt=0)
    saved_amount: float = Field(default=0, ge=0)


class GoalUpdate(BaseModel):
    title: str | None = None
    icon: str | None = None
    target_amount: float | None = Field(default=None, gt=0)
    saved_amount: float | None = Field(default=None, ge=0)


class GoalOut(BaseModel):
    id: str
    title: str
    icon: str
    saved_amount: float
    target_amount: float
    pct: float

    model_config = {"from_attributes": True}


# ---------- Dashboard aggregate ----------

class StatOut(BaseModel):
    label: str
    value: float
    change_pct: float
    up: bool


class SpendingSegment(BaseModel):
    label: str
    amount: float
    pct: float
    color: str


class ChartPoint(BaseModel):
    day: str
    income: float
    expenses: float


class DashboardOut(BaseModel):
    month: str
    stats: dict[str, StatOut]
    spending_overview: list[SpendingSegment]
    total_expenses: float
    income_expenses_chart: list[ChartPoint]
    recent_transactions: list[TransactionOut]
    budget_summary: list[BudgetOut]
    savings_goals: list[GoalOut]
