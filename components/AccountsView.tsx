"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Account, AccountPlan } from "@/lib/accounts";

export function AccountsView() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [selected, setSelected] = useState<Account | null>(null);
  const [plans, setPlans] = useState<AccountPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [context, setContext] = useState("");
  const [error, setError] = useState<string | null>(null);

  // ---------- アカウント一覧の取得 ----------
  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/accounts");
        const json = await res.json();
        if (json.accounts) {
          setAccounts(json.accounts);
          if (json.accounts.length > 0) setSelected(json.accounts[0]);
        } else {
          setError(json.error ?? "アカウントの取得に失敗しました。");
        }
      } catch {
        setError("通信に失敗しました。");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // ---------- 選択中アカウントのプラン取得 ----------
  const loadPlans = useCallback(async (accountId: string) => {
    try {
      const res = await fetch(`/api/plans?account_id=${accountId}`);
      const json = await res.json();
      setPlans(json.plans ?? []);
    } catch {
      setPlans([]);
    }
  }, []);

  useEffect(() => {
    if (selected) loadPlans(selected.id);
  }, [selected, loadPlans]);

  // ---------- プラン生成 ----------
  async function handleGenerate() {
    if (!selected) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ account_id: selected.id, context }),
      });
      const json = await res.json();
      if (res.ok && json.plan) {
        setContext("");
        await loadPlans(selected.id); // 一覧を再取得して最新版を表示
      } else {
        setError(json.error ?? "生成に失敗しました。");
      }
    } catch {
      setError("生成リクエストに失敗しました。");
    } finally {
      setGenerating(false);
    }
  }

  const latest = plans[0] ?? null;

  return (
    <div className="wrap">
      {/* ヘッダ */}
      <div className="acc-head">
        <div>
          <div className="mono acc-crumb">
            <Link href="/" className="acc-back">← KATA</Link> / SALES · AG-01
          </div>
          <h1 className="acc-title">営業エージェント</h1>
          <p className="acc-sub">顧客ごとのアカウントプランを生成・蓄積します。</p>
        </div>
      </div>

      {error && <div className="acc-error">{error}</div>}

      <div className="acc-layout">
        {/* 左: アカウント一覧 */}
        <aside className="acc-list">
          <div className="acc-list-head">
            <span className="mono">ACCOUNTS</span>
            <span className="acc-count">{accounts.length}</span>
          </div>
          {loading ? (
            <div className="acc-empty">読み込み中…</div>
          ) : accounts.length === 0 ? (
            <div className="acc-empty">アカウントがありません。</div>
          ) : (
            accounts.map((a) => (
              <button
                key={a.id}
                className={`acc-item ${selected?.id === a.id ? "on" : ""}`}
                onClick={() => setSelected(a)}
              >
                <div className="acc-item-name">{a.name}</div>
                <div className="acc-item-meta">
                  {a.industry ?? "—"} · {a.status}
                </div>
              </button>
            ))
          )}
        </aside>

        {/* 右: プラン表示 + 生成 */}
        <section className="acc-main">
          {!selected ? (
            <div className="acc-empty">アカウントを選択してください。</div>
          ) : (
            <>
              <div className="acc-detail-head">
                <div>
                  <h2>{selected.name}</h2>
                  <div className="acc-detail-meta mono">
                    {selected.industry ?? "—"} ／ {selected.size ?? "—"} ／ {selected.status}
                  </div>
                  {selected.notes && <p className="acc-notes">{selected.notes}</p>}
                </div>
              </div>

              {/* 生成パネル */}
              <div className="acc-gen">
                <div className="acc-gen-label mono">PLAN GENERATION</div>
                <textarea
                  className="acc-textarea"
                  placeholder="追加コンテキスト（任意）: 商談での気づき、担当者の反応、把握済みの課題など"
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={3}
                />
                <button
                  className="acc-gen-btn"
                  onClick={handleGenerate}
                  disabled={generating}
                >
                  {generating ? "生成中… (10〜20秒)" : "アカウントプランを生成"}
                </button>
              </div>

              {/* 最新プラン */}
              {latest ? (
                <PlanView plan={latest} totalVersions={plans.length} />
              ) : (
                <div className="acc-empty">
                  まだプランがありません。上のボタンで生成してください。
                </div>
              )}
            </>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------- プラン1件の表示 ----------
function PlanView({ plan, totalVersions }: { plan: AccountPlan; totalVersions: number }) {
  const c = plan.content;
  const list = (arr?: string[]) =>
    arr && arr.length > 0 ? arr : ["（要ヒアリング）"];

  return (
    <div className="plan">
      <div className="plan-head">
        <h3>{plan.title}</h3>
        <span className="mono plan-ver">v{plan.version} ／ 全{totalVersions}版</span>
      </div>

      <div className="plan-grid">
        <PlanBlock title="会社レベルの課題" text={c.company_challenges} />
        <PlanBlock title="担当者レベルの課題" text={c.contact_challenges} />
        <PlanBlock title="意思決定者" items={list(c.decision_makers)} />
        <PlanBlock title="競合" items={list(c.competitors)} />
        <PlanBlock title="検証すべき仮説" items={list(c.hypotheses)} />
        <PlanBlock title="次アクション" items={list(c.next_actions)} />
      </div>

      {c.meddpicc && (
        <div className="plan-meddpicc">
          <div className="plan-block-title mono">MEDDPICC</div>
          <div className="meddpicc-grid">
            {Object.entries(c.meddpicc).map(([k, v]) => (
              <div key={k} className="meddpicc-item">
                <span className="meddpicc-key mono">{k}</span>
                <span className="meddpicc-val">{v || "（要ヒアリング）"}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function PlanBlock({
  title,
  text,
  items,
}: {
  title: string;
  text?: string;
  items?: string[];
}) {
  return (
    <div className="plan-block">
      <div className="plan-block-title mono">{title}</div>
      {text !== undefined ? (
        <p className="plan-block-text">{text || "（要ヒアリング）"}</p>
      ) : (
        <ul className="plan-block-list">
          {items?.map((it, i) => (
            <li key={i}>{it}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
