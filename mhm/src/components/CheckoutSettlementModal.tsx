import { useEffect, useRef, useState, useCallback } from "react";
import { invoke } from "@tauri-apps/api/core";

import InfoItem from "@/components/shared/InfoItem";
import Modal from "@/components/ui/Modal";
import { fmtMoney } from "@/lib/format";
import type {
    Booking,
    CheckoutSettlementMode,
    CheckoutSettlementPayload,
    CheckoutSettlementPreview,
} from "@/types";

interface PricingLineItem {
    description: string;
    amount: number;
}

interface PricingBreakdown {
    line_items: PricingLineItem[];
    room_subtotal: number;
    currency: string;
}

interface CheckoutSettlementModalProps {
    open: boolean;
    roomId: string;
    booking: Booking;
    onClose: () => void;
    onConfirm: (payload: CheckoutSettlementPayload) => Promise<void> | void;
}

const MODE_OPTIONS: Array<{ value: CheckoutSettlementMode; label: string }> = [
    { value: "actual_nights", label: "Thực tế" },
    { value: "hourly", label: "Theo giờ" },
    { value: "booked_nights", label: "Đã đặt" },
];

export default function CheckoutSettlementModal({
    open,
    roomId,
    booking,
    onClose,
    onConfirm,
}: CheckoutSettlementModalProps) {
    const [settlementMode, setSettlementMode] = useState<CheckoutSettlementMode>("actual_nights");
    const [preview, setPreview] = useState<CheckoutSettlementPreview | null>(null);
    const [finalTotal, setFinalTotal] = useState(0);
    const [loadingPreview, setLoadingPreview] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const manualOverrideRef = useRef(false);
    const [pricingBreakdown, setPricingBreakdown] = useState<PricingBreakdown | null>(null);
    const [loadingBreakdown, setLoadingBreakdown] = useState(false);
    const debounceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // Debounced pricing calculation
    const fetchPricingBreakdown = useCallback(() => {
        if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = setTimeout(async () => {
            if (!booking.check_in_at) return;
            setLoadingBreakdown(true);
            try {
                const result = await invoke<PricingBreakdown>("calculate_price_v2", {
                    roomTypeId: roomId,
                    checkIn: booking.check_in_at,
                    checkOut: new Date().toISOString(),
                    mode: settlementMode === "hourly" ? "hourly" : null,
                    occupants: 1,
                });
                setPricingBreakdown(result);
            } catch {
                setPricingBreakdown(null);
            } finally {
                setLoadingBreakdown(false);
            }
        }, 200);
    }, [booking, roomId, settlementMode]);

    useEffect(() => {
        if (!open) {
            setSettlementMode("actual_nights");
            setPreview(null);
            setFinalTotal(0);
            setLoadingPreview(false);
            setSubmitting(false);
            manualOverrideRef.current = false;
        }
    }, [open]);

    useEffect(() => {
        if (!open) {
            return;
        }

        let cancelled = false;
        manualOverrideRef.current = false;
        setLoadingPreview(true);

        invoke<CheckoutSettlementPreview>("preview_checkout_settlement", {
            req: {
                booking_id: booking.id,
                settlement_mode: settlementMode,
            },
        })
            .then((nextPreview) => {
                if (cancelled) {
                    return;
                }
                setPreview(nextPreview);
                if (!manualOverrideRef.current) {
                    setFinalTotal(nextPreview.recommended_total);
                }
            })
            .catch(() => {
                if (!cancelled) {
                    setPreview(null);
                }
            })
            .finally(() => {
                if (!cancelled) {
                    setLoadingPreview(false);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [open, booking.id, settlementMode]);

    // Fetch pricing breakdown when modal opens or mode changes
    useEffect(() => {
        if (open) fetchPricingBreakdown();
        return () => {
            if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
        };
    }, [open, settlementMode, fetchPricingBreakdown]);

    if (!open) {
        return null;
    }

    const overpaid = booking.paid_amount > finalTotal;
    const confirmDisabled =
        loadingPreview || submitting || preview === null || finalTotal < 0 || overpaid;

    const handleConfirm = async () => {
        if (confirmDisabled) {
            return;
        }

        setSubmitting(true);
        try {
            await onConfirm({ settlementMode, finalTotal });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal title="Xác nhận Check-out">
            <div className="space-y-3 text-[13px]">
                <InfoItem label="Phòng" value={roomId} variant="block" />
                <InfoItem label="Đã trả" value={fmtMoney(booking.paid_amount)} variant="block" />
                <InfoItem label="Tổng đã đặt" value={fmtMoney(booking.total_price)} variant="block" />

                <div className="space-y-2">
                    <span className="text-[11px] text-slate-400 font-medium block">Cách tính</span>
                    <div className="grid grid-cols-3 gap-2">
                        {MODE_OPTIONS.map((option) => {
                            const active = settlementMode === option.value;
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => setSettlementMode(option.value)}
                                    className={
                                        active
                                            ? "rounded-xl border border-blue-500 bg-blue-50 px-3 py-2 font-semibold text-blue-600 cursor-pointer"
                                            : "rounded-xl border border-slate-200 px-3 py-2 text-slate-600 cursor-pointer"
                                    }
                                >
                                    {option.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <p className="rounded-xl bg-slate-50 px-3 py-2 text-slate-600 min-h-11">
                    {loadingPreview ? "Đang tính lại..." : preview?.explanation ?? ""}
                </p>

                {/* Pricing Breakdown (line items from calculate_price_v2) */}
                {(loadingBreakdown || pricingBreakdown) && (
                    <div className="rounded-xl border border-slate-100 bg-slate-50/50 overflow-hidden">
                        <p className="text-[11px] font-semibold text-slate-500 px-3 py-1.5 bg-slate-100/50 border-b border-slate-100">
                            Chi tiết giá
                        </p>
                        {loadingBreakdown ? (
                            <p className="text-xs text-slate-400 px-3 py-2">Đang tính...</p>
                        ) : pricingBreakdown ? (
                            <div className="divide-y divide-slate-100">
                                {pricingBreakdown.line_items.map((item, idx) => (
                                    <div key={idx} className="flex justify-between items-center px-3 py-1.5">
                                        <span className="text-[12px] text-slate-600">{item.description}</span>
                                        <span className={`text-[12px] font-semibold tabular-nums ${
                                            item.amount >= 0 ? 'text-slate-800' : 'text-red-500'
                                        }`}>
                                            {item.amount >= 0 ? '+' : ''}{fmtMoney(item.amount)}
                                        </span>
                                    </div>
                                ))}
                                <div className="flex justify-between items-center px-3 py-2 bg-blue-50/50">
                                    <span className="text-[12px] font-semibold text-blue-700">Tổng tính giá</span>
                                    <span className="text-[13px] font-bold text-blue-700 tabular-nums">
                                        {fmtMoney(pricingBreakdown.room_subtotal)}
                                    </span>
                                </div>
                            </div>
                        ) : null}
                    </div>
                )}

                <div>
                    <label
                        htmlFor="checkout-final-total"
                        className="text-[11px] text-slate-400 font-medium block mb-1"
                    >
                        Thanh toán cuối
                    </label>
                    <input
                        id="checkout-final-total"
                        type="number"
                        value={finalTotal}
                        onChange={(event) => {
                            manualOverrideRef.current = true;
                            setFinalTotal(Number(event.target.value));
                        }}
                        className="w-full bg-white border border-slate-200 rounded-lg px-3 py-2 text-slate-900 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500"
                    />
                </div>

                {overpaid && (
                    <p className="text-[12px] font-medium text-red-600">
                        Booking đã overpaid. Hãy xử lý refund trước khi checkout.
                    </p>
                )}

                {/* Task 5.5: Late checkout warning */}
                {(() => {
                    const expectedCheckout = new Date(booking.expected_checkout);
                    const now = new Date();
                    const diffMs = now.getTime() - expectedCheckout.getTime();
                    const diffHours = Math.floor(diffMs / 3600000);

                    if (diffHours >= 4) {
                        return (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-3 space-y-1">
                                <p className="text-xs font-semibold text-red-700 flex items-center gap-1">
                                    ⚠️ Check-out muộn {diffHours} giờ — vượt ngưỡng 4h
                                </p>
                                <p className="text-[11px] text-red-600">
                                    Hệ thống tính 100% giá ngày bổ sung. Xem lại "Chi tiết giá" ở trên.
                                </p>
                            </div>
                        );
                    }
                    if (diffHours >= 1) {
                        return (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <p className="text-xs font-semibold text-amber-700 flex items-center gap-1">
                                    ⏰ Check-out muộn {diffHours} giờ — phụ thu có thể áp dụng
                                </p>
                            </div>
                        );
                    }
                    return null;
                })()}
            </div>

            <div className="flex gap-2.5 mt-5">
                <button
                    type="button"
                    onClick={onClose}
                    className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-[13px] font-medium cursor-pointer transition-colors"
                >
                    Hủy
                </button>
                <button
                    type="button"
                    onClick={handleConfirm}
                    disabled={confirmDisabled}
                    className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 disabled:bg-slate-300 text-white rounded-xl text-[13px] font-semibold cursor-pointer transition-colors disabled:cursor-not-allowed"
                >
                    Xác nhận
                </button>
            </div>
        </Modal>
    );
}
