from fastapi import APIRouter, Depends, status, Query, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from datetime import date
from typing import Optional

from app.config import api_response, get_session
from app.services import (
    validate_access_token,
    create_habit,
    get_habits,
    update_habit,
    delete_habit,
    log_habit_completion,
    undo_habit_completion,
    get_habit_stats
)
from app.schemas import HabitCreateRequest, HabitUpdateRequest, HabitLogRequest

router = APIRouter(prefix="/habits", tags=["Habits"])
security = HTTPBearer()

def _get_current_user(authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return None
    return user

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(
    data: HabitCreateRequest,
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    habit = create_habit(db, user.id, data)
    return api_response(
        success=True,
        message="Habit created successfully",
        result={
            "id": habit.id,
            "user_id": habit.user_id,
            "name": habit.name,
            "description": habit.description,
            "frequency": habit.frequency,
            "is_active": habit.is_active,
            "created_at": habit.created_at.isoformat()
        },
        code=status.HTTP_201_CREATED
    )

@router.get("/")
def list_habits(
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    habits = get_habits(db, user.id)
    return api_response(
        success=True,
        message="Habits fetched successfully",
        result=[
            {
                "id": h.id,
                "user_id": h.user_id,
                "name": h.name,
                "description": h.description,
                "frequency": h.frequency,
                "is_active": h.is_active,
                "created_at": h.created_at.isoformat(),
                "current_streak": h.current_streak,
                "longest_streak": h.longest_streak,
                "is_completed_today": h.is_completed_today
            }
            for h in habits
        ],
        code=status.HTTP_200_OK
    )

@router.patch("/{habit_id}")
def update(
    habit_id: int,
    data: HabitUpdateRequest,
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    try:
        habit = update_habit(db, user.id, habit_id, data)
    except HTTPException as e:
        return api_response(
            success=False,
            message=e.detail,
            errors=[e.detail],
            code=e.status_code
        )
        
    return api_response(
        success=True,
        message="Habit updated successfully",
        result={
            "id": habit.id,
            "user_id": habit.user_id,
            "name": habit.name,
            "description": habit.description,
            "frequency": habit.frequency,
            "is_active": habit.is_active,
            "created_at": habit.created_at.isoformat()
        },
        code=status.HTTP_200_OK
    )

@router.delete("/{habit_id}")
def delete(
    habit_id: int,
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    try:
        delete_habit(db, user.id, habit_id)
    except HTTPException as e:
        return api_response(
            success=False,
            message=e.detail,
            errors=[e.detail],
            code=e.status_code
        )
        
    return api_response(
        success=True,
        message="Habit deleted successfully",
        result=None,
        code=status.HTTP_200_OK
    )

@router.post("/{habit_id}/log")
def log_completion(
    habit_id: int,
    data: Optional[HabitLogRequest] = None,
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    logged_date = data.logged_date if data else None
    
    try:
        log = log_habit_completion(db, user.id, habit_id, logged_date)
    except HTTPException as e:
        return api_response(
            success=False,
            message=e.detail,
            errors=[e.detail],
            code=e.status_code
        )
        
    return api_response(
        success=True,
        message="Habit completion logged successfully",
        result={
            "id": log.id,
            "habit_id": log.habit_id,
            "logged_date": log.logged_date.isoformat(),
            "completed_at": log.completed_at.isoformat()
        },
        code=status.HTTP_200_OK
    )

@router.delete("/{habit_id}/log")
def undo_completion(
    habit_id: int,
    logged_date: Optional[date] = Query(None, description="Date to undo (YYYY-MM-DD), defaults to today"),
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    try:
        undo_habit_completion(db, user.id, habit_id, logged_date)
    except HTTPException as e:
        return api_response(
            success=False,
            message=e.detail,
            errors=[e.detail],
            code=e.status_code
        )
        
    return api_response(
        success=True,
        message="Habit completion undone successfully",
        result=None,
        code=status.HTTP_200_OK
    )

@router.get("/{habit_id}/stats")
def stats(
    habit_id: int,
    user = Depends(_get_current_user),
    db: Session = Depends(get_session)
):
    if not user:
        return api_response(
            success=False,
            message="Not authenticated",
            errors=["Invalid or expired token"],
            code=status.HTTP_401_UNAUTHORIZED
        )
        
    try:
        habit_stats = get_habit_stats(db, user.id, habit_id)
    except HTTPException as e:
        return api_response(
            success=False,
            message=e.detail,
            errors=[e.detail],
            code=e.status_code
        )
        
    return api_response(
        success=True,
        message="Habit statistics fetched successfully",
        result={
            "habit_id": habit_stats.habit_id,
            "current_streak": habit_stats.current_streak,
            "longest_streak": habit_stats.longest_streak,
            "history": [d.isoformat() for d in habit_stats.history]
        },
        code=status.HTTP_200_OK
    )
