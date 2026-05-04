import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StepEditor, { type Step } from "@/components/shared/StepEditor";
import { Save, Calculator, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";

// ── Full rate plan shape from backend ──
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
  early_checkin_day_json: string | null;
  early_checkin_night_json: string | null;
  late_checkout_day_json: string | null;
  late_checkout_night_json: string | null;
  extra_bed_per_person: number;
  rounding_minutes: number;
  intraday_mode: string;
  notes: string | null;
}

// ── Preview result from calculate_price_v2 ──
interface PricePreview {
  total: number;
  mode: string;
  line_items: { description: string; amount: number }[];
}

// ── Helpers ──
const DEFAULT_HOURLY_STEPS: Step[] = [
  { from: 0, to: 1, amount: 50000 },
  { from: 1, to: 3, amount: 100000 },
  { from: 3, to: 6, amount: 180000 },
];
const DEFAULT_SURCHARGE: Step[] = [
  { from: 0, to: 2, amount: 30 },
  { from: 2, to: 4, amount: 50 },
];
const DEFAULT_LATE: Step[] = [
  { from: 0, to: 2, amount: 30 },
  { from: 2, to: 4, amount: 50 },
  { from: 4, to: null, amount: 100 },
];

function parseStepsJson(json: string | null | undefined, fallback: Step[]): Step[] {
  if (!json) return fallback;
  try {
    const parsed = JSON.parse(json);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed;
  } catch { /* ignore */ }
  return fallback;
}

function fmtVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN").format(amount) + "đ";
}

export default function RatePlanForm({ roomTypeId, onSaved }: { roomTypeId: string; onSaved: () => void }) {
  const [activeTab, setActiveTab] = useState("basic");
  const [loading, setLoading] = useState(true);

  // ── Form state ──
  const [name, setName] = useState("Default Rate Plan");
  const [capacity, setCapacity] = useState(2);
  const [nightRate, setNightRate] = useState(350000);
  const [overnightRate, setOvernightRate] = useState(250000);
  const [overnightStart, setOvernightStart] = useState(21);
  const [monthlyRate, setMonthlyRate] = useState(6000000);
  const [extraBedFee, setExtraBedFee] = useState(100000);
  const [hourlySteps, setHourlySteps] = useState<Step[]>(DEFAULT_HOURLY_STEPS);
  const [hourlyMaxHours, setHourlyMaxHours] = useState(8);
  const [earlyCheckinDaySteps, setEarlyCheckinDaySteps] = useState<Step[]>(DEFAULT_SURCHARGE);
  const [earlyCheckinNightSteps, setEarlyCheckinNightSteps] = useState<Step[]>(DEFAULT_SURCHARGE);
  const [lateCheckoutDaySteps, setLateCheckoutDaySteps] = useState<Step[]>(DEFAULT_LATE);
  const [lateCheckoutNightSteps, setLateCheckoutNightSteps] = useState<Step[]>(DEFAULT_LATE);
  const [roundingMinutes, setRoundingMinutes] = useState(60);
  const [intradayMode, setIntradayMode] = useState("default");
  const [notes, setNotes] = useState("");

  // ── Preview state ──
  const [previewHours, setPreviewHours] = useState(2);
  const [previewOccupants, setPreviewOccupants] = useState(2);
  const [preview, setPreview] = useState<PricePreview | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  // ── Load existing rate plan on mount ──
  useEffect(() => {
    invoke<RatePlanData[]>("get_rate_plans")
      .then((plans) => {
        const existing = plans.find((p) => p.room_type_id === roomTypeId);
        if (existing) {
          setName(existing.name);
          setCapacity(existing.capacity);
          setNightRate(existing.night_rate ?? 350000);
          setOvernightRate(existing.overnight_rate ?? 250000);
          setOvernightStart(existing.overnight_start_hour);
          setMonthlyRate(existing.monthly_rate ?? 6000000);
          setExtraBedFee(existing.extra_bed_per_person);
          setHourlyMaxHours(existing.hourly_max_hours ?? 8);
          setHourlySteps(parseStepsJson(existing.hourly_steps_json, DEFAULT_HOURLY_STEPS));
          setEarlyCheckinDaySteps(parseStepsJson(existing.early_checkin_day_json, DEFAULT_SURCHARGE));
          setEarlyCheckinNightSteps(parseStepsJson(existing.early_checkin_night_json, DEFAULT_SURCHARGE));
          setLateCheckoutDaySteps(parseStepsJson(existing.late_checkout_day_json, DEFAULT_LATE));
          setLateCheckoutNightSteps(parseStepsJson(existing.late_checkout_night_json, DEFAULT_LATE));
          setRoundingMinutes(existing.rounding_minutes ?? 60);
          setIntradayMode(existing.intraday_mode ?? "default");
          setNotes(existing.notes ?? "");
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [roomTypeId]);

  // ── Save ──
  const handleSave = async () => {
    try {
      await invoke("rate_plan_upsert", {
        roomTypeId,
        name,
        capacity,
        nightRate,
        overnightRate,
        overnightStartHour: overnightStart,
        monthlyRate,
        extraBedPerPerson: extraBedFee,
        hourlyStepsJson: JSON.stringify(hourlySteps),
        hourlyMaxHours: hourlyMaxHours,
        earlyCheckinDayJson: JSON.stringify(earlyCheckinDaySteps),
        earlyCheckinNightJson: JSON.stringify(earlyCheckinNightSteps),
        lateCheckoutDayJson: JSON.stringify(lateCheckoutDaySteps),
        lateCheckoutNightJson: JSON.stringify(lateCheckoutNightSteps),
        roundingMinutes: roundingMinutes,
        intradayMode: intradayMode,
        notes: notes || null,
      });
      toast.success("Đã lưu Cấu hình giá (Rate Plan) thành công");
      onSaved();
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Lỗi khi lưu Rate Plan");
    }
  };

  // ── Live Preview ──
  const runPreview = async () => {
    setPreviewLoading(true);
    try {
      // Save first so the engine uses latest config
      await invoke("rate_plan_upsert", {
        roomTypeId,
        name,
        capacity,
        nightRate,
        overnightRate,
        overnightStartHour: overnightStart,
        monthlyRate,
        extraBedPerPerson: extraBedFee,
        hourlyStepsJson: JSON.stringify(hourlySteps),
        hourlyMaxHours: hourlyMaxHours,
        earlyCheckinDayJson: JSON.stringify(earlyCheckinDaySteps),
        earlyCheckinNightJson: JSON.stringify(earlyCheckinNightSteps),
        lateCheckoutDayJson: JSON.stringify(lateCheckoutDaySteps),
        lateCheckoutNightJson: JSON.stringify(lateCheckoutNightSteps),
        roundingMinutes: roundingMinutes,
        intradayMode: intradayMode,
        notes: notes || null,
      });

      const now = new Date();
      const checkIn = now.toISOString();
      const checkOut = new Date(now.getTime() + previewHours * 60 * 60 * 1000).toISOString();

      const result = await invoke<PricePreview>("calculate_price_v2", {
        roomTypeId,
        checkIn,
        checkOut,
        occupants: previewOccupants,
      });
      setPreview(result);
    } catch (e) {
      toast.error(typeof e === "string" ? e : "Không thể tính giá xem trước");
      setPreview(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="animate-spin text-slate-400" size={24} />
        <span className="ml-2 text-sm text-slate-500">Đang tải cấu hình...</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg p-6 border shadow-sm">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Chỉnh sửa Rate Plan</h3>
        <Button onClick={handleSave} className="gap-2">
          <Save className="w-4 h-4" /> Lưu cấu hình
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="basic">Cơ bản & Đêm</TabsTrigger>
          <TabsTrigger value="hourly">Giá Giờ</TabsTrigger>
          <TabsTrigger value="surcharge">Phụ trội</TabsTrigger>
          <TabsTrigger value="extrabed">Extra Bed</TabsTrigger>
          <TabsTrigger value="preview" className="text-blue-600">
            <Calculator className="w-3.5 h-3.5 mr-1" />
            Xem trước
          </TabsTrigger>
          <TabsTrigger value="usd">Nâng cao</TabsTrigger>
        </TabsList>

        {/* TAB: CƠ BẢN */}
        <TabsContent value="basic" className="space-y-4 pt-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Tên Rate Plan (VD: Mặc định, Agoda, Khách quen)</Label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Sức chứa tiêu chuẩn (Người lớn)</Label>
              <Input type="number" value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Giá Ngày/Đêm (VND)</Label>
              <Input type="number" value={nightRate} onChange={(e) => setNightRate(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Giá Qua đêm (VND)</Label>
              <Input type="number" value={overnightRate} onChange={(e) => setOvernightRate(Number(e.target.value))} />
            </div>
            <div className="space-y-2">
              <Label>Giờ bắt đầu Qua đêm</Label>
              <Input type="number" min={18} max={23} value={overnightStart} onChange={(e) => setOvernightStart(Number(e.target.value))} />
              <p className="text-xs text-muted-foreground">Sau {overnightStart}:00 sẽ tính giá qua đêm</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4">
            <div className="space-y-2">
              <Label>Giá theo Tháng (VND)</Label>
              <Input type="number" value={monthlyRate} onChange={(e) => setMonthlyRate(Number(e.target.value))} />
            </div>
          </div>
        </TabsContent>

        {/* TAB: GIÁ GIỜ */}
        <TabsContent value="hourly" className="pt-4 space-y-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm text-slate-500 mb-2">
            Thiết lập bảng giá bậc thang theo từng giờ. Nếu khách ở vượt quá &quot;Số giờ tối đa&quot;, hệ thống tự động chuyển sang tính giá Ngày/Đêm.
          </div>

          <div className="max-w-xs space-y-2 mb-4">
            <Label>Số giờ tối đa (trước khi tính ngày)</Label>
            <Input
              type="number"
              min={1}
              max={24}
              value={hourlyMaxHours}
              onChange={(e) => setHourlyMaxHours(Number(e.target.value))}
            />
          </div>

          <StepEditor
            steps={hourlySteps}
            onChange={setHourlySteps}
            label="Bảng giá giờ"
            fromLabel="Từ (giờ)"
            toLabel="Đến (giờ)"
            amountLabel="Giá (VND)"
            amountUnit="đ"
            helpText="Ví dụ: 0→1h = 50.000đ, 1→3h = 100.000đ, 3→6h = 180.000đ"
          />
        </TabsContent>

        {/* TAB: PHỤ TRỘI — 4 panels: Early Day/Night, Late Day/Night */}
        <TabsContent value="surcharge" className="pt-4 space-y-6">
          <p className="text-sm text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-100">
            Cấu hình phụ trội Check-in sớm &amp; Check-out muộn. Phân biệt &quot;Theo ngày&quot; và &quot;Qua đêm&quot; giống SkyHotel.
          </p>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">🌅 Check-in sớm (Theo ngày)</h4>
            <StepEditor
              steps={earlyCheckinDaySteps}
              onChange={setEarlyCheckinDaySteps}
              label="Phụ trội checkin sớm — Theo ngày"
              fromLabel="Sớm (giờ)"
              toLabel="Đến (giờ)"
              amountLabel="% Phụ thu"
              amountUnit="%"
              helpText="Áp dụng khi khách check-in sớm hơn giờ chuẩn ban ngày (VD: 14:00)."
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">🌙 Check-in sớm (Qua đêm)</h4>
            <StepEditor
              steps={earlyCheckinNightSteps}
              onChange={setEarlyCheckinNightSteps}
              label="Phụ trội checkin sớm — Qua đêm"
              fromLabel="Sớm (giờ)"
              toLabel="Đến (giờ)"
              amountLabel="% Phụ thu"
              amountUnit="%"
              helpText="Áp dụng khi khách check-in trước giờ bắt đầu qua đêm."
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">🌅 Check-out muộn (Theo ngày)</h4>
            <StepEditor
              steps={lateCheckoutDaySteps}
              onChange={setLateCheckoutDaySteps}
              label="Phụ trội checkout muộn — Theo ngày"
              fromLabel="Muộn (giờ)"
              toLabel="Đến (giờ)"
              amountLabel="% Phụ thu"
              amountUnit="%"
              helpText="Phụ thu khi khách trả phòng muộn ban ngày. 100% ở mốc cuối = tính thêm 1 đêm."
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">🌙 Check-out muộn (Qua đêm)</h4>
            <StepEditor
              steps={lateCheckoutNightSteps}
              onChange={setLateCheckoutNightSteps}
              label="Phụ trội checkout muộn — Qua đêm"
              fromLabel="Muộn (giờ)"
              toLabel="Đến (giờ)"
              amountLabel="% Phụ thu"
              amountUnit="%"
              helpText="Phụ thu khi khách check-out muộn hơn giờ trả phòng qua đêm."
            />
          </div>
        </TabsContent>

        {/* TAB: EXTRA BED */}
        <TabsContent value="extrabed" className="pt-4 space-y-4">
          <div className="space-y-2 max-w-sm">
            <Label>Phụ thu người thứ {capacity + 1} trở lên (VND/người)</Label>
            <Input type="number" value={extraBedFee} onChange={(e) => setExtraBedFee(Number(e.target.value))} />
            <p className="text-xs text-muted-foreground">Phí này sẽ được cộng thẳng vào tổng tiền phòng mỗi đêm.</p>
          </div>
        </TabsContent>

        {/* TAB: XEM TRƯỚC GIÁ — LIVE PREVIEW */}
        <TabsContent value="preview" className="pt-4 space-y-4">
          <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 text-sm text-blue-700 mb-2">
            <Calculator className="inline w-4 h-4 mr-1" />
            Tính giá mẫu với cấu hình hiện tại. Hệ thống sẽ tự lưu cấu hình trước khi tính.
          </div>

          <div className="grid grid-cols-2 gap-4 max-w-md">
            <div className="space-y-2">
              <Label>Số giờ lưu trú</Label>
              <Input
                type="number"
                min={1}
                max={720}
                value={previewHours}
                onChange={(e) => setPreviewHours(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label>Số khách</Label>
              <Input
                type="number"
                min={1}
                max={10}
                value={previewOccupants}
                onChange={(e) => setPreviewOccupants(Number(e.target.value))}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={runPreview} disabled={previewLoading} className="gap-2 bg-blue-600 hover:bg-blue-700 text-white">
              {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calculator className="w-4 h-4" />}
              Tính giá xem trước
            </Button>
          </div>

          {preview && (
            <div className="mt-4 bg-white border border-slate-200 rounded-xl p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">Chế độ tính</p>
                  <p className="text-sm font-semibold text-slate-700 capitalize">{preview.mode}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs uppercase tracking-wide text-slate-400 font-bold">Tổng cộng</p>
                  <p className="text-2xl font-bold text-emerald-600">{fmtVnd(preview.total)}</p>
                </div>
              </div>

              {preview.line_items.length > 0 && (
                <div className="border-t pt-3 space-y-1.5">
                  <p className="text-xs font-bold uppercase text-slate-400">Chi tiết</p>
                  {preview.line_items.map((item, i) => (
                    <div key={i} className="flex justify-between text-sm">
                      <span className="text-slate-600">{item.description}</span>
                      <span className="font-medium text-slate-800">{fmtVnd(item.amount)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </TabsContent>

        {/* TAB: NÂNG CAO */}
        <TabsContent value="usd" className="pt-4 space-y-6">
          <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 text-sm text-amber-700 mb-2">
            Cấu hình nâng cao: Quy định làm tròn giờ và chế độ tính trong ngày.
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">⏱ Quy định làm tròn giờ</h4>
            <div className="max-w-xs space-y-2">
              <Label>Làm tròn lên mỗi (phút)</Label>
              <select
                className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                value={roundingMinutes}
                onChange={(e) => setRoundingMinutes(Number(e.target.value))}
              >
                <option value={15}>15 phút</option>
                <option value={30}>30 phút</option>
                <option value={45}>45 phút</option>
                <option value={60}>60 phút (mặc định)</option>
              </select>
              <p className="text-xs text-muted-foreground">
                VD: Khách ở 1h20p → {roundingMinutes === 60 ? "2 giờ" : `${Math.ceil(80 / roundingMinutes) * roundingMinutes} phút`}
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">📋 Chế độ tính trong ngày</h4>
            <div className="max-w-md space-y-3">
              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="intradayMode"
                  value="default"
                  checked={intradayMode === "default"}
                  onChange={(e) => setIntradayMode(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">Mặc định</p>
                  <p className="text-xs text-muted-foreground">Tính giờ bình thường, phụ trội theo bậc nếu có.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="intradayMode"
                  value="split_surcharge"
                  checked={intradayMode === "split_surcharge"}
                  onChange={(e) => setIntradayMode(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">Tách phụ trội</p>
                  <p className="text-xs text-muted-foreground">Tách riêng dòng phụ trội checkin sớm/checkout muộn (không gộp vào giá phòng).</p>
                </div>
              </label>
              <label className="flex items-start gap-3 p-3 rounded-lg border cursor-pointer hover:bg-slate-50">
                <input
                  type="radio"
                  name="intradayMode"
                  value="always_one_night"
                  checked={intradayMode === "always_one_night"}
                  onChange={(e) => setIntradayMode(e.target.value)}
                  className="mt-1"
                />
                <div>
                  <p className="font-medium text-sm">Luôn tính 1 đêm</p>
                  <p className="text-xs text-muted-foreground">Bất kể thời gian ở, luôn tính ít nhất 1 đêm (không tính giờ).</p>
                </div>
              </label>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">📝 Ghi chú</h4>
            <textarea
              className="flex min-h-[80px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground"
              placeholder="Ghi chú nội bộ về cấu hình giá này (VD: lý do thay đổi, phiên bản, v.v.)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-4">
            <h4 className="text-sm font-bold text-slate-700 border-b pb-2">💱 Tỷ giá USD</h4>
            <p className="text-sm text-muted-foreground">Tính năng cấu hình tỷ giá ngoại tệ linh hoạt đang được phát triển.</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
