import { Plus, Trash2 } from "lucide-react";
import { fmtMoney } from "@/lib/format";

/**
 * Task 4.3: Step Editor for hourly_steps & surcharge tiers.
 *
 * Each step is { from: number, to: number | null, amount: number }.
 * - For hourly: from/to = hours, amount = VND total for that range
 * - For surcharge: from/to = hours (early/late), amount = % or VND
 */

export interface Step {
  from: number;
  to: number | null;
  amount: number;
}

interface StepEditorProps {
  steps: Step[];
  onChange: (steps: Step[]) => void;
  label?: string;
  fromLabel?: string;
  toLabel?: string;
  amountLabel?: string;
  amountUnit?: "đ" | "%";
  helpText?: string;
}

export default function StepEditor({
  steps,
  onChange,
  label = "Mốc giá",
  fromLabel = "Từ (giờ)",
  toLabel = "Đến (giờ)",
  amountLabel = "Giá (VND)",
  amountUnit = "đ",
  helpText,
}: StepEditorProps) {
  const addStep = () => {
    const lastTo = steps.length > 0 ? (steps[steps.length - 1].to ?? steps[steps.length - 1].from + 1) : 0;
    onChange([...steps, { from: lastTo, to: lastTo + 1, amount: 0 }]);
  };

  const removeStep = (idx: number) => {
    onChange(steps.filter((_, i) => i !== idx));
  };

  const updateStep = (idx: number, field: keyof Step, value: number | null) => {
    onChange(
      steps.map((s, i) =>
        i === idx ? { ...s, [field]: value } : s
      )
    );
  };

  return (
    <div className="space-y-3">
      {label && (
        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {label}
        </p>
      )}

      {helpText && (
        <p className="text-xs text-slate-400 bg-slate-50 rounded-lg px-3 py-2">
          {helpText}
        </p>
      )}

      {/* Header */}
      {steps.length > 0 && (
        <div className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 px-1 text-[10px] font-bold text-slate-400 uppercase">
          <span>{fromLabel}</span>
          <span>{toLabel}</span>
          <span>{amountLabel}</span>
          <span />
        </div>
      )}

      {/* Rows */}
      {steps.map((step, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[1fr_1fr_1fr_40px] gap-2 items-center bg-white border border-slate-100 rounded-xl px-3 py-2 group hover:border-slate-200 transition-colors"
        >
          <input
            type="number"
            min={0}
            value={step.from}
            onChange={(e) => updateStep(idx, "from", Number(e.target.value))}
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <input
            type="number"
            min={0}
            value={step.to ?? ""}
            placeholder="∞"
            onChange={(e) =>
              updateStep(idx, "to", e.target.value ? Number(e.target.value) : null)
            }
            className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400"
          />
          <div className="relative">
            <input
              type="number"
              min={0}
              value={step.amount}
              onChange={(e) => updateStep(idx, "amount", Number(e.target.value))}
              className="w-full bg-slate-50 border border-slate-100 rounded-lg px-2 py-1.5 pr-7 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 tabular-nums"
            />
            <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 font-semibold">
              {amountUnit}
            </span>
          </div>
          <button
            type="button"
            onClick={() => removeStep(idx)}
            className="text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg p-1.5 transition-colors opacity-0 group-hover:opacity-100 cursor-pointer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      ))}

      {/* Preview total for hourly */}
      {steps.length > 0 && amountUnit === "đ" && (
        <div className="flex justify-between items-center px-3 py-2 bg-blue-50/50 rounded-lg text-xs">
          <span className="text-slate-500">
            {steps.length} mốc •{" "}
            {steps[0]?.from ?? 0}h →{" "}
            {steps[steps.length - 1]?.to ?? "∞"}h
          </span>
          <span className="font-semibold text-blue-600 tabular-nums">
            Max {fmtMoney(Math.max(...steps.map((s) => s.amount)))}
          </span>
        </div>
      )}

      {/* Add button */}
      <button
        type="button"
        onClick={addStep}
        className="w-full flex items-center justify-center gap-1.5 py-2.5 border border-dashed border-slate-200 rounded-xl text-xs font-semibold text-slate-500 hover:text-blue-600 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer"
      >
        <Plus size={14} /> Thêm mốc mới
      </button>
    </div>
  );
}
