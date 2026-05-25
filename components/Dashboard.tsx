"use client";

import { useState } from "react";
import { agents, orchestrator, Agent, AgentStatus } from "@/data/agents";
import { TopBar } from "./TopBar";
import { KpiStrip } from "./KpiStrip";
import { OrchestratorHero } from "./OrchestratorHero";
import { AgentCard } from "./AgentCard";
import { AgentModal } from "./AgentModal";
import { ActivityFeed } from "./ActivityFeed";

export function Dashboard() {
  const [allOn, setAllOn] = useState(true);
  const [selected, setSelected] = useState<Agent | null>(null);

  // 全停止トグル時は各カードの表示状態を idle に倒す（データ自体は保持）
  const effectiveStatus = (s: AgentStatus): AgentStatus => (allOn ? s : "idle");

  return (
    <div className="wrap">
      <TopBar allOn={allOn} onToggle={() => setAllOn((v) => !v)} />

      <p className="tagline">
        <b>KATA</b> は、AI駆動経営をサポートするビジネスAIエージェント群。
        営業・事業開発・マーケから採用・IRまで、事業成長に必要な機能を
        <b>8体のAIエージェント</b>が自律的に回す「外付け経営チーム」です。
      </p>

      <KpiStrip allOn={allOn} />

      <div className="seclabel">
        <span>Orchestration Layer</span>
        <div className="ln" />
      </div>
      <OrchestratorHero
        orchestrator={orchestrator}
        onClick={() => setSelected(orchestrator)}
      />

      <div className="seclabel">
        <span>Functional Agents</span>
        <div className="ln" />
      </div>
      <div className="main">
        <div className="agents">
          {agents.map((a, i) => (
            <AgentCard
              key={a.id}
              agent={{ ...a, status: effectiveStatus(a.status) }}
              index={i}
              onClick={() => setSelected(a)}
            />
          ))}
        </div>
        <ActivityFeed />
      </div>

      <div className="foot-note">
        KATA — Business AI Agents for Autonomous Management (prototype) ／ 全データはデモ用ダミーです
      </div>

      {selected && (
        <AgentModal agent={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  );
}
