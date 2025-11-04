from database import SessionLocal
from models import User, Email, Provider, Appointment, Challenge, FamilyGroup
from datetime import datetime, timedelta
import uuid

def create_sample_data():
    # Create a database session
    db = SessionLocal()
    
    try:
        # Create sample users
        user1 = User(
            health_id="H123456789",
            name="John Doe",
            phone_number="+1234567890",
            phone_verified=True
        )
        db.add(user1)
        
        user2 = User(
            health_id="H987654321",
            name="Jane Smith",
            phone_number="+0987654321",
            phone_verified=True
        )
        db.add(user2)
        
        # Create sample emails
        email1 = Email(
            email_address="john.doe@example.com",
            verified=True
        )
        db.add(email1)
        
        email2 = Email(
            email_address="jane.smith@example.com",
            verified=True
        )
        db.add(email2)
        
        # Associate emails with users
        user1.emails.append(email1)
        user2.emails.append(email2)
        
        # Create sample providers
        provider1 = Provider(
            license_number="L123456789",
            name="Dr. Michael Johnson",
            specialty="Cardiology",
            verified=True
        )
        db.add(provider1)
        
        provider2 = Provider(
            license_number="L987654321",
            name="Dr. Sarah Williams",
            specialty="Pediatrics",
            verified=True
        )
        db.add(provider2)
        
        # Associate providers with users
        user1.providers.append(provider1)
        user1.providers.append(provider2)
        user2.providers.append(provider2)
        
        # Set primary provider for user1
        user1.primary_provider_id = provider1.id
        
        # Create sample appointments
        appointment1 = Appointment(
            appointment_id=str(uuid.uuid4()),
            user_id=user1.id,
            provider_id=provider1.id,
            date_time=datetime.now() + timedelta(days=7),
            consultation_type="in-person",
            notes="Regular checkup"
        )
        db.add(appointment1)
        
        appointment2 = Appointment(
            appointment_id=str(uuid.uuid4()),
            user_id=user2.id,
            provider_id=provider2.id,
            date_time=datetime.now() + timedelta(days=14),
            consultation_type="online",
            notes="Follow-up consultation"
        )
        db.add(appointment2)
        
        # Create sample challenges
        challenge1 = Challenge(
            challenge_id=str(uuid.uuid4()),
            creator_id=user1.id,
            goal="Walk 100 miles in a month",
            start_date=datetime.now(),
            end_date=datetime.now() + timedelta(days=30)
        )
        db.add(challenge1)
        
        # Add participants to challenge
        challenge1.participants.append(user1)
        challenge1.participants.append(user2)
        
        # Create sample family group
        family_group = FamilyGroup(
            name="Doe Family"
        )
        db.add(family_group)
        
        # Add members to family group
        family_group.members.append(user1)
        family_group.members.append(user2)
        
        # Commit all changes
        db.commit()
        print("Sample data created successfully!")
        
    except Exception as e:
        db.rollback()
        print(f"Error creating sample data: {e}")
        
    finally:
        db.close()

if __name__ == "__main__":
    create_sample_data()