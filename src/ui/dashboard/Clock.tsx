"use client";

import { useEffect, useState } from "react";

export default function Clock() {
  const [now, setNow] = useState<Date>(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 1000); // update tiap 1 detik

    return () => clearInterval(timer); // clear interval saat unmount
  }, []);

  const formatted = new Intl.DateTimeFormat("id-ID", {
    weekday: "long",   // Senin, Selasa, ...
    day: "2-digit",    // 01, 02, ...
    month: "short",     // Januari, Februari, ...
    year: "numeric",
  }).format(now);

  return (
    <div className="text-lg font-semibold">
      {formatted}
    </div>
  );
}
