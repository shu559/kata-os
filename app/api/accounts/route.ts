// =============================================================
//  /api/accounts — アカウントの取得・作成
// -------------------------------------------------------------
//  書き込みは service_role クライアントをサーバー側で使用。
//  キーはブラウザに露出しない。
// =============================================================

import { NextRequest, NextResponse } from "next/server";
import { getServiceClient, isSupabaseConfigured } from "@/lib/supabase";

export async function GET() {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase 未設定。環境変数を確認してください。" },
      { status: 503 }
    );
  }
  const db = getServiceClient();
  const { data, error } = await db
    .from("accounts")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ accounts: data });
}

export async function POST(req: NextRequest) {
  if (!isSupabaseConfigured) {
    return NextResponse.json(
      { error: "Supabase 未設定。環境変数を確認してください。" },
      { status: 503 }
    );
  }
  const body = await req.json();
  if (!body?.name) {
    return NextResponse.json({ error: "name は必須です。" }, { status: 400 });
  }

  const db = getServiceClient();
  const { data, error } = await db
    .from("accounts")
    .insert({
      name: body.name,
      industry: body.industry ?? null,
      size: body.size ?? null,
      status: body.status ?? "active",
      notes: body.notes ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ account: data }, { status: 201 });
}
