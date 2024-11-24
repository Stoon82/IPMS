from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import tasks, auth

app = FastAPI(title="IPMS API", description="Intelligent Personal Management System API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # React frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(tasks.router)

@app.get("/")
async def root():
    return {
        "message": "Welcome to IPMS API",
        "status": "operational",
        "version": "0.1.0"
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "services": {
            "database": "operational",
            "ai_service": "operational"
        }
    }
