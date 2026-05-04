import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Pencil, Save, X } from "lucide-react";
import { toast } from "sonner";

/**
 * Task 5.3: "Linh động giá" — Override pricing dialog.
 * Opens from a pencil icon next to the total price. Allows front-desk staff
 * to override the rate plan for a specific booking by editing a JSON-editable
 * copy of the rate plan fields.
 */

interface PricingOverrideDialogProps {
  open: boolean;
  bookingId: string;
  roomType: string;
  onClose: () => void;
  onSaved: () => void;
}

interface OverrideFields {
  night_rate: number;
  hourly_rate: number;
  overnight_rate: number;
  extra_bed: number;
  reason: string;
}

export default function PricingOverrideDialog({
  open,
  bookingId,
  roomType,
  onClose,
  onSaved,
}: PricingOverrideDialogProps) {
  const [fields, setFields] = useState<OverrideFields>({
    night_rate: 0,
    hourly_rate: 0,
    overnight_rate: 0,
    extra_bed: 0,
    reason: "",
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load current pricing as starting values
  useEffect(() => {
    if (!open || !roomType) return;
    setLoading(true);
    invoke<Array<{ daily_rate: number; hourly_rate: number; overnight_rate: number }>>(
      "get_pricing_rules"
    )
      .then((rules) => {
        const rule = rules.find(
          (r: any) => r.room_type?.toLowerCase() === roomType.toLowerCase()
        );
        if (rule) {
          setFields({
            night_rate: rule.daily_rate ?? 0,
            hourly_rate: rule.hourly_rate ?? 0,
            overnight_rate: rule.overnight_rate ?? 0,
            extra_bed: 0,
            reason: "",
          });
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [open, roomType]);

  const handleSave = async () => {
    if (!fields.reason.trim()) {
      toast.error("Vui lòng nhập lý do linh động giá");
      return;
    }

    setSaving(true);
    try {
      // Save override as JSON in booking's rate_plan_override_json column
      const overrideJson = JSON.stringify({
        night_rate: fields.night_rate,
        hourly_rate: fields.hourly_rate,
        overnight_rate: fields.overnight_rate,
        extra_bed: fields.extra_bed,
        reason: fields.reason,
        overridden_at: new Date().toISOString(),
      });

      await invoke("update_booking_field", {
        bookingId,
        field: "rate_plan_override_json",
        value: overrideJson,
      });

      toast.success("Đã áp dụng linh động giá");
      onSaved();
      onClose();
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Lỗi khi lưu linh động giá");
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  const fieldConfig = [
    { key: "night_rate" as const, label: "Giá Đêm (VND)", icon: "🌙" },
    { key: "hourly_rate" as const, label: "Giá Giờ (VND)", icon: "⏱" },
    { key: "overnight_rate" as const, label: "Giá Qua đêm (VND)", icon: "🌃" },
    { key: "extra_bed" as const, label: "Extra Bed (VND)", icon: "🛏" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 bg-gradient-to-r from-amber-50 to-orange-50">
          <div className="flex items-center gap-2">
            <Pencil size={16} className="text-amber-600" />
            <h3 className="text-sm font-bold text-slate-800">
              Linh động giá — {roomType}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4">
          {loading ? (
            <p className="text-sm text-slate-400 text-center py-6">
              Đang tải giá hiện tại...
            </p>
          ) : (
            <>
              <p className="text-xs text-slate-400 bg-amber-50/50 rounded-lg px-3 py-2 border border-amber-100">
                ⚠️ Override sẽ thay thế giá mặc định cho booking này. Nhập lý do
                để audit trail.
              </p>

              <div className="grid grid-cols-2 gap-3">
                {fieldConfig.map(({ key, label, icon }) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[10px] font-semibold text-slate-400 uppercase flex items-center gap-1">
                      {icon} {label}
                    </label>
                    <input
                      type="number"
                      min={0}
                      value={fields[key]}
                      onChange={(e) =>
                        setFields((prev) => ({
                          ...prev,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-700 tabular-nums focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400"
                    />
                  </div>
                ))}
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-semibold text-slate-400 uppercase">
                  📝 Lý do linh động giá *
                </label>
                <textarea
                  value={fields.reason}
                  onChange={(e) =>
                    setFields((prev) => ({ ...prev, reason: e.target.value }))
                  }
                  placeholder="VD: Khách quen VIP, giá đặc biệt do Mr. X duyệt..."
                  rows={2}
                  className="w-full bg-slate-50 border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-amber-400/30 focus:border-amber-400 resize-none"
                />
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Hủy
          </button>
          <button
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 text-xs font-semibold text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
          >
            <Save size={13} />
            {saving ? "Đang lưu..." : "Áp dụng"}
          </button>
        </div>
      </div>
    </div>
  );
}
