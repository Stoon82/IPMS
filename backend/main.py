from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from routers import tasks_router, activities_router, development_router, profile_router, projects_router
from routers.auth import router as auth_router
from routers.ideas import router as ideas_router
from routers.concepts import router as concepts_router
from routers.project_ideas import router as project_ideas_router
import uvicorn
import logging
import sys
from database import Base, engine, SessionLocal
from config import settings
from datetime import datetime

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s - %(pathname)s:%(lineno)d',
    handlers=[
        logging.StreamHandler(sys.stdout),
        logging.FileHandler('app.log')
    ]
)
logger = logging.getLogger(__name__)

# Create database tables
try:
    logger.info("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    logger.info("Database tables created successfully")
except Exception as e:
    logger.error(f"Error creating database tables: {e}")
    raise

# Verify database connection
try:
    logger.info("Verifying database connection...")
    db = SessionLocal()
    db.execute("SELECT 1")
    db.close()
    logger.info("Database connection verified")
except Exception as e:
    logger.error(f"Database connection failed: {e}")
    raise

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Intelligent Personal Management System API"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
    expose_headers=["*"],
    max_age=3600,
)

# Add middleware for request logging
@app.middleware("http")
async def log_requests(request: Request, call_next):
    logger.debug(f"Request: {request.method} {request.url}")
    logger.debug(f"Headers: {request.headers}")
    response = await call_next(request)
    logger.debug(f"Response status: {response.status_code}")
    return response

# Exception handlers
@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )

# Mount routers
app.include_router(auth_router, prefix="/api/auth")  # Mount auth routes under /api/auth
app.include_router(tasks_router, prefix="/api/tasks")
app.include_router(activities_router, prefix="/api/activities")
app.include_router(development_router, prefix="/api/development")
app.include_router(profile_router, prefix="/api/profile")
app.include_router(projects_router, prefix="/api/projects", tags=["projects"])
app.include_router(ideas_router, prefix="/api/ideas", tags=["ideas"])
app.include_router(concepts_router, prefix="/api/concepts", tags=["concepts"])
app.include_router(project_ideas_router, prefix="/api/project-ideas", tags=["project-ideas"])

@app.get("/")
async def root():
    """Root endpoint returning API information"""
    return {
        "name": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "status": "running",
        "docs_url": "/docs",
        "redoc_url": "/redoc"
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    try:
        # Verify database connection
        db = SessionLocal()
        db.execute("SELECT 1")
        db.close()
        db_status = "operational"
    except Exception as e:
        logger.error(f"Database health check failed: {e}")
        db_status = "error"

    return {
        "status": "healthy" if db_status == "operational" else "unhealthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "database": db_status,
            "api": "operational"
        }
    }

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="debug"
    )
