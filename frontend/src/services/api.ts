import { apiRequest } from '../lib/api'

export function getDashboardApi<T>() {
  return apiRequest<T>('/glucotwin/dashboard')
}

export function getAdaptationApi<T>() {
  return apiRequest<T>('/glucotwin/adaptation')
}

export function getAnalyticsApi<T>() {
  return apiRequest<T>('/glucotwin/analytics')
}

export function getModelsApi<T>() {
  return apiRequest<T>('/glucotwin/models')
}

export function predictBolusApi<T>(input: unknown) {
  return apiRequest<T>('/glucotwin/bolus/predict', { method: 'POST', body: JSON.stringify(input) })
}

export function generateBasalApi<T>(input: unknown = {}) {
  return apiRequest<T>('/glucotwin/basal/generate', { method: 'POST', body: JSON.stringify(input) })
}

export function recommendFoodApi<T>(input: unknown) {
  return apiRequest<T>('/glucotwin/food/recommend', { method: 'POST', body: JSON.stringify(input) })
}

export function runWhatIfApi<T>(input: unknown) {
  return apiRequest<T>('/glucotwin/what-if', { method: 'POST', body: JSON.stringify(input) })
}
