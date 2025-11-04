from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

from database import engine, Base
from routers import users, providers, appointments, challenges, family_groups, invitations, auth

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="HealthTrack API",
    description="Backend API for the HealthTrack Personal Wellness Platform",
    version="1.0.0"
)

# CORS middleware to allow frontend to communicate with backend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify exact origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include all routers
app.include_router(users.router)
app.include_router(providers.router)
app.include_router(appointments.router)
app.include_router(challenges.router)
app.include_router(family_groups.router)
app.include_router(invitations.router)
app.include_router(auth.router)

@app.get("/")
async def root():
    return {"message": "Welcome to HealthTrack API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)