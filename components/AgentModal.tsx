import { Agent } from "@/data/agents";
import { AgentIcon } from "./icons";

const qtag: Record<string, string> = { done: "完了", run: "処理中", queued: "待機" };

export function AgentModal({
  agent,
  onClose,
}: {
  agent: Agent;
  onClose: () => void;
}) {
  return (
    <div
      className="overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="mhead">
          <div className="mic">
            <AgentIcon id={agent.id} size={26} />
          </div>
          <div>
            <div className="dept">
              {agent.dept} · {agent.code}
            </div>
            <h3>{agent.name}</h3>
          </div>
          <button className="close" onClick={onClose} aria-label="閉じる">
            ×
          </button>
        </div>

        <div className="desc">{agent.desc}</div>

        <div className="qhead">TASK QUEUE</div>
        <div className="queue">
          {agent.queue.map((q, i) => (
            <div key={i} className={`qitem ${q.state}`}>
              <span className="qd" />
              {q.label}
              <span className="qtag">{qtag[q.state]}</span>
            </div>
          ))}
        </div>

        <div className="qhead">CAPABILITIES</div>
        <div className="caps">
          {agent.caps.map((c, i) => (
            <span key={i} className="tag">
              {c}
            </span>
          ))}
        </div>

        {agent.approve && (
          <div className="note">
            ⚠ このエージェントの成果物には対外公開・確定処理が含まれます。実行前に人間の承認を挟みます（Human-in-the-loop）。
          </div>
        )}
      </div>
    </div>
  );
}
