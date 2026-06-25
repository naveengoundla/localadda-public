'use client';

const API = process.env.NEXT_PUBLIC_API_URL || "https://api.localadda.com";

const TOKEN_KEY = 'la_customer_token';
const PROFILE_KEY = 'la_customer_profile';

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
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(PROFILE_KEY);
}

export async function sendCustomerOtp(phone: string): Promise<void> {
  const res = await fetch(`${API}/api/customer/auth/send-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'Could not send OTP');
  }
}

export async function redeemInviteCode(code: string, name: string, phone: string): Promise<CustomerProfile> {
  const res = await fetch(`${API}/api/customer/auth/redeem-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ code, name, phone }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'Could not verify code');
  }
  const data = await res.json();

  let exp = Date.now() + 24 * 60 * 60 * 1000;
  try {
    exp = JSON.parse(atob(data.token.split('.')[1])).exp * 1000;
  } catch { /* keep fallback */ }

  const profile: CustomerProfile = {
    customerId: data.customerId,
    name: data.name || name || '',
    phone,
    orderingEnabled: !!data.orderingEnabled,
    exp,
  };
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}

export async function verifyCustomerOtp(phone: string, otp: string, name?: string): Promise<CustomerProfile> {
  const res = await fetch(`${API}/api/customer/auth/verify-otp`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ phone, otp, ...(name ? { name } : {}) }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => null);
    throw new Error(err?.error || err?.message || 'OTP verification failed');
  }
  const data = await res.json();

  let exp = Date.now() + 24 * 60 * 60 * 1000;
  try {
    exp = JSON.parse(atob(data.token.split('.')[1])).exp * 1000;
  } catch { /* keep fallback */ }

  const profile: CustomerProfile = {
    customerId: data.customerId,
    name: data.name || name || '',
    phone,
    orderingEnabled: !!data.orderingEnabled,
    exp,
  };
  localStorage.setItem(TOKEN_KEY, data.token);
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  return profile;
}
