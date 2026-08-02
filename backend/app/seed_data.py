from sqlalchemy.orm import Session

from . import models

DEFAULT_BUDGETS = [
    {"category": "Housing", "icon": "home", "monthly_limit": 2000},
    {"category": "Food", "icon": "utensils", "monthly_limit": 1200},
    {"category": "Transportation", "icon": "car", "monthly_limit": 800},
    {"category": "Entertainment", "icon": "film", "monthly_limit": 600},
]

DEFAULT_GOALS = [
    {"title": "Emergency Fund", "icon": "shield-check", "target_amount": 5000, "saved_amount": 0},
    {"title": "Vacation", "icon": "plane", "target_amount": 2500, "saved_amount": 0},
    {"title": "New Laptop", "icon": "laptop", "target_amount": 1800, "saved_amount": 0},
]


def seed_new_user(db: Session, user: models.User) -> None:
    """Give a freshly signed-up user a sensible starting set of budget
    categories and savings goals so the dashboard isn't empty on day one.
    All amounts are real rows they can edit or delete freely."""
    for b in DEFAULT_BUDGETS:
        db.add(models.Budget(user_id=user.id, **b))
    for g in DEFAULT_GOALS:
        db.add(models.Goal(user_id=user.id, **g))
    db.commit()
