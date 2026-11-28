import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import type { SignInParams, SignUpParams } from '../api/auth';
import type { ApiResult } from '../types/api';

export type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

export interface Membership {
  clinicId: string;
  staffId: string;
  role: 'owner' | 'admin' | 'doctor' | 'receptionist';
}

export interface AuthState {
  status: AuthStatus;
  user: User | null;
  membership: Membership | null;
  membershipError: boolean;
  isPlatformAdmin: boolean;
  signIn(p: SignInParams): Promise<ApiResult<Session>>;
  signUp(p: SignUpParams): Promise<ApiResult<User>>;
  signOut(): Promise<void>;
  refresh(): Promise<void>;
}

export const AuthContext = createContext<AuthState | null>(null);

export function useAuth(): AuthState {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
