from fastapi import FastAPI
from app.config import create_db_and_tables
from app.routes import auth_router, journals_router, quotes_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
app.include_router(auth_router)
app.include_router(journals_router)
app.include_router(quotes_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
def on_startup():
    create_db_and_tables()


@app.get("/")
def home():
    return {"message": "Backend is running"}

