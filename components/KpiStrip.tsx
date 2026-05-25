"use client";

import { useEffect, useRef, useState } from "react";
import { kpis } from "@/data/agents";

function useCountUp(target: number, run: boolean, dur = 1100) {
  const [val, setVal] = useState(0);
  const raf = useRef<number>();
  useEffect(() => {
    if (!run) {
      setVal(0);
      return;
    }
    const start = performance.now();
    const step = (t: number) => {
      const k = Math.min((t - start) / dur, 1);
      setVal(Math.round(target * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf.current = requestAnimationFrame(step);
    };
    raf.current = requestAnimationFrame(step);
    return () => {
      if (raf.current) cancelAnimationFrame(raf.current);
    };
  }, [target, run, dur]);
  return val;
}

export function KpiStrip({ allOn }: { allOn: boolean }) {
  const output = useCountUp(kpis.outputToday, true);
  const tasks = useCountUp(kpis.tasksInProgress, true);
  const approve = useCountUp(kpis.needsApproval, true);

  return (
    <div className="kpis">
      <div className="kpi teal">
        <div className="label">稼働エージェント</div>
        <div className="val">
          {allOn ? kpis.activeAgents : 0}
          <span className="unit">/ {kpis.totalAgents}</span>
        </div>
        <div className="bar" />
      </div>
      <div className="kpi">
        <div className="label">本日のアウトプット</div>
        <div className="val">
          {output}
          <span className="unit">件</span>
        </div>
        <div className="bar" />
      </div>
      <div className="kpi">
        <div className="label">処理中タスク</div>
        <div className="val">
          {tasks}
          <span className="unit">件</span>
        </div>
        <div className="bar" />
      </div>
      <div className="kpi alert">
        <div className="label">要承認 (Human-in-the-loop)</div>
        <div className="val">
          {approve}
          <span className="unit">件</span>
        </div>
        <div className="bar" />
      </div>
    </div>
  );
}
