import { apiRequest } from './api'
import type { AccountUser, TreatmentPlan } from './api'

export type ClinicStats = {
  totalPatients: number
  patientsAtRisk: number
  recentAlerts: {
    type: string
    patient: string
    time: string
  }[]
}

export type ClinicalNote = {
  id: string
  patientId: string
  doctorId: string
  content: string
  createdAt: string
}

export type ClinicalInsight = {
  id: string
  type: 'danger' | 'warning' | 'info'
  title: string
  description: string
  suggestedAction: string
}

async function fetchDoctor<T>(path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(`/doctor${path}`, options)
}

export async function fetchClinicStats(): Promise<{ stats: ClinicStats }> {
  return fetchDoctor('/stats')
}

export async function fetchDoctorPatients(search = '', page = 1, limit = 50): Promise<{ patients: AccountUser[], pagination: { total: number, page: number, limit: number, totalPages: number } }> {
  const query = new URLSearchParams()
  if (search) query.append('search', search)
  query.append('page', page.toString())
  query.append('limit', limit.toString())
  
  return fetchDoctor(`/patients?${query.toString()}`)
}

export async function impersonatePatient(id: string): Promise<{ user: AccountUser }> {
  return fetchDoctor(`/patients/${id}/impersonate`, { method: 'POST' })
}

export async function fetchClinicalNotes(patientId: string): Promise<{ notes: ClinicalNote[] }> {
  return fetchDoctor(`/patients/${patientId}/notes`)
}

export async function addClinicalNote(patientId: string, content: string): Promise<{ note: ClinicalNote }> {
  return fetchDoctor(`/patients/${patientId}/notes`, {
    method: 'POST',
    body: JSON.stringify({ content }),
  })
}

export async function createTreatmentPlan(patientId: string, description: string, details?: any): Promise<{ plan: TreatmentPlan }> {
  return fetchDoctor(`/patients/${patientId}/treatment-plans`, {
    method: 'POST',
    body: JSON.stringify({ description, details }),
  })
}

export async function signAndSendTreatmentPlan(patientId: string, planId: string, payload: { password: string, meaning: string }): Promise<{ success: boolean; plan: TreatmentPlan }> {
  return fetchDoctor(`/patients/${patientId}/treatment-plans/${planId}/sign-and-send`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export async function fetchPatientTreatmentPlans(patientId: string): Promise<{ plans: TreatmentPlan[] }> {
  return fetchDoctor(`/patients/${patientId}/treatment-plans`)
}

export async function replyToTreatmentPlan(patientId: string, planId: string, reply: string): Promise<{ plan: TreatmentPlan }> {
  return fetchDoctor(`/patients/${patientId}/treatment-plans/${planId}/reply`, {
    method: 'POST',
    body: JSON.stringify({ reply }),
  })
}

export async function fetchClinicalInsights(patientId: string): Promise<{ insights: ClinicalInsight[] }> {
  return fetchDoctor(`/patients/${patientId}/insights`)
}

export async function updateClinicalStatus(patientId: string, status: string): Promise<{ clinicalStatus: string }> {
  return fetchDoctor(`/patients/${patientId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

export async function updateBulkClinicalStatus(patientIds: string[], status: string): Promise<{ success: boolean; count: number }> {
  return fetchDoctor(`/patients/bulk-status`, {
    method: 'PATCH',
    body: JSON.stringify({ patientIds, status }),
  })
}

// --- Supervision Requests ---

export type SupervisionRequestForDoctor = {
  id: string
  patient: {
    id: string
    fullName: string
    email: string
    diabetesType: string
    managementType: string
  } | null
  status: string
  message: string
  requestedAt: string
}

export async function fetchSupervisionRequests(): Promise<{ success: boolean; data: SupervisionRequestForDoctor[] }> {
  return fetchDoctor('/supervision-requests')
}

export async function respondToSupervisionRequest(
  requestId: string,
  decision: 'accepted' | 'rejected',
  responseMessage = '',
): Promise<{ success: boolean; data: any }> {
  return fetchDoctor(`/supervision-requests/${requestId}/respond`, {
    method: 'POST',
    body: JSON.stringify({ decision, responseMessage }),
  })
}
