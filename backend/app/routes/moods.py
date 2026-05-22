from fastapi import APIRouter, Depends, status, Query
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from datetime import date
from typing import Optional

from app.config import api_response, get_session
from app.services import validate_access_token, create_mood_log, get_mood_logs, get_mood_stats, delete_mood_log
from app.schemas import MoodLogCreateRequest

router = APIRouter(prefix="/moods", tags=["Moods"])
security = HTTPBearer()

def _get_current_user(authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return None
    return user

@router.post("/", status_code=status.HTTP_201_CREATED)
def create(
    data: MoodLogCreateRequest,
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
        
    mood_log = create_mood_log(db, user.id, data)
    return api_response(
        success=True,
        message="Mood logged successfully",
        result={
            "id": mood_log.id,
            "user_id": mood_log.user_id,
            "mood": mood_log.mood,
            "notes": mood_log.notes,
            "logged_date": mood_log.logged_date.isoformat(),
            "created_at": mood_log.created_at.isoformat()
        },
        code=status.HTTP_201_CREATED
    )

@router.get("/")
def list_moods(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
    skip: int = 0,
    limit: int = 20,
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
        
    logs = get_mood_logs(db, user.id, start_date=start_date, end_date=end_date, skip=skip, limit=limit)
    return api_response(
        success=True,
        message="Mood logs fetched successfully",
        result=[
            {
                "id": log.id,
                "user_id": log.user_id,
                "mood": log.mood,
                "notes": log.notes,
                "logged_date": log.logged_date.isoformat(),
                "created_at": log.created_at.isoformat()
            }
            for log in logs
        ],
        code=status.HTTP_200_OK
    )

@router.get("/stats")
def stats(
    start_date: Optional[date] = Query(None, description="Start date (YYYY-MM-DD)"),
    end_date: Optional[date] = Query(None, description="End date (YYYY-MM-DD)"),
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
        
    mood_distribution = get_mood_stats(db, user.id, start_date=start_date, end_date=end_date)
    return api_response(
        success=True,
        message="Mood statistics fetched successfully",
        result={"stats": mood_distribution},
        code=status.HTTP_200_OK
    )

@router.delete("/{mood_log_id}")
def delete(
    mood_log_id: int,
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
        delete_mood_log(db, user.id, mood_log_id)
    except HTTPException as e:
        return api_response(
            success=False,
            message=e.detail,
            errors=[e.detail],
            code=e.status_code
        )
        
    return api_response(
        success=True,
        message="Mood log deleted successfully",
        result=None,
        code=status.HTTP_200_OK
    )
