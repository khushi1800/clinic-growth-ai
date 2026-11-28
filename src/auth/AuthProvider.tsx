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
  membershipError: boolean;
  isPlatformAdmin: boolean;
}

const UNAUTHENTICATED_STATE: AuthInternalState = {
  status: 'unauthenticated',
  user: null,
  membership: null,
  membershipError: false,
  isPlatformAdmin: false,
};

interface MembershipFetchResult {
  membership: Membership | null;
  error: boolean;
}

async function fetchIsPlatformAdmin(): Promise<boolean> {
  try {
    const { data, error } = await supabase.rpc('is_platform_admin');
    if (error) return false;
    return Boolean(data);
  } catch {
    return false;
  }
}

async function fetchMembershipSafe(userId: string): Promise<MembershipFetchResult> {
  try {
    const result = await getMyMembership(userId);
    if (result.error) return { membership: null, error: true };
    return { membership: result.data, error: false };
  } catch {
    return { membership: null, error: true };
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthInternalState>({
    status: 'loading',
    user: null,
    membership: null,
    membershipError: false,
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

    const [membershipResult, isPlatformAdmin] = await Promise.all([
      fetchMembershipSafe(session.user.id),
      fetchIsPlatformAdmin(),
    ]);

    if (mountedRef.current && requestIdRef.current === reqId) {
      setState((prev) => ({
        status: 'authenticated',
        user: session.user,
        // Preserve known membership for the same user on transient fetch errors.
        membership: membershipResult.error
          ? prev.user?.id === session.user.id
            ? prev.membership
            : null
          : membershipResult.membership,
        membershipError: membershipResult.error,
        isPlatformAdmin,
      }));
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

    const [membershipResult, isPlatformAdmin] = await Promise.all([
      fetchMembershipSafe(session.user.id),
      fetchIsPlatformAdmin(),
    ]);

    if (mountedRef.current && requestIdRef.current === reqId) {
      setState((prev) => ({
        status: 'authenticated',
        user: session.user,
        // Preserve known membership for the same user on transient fetch errors.
        membership: membershipResult.error
          ? prev.user?.id === session.user.id
            ? prev.membership
            : null
          : membershipResult.membership,
        membershipError: membershipResult.error,
        isPlatformAdmin,
      }));
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
      membershipError: state.membershipError,
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
