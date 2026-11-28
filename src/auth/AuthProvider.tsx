import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import {
  getSession,
  signIn as apiSignIn,
  signOut as apiSignOut,
  signUp as apiSignUp,
  type SignInParams,
  type SignUpParams,
} from '../api/auth';
import { getMyMembership } from '../api/clinics';
import { supabase } from '../lib/supabase/client';
import type { ApiResult } from '../types/api';
import { AuthContext, type AuthState, type AuthStatus, type Membership } from './useAuth';

interface AuthInternalState {
  status: AuthStatus;
  user: User | null;
  membership: Membership | null;
  isPlatformAdmin: boolean;
}

const UNAUTHENTICATED_STATE: AuthInternalState = {
  status: 'unauthenticated',
  user: null,
  membership: null,
  isPlatformAdmin: false,
};

async function fetchIsPlatformAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_platform_admin');
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

async function fetchMembershipSafe(userId: string): Promise<Membership | null> {
  try {
    const result = await getMyMembership(userId);
    if (result.error) return null;
    return result.data;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthInternalState>({
    status: 'loading',
    user: null,
    membership: null,
    isPlatformAdmin: false,
  });

  const mountedRef = useRef(true);
  const requestIdRef = useRef(0);

  const syncSession = useCallback(async (session: Session | null) => {
    const reqId = ++requestIdRef.current;

    if (!session?.user) {
      if (mountedRef.current && requestIdRef.current === reqId) {
        setState(UNAUTHENTICATED_STATE);
      }
      return;
    }

    const [membership, isPlatformAdmin] = await Promise.all([
      fetchMembershipSafe(session.user.id),
      fetchIsPlatformAdmin(),
    ]);

    if (mountedRef.current && requestIdRef.current === reqId) {
      setState({
        status: 'authenticated',
        user: session.user,
        membership,
        isPlatformAdmin,
      });
    }
  }, []);

  const loadCurrentSession = useCallback(async () => {
    const reqId = ++requestIdRef.current;
    const { data: session, error } = await getSession();

    if (!mountedRef.current || requestIdRef.current !== reqId) {
      return;
    }

    if (error || !session?.user) {
      setState(UNAUTHENTICATED_STATE);
      return;
    }

    const [membership, isPlatformAdmin] = await Promise.all([
      fetchMembershipSafe(session.user.id),
      fetchIsPlatformAdmin(),
    ]);

    if (mountedRef.current && requestIdRef.current === reqId) {
      setState({
        status: 'authenticated',
        user: session.user,
        membership,
        isPlatformAdmin,
      });
    }
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    void loadCurrentSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void syncSession(session);
    });

    return () => {
      mountedRef.current = false;
      subscription.unsubscribe();
    };
  }, [loadCurrentSession, syncSession]);

  const signIn = useCallback(
    async (params: SignInParams): Promise<ApiResult<Session>> => {
      const result = await apiSignIn(params);
      if (!result.error && result.data?.user) {
        await syncSession(result.data);
      }
      return result;
    },
    [syncSession]
  );

  const signUp = useCallback(async (params: SignUpParams): Promise<ApiResult<User>> => {
    return apiSignUp(params);
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    await apiSignOut();
    requestIdRef.current += 1;
    if (mountedRef.current) {
      setState(UNAUTHENTICATED_STATE);
    }
  }, []);

  const refresh = useCallback(async (): Promise<void> => {
    await loadCurrentSession();
  }, [loadCurrentSession]);

  const value = useMemo<AuthState>(
    () => ({
      status: state.status,
      user: state.user,
      membership: state.membership,
      isPlatformAdmin: state.isPlatformAdmin,
      signIn,
      signUp,
      signOut,
      refresh,
    }),
    [state, signIn, signUp, signOut, refresh]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
