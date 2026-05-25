# KATA OS — AI経営チーム（プロトタイプ）

8機能（営業・事業開発・マーケ・広報・バックオフィス・IR・採用＋統括AI）を
AIエージェントとして可視化する経営ダッシュボードのトップページ。

> 現段階は **UIプロトタイプ**。中身（各エージェントの実処理）は
> `data/agents.ts` のダミーデータで動いており、徐々に実装で置き換えていく。

---

## 技術スタック

- **Next.js 14（App Router）** — Vercel デプロイ前提
- **TypeScript + Tailwind CSS** — KATA デザインシステム（navy × gold）
- **HubSpot API** — `lib/hubspot.ts` に接続レイヤーを用意（現在は stub）

KATA 本体（kata-platform）と同じスタックに揃えてあるので、将来的に
accounts / deals / sessions などのデータと地続きにできる。

---

## ローカル起動

```bash
npm install
npm run dev
# http://localhost:3000
```

---

## Vercel へのデプロイ

1. このディレクトリを GitHub リポジトリにプッシュ（main ブランチ）
2. Vercel で「New Project」→ 該当リポジトリを Import
3. フレームワークは自動で Next.js と認識される。そのまま Deploy
4. （HubSpot 連携時）Project Settings → Environment Variables に
   `HUBSPOT_TOKEN` を追加して再デプロイ

---

## 中身のアップデート方法（重要）

**原則 `data/agents.ts` だけを編集すれば全画面に反映される。**

| やりたいこと | 編集箇所 |
| --- | --- |
| エージェントを追加 | `agents` 配列に1要素追加（`id` に対応するアイコンを `components/icons.tsx` にも追加） |
| タスク/状態を更新 | 該当エージェントの `queue` / `status` / `task` |
| 担当領域を変更 | `caps` |
| KPI 数値を変更 | `kpis` |
| フィードの内容を変更 | `feedEvents` |

GitHub web UI で編集する場合も、このファイルは独立しているので
ファイル全体を貼り替える運用がしやすい。

---

## ディレクトリ構成

```
app/
  layout.tsx         フォント・メタ・全体ラッパ
  page.tsx           トップページ（薄い。Dashboard を呼ぶだけ）
  globals.css        デザイントークン（CSS変数）+ コンポーネントスタイル
components/
  Dashboard.tsx      状態管理のまとめ役（client）
  TopBar / KpiStrip / OrchestratorHero / AgentCard / AgentGrid
  AgentModal / ActivityFeed / StatusPill / icons
data/
  agents.ts          ★ Single Source of Truth（ここを編集する）
lib/
  hubspot.ts         HubSpot 連携の置き場所（現在 stub）
```

---

## 次の実装ステップ（推奨順）

1. **SALES エージェントの実体化** — まず1体だけ。HubSpot の deals を
   `lib/hubspot.ts` 経由で取得し、Claude API で次アクションを生成。
2. 承認フロー（Human-in-the-loop）の実装 — 対外成果物の確定前ゲート。
3. 残りエージェントを順次接続。`data/agents.ts` の型はそのまま
   API レスポンスの shape として再利用できる。

> 注: 顧客データを扱うため、HubSpot / Claude API の呼び出しは必ず
> サーバー側（Route Handler / Server Action）で行い、トークンを
> クライアントに露出させないこと。
