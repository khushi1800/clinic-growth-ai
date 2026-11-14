// ============================================================
// Clinic Growth AI — Supabase Client
// src/lib/supabase/client.ts
// ============================================================
// IMPORTANT: Never hardcode credentials here.
// Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in your .env file.

import { createClient } from '@supabase/supabase-js';

// Safe environment variable resolution across Vite (browser/bundler) and Node.js (tests)
const getEnvVar = (key: string): string => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key] as string;
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return '';
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL') || 'https://mock-clinic-supabase.co';
const supabaseAnonKey = getEnvVar('VITE_SUPABASE_ANON_KEY') || 'mock-anon-key-placeholder';

// Provide a mock WebSocket constructor in headless Node <22 test environments where native WebSocket is absent
class HeadlessMockWebSocket {
  static OPEN = 1;
  static CLOSED = 3;
  readyState = 3;
  send() {}
  close() {}
  addEventListener() {}
  removeEventListener() {}
}

const isBrowser = typeof window !== 'undefined';
const hasNativeWebSocket = typeof WebSocket !== 'undefined' || typeof (globalThis as any).WebSocket !== 'undefined';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: isBrowser,
    autoRefreshToken: isBrowser,
    detectSessionInUrl: isBrowser,
  },
  ...(!isBrowser && !hasNativeWebSocket
    ? {
        realtime: {
          transport: HeadlessMockWebSocket as any,
        },
      }
    : {}),
});

export default supabase;
