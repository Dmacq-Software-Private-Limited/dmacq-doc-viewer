from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import os

from api.documents import router as documents_router
from config import settings

app = FastAPI(title="Document Viewer API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173", "http://localhost:3000", "http://localhost:8081",
        "http://localhost:8000", "http://localhost:8080", "http://localhost:8001",
        "http://192.168.0.93:8081", "http://192.168.0.93:8001", "http://192.168.0.93:8080"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.mount(f"/{settings.UPLOAD_DIR}", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")
app.mount(f"/{settings.CONVERTED_DIR}", StaticFiles(directory=settings.CONVERTED_DIR), name="converted")
app.mount(f"/{settings.THUMBNAILS_DIR}", StaticFiles(directory=settings.THUMBNAILS_DIR), name="thumbnails")

app.include_router(documents_router, prefix="/api", tags=["Documents"])

@app.on_event("startup")
async def startup_event():
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    os.makedirs(settings.CONVERTED_DIR, exist_ok=True)
    os.makedirs(settings.THUMBNAILS_DIR, exist_ok=True)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host=settings.HOST, port=settings.PORT, reload=settings.DEBUG)
