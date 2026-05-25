// =============================================================
//  HubSpot 連携レイヤー（現在は stub）
// -------------------------------------------------------------
//  方針:
//   - フロントは Vercel (Next.js)、CRM のコアは HubSpot。
//   - ここは「将来 HubSpot API を叩くための置き場所」。
//   - いきなり全機能を繋がず、まず SALES（商談/取引）から接続予定。
//
//  接続時の準備:
//   1) HubSpot Private App を作成し、必要スコープを付与
//      （crm.objects.deals.read など最小権限から）
//   2) Vercel の Environment Variables に HUBSPOT_TOKEN を設定
//      ※トークンはコードに直書きしない。必ず env 経由。
//   3) 下記の TODO 関数を実装し、data/agents.ts のダミーを置換
//
//  セキュリティ注意:
//   - 顧客データを扱うため、API 呼び出しは必ずサーバー側
//     (Route Handler / Server Action) で行い、トークンを
//     クライアントに露出させない。
// =============================================================

const HUBSPOT_BASE = "https://api.hubapi.com";

function getToken(): string | null {
  // サーバー側でのみ参照される想定
  return process.env.HUBSPOT_TOKEN ?? null;
}

export interface DealSummary {
  id: string;
  name: string;
  stage: string;
  amount: number | null;
}

/**
 * HubSpot から取引（deals）一覧を取得する。
 * TODO: 実装。今はダミーを返す（プロトタイプ段階）。
 */
export async function fetchDeals(): Promise<DealSummary[]> {
  const token = getToken();
  if (!token) {
    // 未接続時はダミーで動かす（プロトタイプ運用）
    return [
      { id: "demo-1", name: "Acme社 導入", stage: "提案", amount: 4800000 },
      { id: "demo-2", name: "Globex 拡大", stage: "交渉", amount: 7200000 },
    ];
  }

  // --- 実接続時の参考実装（コメントアウト） ---
  // const res = await fetch(`${HUBSPOT_BASE}/crm/v3/objects/deals?limit=20`, {
  //   headers: { Authorization: `Bearer ${token}` },
  //   cache: "no-store",
  // });
  // if (!res.ok) throw new Error(`HubSpot error: ${res.status}`);
  // const json = await res.json();
  // return json.results.map((d: any) => ({
  //   id: d.id,
  //   name: d.properties.dealname,
  //   stage: d.properties.dealstage,
  //   amount: d.properties.amount ? Number(d.properties.amount) : null,
  // }));

  return [];
}
