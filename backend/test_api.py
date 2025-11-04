import requests
import json
from datetime import datetime, timedelta

# Base URL for the API
BASE_URL = "http://localhost:8000"

def test_user_operations():
    """Test user-related operations"""
    print("Testing User Operations...")
    
    # Create a user
    user_data = {
        "health_id": "H123456789",
        "name": "John Doe",
        "phone_number": "+1234567890",
        "phone_verified": True
    }
    
    response = requests.post(f"{BASE_URL}/users/", json=user_data)
    print(f"Create user response: {response.status_code}")
    if response.status_code == 200:
        user = response.json()
        user_id = user["id"]
        print(f"Created user with ID: {user_id}")
    else:
        print(f"Error creating user: {response.text}")
        return
    
    # Add an email to the user
    email_data = {
        "email_address": "john.doe@example.com",
        "verified": True
    }
    
    response = requests.post(f"{BASE_URL}/users/{user_id}/emails/", json=email_data)
    print(f"Add email to user response: {response.status_code}")
    if response.status_code == 200:
        print(f"Added email to user")
    else:
        print(f"Error adding email: {response.text}")

def test_provider_operations():
    """Test provider-related operations"""
    print("\nTesting Provider Operations...")
    
    # Create a provider
    provider_data = {
        "license_number": "L123456789",
        "name": "Dr. Jane Smith",
        "specialty": "Cardiology",
        "verified": True
    }
    
    response = requests.post(f"{BASE_URL}/providers/", json=provider_data)
    print(f"Create provider response: {response.status_code}")
    if response.status_code == 200:
        provider = response.json()
        provider_id = provider["id"]
        print(f"Created provider with ID: {provider_id}")
        return provider_id
    else:
        print(f"Error creating provider: {response.text}")
        return None

def test_appointment_operations(user_id, provider_id):
    """Test appointment-related operations"""
    print("\nTesting Appointment Operations...")
    
    # Create an appointment
    appointment_time = datetime.now() + timedelta(days=7)
    appointment_data = {
        "appointment_id": "A123456789",
        "provider_id": provider_id,
        "date_time": appointment_time.isoformat(),
        "consultation_type": "in-person",
        "notes": "Regular checkup"
    }
    
    response = requests.post(f"{BASE_URL}/appointments/?user_id={user_id}", json=appointment_data)
    print(f"Create appointment response: {response.status_code}")
    if response.status_code == 200:
        appointment = response.json()
        appointment_id = appointment["id"]
        print(f"Created appointment with ID: {appointment_id}")
        return appointment_id
    else:
        print(f"Error creating appointment: {response.text}")
        return None

def test_challenge_operations(user_id):
    """Test challenge-related operations"""
    print("\nTesting Challenge Operations...")
    
    # Create a challenge
    start_date = datetime.now()
    end_date = start_date + timedelta(days=30)
    challenge_data = {
        "challenge_id": "C123456789",
        "goal": "Walk 100 miles in a month",
        "start_date": start_date.isoformat(),
        "end_date": end_date.isoformat()
    }
    
    response = requests.post(f"{BASE_URL}/challenges/?creator_id={user_id}", json=challenge_data)
    print(f"Create challenge response: {response.status_code}")
    if response.status_code == 200:
        challenge = response.json()
        challenge_id = challenge["id"]
        print(f"Created challenge with ID: {challenge_id}")
        return challenge_id
    else:
        print(f"Error creating challenge: {response.text}")
        return None

def test_family_group_operations():
    """Test family group operations"""
    print("\nTesting Family Group Operations...")
    
    # Create a family group
    family_group_data = {
        "name": "Doe Family"
    }
    
    response = requests.post(f"{BASE_URL}/family-groups/", json=family_group_data)
    print(f"Create family group response: {response.status_code}")
    if response.status_code == 200:
        family_group = response.json()
        family_group_id = family_group["id"]
        print(f"Created family group with ID: {family_group_id}")
        return family_group_id
    else:
        print(f"Error creating family group: {response.text}")
        return None

def main():
    """Main test function"""
    print("Starting HealthTrack API Tests...")
    
    # Test user operations
    test_user_operations()
    
    # Test provider operations
    provider_id = test_provider_operations()
    
    # For a complete test, we would need to get the actual user ID from the database
    # For now, we'll use a placeholder
    user_id = 1
    
    if provider_id:
        # Test appointment operations
        test_appointment_operations(user_id, provider_id)
    
    # Test challenge operations
    test_challenge_operations(user_id)
    
    # Test family group operations
    test_family_group_operations()
    
    print("\nAPI tests completed!")

if __name__ == "__main__":
    main()