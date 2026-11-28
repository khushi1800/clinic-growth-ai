import React from 'react';
import { Link, Navigate, Outlet, useLocation, type Location } from 'react-router-dom';
import { sanitizeReturnTo } from './returnTo';
import { useAuth, type Membership } from './useAuth';

function loginRedirectTo(location: Location): string {
  const path = `${location.pathname}${location.search}`;
  return `/login?returnTo=${encodeURIComponent(path)}`;
}

function FullPageSpinner() {
  return (
    <div
      role="status"
      aria-label="Loading"
      className="min-h-screen flex flex-col items-center justify-center bg-slate-50 text-slate-600"
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-800" />
      <p className="mt-3 text-sm font-medium">Loading...</p>
    </div>
  );
}

function MembershipErrorScreen({ onRetry }: { onRetry: () => void }) {
  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
    >
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          Could not load your account
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          We ran into a temporary issue loading your clinic membership. Please try again.
        </p>
        <button
          type="button"
          onClick={onRetry}
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Retry
        </button>
      </div>
    </div>
  );
}

function NoAccessScreen() {
  return (
    <div
      role="alert"
      className="min-h-screen flex items-center justify-center bg-slate-50 px-4"
    >
      <div className="max-w-md w-full rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <h1 className="text-lg font-semibold text-slate-900">
          You don&apos;t have access
        </h1>
        <p className="mt-2 text-sm text-slate-600">
          Your account does not have permission to view this page.
        </p>
        <Link
          to="/dashboard"
          className="mt-4 inline-flex items-center justify-center rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
        >
          Back to dashboard
        </Link>
      </div>
    </div>
  );
}

export function RequireAuth({ children }: { children?: React.ReactNode }) {
  const { status, membership, membershipError, refresh } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to={loginRedirectTo(location)} replace />;
  }

  if (membershipError) {
    return <MembershipErrorScreen onRetry={() => void refresh()} />;
  }

  if (membership === null) {
    return <Navigate to="/onboarding" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export function RequireRole({
  roles,
  children,
}: {
  roles: Array<Membership['role']>;
  children?: React.ReactNode;
}) {
  const { status, membership, membershipError, refresh } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to={loginRedirectTo(location)} replace />;
  }

  if (membershipError) {
    return <MembershipErrorScreen onRetry={() => void refresh()} />;
  }

  if (membership === null) {
    return <Navigate to="/onboarding" replace />;
  }

  if (!roles.includes(membership.role)) {
    return <NoAccessScreen />;
  }

  return <>{children ?? <Outlet />}</>;
}

export function RequirePlatformAdmin({ children }: { children?: React.ReactNode }) {
  const { status, isPlatformAdmin } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to={loginRedirectTo(location)} replace />;
  }

  if (!isPlatformAdmin) {
    return <NoAccessScreen />;
  }

  return <>{children ?? <Outlet />}</>;
}

export function PublicOnly({ children }: { children?: React.ReactNode }) {
  const { status, membership, membershipError } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'authenticated') {
    if (membership === null && !membershipError) {
      return <Navigate to="/onboarding" replace />;
    }
    const rawReturnTo = new URLSearchParams(location.search).get('returnTo');
    return <Navigate to={sanitizeReturnTo(rawReturnTo)} replace />;
  }

  return <>{children ?? <Outlet />}</>;
}

export function RequireOnboarding({ children }: { children?: React.ReactNode }) {
  const { status, membership, membershipError, refresh } = useAuth();
  const location = useLocation();

  if (status === 'loading') {
    return <FullPageSpinner />;
  }

  if (status === 'unauthenticated') {
    return <Navigate to={loginRedirectTo(location)} replace />;
  }

  if (membershipError) {
    return <MembershipErrorScreen onRetry={() => void refresh()} />;
  }

  if (membership !== null) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children ?? <Outlet />}</>;
}
