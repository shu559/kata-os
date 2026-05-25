"use client";

import { useEffect, useState } from "react";

export function TopBar({
  allOn,
  onToggle,
}: {
  allOn: boolean;
  onToggle: () => void;
}) {
  const [clock, setClock] = useState("--:--:--");

  useEffect(() => {
    const tick = () => {
      const d = new Date();
      const p = (n: number) => String(n).padStart(2, "0");
      setClock(`${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`);
    };
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="topbar">
      <div className="brand">
        <div className="logo">K</div>
        <div>
          <h1>
            KATA{" "}
            <span style={{ color: "var(--faint)", fontWeight: 400, fontSize: 13 }}>
              / AI駆動経営エージェント
            </span>
          </h1>
          <div className="sub">Business AI Agents for Autonomous Management</div>
        </div>
      </div>
      <div className="topright">
        <div className="clock">{clock}</div>
        <div className="master" onClick={onToggle}>
          <span
            className="led"
            style={{
              background: allOn ? "var(--teal)" : "var(--faint)",
              boxShadow: allOn ? "0 0 10px var(--teal)" : "none",
            }}
          />
          <span>{allOn ? "全エージェント稼働中" : "全エージェント停止"}</span>
        </div>
      </div>
    </div>
  );
}
