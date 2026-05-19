import { createSlice, type PayloadAction } from '@reduxjs/toolkit'
import type { AccountUser } from '../lib/api'

export type AuthSessionActor = {
  id: string
  fullName: string
  role: string
}

export type AuthSessionState = {
  isImpersonating: boolean
  impersonator: AuthSessionActor | null
}

type AuthState = {
  user: AccountUser | null
  session: AuthSessionState
  isBootstrapping: boolean
}

const initialState: AuthState = {
  user: null,
  session: {
    isImpersonating: false,
    impersonator: null,
  },
  isBootstrapping: true,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setAuthState(state, action: PayloadAction<{ user: AccountUser; session?: AuthSessionState }>) {
      state.user = action.payload.user
      state.session = action.payload.session ?? initialState.session
      state.isBootstrapping = false
    },
    clearAccount(state) {
      state.user = null
      state.session = initialState.session
      state.isBootstrapping = false
    },
    setBootstrappingFinished(state) {
      state.isBootstrapping = false
    }
  },
})

export const { clearAccount, setAuthState, setBootstrappingFinished } = authSlice.actions
export const authReducer = authSlice.reducer
