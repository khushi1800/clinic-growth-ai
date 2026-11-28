import test, { afterEach, beforeEach, describe } from 'node:test';
import assert from 'node:assert/strict';
import React, { useState } from 'react';
import { createMemoryRouter, RouterProvider, useLocation } from 'react-router-dom';
import { JSDOM } from 'jsdom';
import { cleanup, fireEvent, render } from '@testing-library/react';
import type { User } from '@supabase/supabase-js';
import { AuthContext, type AuthState, type Membership } from '../../src/auth/useAuth.js';
import {
  PublicOnly,
  RequireAuth,
  RequireOnboarding,
  RequirePlatformAdmin,
  RequireRole,
} from '../../src/auth/guards.js';

function makeAuthState(overrides: Partial<AuthState> = {}): AuthState {
  return {
    status: 'authenticated',
    user: { id: 'user-1', email: 'clinic@example.test' } as User,
    membership: { clinicId: 'clinic-1', staffId: 'staff-1', role: 'owner' },
    membershipError: false,
    isPlatformAdmin: false,
    signIn: async () => ({ data: null, error: null }),
    signUp: async () => ({ data: null, error: null }),
    signOut: async () => {},
    refresh: async () => {},
    ...overrides,
  };
}

function LocationDisplay({ label }: { label: string }) {
  const location = useLocation();
  return (
    <div data-testid="screen">
      <span data-testid="label">{label}</span>
      <span data-testid="path">{`${location.pathname}${location.search}`}</span>
    </div>
  );
}

function buildTestRouter(initialEntry: string) {
  return createMemoryRouter(
    [
      {
        element: <PublicOnly />,
        children: [
          { path: '/login', element: <LocationDisplay label="login-page" /> },
          { path: '/signup', element: <LocationDisplay label="signup-page" /> },
          { path: '/forgot-password', element: <LocationDisplay label="forgot-page" /> },
        ],
      },
      {
        path: '/onboarding',
        element: (
          <RequireOnboarding>
            <LocationDisplay label="onboarding-page" />
          </RequireOnboarding>
        ),
      },
      {
        element: <RequireAuth />,
        children: [
          { path: '/dashboard', element: <LocationDisplay label="dashboard-page" /> },
          { path: '/leads', element: <LocationDisplay label="leads-page" /> },
          {
            element: <RequireRole roles={['owner', 'admin']} />,
            children: [
              { path: '/settings/staff', element: <LocationDisplay label="settings-staff-page" /> },
              { path: '/settings/clinic', element: <LocationDisplay label="settings-clinic-page" /> },
            ],
          },
        ],
      },
      {
        path: '/admin',
        element: (
          <RequirePlatformAdmin>
            <LocationDisplay label="admin-page" />
          </RequirePlatformAdmin>
        ),
      },
    ],
    { initialEntries: [initialEntry] }
  );
}

function renderWithAuth(authState: AuthState, initialEntry: string) {
  const router = buildTestRouter(initialEntry);
  return render(
    <AuthContext.Provider value={authState}>
      <RouterProvider router={router} />
    </AuthContext.Provider>
  );
}

describe('Route guards (A-01..A-07, A-13, loading, membershipError)', () => {
  let dom: JSDOM;
  let prevWindow: unknown;
  let prevDocument: unknown;
  let prevHTMLElement: unknown;
  let prevNode: unknown;
  let prevActEnv: unknown;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body></body></html>', {
      url: 'http://localhost/',
    });
    prevWindow = globalThis.window;
    prevDocument = globalThis.document;
    prevHTMLElement = (globalThis as Record<string, unknown>).HTMLElement;
    prevNode = (globalThis as Record<string, unknown>).Node;
    prevActEnv = (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT;

    (globalThis as Record<string, unknown>).window = dom.window;
    (globalThis as Record<string, unknown>).document = dom.window.document;
    (globalThis as Record<string, unknown>).HTMLElement = dom.window.HTMLElement;
    (globalThis as Record<string, unknown>).Node = dom.window.Node;
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  });

  afterEach(() => {
    cleanup();
    dom.window.close();
    (globalThis as Record<string, unknown>).window = prevWindow;
    (globalThis as Record<string, unknown>).document = prevDocument;
    (globalThis as Record<string, unknown>).HTMLElement = prevHTMLElement;
    (globalThis as Record<string, unknown>).Node = prevNode;
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = prevActEnv;
  });

  // A-01: unauthenticated redirects for /dashboard, /leads, /settings/staff, /admin
  for (const protectedPath of ['/dashboard', '/leads', '/settings/staff', '/admin']) {
    test(`A-01: unauthenticated ${protectedPath} redirects to /login?returnTo=...`, () => {
      const state = makeAuthState({
        status: 'unauthenticated',
        user: null,
        membership: null,
      });
      const { getByTestId } = renderWithAuth(state, protectedPath);
      assert.equal(getByTestId('label').textContent, 'login-page');
      assert.equal(
        getByTestId('path').textContent,
        `/login?returnTo=${encodeURIComponent(protectedPath)}`
      );
    });
  }

  // A-02: returnTo is preserved and then honoured
  test('A-02: authenticated user on /login?returnTo=/leads is redirected to /leads', () => {
    const state = makeAuthState({ status: 'authenticated' });
    const { getByTestId } = renderWithAuth(state, '/login?returnTo=%2Fleads');
    assert.equal(getByTestId('label').textContent, 'leads-page');
    assert.equal(getByTestId('path').textContent, '/leads');
  });

  // A-03: hostile returnTo is ignored -> /dashboard
  for (const hostile of ['https://evil.test', '//evil.test', 'javascript:alert(1)']) {
    test(`A-03: hostile returnTo=${hostile} is ignored and redirects to /dashboard`, () => {
      const state = makeAuthState({ status: 'authenticated' });
      const { getByTestId } = renderWithAuth(
        state,
        `/login?returnTo=${encodeURIComponent(hostile)}`
      );
      assert.equal(getByTestId('label').textContent, 'dashboard-page');
      assert.equal(getByTestId('path').textContent, '/dashboard');
    });
  }

  // A-04: signed in, no membership -> protected routes redirect to /onboarding
  for (const protectedPath of ['/dashboard', '/leads', '/settings/staff']) {
    test(`A-04: authenticated without membership on ${protectedPath} redirects to /onboarding`, () => {
      const state = makeAuthState({
        status: 'authenticated',
        membership: null,
        membershipError: false,
      });
      const { getByTestId } = renderWithAuth(state, protectedPath);
      assert.equal(getByTestId('label').textContent, 'onboarding-page');
      assert.equal(getByTestId('path').textContent, '/onboarding');
    });
  }

  // A-05: signed in with membership -> /onboarding redirects to /dashboard
  test('A-05: authenticated with membership on /onboarding redirects to /dashboard', () => {
    const state = makeAuthState({ status: 'authenticated' });
    const { getByTestId } = renderWithAuth(state, '/onboarding');
    assert.equal(getByTestId('label').textContent, 'dashboard-page');
    assert.equal(getByTestId('path').textContent, '/dashboard');
  });

  // A-06: receptionist and doctor blocked from /settings/*; owner and admin allowed
  for (const blockedRole of ['receptionist', 'doctor'] as Array<Membership['role']>) {
    test(`A-06: ${blockedRole} is blocked from /settings/staff with no-access view`, () => {
      const state = makeAuthState({
        membership: { clinicId: 'clinic-1', staffId: 'staff-1', role: blockedRole },
      });
      const { queryByTestId, getByText } = renderWithAuth(state, '/settings/staff');
      assert.equal(queryByTestId('label'), null);
      assert.ok(getByText("You don't have access"));
    });
  }

  for (const allowedRole of ['owner', 'admin'] as Array<Membership['role']>) {
    test(`A-06: ${allowedRole} is allowed on /settings/staff`, () => {
      const state = makeAuthState({
        membership: { clinicId: 'clinic-1', staffId: 'staff-1', role: allowedRole },
      });
      const { getByTestId } = renderWithAuth(state, '/settings/staff');
      assert.equal(getByTestId('label').textContent, 'settings-staff-page');
    });
  }

  // A-07: non-platform-admin blocked from /admin; platform admin allowed
  test('A-07: non-platform-admin is blocked from /admin', () => {
    const state = makeAuthState({ isPlatformAdmin: false });
    const { queryByTestId, getByText } = renderWithAuth(state, '/admin');
    assert.equal(queryByTestId('label'), null);
    assert.ok(getByText("You don't have access"));
  });

  test('A-07: platform admin is allowed on /admin', () => {
    const state = makeAuthState({ isPlatformAdmin: true, membership: null });
    const { getByTestId } = renderWithAuth(state, '/admin');
    assert.equal(getByTestId('label').textContent, 'admin-page');
  });

  // Loading state shows spinner and NEVER renders protected children
  for (const protectedPath of ['/dashboard', '/settings/staff', '/admin', '/onboarding']) {
    test(`loading state on ${protectedPath} renders spinner and never protected children`, () => {
      const state = makeAuthState({
        status: 'loading',
        user: null,
        membership: null,
      });
      const { getByRole, queryByTestId } = renderWithAuth(state, protectedPath);
      assert.ok(getByRole('status'));
      assert.equal(queryByTestId('screen'), null);
    });
  }

  // membershipError shows retry screen, NOT onboarding
  test('membershipError shows retry screen and calls refresh() on click, never redirects to /onboarding', () => {
    let refreshCalls = 0;
    const state = makeAuthState({
      status: 'authenticated',
      membership: null,
      membershipError: true,
      refresh: async () => {
        refreshCalls += 1;
      },
    });
    const { getByText, getByRole, queryByTestId } = renderWithAuth(state, '/dashboard');
    assert.ok(getByText('Could not load your account'));
    assert.equal(queryByTestId('label'), null);

    fireEvent.click(getByRole('button', { name: 'Retry' }));
    assert.equal(refreshCalls, 1);
  });

  // A-13: session lost mid-use -> redirect to /login
  test('A-13: losing session mid-use redirects from /leads to /login?returnTo=%2Fleads', () => {
    const router = buildTestRouter('/leads');

    function Harness() {
      const [status, setStatus] = useState<'authenticated' | 'unauthenticated'>('authenticated');
      const authState = makeAuthState({
        status,
        user: status === 'authenticated' ? ({ id: 'user-1' } as User) : null,
        membership:
          status === 'authenticated'
            ? { clinicId: 'clinic-1', staffId: 'staff-1', role: 'owner' }
            : null,
      });

      return (
        <AuthContext.Provider value={authState}>
          <button type="button" onClick={() => setStatus('unauthenticated')}>
            expire-session
          </button>
          <RouterProvider router={router} />
        </AuthContext.Provider>
      );
    }

    const { getByTestId, getByRole } = render(<Harness />);
    assert.equal(getByTestId('label').textContent, 'leads-page');

    fireEvent.click(getByRole('button', { name: 'expire-session' }));
    assert.equal(getByTestId('label').textContent, 'login-page');
    assert.equal(getByTestId('path').textContent, '/login?returnTo=%2Fleads');
  });
});
