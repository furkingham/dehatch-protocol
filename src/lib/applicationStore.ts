import type { LaunchFormValues } from "@/lib/launchSchema";

// Temporary, browser-local storage for submitted project applications.
// Swap the body of these functions for an API call when a backend exists.
const KEY = "dehatch_applications";
const MAX_ENTRIES = 50;

export interface StoredApplication {
  id: string;
  submittedAt: string; // ISO timestamp
  status: "pending";
  /** Account that sent the application. Older records (before accounts existed) have none. */
  userId?: string;
  data: LaunchFormValues;
}

const newId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID().slice(0, 8).toUpperCase()
    : Date.now().toString(36).toUpperCase();

export function listApplications(): StoredApplication[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

/** Returns the stored record, or null if the browser refused (private mode, quota, disabled). */
export function saveApplication(data: LaunchFormValues, userId?: string): StoredApplication | null {
  const record: StoredApplication = {
    id: newId(),
    submittedAt: new Date().toISOString(),
    status: "pending",
    userId,
    data,
  };
  try {
    localStorage.setItem(KEY, JSON.stringify([record, ...listApplications()].slice(0, MAX_ENTRIES)));
    return record;
  } catch {
    return null;
  }
}

export function clearApplications() {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
}

export function removeApplication(id: string) {
  try {
    localStorage.setItem(KEY, JSON.stringify(listApplications().filter((a) => a.id !== id)));
  } catch {
    // ignore
  }
}
