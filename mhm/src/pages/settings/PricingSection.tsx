import { useEffect, useState, type ReactNode } from "react";
import { invoke } from "@tauri-apps/api/core";
import { DollarSign, Settings2, ArrowLeft, Copy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { assertNonNegativeMoneyVnd } from "@/lib/money";
import type { PricingRuleData, RoomTypeItem } from "@/types";

import DynamicRoomTypeSelect from "./DynamicRoomTypeSelect";
import RatePlanForm from "./rate_plans/RatePlanForm";

// ── Rate Plan (V2) type from backend ──
interface RatePlanData {
  id: string;
  property_id: string;
  room_type_id: string;
  name: string;
  is_default: boolean;
  currency: string;
  capacity: number;
  night_rate: number | null;
  overnight_rate: number | null;
  overnight_start_hour: number;
  monthly_rate: number | null;
  hourly_steps_json: string | null;
  hourly_max_hours: number | null;
  extra_bed_per_person: number;
}

export default function PricingSection() {
  // ── Legacy flat rules ──
  const [rules, setRules] = useState<PricingRuleData[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  const [form, setForm] = useState<PricingRuleData>({
    room_type: "",
    hourly_rate: 80000,
    overnight_rate: 300000,
    daily_rate: 400000,
    early_checkin_surcharge_pct: 30,
    late_checkout_surcharge_pct: 30,
    weekend_uplift_pct: 20,
  });

  // ── V2 Rate Plans ──
  const [ratePlans, setRatePlans] = useState<RatePlanData[]>([]);
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([]);
  const [editingRatePlan, setEditingRatePlan] = useState<string | null>(null); // room_type_id
  const [copySource, setCopySource] = useState<string | null>(null); // room_type_id for copy dialog

  const loadRatePlans = () => {
    invoke<RatePlanData[]>("get_rate_plans")
      .then(setRatePlans)
      .catch(() => {});
  };

  const handleCopyConfig = async (sourceRoomTypeId: string, targetRoomTypeId: string) => {
    try {
      await invoke("rate_plan_copy", {
        sourceRoomTypeId,
        targetRoomTypeId,
      });
      toast.success("Đã sao chép cấu hình giá thành công!");
      setCopySource(null);
      loadRatePlans();
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Lỗi khi sao chép cấu hình");
    }
  };

  useEffect(() => {
    invoke<PricingRuleData[]>("get_pricing_rules").then(setRules).catch(() => {});
    loadRatePlans();
    invoke<RoomTypeItem[]>("get_room_types")
      .then((items) => setRoomTypes(Array.isArray(items) ? items : []))
      .catch(() => {});
  }, []);

  const startEdit = (rule: PricingRuleData) => {
    setEditing(rule.room_type);
    setForm({ ...rule });
  };

  const handleSave = async () => {
    if (!form.room_type) {
      toast.error("Chọn loại phòng trước khi lưu");
      return;
    }

    try {
      const hourlyRate = assertNonNegativeMoneyVnd(form.hourly_rate, "hourly_rate");
      const overnightRate = assertNonNegativeMoneyVnd(form.overnight_rate, "overnight_rate");
      const dailyRate = assertNonNegativeMoneyVnd(form.daily_rate, "daily_rate");
      await invoke("save_pricing_rule", {
        roomType: form.room_type,
        hourlyRate,
        overnightRate,
        dailyRate,
        earlyPct: form.early_checkin_surcharge_pct,
        latePct: form.late_checkout_surcharge_pct,
        weekendPct: form.weekend_uplift_pct,
      });
      toast.success("Đã lưu bảng giá!");
      setEditing(null);
      invoke<PricingRuleData[]>("get_pricing_rules").then(setRules);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : String(error) || "Lỗi lưu bảng giá");
    }
  };

  const fmtK = (value: number) => `${(value / 1000).toFixed(0)}k`;
  const fmtM = (value: number | null | undefined) =>
    value ? `${(value / 1000).toFixed(0)}k` : "—";

  // ── If editing a Rate Plan V2, show the full form ──
  if (editingRatePlan) {
    const rtName = roomTypes.find((rt) => rt.id === editingRatePlan)?.name ?? editingRatePlan;
    return (
      <div className="space-y-4">
        <button
          onClick={() => setEditingRatePlan(null)}
          className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-brand-primary transition-colors cursor-pointer"
        >
          <ArrowLeft size={14} /> Quay lại Bảng giá
        </button>
        <p className="text-xs text-slate-400">Loại phòng: <span className="font-semibold text-slate-600">{rtName}</span></p>
        <RatePlanForm
          roomTypeId={editingRatePlan}
          onSaved={() => {
            setEditingRatePlan(null);
            loadRatePlans();
          }}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* ═══ SECTION 1: Rate Plan V2 (Advanced) ═══ */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <Settings2 size={20} className="text-blue-500" />
            Cấu hình giá nâng cao (Rate Plan)
          </h3>
          <p className="text-sm text-brand-muted">
            Cấu hình giá bậc thang theo giờ, phụ trội check-in sớm / check-out muộn, giá theo tháng, extra bed
          </p>
        </div>

        {roomTypes.length > 0 ? (
          <div className="space-y-2">
            {roomTypes.map((rt) => {
              const plan = ratePlans.find((rp) => rp.room_type_id === rt.id);
              return (
                <div
                  key={rt.id}
                  className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-xl hover:border-blue-200 transition-colors"
                >
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{rt.name}</p>
                    {plan ? (
                      <p className="text-xs text-slate-500 mt-0.5">
                        📅 {fmtM(plan.night_rate)} / 🌙 {fmtM(plan.overnight_rate)} / 📆 {fmtM(plan.monthly_rate)}
                        {plan.extra_bed_per_person > 0 && ` · 🛏 +${fmtM(plan.extra_bed_per_person)}`}
                        {plan.hourly_steps_json && " · ⏱ Giá giờ bậc thang"}
                        <span className="ml-2 text-emerald-500 font-medium">✓ Đã cấu hình</span>
                      </p>
                    ) : (
                      <p className="text-xs text-amber-500 mt-0.5">
                        ⚠ Chưa cấu hình Rate Plan — đang dùng giá cơ bản
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {plan && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="rounded-lg gap-1.5 text-slate-400 hover:text-blue-500"
                        onClick={() => setCopySource(rt.id)}
                        title="Sao chép cấu hình sang loại phòng khác"
                      >
                        <Copy size={14} />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-lg gap-1.5 shrink-0"
                      onClick={() => setEditingRatePlan(rt.id)}
                    >
                      <Settings2 size={14} />
                      {plan ? "Chỉnh sửa" : "Cấu hình"}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 bg-slate-50 rounded-2xl">
            <Settings2 size={28} className="mx-auto text-slate-300 mb-2" />
            <p className="text-sm text-slate-500">Chưa có loại phòng nào. Tạo loại phòng trước.</p>
          </div>
        )}

        {/* Copy Config Target Selector */}
        {copySource && (
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-blue-700">
                <Copy size={14} className="inline mr-1" />
                Sao chép cấu hình từ "{roomTypes.find((rt) => rt.id === copySource)?.name}" sang:
              </p>
              <Button variant="ghost" size="sm" onClick={() => setCopySource(null)}>
                Hủy
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {roomTypes
                .filter((rt) => rt.id !== copySource)
                .map((rt) => (
                  <Button
                    key={rt.id}
                    variant="outline"
                    size="sm"
                    className="rounded-lg"
                    onClick={() => handleCopyConfig(copySource, rt.id)}
                  >
                    {rt.name}
                  </Button>
                ))}
            </div>
          </div>
        )}
      </div>

      {/* ═══ Divider ═══ */}
      <div className="border-t border-dashed border-slate-200 pt-6">
        <p className="text-[10px] uppercase tracking-wider text-slate-400 font-bold mb-4">
          Bảng giá cơ bản (Legacy)
        </p>
      </div>

      {/* ═══ SECTION 2: Legacy flat pricing ═══ */}
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-bold mb-1 flex items-center gap-2">
            <DollarSign size={20} className="text-emerald-500" />
            Bảng giá theo loại phòng
          </h3>
          <p className="text-sm text-brand-muted">Cấu hình giá theo giờ, qua đêm, theo ngày cho từng loại phòng</p>
        </div>

        {rules.length > 0 && (
          <div className="space-y-2">
            {rules.map((rule) => (
              <div key={rule.room_type} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                <div>
                  <p className="font-semibold text-sm capitalize">{rule.room_type}</p>
                  <p className="text-xs text-brand-muted">
                    ⏱ {fmtK(rule.hourly_rate)} / 🌙 {fmtK(rule.overnight_rate)} / 📅 {fmtK(rule.daily_rate)} &nbsp;|&nbsp; Sớm +
                    {rule.early_checkin_surcharge_pct}% &nbsp; Trễ +{rule.late_checkout_surcharge_pct}% &nbsp; T7-CN +
                    {rule.weekend_uplift_pct}%
                  </p>
                </div>
                <Button variant="outline" size="sm" className="rounded-lg" onClick={() => startEdit(rule)}>
                  Sửa
                </Button>
              </div>
            ))}
          </div>
        )}

        <div className="p-5 bg-slate-50 rounded-2xl space-y-4">
          <h4 className="font-bold text-sm">{editing ? `Sửa: ${editing}` : "Thêm bảng giá"}</h4>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Loại phòng</Label>
              <DynamicRoomTypeSelect value={form.room_type} onChange={(roomType) => setForm({ ...form, room_type: roomType })} disabled={Boolean(editing)} />
            </div>
            <div />
            <Field label="⏱ Giá theo giờ">
              <Input type="number" value={form.hourly_rate} onChange={(event) => setForm({ ...form, hourly_rate: Number(event.target.value) })} className="mt-1.5" />
            </Field>
            <Field label="🌙 Giá qua đêm">
              <Input type="number" value={form.overnight_rate} onChange={(event) => setForm({ ...form, overnight_rate: Number(event.target.value) })} className="mt-1.5" />
            </Field>
            <Field label="📅 Giá theo ngày">
              <Input type="number" value={form.daily_rate} onChange={(event) => setForm({ ...form, daily_rate: Number(event.target.value) })} className="mt-1.5" />
            </Field>
            <div />
            <Field label="% phụ thu check-in sớm">
              <Input
                type="number"
                value={form.early_checkin_surcharge_pct}
                onChange={(event) => setForm({ ...form, early_checkin_surcharge_pct: Number(event.target.value) })}
                className="mt-1.5 w-24"
              />
            </Field>
            <Field label="% phụ thu check-out trễ">
              <Input
                type="number"
                value={form.late_checkout_surcharge_pct}
                onChange={(event) => setForm({ ...form, late_checkout_surcharge_pct: Number(event.target.value) })}
                className="mt-1.5 w-24"
              />
            </Field>
            <Field label="% phụ thu cuối tuần">
              <Input
                type="number"
                value={form.weekend_uplift_pct}
                onChange={(event) => setForm({ ...form, weekend_uplift_pct: Number(event.target.value) })}
                className="mt-1.5 w-24"
              />
            </Field>
          </div>
          <div className="flex gap-2">
            <Button onClick={() => void handleSave()} disabled={!form.room_type} className="bg-brand-primary text-white rounded-xl">
              {editing ? "Cập nhật" : "Thêm"}
            </Button>
            {editing && (
              <Button variant="outline" className="rounded-xl" onClick={() => setEditing(null)}>
                Hủy
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      {children}
    </div>
  );
}
