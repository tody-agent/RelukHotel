import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/core";
import { Input } from "@/components/ui/input";
import { fmtMoney } from "@/lib/format";

interface RoomTypeValue {
  room_type_id: string;
  room_type_name: string;
  value: number;
}

interface RoomTypeValueEditorProps {
  ruleId: string;
  strategy: "replace" | "add";
  values: RoomTypeValue[];
  onChange: (values: Array<{ room_type_id: string; value: number }>) => void;
}

interface RoomTypeItem {
  id: string;
  name: string;
}

export default function RoomTypeValueEditor({
  ruleId: _ruleId,
  strategy,
  values,
  onChange,
}: RoomTypeValueEditorProps) {
  const [roomTypes, setRoomTypes] = useState<RoomTypeItem[]>([]);

  useEffect(() => {
    invoke<RoomTypeItem[]>("get_room_types")
      .then(setRoomTypes)
      .catch(() => {});
  }, []);

  // Merge loaded room types with existing values
  const mergedValues = roomTypes.map((rt) => {
    const existing = values.find((v) => v.room_type_id === rt.id);
    return {
      room_type_id: rt.id,
      room_type_name: rt.name,
      value: existing?.value ?? 0,
    };
  });

  const handleValueChange = (roomTypeId: string, newValue: number) => {
    const updated = mergedValues.map((v) =>
      v.room_type_id === roomTypeId ? { room_type_id: v.room_type_id, value: newValue } : { room_type_id: v.room_type_id, value: v.value },
    );
    onChange(updated);
  };

  const strategyLabel =
    strategy === "replace"
      ? "Giá thay thế — giá này sẽ ghi đè giá gốc của Rate Plan"
      : "Giá cộng thêm — delta cộng/trừ vào giá gốc của Rate Plan";

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 italic">{strategyLabel}</p>

      {mergedValues.length === 0 ? (
        <p className="text-sm text-slate-400 py-4 text-center">
          Chưa có loại phòng nào. Vui lòng tạo loại phòng trong Cài đặt phòng trước.
        </p>
      ) : (
        <div className="rounded-xl border border-slate-200 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50">
              <tr>
                <th className="text-left px-4 py-2.5 font-semibold text-slate-600">Loại phòng</th>
                <th className="text-right px-4 py-2.5 font-semibold text-slate-600 w-48">
                  {strategy === "replace" ? "Giá trị (VND)" : "Cộng thêm (VND)"}
                </th>
              </tr>
            </thead>
            <tbody>
              {mergedValues.map((item) => (
                <tr key={item.room_type_id} className="border-t border-slate-100 hover:bg-slate-50/50">
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-slate-800 capitalize">{item.room_type_name}</span>
                  </td>
                  <td className="px-4 py-2.5 text-right">
                    <Input
                      type="number"
                      value={item.value}
                      onChange={(e) => handleValueChange(item.room_type_id, Number(e.target.value))}
                      className="w-36 text-right ml-auto"
                      min={strategy === "replace" ? 0 : undefined}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {mergedValues.length > 0 && strategy === "replace" && (
        <p className="text-xs text-slate-400">
          Preview: {mergedValues.filter((v) => v.value > 0).map((v) => `${v.room_type_name}: ${fmtMoney(v.value)}`).join(" · ") || "Chưa có giá trị"}
        </p>
      )}
    </div>
  );
}
