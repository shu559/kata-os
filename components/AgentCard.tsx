import { Agent } from "@/data/agents";
import { AgentIcon } from "./icons";
import { StatusPill } from "./StatusPill";

export function AgentCard({
  agent,
  index,
  onClick,
}: {
  agent: Agent;
  index: number;
  onClick: () => void;
}) {
  return (
    <div
      className="card"
      style={{ animation: `slidein .5s ${index * 0.05}s both` }}
      onClick={onClick}
    >
      <div className="top">
        <div className="ic">
          <AgentIcon id={agent.id} />
        </div>
        <StatusPill status={agent.status} />
      </div>
      <div className="dept">
        {agent.dept} · {agent.code}
      </div>
      <h3>{agent.name}</h3>
      <div className="task">{agent.task}</div>
      <div className="footrow">
        <div className="metric">
          {agent.metric} <small>{agent.metricUnit}</small>
        </div>
        <div className="mono" style={{ fontSize: 10, color: "var(--faint)" }}>
          詳細 →
        </div>
      </div>
    </div>
  );
}
