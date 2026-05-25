// エージェントごとのアイコン（lucide風の手描きSVG path）。
// id をキーに参照する。新エージェント追加時はここに path を追加。

import React from "react";

const paths: Record<string, React.ReactNode> = {
  orchestrator: (
    <>
      <circle cx="12" cy="12" r="2.4" />
      <circle cx="12" cy="4" r="2" />
      <circle cx="4" cy="18" r="2" />
      <circle cx="20" cy="18" r="2" />
      <path d="M12 6.4v3.2M10.4 13.6 5.4 16.4M13.6 13.6l5 2.8" />
    </>
  ),
  sales: (
    <>
      <path d="M3 17l5-5 4 4 8-8" />
      <path d="M16 8h4v4" />
    </>
  ),
  bd: (
    <>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3" />
    </>
  ),
  mkt: (
    <>
      <path d="M3 11l14-6v14L3 13z" />
      <path d="M3 11v2M17 9a3 3 0 0 1 0 6" />
    </>
  ),
  pr: (
    <>
      <circle cx="12" cy="12" r="2" />
      <path d="M7 7a7 7 0 0 0 0 10M17 7a7 7 0 0 1 0 10M4 4a11 11 0 0 0 0 16M20 4a11 11 0 0 1 0 16" />
    </>
  ),
  bo: (
    <>
      <rect x="5" y="3" width="14" height="18" rx="2" />
      <path d="M9 8h6M9 12h6M9 16h3" />
    </>
  ),
  ir: <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />,
  hr: (
    <>
      <circle cx="9" cy="8" r="3" />
      <path d="M3 20a6 6 0 0 1 12 0" />
      <circle cx="17" cy="9" r="2.4" />
      <path d="M16 20a5 5 0 0 1 6-4" />
    </>
  ),
};

export function AgentIcon({ id, size = 22 }: { id: string; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[id] ?? paths.orchestrator}
    </svg>
  );
}
