import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Plus, Trash2, Zap, ChevronDown, ChevronUp } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import DayOfWeekPicker from "@/components/shared/DayOfWeekPicker";
import DateRangePicker from "@/components/shared/DateRangePicker";
import RoomTypeValueEditor from "./RoomTypeValueEditor";

// ── Types ──────────────────────────────────────────────────────────

type AppliesTo = "night" | "overnight" | "hourly" | "late_day" | "late_night" | "early_day" | "early_night";
type Strategy = "replace" | "add";

interface DynamicRule {
  id: string;
  property_id: string;
  name: string;
  applies_to: AppliesTo;
  strategy: Strategy;
  weekday_mask: number;
  specific_dates_json: string | null;
  hour_start: number | null;
  hour_end: number | null;
  active_from: string | null;
  active_to: string | null;
  enabled: number;
}

interface RuleFormData {
  id: string | null;
  name: string;
  applies_to: AppliesTo;
  strategy: Strategy;
  weekday_mask: number;
  specific_dates_json: string;
  hour_start: string;
  hour_end: string;
  active_from: string | null;
  active_to: string | null;
  enabled: boolean;
  values: Array<{ room_type_id: string; value: number }>;
}

const EMPTY_FORM: RuleFormData = {
  id: null,
  name: "",
  applies_to: "night",
  strategy: "add",
  weekday_mask: 127,
  specific_dates_json: "",
  hour_start: "",
  hour_end: "",
  active_from: null,
  active_to: null,
  enabled: true,
  values: [],
};

const APPLIES_TO_OPTIONS: Array<{ value: AppliesTo; label: string }> = [
  { value: "night", label: "Giá ngày (Night)" },
  { value: "overnight", label: "Giá qua đêm (Overnight)" },
  { value: "hourly", label: "Giá giờ (Hourly)" },
  { value: "late_day", label: "Phụ thu checkout muộn (ngày)" },
  { value: "late_night", label: "Phụ thu checkout muộn (đêm)" },
  { value: "early_day", label: "Phụ thu checkin sớm (ngày)" },
  { value: "early_night", label: "Phụ thu checkin sớm (đêm)" },
];

const STRATEGY_OPTIONS: Array<{ value: Strategy; label: string; desc: string }> = [
  { value: "add", label: "Cộng thêm", desc: "Cộng/trừ delta vào giá gốc" },
  { value: "replace", label: "Thay thế", desc: "Ghi đè giá gốc" },
];

function weekdayBadges(mask: number) {
  const days = ["T2", "T3", "T4", "T5", "T6", "T7", "CN"];
  return days
    .filter((_, i) => (mask & (1 << i)) !== 0)
    .join(", ");
}

// ── Component ──────────────────────────────────────────────────────

export default function DynamicPricingSection() {
  const [rules, setRules] = useState<DynamicRule[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<RuleFormData>({ ...EMPTY_FORM });
  const [saving, setSaving] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // TODO: Replace with actual property_id from store
  const propertyId = "default";

  const loadRules = async () => {
    try {
      const data = await invoke<DynamicRule[]>("dynamic_rule_list", { propertyId });
      setRules(data);
    } catch {
      setRules([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRules();
  }, []);

  const openNew = () => {
    setForm({ ...EMPTY_FORM });
    setShowForm(true);
  };

  const openEdit = (rule: DynamicRule) => {
    setForm({
      id: rule.id,
      name: rule.name,
      applies_to: rule.applies_to,
      strategy: rule.strategy,
      weekday_mask: rule.weekday_mask,
      specific_dates_json: rule.specific_dates_json ?? "",
      hour_start: rule.hour_start !== null ? String(rule.hour_start) : "",
      hour_end: rule.hour_end !== null ? String(rule.hour_end) : "",
      active_from: rule.active_from,
      active_to: rule.active_to,
      enabled: rule.enabled === 1,
      values: [],
    });
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      toast.error("Vui lòng nhập tên quy tắc");
      return;
    }
    setSaving(true);
    try {
      await invoke("dynamic_rule_upsert", {
        id: form.id,
        propertyId,
        name: form.name,
        appliesTo: form.applies_to,
        strategy: form.strategy,
        weekdayMask: form.weekday_mask,
        specificDatesJson: form.specific_dates_json || null,
        hourStart: form.hour_start ? Number(form.hour_start) : null,
        hourEnd: form.hour_end ? Number(form.hour_end) : null,
        activeFrom: form.active_from,
        activeTo: form.active_to,
        enabled: form.enabled,
      });
      toast.success(form.id ? "Đã cập nhật quy tắc" : "Đã tạo quy tắc mới");
      setShowForm(false);
      loadRules();
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Lỗi khi lưu quy tắc");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ruleId: string) => {
    try {
      await invoke("dynamic_rule_delete", { ruleId });
      toast.success("Đã xóa quy tắc");
      loadRules();
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Lỗi khi xóa");
    }
  };

  const toggleEnabled = async (rule: DynamicRule) => {
    try {
      await invoke("dynamic_rule_upsert", {
        id: rule.id,
        propertyId: rule.property_id,
        name: rule.name,
        appliesTo: rule.applies_to,
        strategy: rule.strategy,
        weekdayMask: rule.weekday_mask,
        specificDatesJson: rule.specific_dates_json,
        hourStart: rule.hour_start,
        hourEnd: rule.hour_end,
        activeFrom: rule.active_from,
        activeTo: rule.active_to,
        enabled: rule.enabled === 1 ? false : true,
      });
      loadRules();
    } catch {
      toast.error("Lỗi khi thay đổi trạng thái");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Zap size={20} className="text-amber-500" />
            Giá theo thời điểm (Dynamic Pricing)
          </h3>
          <p className="text-sm text-brand-muted mt-1">
            Tăng hoặc thay đổi giá vào cuối tuần, ngày lễ, khung giờ cụ thể
          </p>
        </div>
        <Button onClick={openNew} className="gap-2 bg-brand-primary text-white rounded-xl">
          <Plus size={16} /> Thêm quy tắc mới
        </Button>
      </div>

      {/* Rule list */}
      {loading ? (
        <p className="text-sm text-slate-400 py-8 text-center">Đang tải...</p>
      ) : rules.length === 0 ? (
        <div className="text-center py-12 bg-slate-50 rounded-2xl">
          <Zap size={32} className="mx-auto text-slate-300 mb-3" />
          <p className="text-sm text-slate-500">Chưa có quy tắc giá nào</p>
          <p className="text-xs text-slate-400 mt-1">Nhấn "Thêm quy tắc mới" để bắt đầu</p>
        </div>
      ) : (
        <div className="space-y-2">
          {rules.map((rule) => {
            const expanded = expandedId === rule.id;
            const appliesLabel = APPLIES_TO_OPTIONS.find((o) => o.value === rule.applies_to)?.label ?? rule.applies_to;

            return (
              <div
                key={rule.id}
                className={`rounded-xl border transition-all ${rule.enabled ? "border-slate-200 bg-white" : "border-slate-100 bg-slate-50 opacity-60"}`}
              >
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Toggle */}
                    <button
                      type="button"
                      onClick={() => toggleEnabled(rule)}
                      className={`w-10 h-5 rounded-full transition-colors cursor-pointer relative ${rule.enabled ? "bg-emerald-500" : "bg-slate-300"}`}
                    >
                      <span
                        className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${rule.enabled ? "left-5" : "left-0.5"}`}
                      />
                    </button>

                    <div className="min-w-0">
                      <p className="font-semibold text-sm text-slate-800 truncate">{rule.name}</p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {appliesLabel} · {rule.strategy === "add" ? "Cộng thêm" : "Thay thế"} · {weekdayBadges(rule.weekday_mask)}
                        {rule.hour_start !== null && ` · ${rule.hour_start}h–${rule.hour_end}h`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs"
                      onClick={() => openEdit(rule)}
                    >
                      Sửa
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg text-xs text-red-500 hover:text-red-600 hover:bg-red-50"
                      onClick={() => handleDelete(rule.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                    <button
                      type="button"
                      onClick={() => setExpandedId(expanded ? null : rule.id)}
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 cursor-pointer"
                    >
                      {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </button>
                  </div>
                </div>

                {expanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-slate-100">
                    <RoomTypeValueEditor
                      ruleId={rule.id}
                      strategy={rule.strategy}
                      values={[]}
                      onChange={() => {}}
                    />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Form dialog (inline) */}
      {showForm && (
        <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[85vh] overflow-y-auto">
            <div className="p-6 space-y-5">
              <h4 className="text-base font-bold">
                {form.id ? "Chỉnh sửa quy tắc" : "Tạo quy tắc giá mới"}
              </h4>

              {/* Name */}
              <div className="space-y-1.5">
                <Label>Tên quy tắc</Label>
                <Input
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="VD: Cuối tuần, Tết Nguyên Đán..."
                />
              </div>

              {/* Applies to */}
              <div className="space-y-1.5">
                <Label>Áp dụng cho</Label>
                <select
                  value={form.applies_to}
                  onChange={(e) => setForm({ ...form, applies_to: e.target.value as AppliesTo })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-400/30"
                >
                  {APPLIES_TO_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>

              {/* Strategy */}
              <div className="space-y-1.5">
                <Label>Chiến lược giá</Label>
                <div className="grid grid-cols-2 gap-2">
                  {STRATEGY_OPTIONS.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setForm({ ...form, strategy: opt.value })}
                      className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                        form.strategy === opt.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 hover:bg-slate-50"
                      }`}
                    >
                      <p className={`text-sm font-semibold ${form.strategy === opt.value ? "text-blue-600" : "text-slate-700"}`}>
                        {opt.label}
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">{opt.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Day of week */}
              <div className="space-y-1.5">
                <Label>Ngày trong tuần</Label>
                <DayOfWeekPicker
                  value={form.weekday_mask}
                  onChange={(mask) => setForm({ ...form, weekday_mask: mask })}
                />
              </div>

              {/* Hour range */}
              <div className="space-y-1.5">
                <Label>Khung giờ (tùy chọn)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={form.hour_start}
                    onChange={(e) => setForm({ ...form, hour_start: e.target.value })}
                    placeholder="VD: 22"
                    className="w-24"
                  />
                  <span className="text-slate-400 text-sm">đến</span>
                  <Input
                    type="number"
                    min={0}
                    max={23}
                    value={form.hour_end}
                    onChange={(e) => setForm({ ...form, hour_end: e.target.value })}
                    placeholder="VD: 02"
                    className="w-24"
                  />
                  <span className="text-xs text-slate-400">giờ (để trống = cả ngày)</span>
                </div>
              </div>

              {/* Date range */}
              <div className="space-y-1.5">
                <Label>Thời gian hiệu lực</Label>
                <DateRangePicker
                  from={form.active_from}
                  to={form.active_to}
                  onChange={(from, to) => setForm({ ...form, active_from: from, active_to: to })}
                />
              </div>

              {/* Specific dates */}
              <div className="space-y-1.5">
                <Label>Ngày cụ thể (tùy chọn)</Label>
                <Input
                  value={form.specific_dates_json}
                  onChange={(e) => setForm({ ...form, specific_dates_json: e.target.value })}
                  placeholder='VD: ["2026-01-29","2026-09-02"]'
                  className="font-mono text-xs"
                />
                <p className="text-xs text-slate-400">JSON array ngày ISO. Ưu tiên cao hơn ngày trong tuần.</p>
              </div>

              {/* Room type values */}
              <div className="space-y-1.5">
                <Label>Giá trị theo loại phòng</Label>
                <RoomTypeValueEditor
                  ruleId={form.id ?? "new"}
                  strategy={form.strategy}
                  values={[]}
                  onChange={(values) => setForm({ ...form, values })}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-2">
                <Button
                  onClick={handleSave}
                  disabled={saving || !form.name.trim()}
                  className="flex-1 bg-brand-primary text-white rounded-xl"
                >
                  {saving ? "Đang lưu..." : form.id ? "Cập nhật" : "Tạo quy tắc"}
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setShowForm(false)}
                  className="rounded-xl"
                >
                  Hủy
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
