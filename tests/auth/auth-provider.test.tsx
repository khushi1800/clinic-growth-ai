import test, { afterEach, beforeEach, describe, mock } from 'node:test';
import assert from 'node:assert/strict';
import React, { act } from 'react';
import { createRoot, type Root } from 'react-dom/client';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { AuthProvider } from '../../src/auth/AuthProvider.js';
import { useAuth, type AuthState } from '../../src/auth/useAuth.js';
import { createClinicWithOwner } from '../../src/api/clinics.js';
import { supabase } from '../../src/lib/supabase/client.js';

// Minimal DOM shim so react-dom/client can mount/unmount in Node without jsdom
function installMinimalDom(): () => void {
  const prevWindow = globalThis.window;
  const prevDocument = globalThis.document;
  const prevHTMLElement = (globalThis as Record<string, unknown>).HTMLElement;
  const prevNode = (globalThis as Record<string, unknown>).Node;
  const prevActEnv = (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT;

  class FakeNode {
    nodeType: number;
    nodeName: string;
    tagName: string;
    namespaceURI = 'http://www.w3.org/1999/xhtml';
    childNodes: FakeNode[] = [];
    parentNode: FakeNode | null = null;
    textContent: string | null = '';
    style: Record<string, string> = {};

    constructor(nodeType: number, nodeName: string, text = '') {
      this.nodeType = nodeType;
      this.nodeName = nodeName;
      this.tagName = nodeName;
      this.textContent = text;
    }

    get ownerDocument() {
      return fakeDocument;
    }

    appendChild(child: FakeNode) {
      if (child.parentNode) {
        child.parentNode.removeChild(child);
      }
      child.parentNode = this;
      this.childNodes.push(child);
      return child;
    }

    insertBefore(newNode: FakeNode, refNode: FakeNode | null) {
      if (newNode.parentNode) {
        newNode.parentNode.removeChild(newNode);
      }
      newNode.parentNode = this;
      if (!refNode) {
        this.childNodes.push(newNode);
        return newNode;
      }
      const idx = this.childNodes.indexOf(refNode);
      if (idx === -1) {
        this.childNodes.push(newNode);
      } else {
        this.childNodes.splice(idx, 0, newNode);
      }
      return newNode;
    }

    removeChild(child: FakeNode) {
      const idx = this.childNodes.indexOf(child);
      if (idx !== -1) {
        this.childNodes.splice(idx, 1);
        child.parentNode = null;
      }
      return child;
    }

    addEventListener() {}
    removeEventListener() {}
    setAttribute() {}
    removeAttribute() {}
  }

  const fakeDocument = {
    createElement: (tag: string) => new FakeNode(1, tag.toUpperCase()),
    createElementNS: (_ns: string, tag: string) => new FakeNode(1, tag.toUpperCase()),
    createTextNode: (text: string) => new FakeNode(3, '#text', text),
    createComment: (text: string) => new FakeNode(8, '#comment', text),
    addEventListener: () => {},
    removeEventListener: () => {},
    activeElement: null,
    body: new FakeNode(1, 'BODY'),
  };

  (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = true;
  (globalThis as Record<string, unknown>).HTMLElement = FakeNode;
  (globalThis as Record<string, unknown>).Node = FakeNode;
  (globalThis as Record<string, unknown>).document = fakeDocument;
  (globalThis as Record<string, unknown>).window = {
    document: fakeDocument,
    HTMLIFrameElement: class HTMLIFrameElement {},
    addEventListener: () => {},
    removeEventListener: () => {},
  };

  return () => {
    (globalThis as Record<string, unknown>).IS_REACT_ACT_ENVIRONMENT = prevActEnv;
    if (prevHTMLElement === undefined) {
      delete (globalThis as Record<string, unknown>).HTMLElement;
    } else {
      (globalThis as Record<string, unknown>).HTMLElement = prevHTMLElement;
    }
    if (prevNode === undefined) {
      delete (globalThis as Record<string, unknown>).Node;
    } else {
      (globalThis as Record<string, unknown>).Node = prevNode;
    }
    if (prevDocument === undefined) {
      delete (globalThis as Record<string, unknown>).document;
    } else {
      (globalThis as Record<string, unknown>).document = prevDocument;
    }
    if (prevWindow === undefined) {
      delete (globalThis as Record<string, unknown>).window;
    } else {
      (globalThis as Record<string, unknown>).window = prevWindow;
    }
  };
}

function makeFakeUser(id = 'user-1'): User {
  return {
    id,
    app_metadata: {},
    user_metadata: { name: 'Test User' },
    aud: 'authenticated',
    created_at: '2026-01-01T00:00:00Z',
    email: 'owner@example.test',
  } as User;
}

function makeFakeSession(user = makeFakeUser()): Session {
  return {
    access_token: 'synthetic-access-token',
    refresh_token: 'synthetic-refresh-token',
    expires_in: 3600,
    token_type: 'bearer',
    user,
  } as Session;
}

function mockClinicStaffQuery(result: {
  data: { id: string; clinic_id: string; role: string } | null;
  error: { message: string; code?: string } | null;
}) {
  const chain = {
    select: () => chain,
    eq: () => chain,
    maybeSingle: async () => result,
  };
  return mock.method(supabase, 'from', () => chain as never);
}

describe('AuthProvider & useAuth', () => {
  let restoreDom: () => void;
  let root: Root | null = null;

  beforeEach(() => {
    restoreDom = installMinimalDom();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root?.unmount();
      });
      root = null;
    }
    mock.restoreAll();
    restoreDom();
  });

  function renderWithAuth(onRender: (auth: AuthState) => void) {
    function Consumer() {
      const auth = useAuth();
      onRender(auth);
      return null;
    }

    const container = document.createElement('div');
    root = createRoot(container);
    return {
      mount: async () => {
        await act(async () => {
          root!.render(
            React.createElement(AuthProvider, null, React.createElement(Consumer))
          );
        });
      },
      unmount: async () => {
        await act(async () => {
          root!.unmount();
        });
        root = null;
      },
    };
  }

  test('useAuth throws a clear error outside AuthProvider', async () => {
    let caughtError: Error | null = null;
    function BadConsumer() {
      try {
        useAuth();
      } catch (err) {
        caughtError = err as Error;
      }
      return null;
    }

    const container = document.createElement('div');
    root = createRoot(container);
    await act(async () => {
      root!.render(React.createElement(BadConsumer));
    });

    assert.ok(caughtError instanceof Error);
    assert.match(caughtError.message, /AuthProvider/);
  });

  test('transitions loading -> unauthenticated when no session exists', async () => {
    let resolveSession!: (val: { data: { session: Session | null }; error: null }) => void;
    mock.method(
      supabase.auth,
      'getSession',
      () =>
        new Promise((resolve) => {
          resolveSession = resolve;
        })
    );
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));

    const statuses: string[] = [];
    let latest!: AuthState;

    const { mount } = renderWithAuth((auth) => {
      statuses.push(auth.status);
      latest = auth;
    });

    await mount();
    assert.equal(statuses[0], 'loading');

    await act(async () => {
      resolveSession({ data: { session: null }, error: null });
    });

    assert.equal(latest.status, 'unauthenticated');
    assert.equal(latest.user, null);
    assert.equal(latest.membership, null);
    assert.equal(latest.isPlatformAdmin, false);
  });

  test('transitions loading -> authenticated with membership and platform admin', async () => {
    const user = makeFakeUser('user-owner');
    const session = makeFakeSession(user);

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mockClinicStaffQuery({
      data: { id: 'staff-1', clinic_id: 'clinic-1', role: 'owner' },
      error: null,
    });
    mock.method(supabase, 'rpc', async (fn: string) => {
      if (fn === 'is_platform_admin') return { data: true, error: null };
      return { data: null, error: null };
    });

    let latest!: AuthState;
    const { mount } = renderWithAuth((auth) => {
      latest = auth;
    });

    await mount();

    assert.equal(latest.status, 'authenticated');
    assert.equal(latest.user?.id, 'user-owner');
    assert.deepEqual(latest.membership, {
      clinicId: 'clinic-1',
      staffId: 'staff-1',
      role: 'owner',
    });
    assert.equal(latest.isPlatformAdmin, true);
  });

  test('authenticated without membership sets membership to null', async () => {
    const session = makeFakeSession(makeFakeUser('user-no-clinic'));

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mockClinicStaffQuery({ data: null, error: null });
    mock.method(supabase, 'rpc', async () => ({ data: false, error: null }));

    let latest!: AuthState;
    const { mount } = renderWithAuth((auth) => {
      latest = auth;
    });

    await mount();

    assert.equal(latest.status, 'authenticated');
    assert.equal(latest.user?.id, 'user-no-clinic');
    assert.equal(latest.membership, null);
    assert.equal(latest.isPlatformAdmin, false);
  });

  test('membership fetch error keeps state authenticated with membership null', async () => {
    const session = makeFakeSession(makeFakeUser('user-err'));

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mockClinicStaffQuery({
      data: null,
      error: { message: 'database unavailable', code: '500' },
    });
    mock.method(supabase, 'rpc', async () => ({ data: false, error: null }));

    let latest!: AuthState;
    const { mount } = renderWithAuth((auth) => {
      latest = auth;
    });

    await mount();

    assert.equal(latest.status, 'authenticated');
    assert.equal(latest.user?.id, 'user-err');
    assert.equal(latest.membership, null);
  });

  test('is_platform_admin RPC error defaults isPlatformAdmin to false', async () => {
    const session = makeFakeSession(makeFakeUser('user-1'));

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mockClinicStaffQuery({
      data: { id: 'staff-1', clinic_id: 'clinic-1', role: 'admin' },
      error: null,
    });
    mock.method(supabase, 'rpc', async () => ({
      data: null,
      error: { message: 'rpc failed' },
    }));

    let latest!: AuthState;
    const { mount } = renderWithAuth((auth) => {
      latest = auth;
    });

    await mount();

    assert.equal(latest.status, 'authenticated');
    assert.equal(latest.isPlatformAdmin, false);
  });

  test('signOut clears all auth state', async () => {
    const session = makeFakeSession(makeFakeUser('user-1'));

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session },
      error: null,
    }));
    mock.method(supabase.auth, 'onAuthStateChange', () => ({
      data: { subscription: { unsubscribe: () => {} } },
    }));
    mock.method(supabase.auth, 'signOut', async () => ({ error: null }));
    mockClinicStaffQuery({
      data: { id: 'staff-1', clinic_id: 'clinic-1', role: 'owner' },
      error: null,
    });
    mock.method(supabase, 'rpc', async () => ({ data: true, error: null }));

    let latest!: AuthState;
    const { mount } = renderWithAuth((auth) => {
      latest = auth;
    });

    await mount();
    assert.equal(latest.status, 'authenticated');
    assert.equal(latest.isPlatformAdmin, true);

    await act(async () => {
      await latest.signOut();
    });

    assert.equal(latest.status, 'unauthenticated');
    assert.equal(latest.user, null);
    assert.equal(latest.membership, null);
    assert.equal(latest.isPlatformAdmin, false);
  });

  test('onAuthStateChange event updates state and unsubscribes on unmount', async () => {
    let authCallback: ((event: AuthChangeEvent, session: Session | null) => void) | null = null;
    const unsubscribeMock = mock.fn();

    mock.method(supabase.auth, 'getSession', async () => ({
      data: { session: null },
      error: null,
    }));
    mock.method(
      supabase.auth,
      'onAuthStateChange',
      (cb: (event: AuthChangeEvent, session: Session | null) => void) => {
        authCallback = cb;
        return { data: { subscription: { unsubscribe: unsubscribeMock } } };
      }
    );
    mockClinicStaffQuery({
      data: { id: 'staff-2', clinic_id: 'clinic-2', role: 'doctor' },
      error: null,
    });
    mock.method(supabase, 'rpc', async () => ({ data: false, error: null }));

    let latest!: AuthState;
    const { mount, unmount } = renderWithAuth((auth) => {
      latest = auth;
    });

    await mount();
    assert.equal(latest.status, 'unauthenticated');
    assert.ok(authCallback);

    const newSession = makeFakeSession(makeFakeUser('user-2'));
    await act(async () => {
      authCallback!('SIGNED_IN', newSession);
    });

    assert.equal(latest.status, 'authenticated');
    assert.equal(latest.user?.id, 'user-2');
    assert.deepEqual(latest.membership, {
      clinicId: 'clinic-2',
      staffId: 'staff-2',
      role: 'doctor',
    });

    await unmount();
    assert.equal(unsubscribeMock.mock.callCount(), 1);
  });
});

describe('createClinicWithOwner error mapping', () => {
  afterEach(() => {
    mock.restoreAll();
  });

  for (const expectedCode of ['not_authenticated', 'already_member', 'invalid_name'] as const) {
    test(`maps "${expectedCode}" error message to ApiError.code="${expectedCode}"`, async () => {
      mock.method(supabase, 'rpc', async () => ({
        data: null,
        error: { message: expectedCode, code: 'P0001' },
      }));

      const result = await createClinicWithOwner({
        name: 'Sunrise Dental',
        phone: '+919999999999',
        city: 'Mumbai',
      });

      assert.equal(result.data, null);
      assert.ok(result.error);
      assert.equal(result.error.code, expectedCode);
    });
  }

  test('returns new clinic UUID on success', async () => {
    mock.method(supabase, 'rpc', async (fn: string, params: Record<string, unknown>) => {
      assert.equal(fn, 'create_clinic_with_owner');
      assert.deepEqual(params, {
        p_name: 'Sunrise Dental',
        p_phone: null,
        p_city: 'Pune',
      });
      return { data: 'clinic-uuid-123', error: null };
    });

    const result = await createClinicWithOwner({
      name: 'Sunrise Dental',
      city: 'Pune',
    });

    assert.equal(result.error, null);
    assert.equal(result.data, 'clinic-uuid-123');
  });
});
