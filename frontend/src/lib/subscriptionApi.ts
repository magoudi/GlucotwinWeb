import { apiRequest } from './api'

// --- Types ---

export type PlanPrice = {
  packageId: string
  billingPeriod: string
  label: string
  amount: number
  displayAmount: number
  currency: string
  durationDays: number
}

export type SubscriptionPlan = {
  plan: string
  name: string
  description: string
  features: string[]
  prices: PlanPrice[]
}

export type MySubscription = {
  isSubscribed: boolean
  subscriptionStatus: string
  subscriptionPlan: string | null
  subscriptionBillingPeriod: string | null
  subscriptionStartDate: string | null
  subscriptionEndDate: string | null
}

// --- API Calls ---

export async function fetchSubscriptionPlans(): Promise<{ success: boolean; data: SubscriptionPlan[] }> {
  return apiRequest('/subscriptions/plans')
}

export async function fetchMySubscription(): Promise<{ success: boolean; data: MySubscription }> {
  return apiRequest('/subscriptions/me')
}

export async function createCheckoutSession(packageId: string): Promise<{ success: boolean; url: string }> {
  return apiRequest('/subscriptions/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  })
}

export async function cancelSubscription(): Promise<{ success: boolean; message: string }> {
  return apiRequest('/subscriptions/cancel', {
    method: 'POST',
  })
}

export async function processLocalPayment(packageId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest('/subscriptions/process-local-payment', {
    method: 'POST',
    body: JSON.stringify({ packageId }),
  })
}

export async function activateMockSubscription(sessionId: string): Promise<{ success: boolean; message: string }> {
  return apiRequest('/subscriptions/activate-mock', {
    method: 'POST',
    body: JSON.stringify({ sessionId }),
  })
}
