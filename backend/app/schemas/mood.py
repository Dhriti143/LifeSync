from pydantic import BaseModel
from datetime import datetime, date
from typing import Optional, Dict

class MoodLogCreateRequest(BaseModel):
    mood: str
    notes: Optional[str] = None
    logged_date: Optional[date] = None

class MoodLogResponse(BaseModel):
    id: int
    user_id: int
    mood: str
    notes: Optional[str]
    logged_date: date
    created_at: datetime

    class Config:
        from_attributes = True

class MoodStatsResponse(BaseModel):
    stats: Dict[str, int]
