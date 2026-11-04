"use client";

import { useEffect, useState } from "react";
import { site } from "@/lib/site";

type Parts = { Days: string; Hours: string; Minutes: string; Seconds: string };

const PLACEHOLDER: Parts = { Days: "—", Hours: "—", Minutes: "—", Seconds: "—" };

function remaining(target: number): Parts {
  const totalSeconds = Math.max(0, Math.floor((target - Date.now()) / 1000));
  const pad = (n: number) => String(n).padStart(2, "0");
  return {
    Days: String(Math.floor(totalSeconds / 86400)),
    Hours: pad(Math.floor((totalSeconds % 86400) / 3600)),
    Minutes: pad(Math.floor((totalSeconds % 3600) / 60)),
    Seconds: pad(totalSeconds % 60),
  };
}

export default function Countdown() {
  // Rendered as em dashes on the server so the first paint matches the client.
  const [parts, setParts] = useState<Parts>(PLACEHOLDER);

  useEffect(() => {
    const target = new Date(site.weddingDate).getTime();
    setParts(remaining(target));
    const id = setInterval(() => setParts(remaining(target)), 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="flex items-center justify-center gap-4 sm:gap-8">
      {(Object.keys(PLACEHOLDER) as Array<keyof Parts>).map((unit) => (
        <div key={unit} className="text-center">
          <div className="font-display text-4xl text-primary sm:text-6xl tabular-nums">
            {parts[unit]}
          </div>
          <div className="mt-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground sm:text-xs">
            {unit}
          </div>
        </div>
      ))}
    </div>
  );
}
