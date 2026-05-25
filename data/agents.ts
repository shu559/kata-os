// =============================================================
//  KATA OS — エージェント定義（Single Source of Truth）
// -------------------------------------------------------------
//  中身のアップデートは原則このファイルだけを編集すればOK。
//  - エージェント追加 → agents 配列に1要素追加
//  - タスク/状態の更新 → 該当エージェントの queue / status を編集
//  - 文言修正 → desc / task などを編集
//  将来 HubSpot / Supabase から動的取得する場合も、この型を
//  そのまま API レスポンスの shape として再利用できるよう設計。
// =============================================================

export type AgentStatus = "run" | "wait" | "idle";
export type QueueState = "done" | "run" | "queued";

export interface QueueItem {
  state: QueueState;
  label: string;
}

export interface Agent {
  id: string;          // アイコン参照キー & 一意ID
  dept: string;        // 部門ラベル（SALES, BD ...）
  code: string;        // 識別コード（AG-01 ...）
  name: string;        // 表示名
  status: AgentStatus; // 稼働状態
  task: string;        // 現在の主タスク（カード表示）
  metric: string;      // 主要メトリクスの数値
  metricUnit: string;  // メトリクスの単位/補足
  desc: string;        // 詳細説明（モーダル）
  caps: string[];      // 担当領域（資料の機能群に対応）
  queue: QueueItem[];  // タスクキュー（モーダル）
  approve: boolean;    // Human-in-the-loop の承認ゲートが必要か
}

// -------------------------------------------------------------
//  統括AI（オーケストレーター）— COMMON / 司令塔
// -------------------------------------------------------------
export const orchestrator: Agent = {
  id: "orchestrator",
  dept: "COMMON · ORCHESTRATOR",
  code: "ORC-00",
  name: "統括AI（オーケストレーター）",
  status: "run",
  task: "各エージェントの進捗を集約し週次レポートを生成中",
  metric: "83",
  metricUnit: "% 稼働効率",
  desc:
    "7体の機能エージェントを束ね、タスクの優先度づけ・依存関係の解決・週次レポートの集約を担う統括レイヤー。週一回の課題ヒアリングを起点に、各エージェントへ指示を分配する。",
  caps: ["週次課題ヒアリング", "知見共有会", "週次レポート集約", "エージェント間調整", "優先度づけ"],
  queue: [
    { state: "done", label: "各エージェントの本日進捗を集約" },
    { state: "run", label: "週次レポートのドラフトを生成" },
    { state: "queued", label: "次週の優先タスクを再配分" },
  ],
  approve: false,
};

// -------------------------------------------------------------
//  機能エージェント 7体
// -------------------------------------------------------------
export const agents: Agent[] = [
  {
    id: "sales",
    dept: "SALES",
    code: "AG-01",
    name: "営業エージェント",
    status: "run",
    task: "商談「Acme社」の議事録から次アクションを抽出中",
    metric: "12",
    metricUnit: "商談 / 提案書 3件",
    desc:
      "パイプライン全体を監視し、商談ごとの次アクション・提案書ドラフト・アカウントプランを自動生成。MEDDPICCに基づく抜け漏れチェックも担う。",
    caps: ["パイプライン管理", "商談運用", "提案書整備", "アカウントプラン", "クロージング", "営業レポート"],
    queue: [
      { state: "done", label: "提案書「Acme社_v2」を生成" },
      { state: "run", label: "商談議事録から次アクション抽出" },
      { state: "queued", label: "週次営業レポートの下書き" },
      { state: "queued", label: "停滞商談3件のリスク評価" },
    ],
    approve: true,
  },
  {
    id: "bd",
    dept: "BD",
    code: "AG-02",
    name: "事業開発エージェント",
    status: "run",
    task: "競合3社のリリースを解析し市場レポートへ追記中",
    metric: "47",
    metricUnit: "VOC収集",
    desc:
      "市場・競合・顧客の声を継続収集し、事業戦略の壁打ち相手になる。アライアンス候補のスコアリングも実施。",
    caps: ["事業戦略の壁打ち", "市場調査", "顧客の声収集", "パートナーアライアンス戦略"],
    queue: [
      { state: "done", label: "競合「Frictio」新機能を検知・記録" },
      { state: "run", label: "市場レポートへ反映" },
      { state: "queued", label: "アライアンス候補の再スコアリング" },
    ],
    approve: false,
  },
  {
    id: "mkt",
    dept: "MARKETING",
    code: "AG-03",
    name: "マーケエージェント",
    status: "run",
    task: "週次メルマガのA/B 2案を生成し HubSpot へ同期中",
    metric: "5",
    metricUnit: "コンテンツ生成",
    desc:
      "メルマガ・事例・DL資料・検索広告を制作し、HubSpotのワークフローへ自動連携。インサイドセールスの初動も設計。",
    caps: ["メルマガ", "事例制作", "DL資料制作", "検索広告", "HubSpot構築", "インサイドセールス構築"],
    queue: [
      { state: "done", label: "新規リード18件をHubSpotへ同期" },
      { state: "run", label: "メルマガA/B案を生成" },
      { state: "queued", label: "導入事例ドラフト（2社）" },
    ],
    approve: true,
  },
  {
    id: "pr",
    dept: "PR",
    code: "AG-04",
    name: "広報エージェント",
    status: "wait",
    task: "プレスリリース草案をレビュー待ちに送信",
    metric: "2",
    metricUnit: "PRドラフト",
    desc:
      "プレスリリース・取材誘致・ブランド戦略を担当。社外公開物のため、配信前に必ず人間の承認を挟む。",
    caps: ["プレスリリース", "取材誘致", "ブランド戦略設計"],
    queue: [
      { state: "done", label: "メディアリストを精査・更新" },
      { state: "done", label: "プレスリリース草案を作成" },
      { state: "queued", label: "取材オファー文面の作成" },
    ],
    approve: true,
  },
  {
    id: "bo",
    dept: "BACK OFFICE",
    code: "AG-05",
    name: "バックオフィスエージェント",
    status: "run",
    task: "請求書8件を自動照合・SOC2エビデンスを収集中",
    metric: "8",
    metricUnit: "請求処理",
    desc:
      "受注・請求の自動照合と、ISMS / SOC2取得に向けたエビデンス収集・不足チェックを担当。",
    caps: ["受注・請求システム構築", "ISMS取得支援", "SOC2取得支援"],
    queue: [
      { state: "done", label: "請求書3件を自動照合" },
      { state: "run", label: "SOC2エビデンス不足をチェック" },
      { state: "queued", label: "月次の入金消込" },
    ],
    approve: false,
  },
  {
    id: "ir",
    dept: "IR",
    code: "AG-06",
    name: "IRエージェント",
    status: "wait",
    task: "月次KPIを投資家向け資料へ反映（承認待ち）",
    metric: "1",
    metricUnit: "資料更新",
    desc:
      "月次KPIを集計し投資家向け資料へ反映。対外資料のため数値の確定には承認を要する。",
    caps: ["投資家向け資料作成", "KPIダッシュボード集計"],
    queue: [
      { state: "done", label: "月次KPIを集計" },
      { state: "done", label: "資料ドラフトへ反映" },
      { state: "queued", label: "次回MTG用Q&A想定の作成" },
    ],
    approve: true,
  },
  {
    id: "hr",
    dept: "HR",
    code: "AG-07",
    name: "採用エージェント",
    status: "run",
    task: "候補者23名をスコアリング・JDを最適化中",
    metric: "23",
    metricUnit: "候補者評価",
    desc:
      "求人票（JD）の最適化と候補者スクリーニング、採用広報コンテンツの設計を担当。",
    caps: ["求人支援", "採用広報の設計", "候補者スクリーニング"],
    queue: [
      { state: "done", label: "候補者スコアリング（5名）" },
      { state: "run", label: "JDのSEO最適化" },
      { state: "queued", label: "採用広報note下書き" },
    ],
    approve: false,
  },
];

// -------------------------------------------------------------
//  ライブ・アクティビティフィードのイベント（デモ用ダミー）
// -------------------------------------------------------------
export const feedEvents: [string, string][] = [
  ["SALES", "提案書「Acme社_v2」を生成しました"],
  ["MARKETING", "HubSpotに新規リード18件を同期"],
  ["BD", "競合「Frictio」の新機能を検知 → 市場レポートに追記"],
  ["PR", "プレスリリース草案をレビュー待ちに送信"],
  ["BACKOFFICE", "請求書3件を自動照合・消込"],
  ["HR", "候補者スコアリングを完了（5名）"],
  ["IR", "月次KPIダッシュボードを更新"],
  ["統括AI", "週次レポートのドラフトを集約中"],
  ["SALES", "停滞商談2件にリスクフラグを付与"],
  ["MARKETING", "週次メルマガのA/B 2案を生成"],
  ["BD", "VOC 12件を要約しインサイトを抽出"],
  ["HR", "求人票のSEOスコアを +18 改善"],
];

// -------------------------------------------------------------
//  トップのKPI（デモ用ダミー。将来 HubSpot / Supabase 集計に差し替え）
// -------------------------------------------------------------
export const kpis = {
  activeAgents: 8,
  totalAgents: 8,
  outputToday: 64,
  tasksInProgress: 12,
  needsApproval: 3,
};
