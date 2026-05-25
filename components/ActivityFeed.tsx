"use client";

import { useEffect, useRef, useState } from "react";
import { feedEvents } from "@/data/agents";

interface Ev {
  src: string;
  txt: string;
  t: string;
}

function nowStr() {
  const d = new Date();
  const p = (n: number) => String(n).padStart(2, "0");
  return `${p(d.getHours())}:${p(d.getMinutes())}`;
}

export function ActivityFeed() {
  const [events, setEvents] = useState<Ev[]>([]);
  const idx = useRef(0);

  useEffect(() => {
    const push = () => {
      const [src, txt] = feedEvents[idx.current % feedEvents.length];
      idx.current += 1;
      setEvents((prev) => [{ src, txt, t: nowStr() }, ...prev].slice(0, 7));
    };
    // seed
    for (let i = 0; i < 5; i++) push();
    const timer = setInterval(push, 3200);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="feed">
      <h4>
        アクティビティ <span className="live">● LIVE</span>
      </h4>
      <div className="hint">各エージェントの自律アクションをリアルタイム記録</div>
      <div className="feedlist">
        {events.map((e, i) => (
          <div key={`${e.t}-${i}-${e.txt}`} className="ev">
            <div className="src">{e.src}</div>
            <div className="txt">
              {e.txt}
              <div className="t">{e.t}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
