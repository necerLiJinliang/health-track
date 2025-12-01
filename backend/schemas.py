from pydantic import BaseModel
from datetime import datetime
from typing import List, Optional

# User schemas
class EmailBase(BaseModel):
    email_address: str
    verified: bool = False

class EmailCreate(EmailBase):
    pass

class Email(EmailBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class ProviderBase(BaseModel):
    license_number: str
    name: str
    specialty: Optional[str] = None
    verified: bool = False

class ProviderCreate(ProviderBase):
    pass

class Provider(ProviderBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class UserBase(BaseModel):
    health_id: str
    name: str
    phone_number: Optional[str] = None
    phone_verified: bool = False

class UserCreateWithPassword(UserBase):
    password: str

class UserCreate(UserBase):
    pass

class UserRegister(BaseModel):
    name: str
    phone_number: Optional[str] = None
    phone_verified: bool = False
    password: str

class User(UserBase):
    id: int
    primary_provider_id: Optional[int] = None
    created_at: datetime
    emails: List[Email] = []
    providers: List[Provider] = []
    
    class Config:
        from_attributes = True

# Appointment schemas
class AppointmentBase(BaseModel):
    appointment_id: str
    provider_id: int
    date_time: datetime
    consultation_type: str  # "in-person" or "online"
    notes: Optional[str] = None

class AppointmentCreate(AppointmentBase):
    pass

class Appointment(AppointmentBase):
    id: int
    user_id: int
    cancelled: bool = False
    cancellation_reason: Optional[str] = None
    created_at: datetime
    
    class Config:
        from_attributes = True

# Challenge schemas
class ChallengeBase(BaseModel):
    challenge_id: str
    goal: str
    start_date: datetime
    end_date: datetime

class ChallengeCreate(ChallengeBase):
    pass

class Challenge(ChallengeBase):
    id: int
    creator_id: Optional[int] = None
    created_at: datetime
    participants: List[User] = []
    
    class Config:
        from_attributes = True

# Family Group schemas
class FamilyGroupBase(BaseModel):
    name: str

class FamilyGroupCreate(FamilyGroupBase):
    pass

class FamilyGroupMemberBase(BaseModel):
    role: str = "member"

class FamilyGroupMemberCreate(FamilyGroupMemberBase):
    user_id: int

class FamilyGroupMember(FamilyGroupMemberBase):
    id: int
    family_group_id: int
    user_id: int
    joined_at: datetime
    
    class Config:
        from_attributes = True

class FamilyGroup(FamilyGroupBase):
    id: int
    created_at: datetime
    members: List[User] = []
    family_group_members: List[FamilyGroupMember] = []
    
    class Config:
        from_attributes = True

# Invitation schemas
class InvitationBase(BaseModel):
    recipient_email: Optional[str] = None
    recipient_phone: Optional[str] = None
    invitation_type: str  # "challenge" or "data_sharing"

class InvitationCreate(InvitationBase):
    pass

class Invitation(InvitationBase):
    id: int
    sender_id: int
    sent_at: datetime
    accepted_at: Optional[datetime] = None
    expired_at: Optional[datetime] = None
    is_accepted: bool = False
    is_expired: bool = False
    
    class Config:
        from_attributes = True


# Provider Availability schemas
class ProviderAvailabilityBase(BaseModel):
    provider_id: int
    start_time: datetime
    end_time: datetime
    is_booked: bool = False

class ProviderAvailabilityCreate(ProviderAvailabilityBase):
    pass

class ProviderAvailability(ProviderAvailabilityBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True