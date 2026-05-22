from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field

class MoodLog(SQLModel, table=True):
    __tablename__ = "mood_log"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    mood: str
    notes: Optional[str] = Field(default=None)
    logged_date: date = Field(default_factory=lambda: datetime.utcnow().date(), index=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
