import { Edit3 } from "lucide-react";

interface FormFieldProps {
    label: string;
    value: string;
    onChange: (v: string) => void;
    type?: string;
    className?: string;
}

export function FormField({
    label,
    value,
    onChange,
    type = "text",
    className = "",
}: FormFieldProps) {
    const inputId = `field-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div className={className}>
            <label htmlFor={inputId} className="text-xs font-semibold text-brand-muted flex items-center gap-1.5 mb-1.5 ml-1">
                {label} <Edit3 size={11} className="opacity-40" />
            </label>
            <input
                id={inputId}
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 rounded-xl px-3 py-2.5 text-brand-text text-sm font-medium outline-none transition-all"
            />
        </div>
    );
}

interface FormFieldSelectProps {
    label: string;
    value: string;
    options: string[];
    onChange: (v: string) => void;
    className?: string;
}

export function FormFieldSelect({
    label,
    value,
    options,
    onChange,
    className = "",
}: FormFieldSelectProps) {
    const selectId = `field-select-${label.replace(/\s+/g, '-').toLowerCase()}`;
    return (
        <div className={className}>
            <label htmlFor={selectId} className="text-xs font-semibold text-brand-muted flex items-center gap-1.5 mb-1.5 ml-1">
                {label} <Edit3 size={11} className="opacity-40" />
            </label>
            <select
                id={selectId}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-slate-50 border border-slate-100 focus:border-brand-primary/50 focus:ring-2 focus:ring-brand-primary/20 rounded-xl px-3 py-2.5 text-brand-text text-sm font-medium outline-none transition-all"
            >
                {options.map((o) => (
                    <option key={o} value={o}>
                        {o}
                    </option>
                ))}
            </select>
        </div>
    );
}
