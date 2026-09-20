// Browser-local accounts. There is no backend in this project, so accounts live in localStorage.
// Passwords are never stored: only a salted PBKDF2-SHA256 hash. This gates the UI for the demo;
// it is NOT a substitute for server-side authentication (see README, "What is real").
// Swap the functions below for API calls when a backend exists.

export interface AuthUser {
  id: string;
  name: string;
  email: string;
}

interface StoredUser extends AuthUser {
  salt: string; // base64
  hash: string; // base64
  createdAt: string;
}

const USERS_KEY = "dehatch_users";
const SESSION_KEY = "dehatch_session";
const ITERATIONS = 150_000;

/** Errors carry an i18n key as their message (see src/lib/i18n/dict.ts). */
export class AuthError extends Error {}

const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
const unb64 = (s: string) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

async function hashPassword(password: string, salt: Uint8Array): Promise<string> {
  if (typeof crypto === "undefined" || !crypto.subtle) throw new AuthError("auth.err.crypto");
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: salt as BufferSource, iterations: ITERATIONS, hash: "SHA-256" },
    key,
    256,
  );
  return b64(new Uint8Array(bits));
}

function readUsers(): StoredUser[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(USERS_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeUsers(users: StoredUser[]) {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch {
    throw new AuthError("auth.err.storage");
  }
}

const publicUser = (u: StoredUser): AuthUser => ({ id: u.id, name: u.name, email: u.email });
const normalizeEmail = (email: string) => email.trim().toLowerCase();

export function setSession(userId: string) {
  try {
    localStorage.setItem(SESSION_KEY, userId);
  } catch {
    throw new AuthError("auth.err.storage");
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

/** The signed-in user, or null (also null if the session points at a deleted account). */
export function getSessionUser(): AuthUser | null {
  try {
    const id = localStorage.getItem(SESSION_KEY);
    const user = id ? readUsers().find((u) => u.id === id) : undefined;
    return user ? publicUser(user) : null;
  } catch {
    return null;
  }
}

export async function registerUser(input: { name: string; email: string; password: string }): Promise<AuthUser> {
  const email = normalizeEmail(input.email);
  const users = readUsers();
  if (users.some((u) => u.email === email)) throw new AuthError("auth.err.exists");

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const user: StoredUser = {
    id: crypto.randomUUID(),
    name: input.name.trim().replace(/\s+/g, " "),
    email,
    salt: b64(salt),
    hash: await hashPassword(input.password, salt),
    createdAt: new Date().toISOString(),
  };
  writeUsers([...users, user]);
  setSession(user.id);
  return publicUser(user);
}

export async function loginUser(input: { email: string; password: string }): Promise<AuthUser> {
  const user = readUsers().find((u) => u.email === normalizeEmail(input.email));
  // Same error for "no such user" and "wrong password" so accounts cannot be probed.
  const hash = await hashPassword(input.password, user ? unb64(user.salt) : new Uint8Array(16));
  if (!user || hash !== user.hash) throw new AuthError("auth.err.invalid");
  setSession(user.id);
  return publicUser(user);
}
