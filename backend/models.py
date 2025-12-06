from datetime import datetime
from typing import List, Optional

from sqlalchemy import Boolean, Column, DateTime, ForeignKey, Integer, String, Table
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

# Association table for user-email relationships
user_email_association = Table(
    "user_emails",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("email_id", Integer, ForeignKey("emails.id")),
)

# Association table for user-provider relationships
user_provider_association = Table(
    "user_providers",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("users.id")),
    Column("provider_id", Integer, ForeignKey("providers.id")),
)

# Association table for challenge participants
challenge_participant_association = Table(
    "challenge_participants",
    Base.metadata,
    Column("challenge_id", Integer, ForeignKey("challenges.id")),
    Column("user_id", Integer, ForeignKey("users.id")),
)


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    health_id = Column(String, unique=True, index=True)  # Unique 8-digit health ID
    name = Column(String, index=True)
    phone_number = Column(String, unique=True, index=True)  # Phone number is now unique
    phone_verified = Column(Boolean, default=False)
    password_hash = Column(String)  # For authentication
    primary_provider_id = Column(Integer, ForeignKey("providers.id"), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    emails = relationship(
        "Email", secondary=user_email_association, back_populates="users"
    )
    providers = relationship(
        "Provider", secondary=user_provider_association, back_populates="users"
    )
    appointments = relationship("Appointment", back_populates="user")
    challenges_created = relationship(
        "Challenge", foreign_keys="Challenge.creator_id", back_populates="creator"
    )
    challenges_participating = relationship(
        "Challenge",
        secondary=challenge_participant_association,
        back_populates="participants",
    )
    family_group_memberships = relationship("FamilyGroupMember", back_populates="user")
    # family_groups relationship is now accessed through family_group_memberships


class Email(Base):
    __tablename__ = "emails"

    id = Column(Integer, primary_key=True, index=True)
    email_address = Column(String, unique=True, index=True)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship(
        "User", secondary=user_email_association, back_populates="emails"
    )


class Provider(Base):
    __tablename__ = "providers"

    id = Column(Integer, primary_key=True, index=True)
    license_number = Column(
        String, unique=True, index=True
    )  # Unique medical license number
    name = Column(String, index=True)
    specialty = Column(String)
    verified = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    users = relationship(
        "User", secondary=user_provider_association, back_populates="providers"
    )
    appointments = relationship("Appointment", back_populates="provider")
    availabilities = relationship("ProviderAvailability", back_populates="provider")


class Appointment(Base):
    __tablename__ = "appointments"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    provider_id = Column(Integer, ForeignKey("providers.id"))
    user_name = Column(String)
    provider_name = Column(String)
    date_time = Column(DateTime)
    consultation_type = Column(String)  # "in-person" or "online"
    notes = Column(String, nullable=True)
    cancelled = Column(Boolean, default=False)
    cancellation_reason = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    user = relationship("User", back_populates="appointments")
    provider = relationship("Provider", back_populates="appointments")


class Challenge(Base):
    __tablename__ = "challenges"

    id = Column(Integer, primary_key=True, index=True)
    challenge_id = Column(String, unique=True, index=True)  # Unique challenge ID
    creator_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    goal = Column(String)  # Challenge goal (e.g., "Walk 100 miles in a month")
    start_date = Column(DateTime)
    end_date = Column(DateTime)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    creator = relationship(
        "User", foreign_keys=[creator_id], back_populates="challenges_created"
    )
    participants = relationship(
        "User",
        secondary=challenge_participant_association,
        back_populates="challenges_participating",
    )


class FamilyGroup(Base):
    __tablename__ = "family_groups"

    id = Column(Integer, primary_key=True, index=True)
    owner_id = Column(Integer, ForeignKey("users.id"))
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    # members relationship is now accessed through family_group_members
    family_group_members = relationship(
        "FamilyGroupMember", back_populates="family_group"
    )


class FamilyGroupMember(Base):
    __tablename__ = "family_group_members"

    id = Column(Integer, primary_key=True, index=True)
    family_group_id = Column(Integer, ForeignKey("family_groups.id"))
    user_id = Column(Integer, ForeignKey("users.id"))
    role = Column(String, default="member")  # member, caregiver, admin
    joined_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    family_group = relationship("FamilyGroup", back_populates="family_group_members")
    user = relationship("User", back_populates="family_group_memberships")


class Invitation(Base):
    __tablename__ = "invitations"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, ForeignKey("users.id"))
    recipient_email = Column(String, nullable=True)  # For unregistered users
    recipient_phone = Column(String, nullable=True)  # For unregistered users
    invitation_type = Column(String)  # "challenge", "data_sharing", or "family_group"
    challenge_id = Column(
        Integer, ForeignKey("challenges.id"), nullable=True
    )  # For challenge invitations
    family_group_id = Column(
        Integer, ForeignKey("family_groups.id"), nullable=True
    )  # For family group invitations
    sent_at = Column(DateTime, default=datetime.utcnow)
    accepted_at = Column(DateTime, nullable=True)
    expired_at = Column(DateTime, nullable=True)
    is_accepted = Column(Boolean, default=False)
    is_expired = Column(Boolean, default=False)
    is_rejected = Column(Boolean, default=False)
    rejected_at = Column(DateTime, nullable=True)


class ProviderAvailability(Base):
    __tablename__ = "provider_availabilities"

    id = Column(Integer, primary_key=True, index=True)
    provider_id = Column(Integer, ForeignKey("providers.id"))
    start_time = Column(DateTime)
    end_time = Column(DateTime)
    is_booked = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationships
    provider = relationship("Provider", back_populates="availabilities")
