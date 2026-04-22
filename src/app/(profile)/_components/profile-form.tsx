"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";

import {
  fetchDistricts,
  type DistrictsCatalog,
  type GenderPreference,
  type LevelTolerance,
  type ProfileInput,
  type ShuttleType,
  type TimeSlot
} from "@/app/lib/profile-client";

import { ChipGroupMulti, ChipGroupSingle } from "./chip-group";
import { LevelPicker } from "./level-picker";

interface Props {
  initial?: ProfileInput;
  submitLabel: string;
  submittingLabel: string;
  onSubmit: (input: ProfileInput) => Promise<void>;
}

const TIME_SLOT_OPTIONS: { value: TimeSlot; label: string }[] = [
  { value: "morning", label: "Sáng" },
  { value: "noon", label: "Trưa" },
  { value: "afternoon", label: "Chiều" },
  { value: "evening", label: "Tối" }
];

const SHUTTLE_OPTIONS: { value: ShuttleType; label: string }[] = [
  { value: "feather", label: "Cầu lông vũ" },
  { value: "plastic", label: "Cầu nhựa" },
  { value: "any", label: "Bất kỳ" }
];

const GENDER_OPTIONS: { value: GenderPreference; label: string }[] = [
  { value: "any", label: "Bất kỳ" },
  { value: "male", label: "Nam" },
  { value: "female", label: "Nữ" },
  { value: "mixed", label: "Đôi nam nữ" }
];

const TOLERANCE_OPTIONS: { value: LevelTolerance; label: string }[] = [
  { value: 1, label: "±1 trình" },
  { value: 2, label: "±2 trình" }
];

const DEFAULT_INPUT: ProfileInput = {
  displayName: "",
  level: 5,
  levelTolerance: 1,
  city: "",
  districts: [],
  timeSlots: [],
  budgetVnd: 50_000,
  shuttleType: "feather",
  genderPreference: "any"
};

export function ProfileForm({ initial, submitLabel, submittingLabel, onSubmit }: Props) {
  const [form, setForm] = useState<ProfileInput>(initial ?? DEFAULT_INPUT);
  const [catalog, setCatalog] = useState<DistrictsCatalog | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchDistricts().then((res) => {
      if (!res.ok) {
        setError(res.error.message);
        return;
      }
      setCatalog(res.data);
      setForm((prev) => {
        if (prev.city) return prev;
        const firstCity = res.data.cities[0] ?? "";
        return { ...prev, city: firstCity };
      });
    });
  }, []);

  const districtOptions = useMemo(() => {
    if (!catalog || !form.city) return [];
    return (catalog.byCity[form.city] ?? []).map((d) => ({ value: d, label: d }));
  }, [catalog, form.city]);

  function update<K extends keyof ProfileInput>(key: K, value: ProfileInput[K]): void {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  function onCityChange(nextCity: string): void {
    setForm((prev) => ({ ...prev, city: nextCity, districts: [] }));
  }

  async function handleSubmit(e: FormEvent): Promise<void> {
    e.preventDefault();
    setError(null);
    if (form.districts.length === 0) {
      setError("Chọn ít nhất một quận / huyện.");
      return;
    }
    if (form.timeSlots.length === 0) {
      setError("Chọn ít nhất một khung giờ chơi.");
      return;
    }
    setSubmitting(true);
    try {
      await onSubmit(form);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Có lỗi xảy ra.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      {error && <div className="alert">{error}</div>}

      <div className="field">
        <label htmlFor="displayName">Tên hiển thị</label>
        <input
          id="displayName"
          type="text"
          required
          maxLength={80}
          value={form.displayName}
          onChange={(e) => update("displayName", e.target.value)}
        />
      </div>

      <div className="field">
        <label>Trình độ (1–10)</label>
        <LevelPicker value={form.level} onChange={(v) => update("level", v)} />
      </div>

      <div className="field">
        <label>Sai lệch trình độ chấp nhận</label>
        <ChipGroupSingle
          options={TOLERANCE_OPTIONS}
          value={form.levelTolerance}
          onChange={(v) => update("levelTolerance", v)}
        />
      </div>

      <div className="field">
        <label htmlFor="city">Thành phố</label>
        <select
          id="city"
          value={form.city}
          onChange={(e) => onCityChange(e.target.value)}
          disabled={!catalog}
        >
          {!catalog && <option value="">Đang tải...</option>}
          {catalog?.cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>

      <div className="field">
        <label>Quận / Huyện (chọn nhiều)</label>
        <ChipGroupMulti
          options={districtOptions}
          value={form.districts}
          onChange={(v) => update("districts", v)}
        />
      </div>

      <div className="field">
        <label>Khung giờ chơi</label>
        <ChipGroupMulti
          options={TIME_SLOT_OPTIONS}
          value={form.timeSlots}
          onChange={(v) => update("timeSlots", v)}
        />
      </div>

      <div className="field">
        <label htmlFor="budget">Ngân sách / buổi (VND, bước 10.000)</label>
        <input
          id="budget"
          type="number"
          min={0}
          max={10_000_000}
          step={10_000}
          required
          value={form.budgetVnd}
          onChange={(e) => update("budgetVnd", Number(e.target.value))}
        />
      </div>

      <div className="field">
        <label>Loại cầu</label>
        <ChipGroupSingle
          options={SHUTTLE_OPTIONS}
          value={form.shuttleType}
          onChange={(v) => update("shuttleType", v)}
        />
      </div>

      <div className="field">
        <label>Đối tượng chơi</label>
        <ChipGroupSingle
          options={GENDER_OPTIONS}
          value={form.genderPreference}
          onChange={(v) => update("genderPreference", v)}
        />
      </div>

      <button className="btn" type="submit" disabled={submitting}>
        {submitting ? submittingLabel : submitLabel}
      </button>
    </form>
  );
}
