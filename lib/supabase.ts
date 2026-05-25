// =============================================================
//  Supabase 接続レイヤー
// -------------------------------------------------------------
//  キーは2種類。役割を厳密に分ける（顧客データを扱うため）:
//   - anon key        : 公開OK。ブラウザ/読み取り用。
//   - service_role key : 全権限。サーバー側でのみ使用。絶対に
//                        ブラウザへ露出させない（NEXT_PUBLIC_を付けない）。
//
//  Vercel の Environment Variables に以下を設定:
//   NEXT_PUBLIC_SUPABASE_URL       = https://xxxx.supabase.co
//   NEXT_PUBLIC_SUPABASE_ANON_KEY  = （anon public key）
//   SUPABASE_SERVICE_ROLE_KEY      = （service_role key／サーバー専用）
// =============================================================

import { createClient, SupabaseClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 環境変数が未設定でもビルドは通す（プロトタイプ運用）。
// 実行時に未設定なら、呼び出し側でダミーにフォールバックする。
export const isSupabaseConfigured = Boolean(url && anonKey);

// ---------- ブラウザ/読み取り用（anon） ----------
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(url as string, anonKey as string)
  : null;

// ---------- サーバー専用（service_role） ----------
//  Route Handler / Server Action の中だけで呼ぶこと。
//  クライアントコンポーネントから import しないよう注意。
export function getServiceClient(): SupabaseClient {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error(
      "Supabase service client が未設定です。SUPABASE_SERVICE_ROLE_KEY と NEXT_PUBLIC_SUPABASE_URL を確認してください。"
    );
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false },
  });
}
