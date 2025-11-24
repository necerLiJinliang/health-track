import os
import sys

from sqlalchemy import and_
from sqlalchemy.orm import Session, joinedload
from sqlalchemy.sql.expression import false, true

sys.path.append(os.path.dirname(os.path.abspath(__file__)))

import random
import string
from datetime import datetime, timedelta
from typing import List, Optional

from passlib.context import CryptContext

import models
import schemas

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def generate_unique_health_id(db: Session) -> str:
    """
    Generate a unique 8-digit health ID
    """
    while True:
        # Generate a random 8-digit number
        health_id = "".join(random.choices(string.digits, k=8))

        # Check if this health_id already exists
        existing_user = (
            db.query(models.User).filter(models.User.health_id == health_id).first()
        )

        # If no user has this health_id, it's unique and we can use it
        if not existing_user:
            return health_id


# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()


def get_user_by_health_id(db: Session, health_id: str):
    return db.query(models.User).filter(models.User.health_id == health_id).first()


def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()


def create_user(db: Session, user: schemas.UserCreate):
    # Generate a unique 8-digit health ID
    health_id = generate_unique_health_id(db)

    db_user = models.User(
        health_id=health_id,
        name=user.name,
        phone_number=user.phone_number,
        phone_verified=user.phone_verified,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def create_user_with_password(db: Session, user: schemas.UserCreateWithPassword):
    hashed_password = pwd_context.hash(user.password)
    # Generate a unique 8-digit health ID
    health_id = generate_unique_health_id(db)

    db_user = models.User(
        health_id=health_id,
        name=user.name,
        phone_number=user.phone_number,
        phone_verified=user.phone_verified,
        password_hash=hashed_password,
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(db: Session, user_id: int, user_update: schemas.UserCreate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.health_id = user_update.health_id
        db_user.name = user_update.name
        db_user.phone_number = user_update.phone_number
        db_user.phone_verified = user_update.phone_verified
        db.commit()
        db.refresh(db_user)
    return db_user


def update_user_phone(db: Session, user_id: int, phone_number: str):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db_user.phone_number = phone_number
        db.commit()
        db.refresh(db_user)
    return db_user


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_user_by_phone_number(db: Session, phone_number: str):
    return (
        db.query(models.User).filter(models.User.phone_number == phone_number).first()
    )


def authenticate_user(db: Session, phone_number: str, password: str):
    user = get_user_by_phone_number(db, phone_number)
    if not user or not user.password_hash:
        return False
    if not verify_password(password, user.password_hash):
        return False
    return user


# Email CRUD operations
def get_email(db: Session, email_id: int):
    return db.query(models.Email).filter(models.Email.id == email_id).first()


def get_email_by_address(db: Session, email_address: str):
    return (
        db.query(models.Email)
        .filter(models.Email.email_address == email_address)
        .first()
    )


def create_email(db: Session, email: schemas.EmailCreate):
    db_email = models.Email(email_address=email.email_address, verified=email.verified)
    db.add(db_email)
    db.commit()
    db.refresh(db_email)
    return db_email


# Provider CRUD operations
def get_provider(db: Session, provider_id: int):
    return db.query(models.Provider).filter(models.Provider.id == provider_id).first()


def get_provider_by_license(db: Session, license_number: str):
    return (
        db.query(models.Provider)
        .filter(models.Provider.license_number == license_number)
        .first()
    )


def get_providers(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Provider).offset(skip).limit(limit).all()


def create_provider(db: Session, provider: schemas.ProviderCreate):
    db_provider = models.Provider(
        license_number=provider.license_number,
        name=provider.name,
        specialty=provider.specialty,
        verified=provider.verified,
    )
    db.add(db_provider)
    db.commit()
    db.refresh(db_provider)
    return db_provider


def get_providers_by_user_id(session: Session, user_id: int):
    user = session.query(models.User).filter(models.User.id == user_id).first()
    if user:
        return user.providers  # 这是一个 Provider 对象的列表
    else:
        return []


def associate_provider_with_user(db: Session, user_id: int, provider_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    provider = (
        db.query(models.Provider).filter(models.Provider.id == provider_id).first()
    )
    if user and provider and provider not in user.providers:
        user.providers.append(provider)
        db.commit()
        return True
    return False


def dissociate_provider_from_user(db: Session, user_id: int, provider_id: int):
    user = db.query(models.User).filter(models.User.id == user_id).first()
    provider = (
        db.query(models.Provider).filter(models.Provider.id == provider_id).first()
    )
    if user and provider and provider in user.providers:
        user.providers.remove(provider)
        db.commit()
        return True
    return False


def delete_user_by_phone_number(db: Session, phone_number):
    user = (
        db.query(models.User).filter(models.User.phone_number == phone_number).first()
    )
    if user:
        db.delete(user)
        db.commit()
        return True
    else:
        return False
    return False


def delete_provider(db: Session, provider_id: int):
    provider = (
        db.query(models.Provider).filter(models.Provider.id == provider_id).first()
    )
    if provider:
        # 只有当Provider没有与任何用户关联时才删除
        if len(provider.users) == 0:
            db.delete(provider)
            db.commit()
            return True
        else:
            # 如果还有用户关联，不删除Provider
            return False
    return False


# def set_primary_provider(db: Session, user_id: int, provider_id: int):
#     user = db.query(models.User).filter(models.User.id == user_id).first()
#     provider = (
#         db.query(models.Provider).filter(models.Provider.id == provider_id).first()
#     )
#     if user and provider:
#         user.primary_provider_id = provider_id
#         db.commit()
#         return True
#     return False


# Appointment CRUD operations
def get_appointment(db: Session, appointment_id: int):
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .first()
    )


def get_appointment_by_appointment_id(db: Session, appointment_id: str):
    return (
        db.query(models.Appointment)
        .filter(models.Appointment.appointment_id == appointment_id)
        .first()
    )


def get_appointments(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Appointment).offset(skip).limit(limit).all()


def get_user_appointments(db: Session, user_id: int):
    return (
        db.query(models.Appointment).filter(models.Appointment.user_id == user_id).all()
    )


def create_appointment(
    db: Session, appointment: schemas.AppointmentCreate, user_id: int
):
    db_appointment = models.Appointment(
        appointment_id=appointment.appointment_id,
        user_id=user_id,
        provider_id=appointment.provider_id,
        date_time=appointment.date_time,
        consultation_type=appointment.consultation_type,
        notes=appointment.notes,
    )
    db.add(db_appointment)
    db.commit()
    db.refresh(db_appointment)
    return db_appointment


def cancel_appointment(db: Session, appointment_id: int, reason: str):
    db_appointment = (
        db.query(models.Appointment)
        .filter(models.Appointment.id == appointment_id)
        .first()
    )
    if db_appointment and not db_appointment.cancelled:
        db_appointment.cancelled = True
        db_appointment.cancellation_reason = reason
        db.commit()
        return True
    return False


# Challenge CRUD operations
def get_challenge(db: Session, challenge_id: int):
    return (
        db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    )


def get_challenge_by_challenge_id(db: Session, challenge_id: str):
    return (
        db.query(models.Challenge)
        .filter(models.Challenge.challenge_id == challenge_id)
        .first()
    )


def get_challenges(db: Session, skip: int = 0, limit: int = 100):
    return (
        db.query(models.Challenge)
        .options(joinedload(models.Challenge.creator))
        .offset(skip)
        .limit(limit)
        .all()
    )


def create_challenge(db: Session, challenge: schemas.ChallengeCreate, creator_id: int):
    db_challenge = models.Challenge(
        challenge_id=challenge.challenge_id,
        creator_id=creator_id,
        goal=challenge.goal,
        start_date=challenge.start_date,
        end_date=challenge.end_date,
    )
    db.add(db_challenge)
    db.commit()
    db.refresh(db_challenge)
    return db_challenge


def add_participant_to_challenge(db: Session, challenge_id: int, user_id: int):
    challenge = (
        db.query(models.Challenge).filter(models.Challenge.id == challenge_id).first()
    )
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if challenge and user and user not in challenge.participants:
        challenge.participants.append(user)
        db.commit()
        return True
    return False


# Family Group CRUD operations
def get_family_group(db: Session, family_group_id: int):
    return (
        db.query(models.FamilyGroup)
        .filter(models.FamilyGroup.id == family_group_id)
        .first()
    )


def create_family_group(db: Session, family_group: schemas.FamilyGroupCreate):
    db_family_group = models.FamilyGroup(name=family_group.name)
    db.add(db_family_group)
    db.commit()
    db.refresh(db_family_group)
    return db_family_group


def add_member_to_family_group(db: Session, family_group_id: int, user_id: int):
    family_group = (
        db.query(models.FamilyGroup)
        .filter(models.FamilyGroup.id == family_group_id)
        .first()
    )
    user = db.query(models.User).filter(models.User.id == user_id).first()
    if family_group and user and user not in family_group.members:
        family_group.members.append(user)
        db.commit()
        return True
    return False


# Invitation CRUD operations
def get_invitation(db: Session, invitation_id: int):
    return (
        db.query(models.Invitation)
        .filter(models.Invitation.id == invitation_id)
        .first()
    )


def create_invitation(
    db: Session, invitation: schemas.InvitationCreate, sender_id: int
):
    db_invitation = models.Invitation(
        sender_id=sender_id,
        recipient_email=invitation.recipient_email,
        recipient_phone=invitation.recipient_phone,
        invitation_type=invitation.invitation_type,
    )
    # Set expiration to 15 days from now
    db_invitation.expired_at = datetime.utcnow() + timedelta(days=15)
    db.add(db_invitation)
    db.commit()
    db.refresh(db_invitation)
    return db_invitation


def accept_invitation(db: Session, invitation_id: int):
    db_invitation = (
        db.query(models.Invitation)
        .filter(models.Invitation.id == invitation_id)
        .first()
    )
    if db_invitation and not db_invitation.is_expired and not db_invitation.is_accepted:
        # Check if invitation is still valid (not expired)
        if datetime.utcnow() < db_invitation.expired_at:
            db_invitation.is_accepted = True
            db_invitation.accepted_at = datetime.utcnow()
            db.commit()
            return True
        else:
            # Mark as expired if past expiration date
            db_invitation.is_expired = True
            db.commit()
    return False
