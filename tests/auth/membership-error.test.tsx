import test, { afterEach, beforeEach, describe, mock } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import { JSDOM } from 'jsdom';
import type { Session, User } from '@supabase/supabase-js';
import { AuthProvider } from '../../src/auth/AuthProvider.js';
import { useAuth, type AuthState } from '../../src/auth/useAuth.js';
import { supabase } from '../../src/lib/supabase/client.js';

function makeUser(id = 'user-1'): User {
  return {
    id,
    email: 'owner@example.test',
    app_metadata: {},
    user_metadata: {},
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
  } as User;
}

function makeSession(user: User): Session {
  return {
    access_token: 'tok-123',
    refresh_token: 'ref-123',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  } as Session;
}

async function flushMicrotasks(): Promise<void> {
  await act(async () => {
    await new Promise((r) => setTimeout(r, 15));
  });
}

describe('AuthProvider membershipError handling', () => {
  let dom: JSDOM;
  let root: Root;
  let container: HTMLElement;
  let prevWindow: unknown;
  let prevDocument: unknown;
  let prevHTMLElement: unknown;
  let prevNode: unknown;
  let prevActEnv: unknown;

  beforeEach(() => {
    dom = new JSDOM('<!doctype html><html><body><div id="root"></div></body></html>', {
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

    container = dom.window.document.getElementById('root')!;
    root = createRoot(container);
  });

  afterEach(async () => {
    await act(async () => {
      root.unmount();
    });
    dom.window.close();
    mock.restoreAll();

    (globalThis as Record<string, unknown>).window = prevWindow;
    (globalThis as Record<string, unknown>).document = prevDocument;
    (globalThis as Record<string, unknown>).HTMLElement = prevHTMLElement;
    (globalThis as Record<string, unknown>).Node = prevNode;
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = prevActEnv;
  });

  test('preserves known membership on transient fetch error and clears membershipError on next success', async () => {
    const user = makeUser('user-owner');
    const session = makeSession(user);

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mock.method(supabase, 'rpc', async () => ({ data: false, error: null }));

    let shouldFail = false;
    mock.method(supabase, 'from', () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => {
              if (shouldFail) {
                return { data: null, error: { message: 'network timeout', code: '503' } };
              }
              return {
                data: { id: 'staff-1', clinic_id: 'clinic-1', role: 'owner' },
                error: null,
              };
            },
          }),
        }),
      }),
    }));

    let latest: AuthState | null = null;
    function Probe() {
      latest = useAuth();
      return null;
    }

    await act(async () => {
      root.render(
        React.createElement(AuthProvider, null, React.createElement(Probe))
      );
    });
    await flushMicrotasks();

    assert.equal(latest!.status, 'authenticated');
    assert.deepEqual(latest!.membership, {
      clinicId: 'clinic-1',
      staffId: 'staff-1',
      role: 'owner',
    });
    assert.equal(latest!.membershipError, false);

    // Trigger a transient failure on refresh()
    shouldFail = true;
    await act(async () => {
      await latest!.refresh();
    });
    await flushMicrotasks();

    assert.equal(latest!.status, 'authenticated');
    assert.equal(latest!.membershipError, true);
    assert.deepEqual(latest!.membership, {
      clinicId: 'clinic-1',
      staffId: 'staff-1',
      role: 'owner',
    });

    // Next successful refresh clears membershipError
    shouldFail = false;
    await act(async () => {
      await latest!.refresh();
    });
    await flushMicrotasks();

    assert.equal(latest!.membershipError, false);
    assert.deepEqual(latest!.membership, {
      clinicId: 'clinic-1',
      staffId: 'staff-1',
      role: 'owner',
    });
  });

  test('initial membership fetch error sets membershipError=true and membership=null', async () => {
    const user = makeUser('user-initial-err');
    const session = makeSession(user);

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mock.method(supabase, 'rpc', async () => ({ data: false, error: null }));
    mock.method(supabase, 'from', () => ({
      select: () => ({
        eq: () => ({
          eq: () => ({
            maybeSingle: async () => ({
              data: null,
              error: { message: 'db unavailable', code: '500' },
            }),
          }),
        }),
      }),
    }));

    let latest: AuthState | null = null;
    function Probe() {
      latest = useAuth();
      return null;
    }

    await act(async () => {
      root.render(
        React.createElement(AuthProvider, null, React.createElement(Probe))
      );
    });
    await flushMicrotasks();

    assert.equal(latest!.status, 'authenticated');
    assert.equal(latest!.membership, null);
    assert.equal(latest!.membershipError, true);
  });
});
