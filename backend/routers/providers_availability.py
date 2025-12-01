from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(
    prefix="/providers-availability",
    tags=["providers-availability"]
)

@router.post("/", response_model=schemas.ProviderAvailability)
def create_provider_availability(availability: schemas.ProviderAvailabilityCreate, db: Session = Depends(get_db)):
    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=availability.provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    
    return crud.create_provider_availability(db=db, availability=availability)

@router.get("/{provider_id}", response_model=List[schemas.ProviderAvailability])
def read_provider_availabilities(provider_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    availabilities = crud.get_provider_availabilities(db, provider_id=provider_id, skip=skip, limit=limit)
    return availabilities

@router.get("/all/available", response_model=List[schemas.ProviderAvailability])
def read_all_providers_available_slots(db: Session = Depends(get_db)):
    print("Getting all providers available slots")
    availabilities = crud.get_all_providers_available_slots(db)
    print(f"Returning {len(availabilities)} availabilities")
    return availabilities

@router.get("/{provider_id}/available", response_model=List[schemas.ProviderAvailability])
def read_available_provider_slots(provider_id: int, db: Session = Depends(get_db)):
    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
        
    availabilities = crud.get_available_provider_slots(db, provider_id=provider_id)
    return availabilities

@router.get("/{availability_id}", response_model=schemas.ProviderAvailability)
def read_provider_availability(availability_id: int, db: Session = Depends(get_db)):
    db_availability = crud.get_provider_availability(db, availability_id=availability_id)
    if db_availability is None:
        raise HTTPException(status_code=404, detail="Provider availability not found")
    return db_availability

@router.delete("/{availability_id}")
def delete_provider_availability(availability_id: int, db: Session = Depends(get_db)):
    result = crud.delete_provider_availability(db, availability_id=availability_id)
    if not result:
        raise HTTPException(status_code=404, detail="Provider availability not found")
    return {"message": "Provider availability deleted successfully"}