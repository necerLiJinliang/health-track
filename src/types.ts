export interface User {
  id: number;
  health_id: string;
  name: string;
  phone_number: string;
  phone_verified: boolean;
  primary_provider_id: number | null;
  created_at: string;
  emails: string[];
  providers: Provider[];
}

export interface Email {
  id: number;
  email_address: string;
  verified: boolean;
  created_at: string;
}

export interface Provider {
  id: number;
  license_number: string;
  name: string;
  specialty: string | null;
  verified: boolean;
  created_at: string;
}

// export interface Appointment {
//   id: number;
//   appointment_id: string;
//   user_id: number;
//   provider_id: number;
//   date_time: string;
//   consultation_type: string;
//   notes: string | null;
//   cancelled: boolean;
//   cancellation_reason: string | null;
//   created_at: string;
//   provider: Provider;
// }

export interface Challenge {
  id: number;
  challenge_id: string;
  creator_id: number;
  goal: string;
  start_date: string;
  end_date: string;
  created_at: string;
  participants: User[];
}

export interface FamilyGroup {
  id: number;
  name: string;
  creator_id: number;
  created_at: string;
  family_group_members: FamilyMember[];
}

export interface FamilyMember {
  id: number;
  user_id: number;
  family_group_id: number;
  role: string;
  joined_at: string;
  user_name: string;
}

export interface ProviderAvailability {
  id: number;
  provider_id: number;
  start_time: string;
  end_time: string;
  is_booked: boolean;
  created_at: string;
}
export interface AppointmentData {
  user_name: string;
  provider_name: string;
  provider_id: number;
  date_time: string;
  consultation_type: string;
  notes?: string;
}

export interface Slot {
  id: number;
  provider_id: number;
  name: string;
  specialty: string;
  start_time: string;
  end_time: string;
}

export interface Appointment {
  id: number;
  appointment_id: string;
  provider_id: number;
  date_time: string;
  consultation_type: string;
  notes: string | null;
  cancelled: boolean;
  cancellation_reason: string | null;
  created_at: string;
  user_id: number;
  user_name: string;
  provider_name: string;
  provider_specialty: string;
}
