from sqlmodel import Session, select
from fastapi import HTTPException, status
from datetime import date, datetime, timedelta
from typing import Optional
from app.models import Habit, HabitLog
from app.schemas import HabitCreateRequest, HabitUpdateRequest, HabitResponse, HabitStatsResponse, HabitLogResponse

# ---------- STREAK LOGIC HELPER ----------
def calculate_streaks(logged_dates: list[date]) -> tuple[int, int, bool]:
    if not logged_dates:
        return 0, 0, False

    # Remove duplicates and sort dates ascending
    sorted_dates = sorted(list(set(logged_dates)))
    
    # 1. Calculate longest streak
    longest = 0
    current_temp = 0
    prev_date = None
    
    for d in sorted_dates:
        if prev_date is None:
            current_temp = 1
        elif (d - prev_date).days == 1:
            current_temp += 1
        elif (d - prev_date).days == 0:
            # duplicate or same day (should not happen due to unique constraint, but safe fallback)
            pass
        else: # gap in days
            if current_temp > longest:
                longest = current_temp
            current_temp = 1
        prev_date = d
        
    if current_temp > longest:
        longest = current_temp

    # 2. Calculate current streak
    # Current streak is active if completed today or yesterday.
    # Otherwise, it is 0.
    today = datetime.utcnow().date()
    yesterday = today - timedelta(days=1)
    
    date_set = set(sorted_dates)
    is_completed_today = today in date_set
    
    if is_completed_today:
        start_date = today
    elif yesterday in date_set:
        start_date = yesterday
    else:
        start_date = None
        
    current = 0
    if start_date:
        current = 1
        check_date = start_date - timedelta(days=1)
        while check_date in date_set:
            current += 1
            check_date -= timedelta(days=1)
            
    return current, longest, is_completed_today


# ---------- HABIT CRUD ----------

def create_habit(db: Session, user_id: int, data: HabitCreateRequest) -> Habit:
    habit = Habit(
        user_id=user_id,
        name=data.name,
        description=data.description,
        frequency=data.frequency or "daily",
    )
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

def get_habits(db: Session, user_id: int) -> list[HabitResponse]:
    # Fetch active habits
    statement = select(Habit).where(Habit.user_id == user_id, Habit.deleted_at == None)
    habits = db.exec(statement).all()
    
    response_list = []
    for h in habits:
        # Fetch logs to compute streaks
        logs_statement = select(HabitLog).where(HabitLog.habit_id == h.id)
        logs = db.exec(logs_statement).all()
        logged_dates = [log.logged_date for log in logs]
        
        current_streak, longest_streak, is_completed_today = calculate_streaks(logged_dates)
        
        response_list.append(
            HabitResponse(
                id=h.id,
                user_id=h.user_id,
                name=h.name,
                description=h.description,
                frequency=h.frequency,
                is_active=h.is_active,
                created_at=h.created_at,
                current_streak=current_streak,
                longest_streak=longest_streak,
                is_completed_today=is_completed_today
            )
        )
    return response_list

def update_habit(db: Session, user_id: int, habit_id: int, data: HabitUpdateRequest) -> Habit:
    habit = db.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id, Habit.deleted_at == None)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )
        
    if data.name is not None:
        habit.name = data.name
    if data.description is not None:
        habit.description = data.description
    if data.frequency is not None:
        habit.frequency = data.frequency
    if data.is_active is not None:
        habit.is_active = data.is_active
        
    db.add(habit)
    db.commit()
    db.refresh(habit)
    return habit

def delete_habit(db: Session, user_id: int, habit_id: int) -> None:
    habit = db.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id, Habit.deleted_at == None)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )
        
    habit.deleted_at = datetime.utcnow()
    db.add(habit)
    db.commit()


# ---------- HABIT LOGS & STATS ----------

def log_habit_completion(db: Session, user_id: int, habit_id: int, logged_date: Optional[date] = None) -> HabitLog:
    # 1. Verify habit exists and belongs to user
    habit = db.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id, Habit.deleted_at == None)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )
        
    # Default to today in UTC date
    target_date = logged_date or datetime.utcnow().date()
    
    # 2. Check if log already exists
    existing_log = db.exec(
        select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.logged_date == target_date)
    ).first()
    
    if existing_log:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Habit already completed on this date",
        )
        
    # 3. Create log
    log = HabitLog(
        habit_id=habit_id,
        logged_date=target_date,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def undo_habit_completion(db: Session, user_id: int, habit_id: int, logged_date: Optional[date] = None) -> None:
    # 1. Verify habit
    habit = db.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id, Habit.deleted_at == None)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )
        
    target_date = logged_date or datetime.utcnow().date()
    
    # 2. Verify log exists
    log = db.exec(
        select(HabitLog).where(HabitLog.habit_id == habit_id, HabitLog.logged_date == target_date)
    ).first()
    
    if not log:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit completion log not found for this date",
        )
        
    db.delete(log)
    db.commit()

def get_habit_stats(db: Session, user_id: int, habit_id: int) -> HabitStatsResponse:
    # 1. Verify habit
    habit = db.exec(
        select(Habit).where(Habit.id == habit_id, Habit.user_id == user_id, Habit.deleted_at == None)
    ).first()
    
    if not habit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Habit not found",
        )
        
    # 2. Fetch all logs
    logs_statement = select(HabitLog).where(HabitLog.habit_id == habit_id).order_by(HabitLog.logged_date.asc())
    logs = db.exec(logs_statement).all()
    
    logged_dates = [log.logged_date for log in logs]
    current_streak, longest_streak, _ = calculate_streaks(logged_dates)
    
    return HabitStatsResponse(
        habit_id=habit_id,
        current_streak=current_streak,
        longest_streak=longest_streak,
        history=logged_dates
    )
