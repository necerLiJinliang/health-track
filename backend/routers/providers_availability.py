from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

import sys
import os
from datetime import datetime

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud, models, schemas
from database import get_db

router = APIRouter(prefix="/providers-availability", tags=["providers-availability"])


@router.post("/", response_model=schemas.ProviderAvailability)
def create_provider_availability(
    availability: schemas.ProviderAvailabilityCreate, db: Session = Depends(get_db)
):
    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=availability.provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")

    return crud.create_provider_availability(db=db, availability=availability)


@router.get("/{provider_id}", response_model=List[schemas.ProviderAvailability])
def read_provider_availabilities(
    provider_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")

    availabilities = crud.get_provider_availabilities(
        db, provider_id=provider_id, skip=skip, limit=limit
    )
    return availabilities


@router.get("/all/available", response_model=List[schemas.ProviderAvailabilityExpand])
def read_all_providers_available_slots(db: Session = Depends(get_db)):
    print("Getting all providers available slots")
    availabilities = crud.get_all_providers_available_slots(db)
    # print(22222, availabilities[0].start_time)
    # available_slots = [
    #     slot for slot in availabilities if slot.end_time > datetime.now()
    # ]
    available_slots = availabilities
    """available_slot 
    {"provider_id": provider_id, 
    "start_time": start_time, 
    "end_time": end_time,
    "is_booked": is_booked,
    "id": id,
    "created_at": created_at}
    """
    # 根据Providerid找到Provider用户的名称，license和name
    res = []
    for slot in available_slots:
        res.append(
            {
                "provider_id": slot.provider_id,
                "start_time": slot.start_time,
                "end_time": slot.end_time,
                "is_booked": slot.is_booked,
                "id": slot.id,
                "created_at": slot.created_at,
                "name": slot.provider.name,
                "specialty": slot.provider.specialty,
            }
        )
    print(res)
    print(f"Returning {len(res)} availabilities")
    return res


@router.get(
    "/{provider_id}/available", response_model=List[schemas.ProviderAvailability]
)
def read_available_provider_slots(provider_id: int, db: Session = Depends(get_db)):
    # Verify provider exists
    db_provider = crud.get_provider(db, provider_id=provider_id)
    if db_provider is None:
        raise HTTPException(status_code=404, detail="Provider not found")

    availabilities = crud.get_available_provider_slots(db, provider_id=provider_id)
    return availabilities


@router.get("/{availability_id}", response_model=schemas.ProviderAvailability)
def read_provider_availability(availability_id: int, db: Session = Depends(get_db)):
    db_availability = crud.get_provider_availability(
        db, availability_id=availability_id
    )
    if db_availability is None:
        raise HTTPException(status_code=404, detail="Provider availability not found")
    return db_availability


@router.delete("/{availability_id}")
def delete_provider_availability(availability_id: int, db: Session = Depends(get_db)):
    result = crud.delete_provider_availability(db, availability_id=availability_id)
    if not result:
        raise HTTPException(status_code=404, detail="Provider availability not found")
    return {"message": "Provider availability deleted successfully"}
