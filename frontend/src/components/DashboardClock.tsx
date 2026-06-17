"use client";

import { useEffect, useState } from "react";

export default function DashboardClock() {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!now) return null;

  return (
    <div className="text-right shrink-0">
      <p className="text-2xl font-bold text-white tabular-nums">
        {now.toLocaleTimeString("uz-UZ", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
      </p>
      <p className="text-slate-400 text-sm capitalize">
        {now.toLocaleDateString("uz-UZ", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}
      </p>
    </div>
  );
}
