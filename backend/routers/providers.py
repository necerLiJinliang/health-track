from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(
    prefix="/providers",
    tags=["providers"]
)

@router.post("/", response_model=schemas.Provider)
def create_provider(provider: schemas.ProviderCreate, db: Session = Depends(get_db)):
    db_provider = crud.get_provider_by_license(db, license_number=provider.license_number)
    if db_provider:
        raise HTTPException(status_code=400, detail="Provider with this license number already exists")
    return crud.create_provider(db=db, provider=provider)

@router.get("/{provider_id}", response_model=schemas.Provider)
def read_provider(provider_id: int, db: Session = Depends(get_db)):
    db_provider = crud.get_provider(db, provider_id=provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    return db_provider

@router.get("/", response_model=List[schemas.Provider])
def read_providers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    providers = crud.get_providers(db, skip=skip, limit=limit)
    return providers