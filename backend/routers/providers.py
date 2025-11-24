from math import log
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
# import logger
import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/providers", tags=["providers"])


@router.post("/", response_model=schemas.Provider)
def create_provider(provider: schemas.ProviderCreate, db: Session = Depends(get_db)):
    db_provider = crud.get_provider_by_license(
        db, license_number=provider.license_number
    )
    if db_provider:
        raise HTTPException(
            status_code=400, detail="Provider with this license number already exists"
        )
    return crud.create_provider(db=db, provider=provider)


@router.get("/user/{user_id}", response_model=List[schemas.Provider])
def get_provider_by_user_id(user_id: int, db: Session = Depends(get_db)):
    user_providers = crud.get_providers_by_user_id(db, user_id=user_id)
    if user_providers is None:
        return []
    return user_providers


@router.delete("/license/{license_number}")
def delete_provider_by_license(license_number: str, db: Session = Depends(get_db)):
    """
    调用方式示例：
    DELETE http://<host>:<port>/providers/license/{license_number}
    其中 license_number 替换为要删除的提供商执照号码。
    """
    print(f"Deleting provider with license number: {license_number}")
    # print(license_number)
    db_provider = crud.get_provider_by_license(db, license_number=license_number)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    crud.delete_provider(db, provider_id=db_provider.id)
    return {"message": "Provider deleted successfully"}


@router.get("/{provider_id}", response_model=schemas.Provider)
def read_provider(provider_id: int, db: Session = Depends(get_db)):
    db_provider = crud.get_provider(db, provider_id=provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    return db_provider


@router.get("/license/{license_number}", response_model=schemas.Provider)
def read_provider_by_license(license_number: str, db: Session = Depends(get_db)):
    db_provider = crud.get_provider_by_license(db, license_number=license_number)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")
    return db_provider


@router.get("/", response_model=List[schemas.Provider])
def read_providers(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    providers = crud.get_providers(db, skip=skip, limit=limit)
    return providers
