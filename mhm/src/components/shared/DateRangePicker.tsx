interface DateRangePickerProps {
  from: string | null;
  to: string | null;
  onChange: (from: string | null, to: string | null) => void;
  disabled?: boolean;
}

export default function DateRangePicker({ from, to, onChange, disabled }: DateRangePickerProps) {
  const unlimited = from === null && to === null;

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={unlimited}
          onChange={(e) => {
            if (e.target.checked) {
              onChange(null, null);
            } else {
              const today = new Date().toISOString().split("T")[0];
              onChange(today, today);
            }
          }}
          disabled={disabled}
          className="w-4 h-4 rounded border-slate-300 text-blue-500 focus:ring-blue-400/40"
        />
        <span className="text-sm text-slate-600 font-medium">Không giới hạn thời gian</span>
      </label>

      {!unlimited && (
        <div className="flex items-center gap-2">
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-medium block mb-1">Từ ngày</label>
            <input
              type="date"
              value={from ?? ""}
              onChange={(e) => onChange(e.target.value || null, to)}
              disabled={disabled}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-500"
            />
          </div>
          <span className="text-slate-400 mt-5">→</span>
          <div className="flex-1">
            <label className="text-xs text-slate-400 font-medium block mb-1">Đến ngày</label>
            <input
              type="date"
              value={to ?? ""}
              onChange={(e) => onChange(from, e.target.value || null)}
              disabled={disabled}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30 focus:border-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
}
