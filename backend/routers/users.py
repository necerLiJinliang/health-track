import os
import sys
from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from starlette.types import Message

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import crud
import models
import schemas
from database import get_db

router = APIRouter(prefix="/users", tags=["users"])


@router.post("/", response_model=schemas.User)
def create_user(user: schemas.UserRegister, db: Session = Depends(get_db)):
    # 检查手机号是否已被使用
    if user.phone_number:
        db_user = crud.get_user_by_phone_number(db, phone_number=user.phone_number)
        if db_user:
            raise HTTPException(
                status_code=400, detail="User with this phone number already exists"
            )
    # 创建UserCreateWithPassword实例，health_id将由系统生成
    user_with_password = schemas.UserCreateWithPassword(
        health_id="",  # 这个字段会被系统忽略，因为health_id由create_user_with_password函数生成
        name=user.name,
        phone_number=user.phone_number,
        phone_verified=user.phone_verified,
        password=user.password,
    )
    return crud.create_user_with_password(db=db, user=user_with_password)


@router.get("/{user_id}", response_model=schemas.User)
def read_user(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/emial/{email_address}", response_model=List[schemas.User])
def read_user_by_email(email_address: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email_address(db, email_address=email_address)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.get("/phone/{phone_number}", response_model=List[schemas.User])
def read_user_by_phone(phone_number: str, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_phone_number(db, phone_number=phone_number)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.delete("/phone/{phone_number}")
def delete_user_by_phone_number(phone_number: str, db: Session = Depends(get_db)):
    users_deleted = crud.delete_user_by_phone_number(db=db, phone_number=phone_number)
    if users_deleted:
        return {
            "message": f"User with phone number {phone_number} deleted successfully"
        }
    raise HTTPException(status_code=404, detail="User not found")


@router.get("/", response_model=List[schemas.User])
def read_users(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    users = crud.get_users(db, skip=skip, limit=limit)
    return users


@router.put("/{user_id}", response_model=schemas.User)
def update_user(user_id: int, user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = crud.update_user(db, user_id=user_id, user_update=user)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user


@router.put("/{user_id}/phone/{phone_number}", response_model=schemas.User)
def update_user_phone(
    user_id: int,
    phone_number: str,
    db: Session = Depends(get_db),
):
    # 查询所有的电话号码
    users = crud.get_user_by_phone_number(db, phone_number=phone_number)
    if users:
        raise HTTPException(status_code=404, detail="Phone number already in use")
    db_user = crud.update_user_phone(db, user_id=user_id, phone_number=phone_number)
    return db_user


@router.get("/{user_id}/emails/", response_model=List[schemas.Email])
def get_user_emails(user_id: int, db: Session = Depends(get_db)):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return db_user.emails


@router.post("/{user_id}/emails", response_model=schemas.Email)
def add_email_to_user(
    user_id: int, email: schemas.EmailCreate, db: Session = Depends(get_db)
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_email = crud.get_email_by_address(db, email_address=email.email_address)
    if not db_email:
        db_email = crud.create_email(db=db, email=email)
    elif db_email.users:
        # 如果Email已经关联了其他用户，抛出错误
        if db_email.users[0].id != user_id:
            raise HTTPException(
                status_code=400, detail="Email already associated with other user"
            )

    if db_email not in db_user.emails:
        db_user.emails.append(db_email)
        db.commit()
    else:
        raise HTTPException(
            status_code=400, detail="Email already associated with user"
        )

    return db_email


@router.delete("/{user_id}/emails/{email_address}")
def delete_email_from_user(
    user_id: int, email_address: str, db: Session = Depends(get_db)
):
    db_user = crud.get_user(db, user_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")

    db_email = crud.get_email_by_address(db, email_address=email_address)
    if db_email is None or db_email not in db_user.emails:
        raise HTTPException(status_code=404, detail="Email not associated with user")

    db_user.emails.remove(db_email)
    db.commit()
    return {"message": "Email dissociated from user successfully"}


@router.post("/{user_id}/providers/{provider_id}")
def associate_provider_with_user(
    user_id: int, provider_id: int, db: Session = Depends(get_db)
):
    result = crud.associate_provider_with_user(
        db, user_id=user_id, provider_id=provider_id
    )
    if not result:
        raise HTTPException(
            status_code=404,
            detail="User or provider not found, or association already exists",
        )
    return {"message": "Provider associated with user successfully"}


# 删除和用户关联的Provider
@router.delete("/{user_id}/providers/{provider_id}")
def dissociate_provider_from_user(
    user_id: int, provider_id: int, db: Session = Depends(get_db)
):
    # 先断开用户和Provider的关联
    result = crud.dissociate_provider_from_user(
        db, user_id=user_id, provider_id=provider_id
    )
    print(user_id, provider_id)
    if not result:
        raise HTTPException(
            status_code=404,
            detail="User or provider not found, or association does not exist",
        )

    # 然后尝试删除Provider（只有当Provider不再与任何用户关联时才会被删除）
    provider_deleted = crud.delete_provider(db, provider_id=provider_id)

    if provider_deleted:
        return {"message": "Provider dissociated from user and deleted successfully"}
    else:
        return {
            "message": "Provider dissociated from user successfully, but not deleted (may still be associated with other users)"
        }


@router.put("/{user_id}/primary-provider/{provider_id}")
def set_primary_provider(user_id: int, provider_id: int, db: Session = Depends(get_db)):
    result = crud.set_primary_provider(db, user_id=user_id, provider_id=provider_id)
    if not result:
        raise HTTPException(status_code=404, detail="User or provider not found")
    return {"message": "Primary provider set successfully"}
