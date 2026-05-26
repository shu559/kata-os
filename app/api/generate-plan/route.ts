// =============================================================
//  /api/generate-plan — アカウントプランを生成して保存
// -------------------------------------------------------------
//  流れ:
//   1) account_id から顧客情報を取得（Supabase）
//   2) Claude でアカウントプランを生成（KATA方法論）
//   3) account_plans に新しい版として保存
//   4) 保存したプランを返す
//
//  すべてサーバー側で完結。Claude/Supabase のキーはブラウザに出ない。
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";
import { generateAccountPlan, isClaudeConfigured } from "@/lib/claude";

// 生成は時間がかかるので最大実行時間を延ばす（Vercel）
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase 未設定です。" },
      { status: 503 }
    );
  }
  if (!isClaudeConfigured) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY 未設定です。Vercel の環境変数を確認してください。" },
      { status: 503 }
    );
  }

  const body = await req.json();
  if (!body?.account_id) {
    return NextResponse.json({ error: "account_id は必須です。" }, { status: 400 });
  }

  const db = getServiceClient();

  // 1) 顧客情報を取得
  const { data: account, error: accErr } = await db
    .from("accounts")
    .select("*")
    .eq("id", body.account_id)
    .single();

  if (accErr || !account) {
    return NextResponse.json(
      { error: "対象アカウントが見つかりません。" },
      { status: 404 }
    );
  }

  // 2) Claude で生成
  let content;
  try {
    content = await generateAccountPlan({
      accountName: account.name,
      industry: account.industry,
      size: account.size,
      notes: account.notes,
      context: body.context, // 画面からの追加メモ（任意）
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "生成に失敗しました。";
    return NextResponse.json({ error: msg }, { status: 500 });
  }

  // 3) 版番号を決めて保存
  const { data: existing } = await db
    .from("account_plans")
    .select("version")
    .eq("account_id", body.account_id)
    .order("version", { ascending: false })
    .limit(1);

  const nextVersion = existing && existing.length > 0 ? existing[0].version + 1 : 1;

  const { data: saved, error: saveErr } = await db
    .from("account_plans")
    .insert({
      account_id: body.account_id,
      title: `アカウントプラン v${nextVersion}`,
      content,
      version: nextVersion,
      created_by: "sales-agent",
    })
    .select()
    .single();

  if (saveErr) {
    return NextResponse.json({ error: saveErr.message }, { status: 500 });
  }

  // 4) 返す
  return NextResponse.json({ plan: saved }, { status: 201 });
}
