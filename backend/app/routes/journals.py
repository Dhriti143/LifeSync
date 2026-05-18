from fastapi import APIRouter, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlmodel import Session
from typing import Optional

from app.config import api_response, get_session
from app.services import validate_access_token, create_journal, get_journals, get_journal, update_journal, delete_journal
from app.schemas import JournalCreateRequest, JournalUpdateRequest

router = APIRouter(prefix="/journals", tags=["Journals"])
security = HTTPBearer()


def _get_current_user(authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    """Shared auth dependency — validates the bearer token and returns the User."""
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return None, db
    return user, db


@router.post("/", status_code=status.HTTP_201_CREATED)
def create(data: JournalCreateRequest, authorization: HTTPAuthorizationCredentials = Depends(security),db: Session = Depends(get_session)):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return api_response(success=False, message="Not authenticated", errors=["Invalid or expired token"], code=status.HTTP_401_UNAUTHORIZED)

    journal = create_journal(db, user.id, data)
    return api_response(
        success=True,
        message="Journal entry created",
        result={
            "id": journal.id,
            "user_id": journal.user_id,
            "title": journal.title,
            "content": journal.content,
            "mood": journal.mood,
            "created_at": journal.created_at.isoformat(),
            "updated_at": journal.updated_at.isoformat() if journal.updated_at else None,
        },
        code=status.HTTP_201_CREATED,
    )


@router.get("/")
def list_journals(skip: int = 0, limit: int = 20, authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session),):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return api_response(success=False, message="Not authenticated", errors=["Invalid or expired token"], code=status.HTTP_401_UNAUTHORIZED)

    journals = get_journals(db, user.id, skip=skip, limit=limit)
    return api_response(
        success=True,
        message="Journal entries fetched",
        result=[
            {
                "id": j.id,
                "user_id": j.user_id,
                "title": j.title,
                "content": j.content,
                "mood": j.mood,
                "created_at": j.created_at.isoformat(),
                "updated_at": j.updated_at.isoformat() if j.updated_at else None,
            }
            for j in journals
        ],
        code=status.HTTP_200_OK,
    )


@router.get("/{journal_id}")
def read_journal(journal_id: int, authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return api_response(success=False, message="Not authenticated", errors=["Invalid or expired token"], code=status.HTTP_401_UNAUTHORIZED)

    try:
        journal = get_journal(db, user.id, journal_id)
    except Exception as e:
        return api_response(success=False, message=str(e.detail), errors=[str(e.detail)], code=status.HTTP_404_NOT_FOUND)

    return api_response(
        success=True,
        message="Journal entry fetched",
        result={
            "id": journal.id,
            "user_id": journal.user_id,
            "title": journal.title,
            "content": journal.content,
            "mood": journal.mood,
            "created_at": journal.created_at.isoformat(),
            "updated_at": journal.updated_at.isoformat() if journal.updated_at else None,
        },
        code=status.HTTP_200_OK,
    )


@router.patch("/{journal_id}")
def update(
    journal_id: int, data: JournalUpdateRequest, authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return api_response(success=False, message="Not authenticated", errors=["Invalid or expired token"], code=status.HTTP_401_UNAUTHORIZED)

    try:
        journal = update_journal(db, user.id, journal_id, data)
    except Exception as e:
        return api_response(success=False, message=str(e.detail), errors=[str(e.detail)], code=status.HTTP_404_NOT_FOUND)

    return api_response(
        success=True,
        message="Journal entry updated",
        result={
            "id": journal.id,
            "user_id": journal.user_id,
            "title": journal.title,
            "content": journal.content,
            "mood": journal.mood,
            "created_at": journal.created_at.isoformat(),
            "updated_at": journal.updated_at.isoformat() if journal.updated_at else None,
        },
        code=status.HTTP_200_OK,
    )


@router.delete("/{journal_id}")
def delete(journal_id: int,authorization: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_session)):
    user = validate_access_token(db, authorization.credentials)
    if not user:
        return api_response(success=False, message="Not authenticated", errors=["Invalid or expired token"], code=status.HTTP_401_UNAUTHORIZED)

    try:
        delete_journal(db, user.id, journal_id)
    except Exception as e:
        return api_response(success=False, message=str(e.detail), errors=[str(e.detail)], code=status.HTTP_404_NOT_FOUND)

    return api_response(success=True, message="Journal entry deleted", result=None, code=status.HTTP_200_OK)
