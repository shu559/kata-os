import { Agent } from "@/data/agents";
import { AgentIcon } from "./icons";

export function OrchestratorHero({
  orchestrator,
  onClick,
}: {
  orchestrator: Agent;
  onClick: () => void;
}) {
  return (
    <div className="orch" onClick={onClick}>
      <div className="left">
        <div className="badge">
          <AgentIcon id="orchestrator" size={26} />
        </div>
        <div>
          <div className="dept">{orchestrator.dept}</div>
          <h2>{orchestrator.name}</h2>
          <p>{orchestrator.desc}</p>
          <div className="tags">
            {orchestrator.caps.map((c, i) => (
              <span key={i} className="tag">
                {c}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="stat">
        <div className="ring">
          <svg width="132" height="132">
            <circle cx="66" cy="66" r="58" stroke="rgba(255,255,255,0.06)" strokeWidth="9" fill="none" />
            <circle
              cx="66"
              cy="66"
              r="58"
              stroke="var(--gold)"
              strokeWidth="9"
              fill="none"
              strokeLinecap="round"
              strokeDasharray="364"
              strokeDashoffset="62"
            />
          </svg>
          <div className="center">
            <b>{orchestrator.metric}%</b>
            <small>稼働効率</small>
          </div>
        </div>
        <div className="status s-run">
          <span className="dot" />
          SUPERVISING
        </div>
      </div>
    </div>
  );
}
