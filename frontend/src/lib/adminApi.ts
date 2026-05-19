import { apiRequest } from './api'
import type { AccountUser } from './api'

export type AdminStats = {
  totalUsers: number
  newUsersThisWeek: number
  roleBreakdown: Record<string, number>
  diabetesBreakdown: Record<string, number>
  recentRegistrations: AccountUser[]
  engagement: {
    dau: number
    mau: number
    simulationsRunToday: number
  }
}

export type AuditEntry = {
  id: string
  adminId: string
  action: string
  targetId: string | null
  details: string
  timestamp: string
}

export type SystemInfo = {
  databaseMode: string
  uptime: number
  nodeVersion: string
  platform: string
  environment: string
  memoryUsage: {
    heapUsedMB: number
    heapTotalMB: number
    rssMB: number
  }
}

export type Announcement = {
  id: string
  title: string
  message: string
  type: string
  active: boolean
  createdAt: string
}

export type SystemSettings = {
  maxBasalRate: number
  defaultTargetMin: number
  defaultTargetMax: number
  enableAdvancedWhatIf: boolean
}

async function fetchAdmin<T>(path: string, options?: RequestInit): Promise<T> {
  return apiRequest<T>(`/admin${path}`, options)
}

export async function fetchAdminStats(): Promise<AdminStats> {
  return fetchAdmin('/stats')
}

export async function fetchAdminUsers(search?: string): Promise<{ users: AccountUser[] }> {
  return fetchAdmin(search ? `/users?search=${encodeURIComponent(search)}` : '/users')
}

export async function updateAdminUser(id: string, data: Partial<AccountUser>): Promise<{ user: AccountUser }> {
  return fetchAdmin(`/users/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteAdminUser(id: string): Promise<void> {
  return fetchAdmin(`/users/${id}`, { method: 'DELETE' })
}

export async function resetAdminUserPassword(id: string, password: string): Promise<void> {
  return fetchAdmin(`/users/${id}/reset-password`, {
    method: 'POST',
    body: JSON.stringify({ newPassword: password }),
  })
}

export async function fetchAuditLog(limit?: number): Promise<{ entries: AuditEntry[] }> {
  return fetchAdmin(limit ? `/audit?limit=${limit}` : '/audit')
}

export async function verifyAuditIntegrity(): Promise<{ success: boolean; valid: boolean; checkedEntries: number; brokenAt: string | null }> {
  return fetchAdmin('/audit/verify-integrity')
}

export async function fetchSystemInfo(): Promise<SystemInfo> {
  return fetchAdmin('/system')
}

// --- NEW ADVANCED FEATURES ---

export async function impersonateUser(id: string): Promise<{ user: AccountUser }> {
  return fetchAdmin(`/users/${id}/impersonate`, { method: 'POST' })
}

export function getExportUsersUrl(): string {
  return `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/admin/export/users`
}

export function getExportAnonymizedUrl(): string {
  return `${import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api'}/admin/export/anonymized`
}

export async function fetchAnnouncements(): Promise<{ announcements: Announcement[] }> {
  return fetchAdmin('/announcements')
}

export async function createAnnouncement(data: Partial<Announcement>): Promise<{ announcement: Announcement }> {
  return fetchAdmin('/announcements', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function updateAnnouncement(id: string, data: Partial<Announcement>): Promise<{ announcement: Announcement }> {
  return fetchAdmin(`/announcements/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function deleteAnnouncement(id: string): Promise<void> {
  return fetchAdmin(`/announcements/${id}`, { method: 'DELETE' })
}

export async function fetchSystemSettings(): Promise<{ settings: SystemSettings }> {
  return fetchAdmin('/settings')
}

export async function updateSystemSettings(data: Partial<SystemSettings>): Promise<{ settings: SystemSettings }> {
  return fetchAdmin('/settings', {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export async function fetchActiveAnnouncements(): Promise<{ announcements: Announcement[] }> {
  return apiRequest('/announcements/active')
}
