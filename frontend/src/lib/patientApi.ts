import { apiRequest } from './api'
import type { AccountUser, TreatmentPlan, TimelineData } from './api'

// --- Types ---

export type PatientSummary = {
  currentGlucose: number
  glucoseUnit: string
  latestReading: { value: number; unit: string; source: string; timestamp: string } | null
  pendingPlan: TreatmentPlan | null
  recentMeals: Array<{ id: string; foodName: string; carbs: number; mealType: string; timestamp: string }>
  recentInsulin: Array<{ id: string; dose: number; insulinType: string; timestamp: string }>
  recentPredictions: Array<{ id: string; predictionType: string; safetyStatus: string; createdAt: string }>
  timelineEvents: Array<Record<string, any>>
  timelineSummary: {
    meals: number
    insulinEvents: number
    activityMinutes: number
    sleepHours: number
    predictions: number
    treatmentPlans: number
  }
  riskAlerts: Array<{ type: string; message: string }>
}

export type CareTeamData = {
  assignedDoctor: {
    id: string
    fullName: string
    email: string
    initials: string
    role: string
  } | null
  careTeam: Array<{
    fullName: string
    role: string
    accessLevel: string
    initials: string
    id?: string
    email?: string
  }>
  planSummary: { pending: number; accepted: number; total: number }
  sharingSettings: Record<string, boolean>
}

export type ConnectorInfo = {
  type: string
  name: string
  provider: string
  status: 'connected' | 'disconnected'
  lastSync: string | null
  connectedAt: string | null
}

export type PredictionStats = {
  total: number
  safe: number
  caution: number
  unsafe: number
}

// --- API Calls ---

async function fetchPatient<T>(path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(`/patient${path}`, options)
}

export async function fetchPatientSummary(): Promise<PatientSummary> {
  return fetchPatient('/summary')
}

export async function fetchPatientProfile(): Promise<{ user: AccountUser }> {
  return fetchPatient('/profile')
}

export async function updatePatientProfile(data: Partial<AccountUser>): Promise<{ user: AccountUser }> {
  return fetchPatient('/profile', {
    method: 'PUT',
    body: JSON.stringify(data),
  })
}

export async function fetchPatientAnalytics(): Promise<Record<string, any>> {
  return fetchPatient('/analytics')
}

export async function fetchPatientTimeline(limit = 50): Promise<TimelineData> {
  return fetchPatient(`/timeline?limit=${limit}`)
}

export async function fetchPatientCareTeam(): Promise<CareTeamData> {
  return fetchPatient('/care-team')
}

export async function fetchPatientConnectors(): Promise<{ connectors: ConnectorInfo[] }> {
  return fetchPatient('/connectors')
}

export async function connectPatientConnector(type: string): Promise<{ connector: ConnectorInfo }> {
  return fetchPatient(`/connectors/${type}/connect`, { method: 'POST' })
}

export async function disconnectPatientConnector(type: string): Promise<{ success: boolean }> {
  return fetchPatient(`/connectors/${type}/disconnect`, { method: 'POST' })
}

export async function replyToTreatmentPlan(
  planId: string,
  action: 'accept' | 'dismiss',
  patientComment = '',
): Promise<{ plan: TreatmentPlan }> {
  return fetchPatient(`/treatment-plans/${planId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ action, patientComment }),
  })
}

// --- Doctor Supervision ---

export type DoctorInfo = {
  id: string
  fullName: string
  email: string
  specialty: string
  clinicName: string
  licenseNumber: string
}

export type SupervisionRequest = {
  id: string
  doctorId: string
  doctor: DoctorInfo | null
  status: 'pending' | 'accepted' | 'rejected' | 'cancelled'
  message: string
  responseMessage: string
  requestedAt: string
  respondedAt: string | null
}

export async function fetchAvailableDoctors(): Promise<{ success: boolean; data: DoctorInfo[] }> {
  return fetchPatient('/doctors')
}

export async function fetchMyDoctorRequests(): Promise<{ success: boolean; data: SupervisionRequest[] }> {
  return fetchPatient('/doctor-requests')
}

export async function createDoctorSupervisionRequest(doctorId: string, message = ''): Promise<{ success: boolean; data: SupervisionRequest }> {
  return fetchPatient('/doctor-requests', {
    method: 'POST',
    body: JSON.stringify({ doctorId, message }),
  })
}
