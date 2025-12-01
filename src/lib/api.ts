import { User } from "@/types";
import { handleApiError } from "@/lib/apiErrorHandler";
import Cookies from "js-cookie";

const API_BASE_URL = "http://localhost:8000";

// 获取认证令牌
const getAuthToken = () => {
  return Cookies.get("authToken");
};

// 创建带认证和cookies的fetch选项
const getAuthFetchOptions = (options: RequestInit = {}) => {
  const token = getAuthToken();
  return {
    ...options,
    headers: token
      ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      }
      : {
        "Content-Type": "application/json",
        ...options.headers,
      },
  };
};

// User API
export const createUser = async (userData: Partial<User>) => {
  const response = await fetch(
    `${API_BASE_URL}/users/`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify(userData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateUserInfo = async (userData: Partial<User>) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userData.id}`,
    getAuthFetchOptions({
      method: "PUT",
      body: JSON.stringify(userData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const updateUserPhone = async (
  userId: number | undefined,
  phoneNumber: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/phone/${phoneNumber}`,
    getAuthFetchOptions({
      method: "PUT",
      body: JSON.stringify({ phone_number: phoneNumber }),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getUserInfo = async (userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }
  return response.json();
};

export const getUserEmails = async (userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/emails/`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }
  const data = await response.json();
  console.log("getUserEmail:", data);
  return data;
};

export const addUserEmail = async (
  userId: number | undefined,
  email: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/emails`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify({
        email_address: email,
        verified: true,
      }),
    }),
  );
  if (!response.ok) {
    await handleApiError(response);
  }
};

export const deleteEmailFromUser = async (
  userId: number,
  email_address: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/emails/${encodeURIComponent(
      email_address,
    )}`,
    getAuthFetchOptions({
      method: "DELETE",
    }),
  );
  if (!response.ok) {
    await handleApiError(response);
  }
  return response.json();
};

export const associateProviderWithUser = async (
  userId: number,
  providerId: number,
) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/providers/${providerId}`,
    getAuthFetchOptions({
      method: "POST",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const dissociateProviderFromUser = async (
  userId: number,
  providerId: number,
) => {
  const response = await fetch(
    `${API_BASE_URL}/users/${userId}/providers/${providerId}`,
    getAuthFetchOptions({
      method: "DELETE",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// Provider API
export const getAssociatedProvider = async (userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/providers/user/${userId}`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const providersData = await response.json();
  return providersData.map((provider: any) => ({
    id: provider.id,
    license_number: provider.license_number,
    name: provider.name,
    specialty: provider.specialty,
    verified: provider.verified,
    created_at: provider.created_at,
  }));
};

// 获取与特定用户关联的提供者
export const getAssociatedProviders = async (userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/providers/${userId}`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const providersData = await response.json();
  return providersData.map((provider: any) => ({
    id: provider.id,
    license_number: provider.license_number,
    name: provider.name,
    specialty: provider.specialty,
    verified: provider.verified,
    created_at: provider.created_at,
  }));
};

interface ProviderData {
  name: string;
  license_number: string;
  specialty?: string;
  verified?: boolean;
}

export const createProvider = async (providerData: ProviderData) => {
  const response = await fetch(
    `${API_BASE_URL}/providers/`,
    getAuthFetchOptions({
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(providerData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

interface AppointmentData {
  provider_id: number;
  date_time: string;
  consultation_type: string;
  notes?: string;
}

// Appointment API
export const createAppointment = async (
  appointmentData: AppointmentData,
  userId: number,
) => {
  const response = await fetch(
    `${API_BASE_URL}/appointments/?user_id=${userId}`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify(appointmentData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getUserAppointments = async (userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/appointments/user/${userId}`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const appointmentsData = await response.json();
  return appointmentsData.map((appointment: any) => ({
    id: appointment.id,
    appointment_id: appointment.appointment_id,
    user_id: appointment.user_id,
    provider_id: appointment.provider_id,
    date_time: appointment.date_time,
    consultation_type: appointment.consultation_type,
    notes: appointment.notes,
    cancelled: appointment.cancelled,
    cancellation_reason: appointment.cancellation_reason,
    created_at: appointment.created_at,
    provider: appointment.provider,
  }));
};

export const cancelAppointment = async (
  appointmentId: number,
  reason: string,
) => {
  const response = await fetch(
    `${API_BASE_URL}/appointments/${appointmentId}/cancel`,
    getAuthFetchOptions({
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ reason }),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

interface ChallengeData {
  goal: string;
  start_date: string;
  end_date: string;
}

// Challenge API
export const createChallenge = async (
  challengeData: ChallengeData,
  creatorId: number,
) => {
  const response = await fetch(
    `${API_BASE_URL}/challenges/?creator_id=${creatorId}`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify(challengeData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getChallenges = async () => {
  const response = await fetch(
    `${API_BASE_URL}/challenges/`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const challengesData = await response.json();
  return challengesData.map((challenge: any) => ({
    id: challenge.id,
    challenge_id: challenge.challenge_id,
    creator_id: challenge.creator_id,
    goal: challenge.goal,
    start_date: challenge.start_date,
    end_date: challenge.end_date,
    created_at: challenge.created_at,
    participants: challenge.participants || [],
  }));
};

export const joinChallenge = async (challengeId: number, userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/challenges/${challengeId}/participants/${userId}`,
    getAuthFetchOptions({
      method: "POST",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getChallengeParticipants = async (challengeId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/challenges/${challengeId}/participants`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

interface FamilyGroupData {
  name: string;
  owner_id: number;
}

// Family Group API
export const createFamilyGroup = async (familyGroupData: FamilyGroupData, userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/family_groups/${userId}`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify(familyGroupData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getFamilyGroups = async (userId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/family_groups/user/${userId}`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  const familyGroupsData = await response.json();
  return familyGroupsData.map((group: any) => ({
    id: group.id,
    group_id: group.group_id,
    name: group.name,
    creator_id: group.creator_id,
    created_at: group.created_at,
    members: group.members || [],
  }));
};

interface FamilyMemberData {
  user_id: number;
  role: string;
}

export const addFamilyMember = async (
  groupId: number,
  memberData: FamilyMemberData,
) => {
  const response = await fetch(
    `${API_BASE_URL}/family_groups/${groupId}/members/`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify(memberData),
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getFamilyMembers = async (groupId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/family_groups/${groupId}/members/`,
    getAuthFetchOptions({
      method: "GET",
    }),
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

// 获取当前用户信息
export const getCurrentUser = async (): Promise<User> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("No authentication token found");
  }

  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user data");
  }

  return response.json();
};

// Provider Availability API
interface ProviderAvailabilityData {
  provider_id: number;
  start_time: string;
  end_time: string;
  is_booked?: boolean;
}

export const createProviderAvailability = async (
  availabilityData: ProviderAvailabilityData
) => {
  const response = await fetch(
    `${API_BASE_URL}/providers-availability/`,
    getAuthFetchOptions({
      method: "POST",
      body: JSON.stringify(availabilityData),
    })
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getProviderAvailabilities = async (providerId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/providers-availability/${providerId}`,
    getAuthFetchOptions({
      method: "GET",
    })
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getAvailableProviderSlots = async (providerId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/providers-availability/${providerId}/available`,
    getAuthFetchOptions({
      method: "GET",
    })
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const getAllProvidersAvailableSlots = async () => {
  const response = await fetch(
    `${API_BASE_URL}/providers-availability/all/available`,
    getAuthFetchOptions({
      method: "GET",
    })
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};

export const deleteProviderAvailability = async (availabilityId: number) => {
  const response = await fetch(
    `${API_BASE_URL}/providers-availability/${availabilityId}`,
    getAuthFetchOptions({
      method: "DELETE",
    })
  );

  if (!response.ok) {
    await handleApiError(response);
  }

  return response.json();
};
