import test from 'node:test'
import assert from 'node:assert/strict'

// Provide minimal headless DOM primitives for react-router in Node test runner
if (typeof globalThis.window === 'undefined') {
  ;(globalThis as any).window = {
    addEventListener() {},
    removeEventListener() {},
    location: { pathname: '/' },
    history: { state: { idx: 0 }, pushState() {}, replaceState() {} },
  }
}
if (typeof globalThis.document === 'undefined') {
  ;(globalThis as any).document = {
    defaultView: (globalThis as any).window,
  }
}

test('Application Routes: All core navigation paths exist in the router tree', async () => {
  const { router } = await import('../../src/router.js')
  assert.ok(router, 'Router must be instantiated')

  // Traverse all route paths
  const routePaths: string[] = []
  function traverse(routes: any[], parent = '') {
    for (const r of routes) {
      const full = r.path !== undefined ? (parent ? `${parent}/${r.path}` : r.path) : parent
      if (r.path !== undefined) routePaths.push(r.path)
      if (r.children) traverse(r.children, full)
    }
  }
  traverse(router.routes)

  // Marketing routes
  assert.ok(routePaths.includes('/'), 'Contains home route')
  assert.ok(routePaths.includes('pricing'), 'Contains pricing route')
  assert.ok(routePaths.includes('demo'), 'Contains demo request route')

  // Auth routes
  assert.ok(routePaths.includes('login'), 'Contains login route')
  assert.ok(routePaths.includes('signup'), 'Contains signup route')
  assert.ok(routePaths.includes('forgot-password'), 'Contains forgot password route')

  // Clinic Operations Dashboard routes
  assert.ok(routePaths.includes('dashboard'), 'Contains overview dashboard')
  assert.ok(routePaths.includes('leads'), 'Contains leads list')
  assert.ok(routePaths.includes('leads/:id'), 'Contains lead detail')
  assert.ok(routePaths.includes('appointments'), 'Contains appointments list')
  assert.ok(routePaths.includes('appointments/:id'), 'Contains appointment detail')
  assert.ok(routePaths.includes('conversations'), 'Contains conversations')
  assert.ok(routePaths.includes('ai-playground'), 'Contains AI playground')
  assert.ok(routePaths.includes('settings/clinic'), 'Contains clinic settings')
  assert.ok(routePaths.includes('settings/staff'), 'Contains staff settings')
  assert.ok(routePaths.includes('settings/faq'), 'Contains FAQ settings')
  assert.ok(routePaths.includes('settings/follow-ups'), 'Contains follow-up rules')

  // Owner Admin routes
  assert.ok(routePaths.includes('admin'), 'Contains admin home')
  assert.ok(routePaths.includes('prospects'), 'Contains prospects')
  assert.ok(routePaths.includes('customers'), 'Contains customers')
  assert.ok(routePaths.includes('finance'), 'Contains finance')
})
