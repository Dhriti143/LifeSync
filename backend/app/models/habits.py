from datetime import datetime, date
from typing import Optional
from sqlmodel import SQLModel, Field, UniqueConstraint

class Habit(SQLModel, table=True):
    __tablename__ = "habit"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="user.id", index=True)
    name: str
    description: Optional[str] = Field(default=None)
    frequency: str = Field(default="daily")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
    deleted_at: Optional[datetime] = Field(default=None)

class HabitLog(SQLModel, table=True):
    __tablename__ = "habit_log"
    __table_args__ = (
        UniqueConstraint("habit_id", "logged_date", name="unique_habit_log_date"),
    )

    id: Optional[int] = Field(default=None, primary_key=True)
    habit_id: int = Field(foreign_key="habit.id", index=True)
    logged_date: date = Field(index=True)
    completed_at: datetime = Field(default_factory=datetime.utcnow)
