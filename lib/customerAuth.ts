'use client';

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.localadda.com";

const TOKEN_KEY = 'la_customer_token';
const PROFILE_KEY = 'la_customer_profile';

// The access token is short-lived (~15m); the UI session lasts as long as the
// httpOnly refresh cookie (~30d). Keep the profile "logged in" for that horizon
// and renew the access token on demand via getValidCustomerToken().
const SESSION_MS = 30 * 24 * 60 * 60 * 1000;

export interface CustomerProfile {
  customerId: string;
  name: string;
  phone: string;
  orderingEnabled: boolean;
  exp: number; // token expiry (ms)
}

export function getCustomer(): CustomerProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    if (!raw) return null;
    const profile = JSON.parse(raw) as CustomerProfile;
    if (profile.exp && profile.exp < Date.now()) {
      logoutCustomer();
      return null;
    }
    return profile;
  } catch {
    return null;
  }
}

export function logoutCustomer() {
  // Best-effort server-side revoke of the refresh token, then clear local state.
  fetch(`${API}/api/auth/logout`, { method: 'POST', credentials: 'include' }).catch(() => {});
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

function isJwtExpired(token: string): boolean {
  try {
    return JSON.parse(atob(token.split('.')[1])).exp * 1000 < Date.now();
  } catch {
    return true;
  }
}

/**
 * Returns a valid customer access token, transparently renewing it from the
 * refresh cookie when the stored one has expired. Use this for any authenticated
 * customer API call. Returns null if the session can't be renewed.
 */
export async function getValidCustomerToken(): Promise<string | null> {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token && !isJwtExpired(token)) return token;
  try {
    const res = await fetch(`${API}/api/auth/refresh`, { method: 'POST', credentials: 'include' });
    if (!res.ok) { logoutCustomer(); return null; }
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    return data.token as string;
  } catch {
    return null;
  }
}

export async function sendCustomerOtp(phone: string, captchaToken?: string): Promise<void> {
  const res = await fetch(`${API}/api/customer/auth/send-otp`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, captchaToken }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'Could not send OTP');
  }
}

export async function redeemInviteCode(code: string, name: string, phone: string): Promise<CustomerProfile> {
  const res = await fetch(`${API}/api/customer/auth/redeem-code`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, name, phone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'Could not verify code');
  }
  const data = await res.json();

  const profile: CustomerProfile = {
    customerId: data.customerId,
    name: data.name || name || '',
    phone,
    orderingEnabled: !!data.orderingEnabled,
    exp: Date.now() + SESSION_MS,
  };
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function verifyCustomerOtp(phone: string, otp: string, name?: string): Promise<CustomerProfile> {
  const res = await fetch(`${API}/api/customer/auth/verify-otp`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, ...(name ? { name } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'OTP verification failed');
  }
  const data = await res.json();

  const profile: CustomerProfile = {
    customerId: data.customerId,
    name: data.name || name || '',
    phone,
    orderingEnabled: !!data.orderingEnabled,
    exp: Date.now() + SESSION_MS,
  };
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}
