from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, List

class HabitCreateRequest(BaseModel):
    name: str
    description: Optional[str] = None
    frequency: Optional[str] = "daily"

class HabitUpdateRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    frequency: Optional[str] = None
    is_active: Optional[bool] = None

class HabitLogRequest(BaseModel):
    logged_date: Optional[date] = None

class HabitResponse(BaseModel):
    id: int
    user_id: int
    name: str
    description: Optional[str]
    frequency: str
    is_active: bool
    created_at: datetime
    current_streak: int = 0
    longest_streak: int = 0
    is_completed_today: bool = False

    class Config:
        from_attributes = True

class HabitLogResponse(BaseModel):
    id: int
    habit_id: int
    logged_date: date
    completed_at: datetime

    class Config:
        from_attributes = True

class HabitStatsResponse(BaseModel):
    habit_id: int
    current_streak: int
    longest_streak: int
    history: List[date]
