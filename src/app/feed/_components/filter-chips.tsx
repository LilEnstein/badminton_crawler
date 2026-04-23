"use client";

const TIME_SLOTS = [
  { value: "morning",   label: "🌅 Sáng" },
  { value: "noon",      label: "🌤 Trưa" },
  { value: "afternoon", label: "☀️ Chiều" },
  { value: "evening",   label: "🌙 Tối" }
] as const;

interface FilterChipsProps {
  activeSlots: string[];
  onToggleSlot: (slot: string) => void;
  includeAll: boolean;
  onToggleAll: () => void;
}

export function FilterChips({ activeSlots, onToggleSlot, includeAll, onToggleAll }: FilterChipsProps) {
  return (
    <div className="feed-filter-chips">
      {TIME_SLOTS.map((slot) => (
        <button
          key={slot.value}
          className={`chip${activeSlots.includes(slot.value) ? " selected" : ""}`}
          onClick={() => onToggleSlot(slot.value)}
        >
          {slot.label}
        </button>
      ))}
      <button
        className={`chip${includeAll ? " selected" : ""}`}
        onClick={onToggleAll}
      >
        Tất cả trạng thái
      </button>
    </div>
  );
}
