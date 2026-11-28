import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import { sanitizeReturnTo } from '../../src/auth/returnTo.js';

describe('sanitizeReturnTo', () => {
  const cases: Array<{ name: string; input: string | null; expected: string }> = [
    // Benign same-origin relative paths
    { name: 'root path', input: '/', expected: '/' },
    { name: 'dashboard path', input: '/dashboard', expected: '/dashboard' },
    { name: 'leads path', input: '/leads', expected: '/leads' },
    { name: 'nested detail path', input: '/leads/lead-123', expected: '/leads/lead-123' },
    {
      name: 'path with query string',
      input: '/appointments?view=week&day=2026-11-28',
      expected: '/appointments?view=week&day=2026-11-28',
    },
    {
      name: 'path with hash fragment',
      input: '/settings/staff#invite',
      expected: '/settings/staff#invite',
    },
    { name: 'ai-playground path', input: '/ai-playground', expected: '/ai-playground' },
    { name: 'conversations path', input: '/conversations', expected: '/conversations' },

    // Hostile or invalid inputs -> fallback to /dashboard
    { name: 'null input', input: null, expected: '/dashboard' },
    { name: 'empty string', input: '', expected: '/dashboard' },
    { name: 'whitespace only', input: '   ', expected: '/dashboard' },
    { name: 'protocol-relative //evil.test', input: '//evil.test', expected: '/dashboard' },
    { name: 'triple slash ///evil.test', input: '///evil.test', expected: '/dashboard' },
    { name: 'backslash \\evil.test', input: '\\evil.test', expected: '/dashboard' },
    { name: 'slash-backslash /\\evil.test', input: '/\\evil.test', expected: '/dashboard' },
    { name: 'http:// URL', input: 'http://evil.test/leads', expected: '/dashboard' },
    { name: 'https:// URL', input: 'https://evil.test/dashboard', expected: '/dashboard' },
    { name: 'http: scheme without slashes', input: 'http:evil.test', expected: '/dashboard' },
    { name: 'https: scheme without slashes', input: 'https:evil.test', expected: '/dashboard' },
    { name: 'javascript: scheme', input: 'javascript:alert(1)', expected: '/dashboard' },
    {
      name: 'data: scheme',
      input: 'data:text/html,<script>alert(1)</script>',
      expected: '/dashboard',
    },
    { name: 'newline control character', input: '/leads\nHost: evil.test', expected: '/dashboard' },
    { name: 'CRLF control characters', input: '/leads\r\n', expected: '/dashboard' },
    { name: 'null byte control character', input: '/leads\x00', expected: '/dashboard' },
    {
      name: 'embedded :// in query',
      input: '/redirect?next=https://evil.test',
      expected: '/dashboard',
    },
    { name: 'relative path without leading slash', input: 'leads', expected: '/dashboard' },
    { name: 'leading space before //', input: ' //evil.test', expected: '/dashboard' },
  ];

  for (const tc of cases) {
    test(`${tc.name}: ${JSON.stringify(tc.input)} -> ${tc.expected}`, () => {
      assert.equal(sanitizeReturnTo(tc.input), tc.expected);
    });
  }
});
