import calendar
from collections import defaultdict
from datetime import date

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/expenses", tags=["expenses"])

PALETTE = ["#1E3A2B", "#5FA97A", "#E3971F", "#F0B15C", "#D9564C", "#B79FD1", "#4C8BF5", "#8A9084"]


def _month_bounds(month: str | None) -> tuple[date, date, date, date]:
    """Returns (this_start, this_end, prev_start, prev_end) for a 'YYYY-MM' string,
    defaulting to the current month."""
    if month:
        year, mon = (int(p) for p in month.split("-"))
    else:
        today = date.today()
        year, mon = today.year, today.month

    last_day = calendar.monthrange(year, mon)[1]
    this_start = date(year, mon, 1)
    this_end = date(year, mon, last_day)

    prev_year, prev_mon = (year - 1, 12) if mon == 1 else (year, mon - 1)
    prev_last_day = calendar.monthrange(prev_year, prev_mon)[1]
    prev_start = date(prev_year, prev_mon, 1)
    prev_end = date(prev_year, prev_mon, prev_last_day)

    return this_start, this_end, prev_start, prev_end


def _pct_change(current: float, previous: float) -> tuple[float, bool]:
    if previous == 0:
        return (100.0, True) if current > 0 else (0.0, True)
    change = (current - previous) / abs(previous) * 100
    return round(abs(change), 1), change >= 0


# ---------- Transactions CRUD ----------

@router.get("/transactions", response_model=list[schemas.TransactionOut])
def list_transactions(
    limit: int = 50,
    type: schemas.TransactionType | None = None,  # noqa: A002 (shadowing builtin is fine here, matches query param name)
    category: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    query = select(models.Transaction).where(models.Transaction.user_id == current_user.id)
    if type:
        query = query.where(models.Transaction.type == type)
    if category:
        query = query.where(models.Transaction.category == category)

    rows = db.scalars(
        query.order_by(models.Transaction.occurred_on.desc(), models.Transaction.created_at.desc()).limit(limit)
    ).all()
    return rows


@router.post("/transactions", response_model=schemas.TransactionOut, status_code=201)
def create_transaction(
    payload: schemas.TransactionCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = models.Transaction(user_id=current_user.id, **payload.model_dump())
    db.add(tx)
    db.commit()
    db.refresh(tx)
    return tx


@router.patch("/transactions/{tx_id}", response_model=schemas.TransactionOut)
def update_transaction(
    tx_id: str,
    payload: schemas.TransactionUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = db.get(models.Transaction, tx_id)
    if not tx or tx.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found.")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(tx, field, value)

    db.commit()
    db.refresh(tx)
    return tx


@router.delete("/transactions/{tx_id}", status_code=204)
def delete_transaction(
    tx_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tx = db.get(models.Transaction, tx_id)
    if not tx or tx.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    db.delete(tx)
    db.commit()


# ---------- Budgets CRUD ----------

@router.get("/budgets", response_model=list[schemas.BudgetOut])
def list_budgets(
    month: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    return _budget_summaries(db, current_user.id, month)


@router.post("/budgets", response_model=schemas.BudgetOut, status_code=201)
def create_budget(
    payload: schemas.BudgetCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = models.Budget(user_id=current_user.id, **payload.model_dump())
    db.add(budget)
    db.commit()
    db.refresh(budget)
    return _to_budget_out(budget, spent=0)


@router.delete("/budgets/{budget_id}", status_code=204)
def delete_budget(
    budget_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    budget = db.get(models.Budget, budget_id)
    if not budget or budget.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Budget not found.")
    db.delete(budget)
    db.commit()


def _to_budget_out(budget: models.Budget, spent: float) -> schemas.BudgetOut:
    limit = float(budget.monthly_limit)
    pct = round(min(spent / limit * 100, 999), 1) if limit else 0.0
    return schemas.BudgetOut(
        id=budget.id,
        category=budget.category,
        icon=budget.icon,
        monthly_limit=limit,
        spent=round(spent, 2),
        pct=pct,
    )


def _budget_summaries(db: Session, user_id: str, month: str | None) -> list[schemas.BudgetOut]:
    this_start, this_end, *_ = _month_bounds(month)

    budgets = db.scalars(select(models.Budget).where(models.Budget.user_id == user_id)).all()

    spent_by_category: dict[str, float] = defaultdict(float)
    tx_rows = db.scalars(
        select(models.Transaction).where(
            models.Transaction.user_id == user_id,
            models.Transaction.type == models.TransactionType.expense,
            models.Transaction.occurred_on >= this_start,
            models.Transaction.occurred_on <= this_end,
        )
    ).all()
    for tx in tx_rows:
        spent_by_category[tx.category] += float(tx.amount)

    return [_to_budget_out(b, spent_by_category.get(b.category, 0.0)) for b in budgets]


# ---------- Dashboard aggregate ----------

@router.get("/dashboard", response_model=schemas.DashboardOut)
def dashboard(
    month: str | None = None,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    this_start, this_end, prev_start, prev_end = _month_bounds(month)

    all_tx = db.scalars(
        select(models.Transaction).where(models.Transaction.user_id == current_user.id)
    ).all()

    def in_range(tx, start, end):
        return start <= tx.occurred_on <= end

    this_month_tx = [tx for tx in all_tx if in_range(tx, this_start, this_end)]
    prev_month_tx = [tx for tx in all_tx if in_range(tx, prev_start, prev_end)]

    def totals(rows):
        income = sum(float(tx.amount) for tx in rows if tx.type == models.TransactionType.income)
        expenses = sum(float(tx.amount) for tx in rows if tx.type == models.TransactionType.expense)
        return income, expenses

    income, expenses = totals(this_month_tx)
    prev_income, prev_expenses = totals(prev_month_tx)

    all_time_balance = sum(
        float(tx.amount) if tx.type == models.TransactionType.income else -float(tx.amount)
        for tx in all_tx
    )
    prev_balance_cutoff = sum(
        float(tx.amount) if tx.type == models.TransactionType.income else -float(tx.amount)
        for tx in all_tx
        if tx.occurred_on <= prev_end
    )

    savings = income - expenses
    prev_savings = prev_income - prev_expenses

    balance_change, balance_up = _pct_change(all_time_balance, prev_balance_cutoff)
    income_change, income_up = _pct_change(income, prev_income)
    expenses_change, expenses_up = _pct_change(expenses, prev_expenses)
    savings_change, savings_up = _pct_change(savings, prev_savings)

    stats = {
        "totalBalance": schemas.StatOut(
            label="Total Balance", value=round(all_time_balance, 2), change_pct=balance_change, up=balance_up
        ),
        "totalIncome": schemas.StatOut(
            label="Total Income", value=round(income, 2), change_pct=income_change, up=income_up
        ),
        "totalExpenses": schemas.StatOut(
            label="Total Expenses", value=round(expenses, 2), change_pct=expenses_change, up=not expenses_up
        ),
        "netSavings": schemas.StatOut(
            label="Net Savings", value=round(savings, 2), change_pct=savings_change, up=savings_up
        ),
    }

    # Spending overview: this month's expenses grouped by category
    by_category: dict[str, float] = defaultdict(float)
    for tx in this_month_tx:
        if tx.type == models.TransactionType.expense:
            by_category[tx.category] += float(tx.amount)

    segments = []
    for i, (label, amount) in enumerate(sorted(by_category.items(), key=lambda kv: -kv[1])):
        pct = round(amount / expenses * 100, 1) if expenses else 0.0
        segments.append(
            schemas.SpendingSegment(label=label, amount=round(amount, 2), pct=pct, color=PALETTE[i % len(PALETTE)])
        )

    # Income vs expenses, aggregated per day within the month
    per_day: dict[date, dict[str, float]] = defaultdict(lambda: {"income": 0.0, "expenses": 0.0})
    for tx in this_month_tx:
        bucket = per_day[tx.occurred_on]
        if tx.type == models.TransactionType.income:
            bucket["income"] += float(tx.amount)
        else:
            bucket["expenses"] += float(tx.amount)

    chart = [
        schemas.ChartPoint(
            day=day.strftime("%b %-d") if hasattr(day, "strftime") else str(day),
            income=round(vals["income"], 2),
            expenses=round(vals["expenses"], 2),
        )
        for day, vals in sorted(per_day.items())
    ]

    recent = sorted(all_tx, key=lambda tx: (tx.occurred_on, tx.created_at), reverse=True)[:8]

    budget_summary = _budget_summaries(db, current_user.id, month)

    goals = db.scalars(select(models.Goal).where(models.Goal.user_id == current_user.id)).all()
    goals_out = [
        schemas.GoalOut(
            id=g.id,
            title=g.title,
            icon=g.icon,
            saved_amount=float(g.saved_amount),
            target_amount=float(g.target_amount),
            pct=round(min(float(g.saved_amount) / float(g.target_amount) * 100, 100), 1)
            if float(g.target_amount)
            else 0.0,
        )
        for g in goals
    ]

    return schemas.DashboardOut(
        month=this_start.strftime("%Y-%m"),
        stats=stats,
        spending_overview=segments,
        total_expenses=round(expenses, 2),
        income_expenses_chart=chart,
        recent_transactions=[schemas.TransactionOut.model_validate(tx) for tx in recent],
        budget_summary=budget_summary,
        savings_goals=goals_out,
    )
