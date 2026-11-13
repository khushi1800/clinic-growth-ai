// ============================================================
// Clinic Growth AI — Auth API
// src/api/auth.ts
// ============================================================

import { supabase } from '../lib/supabase/client';
import type { ApiResult } from '../types/api';
import type { Session, User } from '@supabase/supabase-js';

export interface SignUpParams {
  email: string;
  password: string;
  name: string;
}

export interface SignInParams {
  email: string;
  password: string;
}

/**
 * Register a new user with email and password.
 * The user's display name is stored in user_metadata.
 */
export async function signUp(params: SignUpParams): Promise<ApiResult<User>> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email: params.email,
      password: params.password,
      options: {
        data: { name: params.name },
      },
    });

    if (error) return { data: null, error: { message: error.message, code: error.status?.toString() } };
    return { data: data.user, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Sign in with email and password.
 */
export async function signIn(params: SignInParams): Promise<ApiResult<Session>> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: params.email,
      password: params.password,
    });

    if (error) return { data: null, error: { message: error.message, code: error.status?.toString() } };
    return { data: data.session, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Sign out the currently authenticated user.
 */
export async function signOut(): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) return { data: null, error: { message: error.message } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns the currently authenticated user, or null if not signed in.
 */
export async function getCurrentUser(): Promise<ApiResult<User>> {
  try {
    const { data, error } = await supabase.auth.getUser();
    if (error) return { data: null, error: { message: error.message } };
    return { data: data.user, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Returns the current active session, or null if not signed in.
 */
export async function getSession(): Promise<ApiResult<Session>> {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) return { data: null, error: { message: error.message } };
    return { data: data.session, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Send a password reset email.
 */
export async function resetPassword(email: string): Promise<ApiResult<null>> {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) return { data: null, error: { message: error.message } };
    return { data: null, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}

/**
 * Update user password (requires a valid session, used in reset flow).
 */
export async function updatePassword(newPassword: string): Promise<ApiResult<User>> {
  try {
    const { data, error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) return { data: null, error: { message: error.message } };
    return { data: data.user, error: null };
  } catch (err) {
    return { data: null, error: { message: String(err) } };
  }
}
