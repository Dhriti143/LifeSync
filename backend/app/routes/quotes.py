from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session, select
import urllib.request
import json
from datetime import date, datetime

from app.config import api_response, get_session
from app.services import validate_access_token
from app.models import Quote

router = APIRouter(prefix="/quote", tags=["Quotes"])
security = HTTPBearer()

@router.get("/today")
def get_quote(authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    token = authorization.credentials
    user = validate_access_token(db, token)

    if not user:
        return api_response(
            success=False,
            message="Invalid token",
            errors=["Token expired or invalid"],
            code=status.HTTP_401_UNAUTHORIZED
        )

    today = date.today()
    statement = select(Quote).where(Quote.quote_date == today)
    quote = db.exec(statement).first()

    if quote is None:
        try:
            req = urllib.request.Request("https://zenquotes.io/api/today", headers={'User-Agent': 'Mozilla/5.0'})
            with urllib.request.urlopen(req) as response:
                data = json.loads(response.read().decode())
                if isinstance(data, list) and len(data) > 0:
                    q_data = data[0]
                    text = q_data.get("q", "No quote available.")
                    author = q_data.get("a", "Unknown")
                    
                    quote = Quote(text=text, author=author, quote_date=today)
                    db.add(quote)
                    db.commit()
                    db.refresh(quote)
                else:
                    return api_response(
                        success=False,
                        message="Failed to fetch quote",
                        code=status.HTTP_500_INTERNAL_SERVER_ERROR
                    )
        except Exception as e:
            return api_response(
                success=False,
                message="Error fetching quote",
                errors=[str(e)],
                code=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    return api_response(
        success=True,
        message="Quote fetched successfully",
        result={
            "id": quote.id,
            "text": quote.text,
            "author": quote.author,
            "date": quote.quote_date.isoformat()
        },
        code=status.HTTP_200_OK
    )