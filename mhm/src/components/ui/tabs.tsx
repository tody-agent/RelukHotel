import { createContext, useContext, type ReactNode } from "react";

/* ─── Lightweight Tabs (no external deps) ───────────────────── */

interface TabsContextValue {
  value: string;
  onChange: (val: string) => void;
}

const TabsContext = createContext<TabsContextValue>({
  value: "",
  onChange: () => {},
});

export function Tabs({
  value,
  onValueChange,
  children,
  className = "",
}: {
  value: string;
  onValueChange: (v: string) => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <TabsContext.Provider value={{ value, onChange: onValueChange }}>
      <div className={className}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`flex gap-1 bg-slate-100 rounded-xl p-1 ${className}`}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({
  value,
  children,
  className = "",
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  const active = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.onChange(value)}
      className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all cursor-pointer ${
        active
          ? "bg-white text-brand-primary shadow-sm"
          : "text-brand-muted hover:text-brand-text"
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function TabsContent({
  value,
  children,
  className = "",
}: {
  value: string;
  children: ReactNode;
  className?: string;
}) {
  const ctx = useContext(TabsContext);
  if (ctx.value !== value) return null;

  return <div className={className}>{children}</div>;
}
