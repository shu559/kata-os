// =============================================================
//  accounts / account_plans データアクセス層
// -------------------------------------------------------------
//  Supabase が設定済みなら DB から、未設定ならダミーを返す。
//  これにより「DB未接続でも画面は動く」プロトタイプ運用を維持。
//  読み取りは anon クライアント、書き込みは API Route 経由
//  （= service_role）にするのが安全。
// =============================================================

import { supabase, isSupabaseConfigured } from "./supabase";

// ---------- 型 ----------
export interface Account {
  id: string;
  name: string;
  industry: string | null;
  size: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// アカウントプランの中身（柔軟。項目は増減可）
export interface AccountPlanContent {
  company_challenges?: string;
  contact_challenges?: string;
  decision_makers?: string[];
  competitors?: string[];
  hypotheses?: string[];
  next_actions?: string[];
  meddpicc?: Record<string, string>;
  [key: string]: unknown; // 将来の項目追加に耐える
}

export interface AccountPlan {
  id: string;
  account_id: string;
  title: string;
  content: AccountPlanContent;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

// ---------- ダミーデータ（DB未接続時） ----------
const DUMMY_ACCOUNTS: Account[] = [
  {
    id: "demo-acme",
    name: "Acme株式会社",
    industry: "SaaS",
    size: "101-500名",
    status: "active",
    notes: "パイロット導入を検討中",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: "demo-globex",
    name: "Globex Corp",
    industry: "製造",
    size: "1000名以上",
    status: "prospect",
    notes: "次回MTG調整中",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const DUMMY_PLANS: Record<string, AccountPlan[]> = {
  "demo-acme": [
    {
      id: "demo-plan-1",
      account_id: "demo-acme",
      title: "アカウントプラン（初版）",
      version: 1,
      created_by: "sales-agent",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      content: {
        company_challenges: "全社的なデータ分断。部門ごとにツールが乱立。",
        contact_challenges: "情シス部長が短期ROIの説明を社内で求められている。",
        decision_makers: ["情シス部長（窓口）", "CFO（予算承認）"],
        competitors: ["Frictio", "内製"],
        hypotheses: ["導入は来期予算で検討の可能性が高い"],
        next_actions: ["ROI試算の提示", "CFO同席のMTG設定"],
      },
    },
  ],
};

// ---------- 読み取り API ----------

/** アカウント一覧を取得（新しい順） */
export async function listAccounts(): Promise<Account[]> {
  if (!isSupabaseConfigured || !supabase) return DUMMY_ACCOUNTS;

  const { data, error } = await supabase
    .from("accounts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("listAccounts error:", error.message);
    return DUMMY_ACCOUNTS;
  }
  return data as Account[];
}

/** 指定アカウントのプラン一覧を取得（版の新しい順） */
export async function listPlans(accountId: string): Promise<AccountPlan[]> {
  if (!isSupabaseConfigured || !supabase) return DUMMY_PLANS[accountId] ?? [];

  const { data, error } = await supabase
    .from("account_plans")
    .select("*")
    .eq("account_id", accountId)
    .order("version", { ascending: false });

  if (error) {
    console.error("listPlans error:", error.message);
    return [];
  }
  return data as AccountPlan[];
}
