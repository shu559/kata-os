// =============================================================
//  /api/plans — アカウントプランの取得・作成
// -------------------------------------------------------------
//  営業エージェントが生成したアカウントプランを保存する口。
//  content は JSONB なので項目が増減しても受け取れる。
//  同一アカウントに複数版を許す（version を自動インクリメント）。
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

// GET /api/plans?account_id=xxx
export async function GET(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase 未設定。環境変数を確認してください。" },
      { status: 503 }
    );
  }
  const accountId = req.nextUrl.searchParams.get("account_id");
  if (!accountId) {
    return NextResponse.json({ error: "account_id は必須です。" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("account_plans")
    .select("*")
    .eq("account_id", accountId)
    .order("version", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plans: data });
}

// POST /api/plans  body: { account_id, title?, content }
export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase 未設定。環境変数を確認してください。" },
      { status: 503 }
    );
  }
  const body = await req.json();
  if (!body?.account_id) {
    return NextResponse.json({ error: "account_id は必須です。" }, { status: 400 });
  }

  const db = getServiceClient();

  // 既存の最大 version を取得して +1（版を重ねて履歴を残す）
  const { data: existing } = await db
    .from("account_plans")
    .select("version")
    .eq("account_id", body.account_id)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

  const { data, error } = await db
    .from("account_plans")
    .insert({
      account_id: body.account_id,
      title: body.title ?? "アカウントプラン",
      content: body.content ?? {},
      version: nextVersion,
      created_by: body.created_by ?? "sales-agent",
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ plan: data }, { status: 201 });
}
