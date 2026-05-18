from datetime import date
from typing import Optional
from sqlmodel import SQLModel, Field

class Quote(SQLModel, table=True):
    __tablename__ = "quotes"

    id: Optional[int] = Field(default=None, primary_key=True)
    text: str
    author: Optional[str] = Field(default=None)
    quote_date: date = Field(index=True, unique=True)
