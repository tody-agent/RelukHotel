import { useCallback } from "react";

const DAYS = [
  { label: "T2", index: 0 },
  { label: "T3", index: 1 },
  { label: "T4", index: 2 },
  { label: "T5", index: 3 },
  { label: "T6", index: 4 },
  { label: "T7", index: 5 },
  { label: "CN", index: 6 },
];

interface DayOfWeekPickerProps {
  /** Bitmask 0-127: bit 0=Mon(T2)..bit 6=Sun(CN) */
  value: number;
  onChange: (mask: number) => void;
  disabled?: boolean;
}

export default function DayOfWeekPicker({ value, onChange, disabled }: DayOfWeekPickerProps) {
  const toggle = useCallback(
    (dayIndex: number) => {
      if (disabled) return;
      onChange(value ^ (1 << dayIndex));
    },
    [value, onChange, disabled],
  );

  return (
    <div className="flex items-center gap-1.5">
      {DAYS.map(({ label, index }) => {
        const active = (value & (1 << index)) !== 0;
        return (
          <button
            key={index}
            type="button"
            onClick={() => toggle(index)}
            disabled={disabled}
            className={`
              w-9 h-9 rounded-full text-xs font-semibold transition-all cursor-pointer
              focus:outline-none focus:ring-2 focus:ring-blue-400/40
              ${active
                ? "bg-blue-500 text-white shadow-sm hover:bg-blue-600"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }
              ${disabled ? "opacity-50 cursor-not-allowed" : ""}
            `}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}
