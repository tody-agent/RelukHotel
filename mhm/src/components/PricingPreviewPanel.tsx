import { useEffect, useState, useCallback, useRef } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Calculator, ChevronDown, ChevronUp } from "lucide-react";
import { fmtMoney } from "@/lib/format";

/**
 * Task 5.1 + 5.2: Real-time pricing preview panel for Check-in dialog.
 * Calls calculate_price_v2 with debounce when room/nights/occupants change.
 * Shows a collapsible line-item breakdown (Calculator Panel).
 */

interface PricingLineItem {
  description: string;
  amount: number;
}

interface PricingResult {
  line_items: PricingLineItem[];
  room_subtotal: number;
  currency: string;
}

interface PricingPreviewPanelProps {
  roomType: string;
  nights: number;
  occupants?: number;
  /** If true, panel is visible */
  visible: boolean;
}

export default function PricingPreviewPanel({
  roomType,
  nights,
  occupants = 1,
  visible,
}: PricingPreviewPanelProps) {
  const [result, setResult] = useState<PricingResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchPreview = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!roomType || nights <= 0) {
        setResult(null);
        return;
      }
      setLoading(true);
      try {
        const checkIn = new Date().toISOString();
        const checkOut = new Date(
          Date.now() + nights * 86400000
        ).toISOString();

        const res = await invoke<PricingResult>("calculate_price_v2", {
          roomTypeId: roomType,
          checkIn,
          checkOut,
          occupants,
          mode: null,
        });
        setResult(res);
      } catch {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }, 300);
  }, [roomType, nights, occupants]);

  useEffect(() => {
    if (visible) fetchPreview();
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [visible, fetchPreview]);

  if (!visible || (!loading && !result)) return null;

  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/70 overflow-hidden transition-all">
      {/* Summary bar */}
      <button
        type="button"
        onClick={() => setExpanded((p) => !p)}
        className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-slate-100/50 transition-colors cursor-pointer"
      >
        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <Calculator size={13} />
          Pricing Engine v2
        </span>
        <span className="flex items-center gap-2">
          {loading ? (
            <span className="text-xs text-slate-400">Đang tính...</span>
          ) : result ? (
            <span className="text-sm font-bold text-emerald-600 tabular-nums">
              {fmtMoney(result.room_subtotal)}
            </span>
          ) : null}
          {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </span>
      </button>

      {/* Expanded line items (Calculator panel — Task 5.2) */}
      {expanded && result && (
        <div className="border-t border-slate-100 divide-y divide-slate-100">
          {result.line_items.map((item, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center px-3 py-1.5"
            >
              <span className="text-[12px] text-slate-600">
                {item.description}
              </span>
              <span
                className={`text-[12px] font-semibold tabular-nums ${
                  item.amount >= 0 ? "text-slate-700" : "text-red-500"
                }`}
              >
                {item.amount >= 0 ? "+" : ""}
                {fmtMoney(item.amount)}
              </span>
            </div>
          ))}
          <div className="flex justify-between items-center px-3 py-2 bg-emerald-50/50">
            <span className="text-[12px] font-semibold text-emerald-700">
              Tổng tính giá
            </span>
            <span className="text-[13px] font-bold text-emerald-700 tabular-nums">
              {fmtMoney(result.room_subtotal)}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
