from fastapi import FastAPI, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from contextlib import asynccontextmanager
from database import get_db
import crud, schemas, routers
from bot import ptb_app, init_webhook, process_update

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: PTB ilovasini ishga tushirish va Webhookni o'rnatish
    await ptb_app.initialize()
    await ptb_app.start()
    await init_webhook()
    yield
    # Shutdown: PTB ilovasini to'xtatish
    await ptb_app.stop()
    await ptb_app.shutdown()

app = FastAPI(title="Mentor Academy API", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Ruxsat berilgan domenlar, masalan: "http://localhost:3000"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.get("/")
async def root():
    return {"message": "FastAPI is running!"}

@app.get("/health")
async def health_check(db: AsyncSession = Depends(get_db)):
    try:
        await db.execute(text("SELECT 1"))
        return {"status": "Database connected"}
    except Exception as e:
        return {"status": "Database error", "details": str(e)}


@app.post("/webhook")
async def telegram_webhook(request: Request):
    data = await request.json()
    await process_update(data)
    return {"ok": True}

@app.get("/api/students", response_model=list[schemas.StudentOut])
async def read_students(skip: int = 0, limit: int = 100, db: AsyncSession = Depends(get_db)):
    students = await crud.get_students(db, skip=skip, limit=limit)
    return students

app.include_router(routers.router, prefix="/api")
