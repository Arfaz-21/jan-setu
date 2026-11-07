import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base
from backend.app.api.endpoints import documents, schemes, sakala, appeals, legal, voice

# Initialize logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("JanSetu")

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="JAN SETU API",
    description="Citizen Application Readiness & Accountability Platform for Karnataka Government Services",
    version="1.0.0"
)

# Enable CORS for local development and Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount endpoints
app.include_router(documents.router, prefix="/api")
app.include_router(schemes.router, prefix="/api")
app.include_router(sakala.router, prefix="/api")
app.include_router(appeals.router, prefix="/api")
app.include_router(legal.router, prefix="/api")
app.include_router(voice.router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": "JAN SETU Platform API",
        "version": "1.0.0",
        "environment": settings.APP_ENV,
        "database": "SQLite (Local Dev Mode - PostgreSQL migration ready)",
        "privacy_mode": "Zero-retention temporary storage active",
        "bhashini_mode": "Browser SpeechSynthesis Fallback (No paid API keys required)"
    }

@app.get("/")
def root():
    return {
        "app": "JAN SETU - Citizen Application Readiness & Accountability Platform",
        "state": "Karnataka, India",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.app.main:app", host="127.0.0.1", port=8000, reload=True)
