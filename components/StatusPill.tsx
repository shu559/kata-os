import { AgentStatus } from "@/data/agents";

const map: Record<AgentStatus, { cls: string; label: string }> = {
  run: { cls: "s-run", label: "RUNNING" },
  wait: { cls: "s-wait", label: "要承認" },
  idle: { cls: "s-idle", label: "待機" },
};

export function StatusPill({ status }: { status: AgentStatus }) {
  const { cls, label } = map[status];
  return (
    <div className={`status ${cls}`}>
      <span className="dot" />
      {label}
    </div>
  );
}
