from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.orm import Session

from .. import models, schemas
from ..database import get_db
from ..deps import get_current_user

router = APIRouter(prefix="/api/goals", tags=["goals"])


def _to_out(g: models.Goal) -> schemas.GoalOut:
    target = float(g.target_amount)
    pct = round(min(float(g.saved_amount) / target * 100, 100), 1) if target else 0.0
    return schemas.GoalOut(
        id=g.id, title=g.title, icon=g.icon,
        saved_amount=float(g.saved_amount), target_amount=target, pct=pct,
    )


@router.get("", response_model=list[schemas.GoalOut])
def list_goals(
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goals = db.scalars(select(models.Goal).where(models.Goal.user_id == current_user.id)).all()
    return [_to_out(g) for g in goals]


@router.post("", response_model=schemas.GoalOut, status_code=201)
def create_goal(
    payload: schemas.GoalCreate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = models.Goal(user_id=current_user.id, **payload.model_dump())
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return _to_out(goal)


@router.patch("/{goal_id}", response_model=schemas.GoalOut)
def update_goal(
    goal_id: str,
    payload: schemas.GoalUpdate,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.get(models.Goal, goal_id)
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found.")
    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(goal, field, value)
    db.commit()
    db.refresh(goal)
    return _to_out(goal)


@router.delete("/{goal_id}", status_code=204)
def delete_goal(
    goal_id: str,
    current_user: models.User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.get(models.Goal, goal_id)
    if not goal or goal.user_id != current_user.id:
        raise HTTPException(status_code=404, detail="Goal not found.")
    db.delete(goal)
    db.commit()
