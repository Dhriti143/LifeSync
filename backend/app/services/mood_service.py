from sqlmodel import Session, select, func
from fastapi import HTTPException, status
from datetime import date, datetime
from typing import Optional
from app.models import MoodLog
from app.schemas import MoodLogCreateRequest

def create_mood_log(db: Session, user_id: int, data: MoodLogCreateRequest) -> MoodLog:
    # Use specified logged_date or default to today's date in local time
    logged_date = data.logged_date or datetime.utcnow().date()
    
    mood_log = MoodLog(
        user_id=user_id,
        mood=data.mood,
        notes=data.notes,
        logged_date=logged_date,
    )
    db.add(mood_log)
    db.commit()
    db.refresh(mood_log)
    return mood_log

def get_mood_logs(
    db: Session, 
    user_id: int, 
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None, 
    skip: int = 0, 
    limit: int = 20
) -> list[MoodLog]:
    statement = select(MoodLog).where(MoodLog.user_id == user_id)
    if start_date:
        statement = statement.where(MoodLog.logged_date >= start_date)
    if end_date:
        statement = statement.where(MoodLog.logged_date <= end_date)
        
    statement = statement.order_by(MoodLog.logged_date.desc(), MoodLog.created_at.desc()).offset(skip).limit(limit)
    return db.exec(statement).all()

def get_mood_stats(
    db: Session, 
    user_id: int, 
    start_date: Optional[date] = None, 
    end_date: Optional[date] = None
) -> dict[str, int]:
    statement = select(MoodLog.mood, func.count(MoodLog.id)).where(MoodLog.user_id == user_id)
    if start_date:
        statement = statement.where(MoodLog.logged_date >= start_date)
    if end_date:
        statement = statement.where(MoodLog.logged_date <= end_date)
    
    statement = statement.group_by(MoodLog.mood)
    results = db.exec(statement).all()
    
    return {mood: count for mood, count in results}

def delete_mood_log(db: Session, user_id: int, mood_log_id: int) -> None:
    mood_log = db.exec(
        select(MoodLog).where(MoodLog.id == mood_log_id, MoodLog.user_id == user_id)
    ).first()
    
    if not mood_log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Mood log entry not found",
        )
    
    db.delete(mood_log)
    db.commit()
