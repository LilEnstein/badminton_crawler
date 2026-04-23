"use client";

import { getAccessToken } from "./auth-client";

export type TimeSlot = "morning" | "noon" | "afternoon" | "evening";
export type ShuttleType = "plastic" | "feather" | "any";
export type GenderPreference = "male" | "female" | "mixed" | "any";
export type LevelTolerance = 1 | 2;

export interface ProfilePublic {
  userId: string;
  displayName: string;
  level: number;
  levelTolerance: LevelTolerance;
  city: string;
  districts: string[];
  timeSlots: TimeSlot[];
  budgetVnd: number;
  shuttleType: ShuttleType;
  genderPreference: GenderPreference;
  sessionsCount?: number;
  favoriteCourts?: string;
  favoriteDays?: string[];
  updatedAt: string;
}

export interface ProfileInput {
  displayName: string;
  level: number;
  levelTolerance: LevelTolerance;
  city: string;
  districts: string[];
  timeSlots: TimeSlot[];
  budgetVnd: number;
  shuttleType: ShuttleType;
  genderPreference: GenderPreference;
  sessionsCount?: number;
  favoriteCourts?: string;
  favoriteDays?: string[];
}

export interface DistrictsCatalog {
  cities: string[];
  byCity: Record<string, string[]>;
}

export type ApiResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: { code: string; message: string; fields?: Record<string, string> } };

async function send<T>(url: string, init: RequestInit): Promise<ApiResult<T>> {
  const token = getAccessToken();
  const headers = new Headers(init.headers);
  if (token) headers.set("Authorization", `Bearer ${token}`);
  if (init.body) headers.set("Content-Type", "application/json");

  const res = await fetch(url, { ...init, headers, credentials: "same-origin" });
  const json = await res.json().catch(() => null);
  if (!res.ok || !json || json.error) {
    return {
      ok: false,
      error: json?.error ?? { code: "NETWORK_ERROR", message: "Request failed" }
    };
  }
  return { ok: true, data: json.data as T };
}

export function fetchDistricts(): Promise<ApiResult<DistrictsCatalog>> {
  return send<DistrictsCatalog>("/api/v1/districts", { method: "GET" });
}

export function fetchMyProfile(): Promise<ApiResult<{ profile: ProfilePublic }>> {
  return send<{ profile: ProfilePublic }>("/api/v1/profiles/me", { method: "GET" });
}

export function createProfile(
  input: ProfileInput
): Promise<ApiResult<{ profile: ProfilePublic }>> {
  return send<{ profile: ProfilePublic }>("/api/v1/profiles", {
    method: "POST",
    body: JSON.stringify(input)
  });
}

export function updateProfile(
  patch: Partial<ProfileInput>
): Promise<ApiResult<{ profile: ProfilePublic }>> {
  return send<{ profile: ProfilePublic }>("/api/v1/profiles/me", {
    method: "PATCH",
    body: JSON.stringify(patch)
  });
}
