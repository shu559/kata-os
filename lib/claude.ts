// =============================================================
//  Claude API 連携層（アカウントプラン生成）
// -------------------------------------------------------------
//  営業エージェントの中核。顧客情報を受け取り、KATAの営業
//  方法論に沿ったアカウントプランを構造化JSONで生成する。
//
//  - APIキーは ANTHROPIC_API_KEY（サーバー専用。NEXT_PUBLIC_禁止）
//  - サーバー側（API Route）からのみ呼ぶこと
//  - 出力は AccountPlanContent と同じ shape の JSON
// =============================================================

import Anthropic from "@anthropic-ai/sdk";
import { AccountPlanContent } from "./accounts";

// 生成に使うモデル（バランス重視で Sonnet）
const MODEL = "claude-sonnet-4-6";

export const isClaudeConfigured = Boolean(process.env.ANTHROPIC_API_KEY);

// 営業エージェントへの指示。KATAの方法論をここに集約する。
// （会社/担当者の課題分離・仮説検証・MEDDPICC を明示）
const SYSTEM_PROMPT = `あなたはエンタープライズ営業に精通した、KATAの「営業エージェント」です。
与えられた顧客情報をもとに、実戦的なアカウントプランを作成します。

重要な方法論:
- 「会社レベルの課題」と「担当者レベルの課題」を必ず分けて捉える
- 確定情報と「仮説」を区別する。検証すべき仮説を明示する
- 意思決定者は役割（窓口／予算承認／技術評価など）とともに特定する
- MEDDPICC（Metrics, Economic buyer, Decision criteria, Decision process,
  Paper process, Identify pain, Champion, Competition）の観点で抜け漏れを埋める

出力は必ず次のJSON形式のみ。前置き・説明・マークダウン記法は一切含めない:
{
  "company_challenges": "会社レベルの課題（文章）",
  "contact_challenges": "担当者レベルの課題（文章）",
  "decision_makers": ["役割: 名前や立場", ...],
  "competitors": ["競合名", ...],
  "hypotheses": ["検証すべき仮説", ...],
  "next_actions": ["次にとるべき具体アクション", ...],
  "meddpicc": {
    "metrics": "...",
    "economic_buyer": "...",
    "decision_criteria": "...",
    "decision_process": "...",
    "paper_process": "...",
    "identify_pain": "...",
    "champion": "...",
    "competition": "..."
  }
}
情報が不足している項目は、空文字や空配列ではなく「（要ヒアリング）」など
次アクションに繋がる形で埋めること。`;

interface GenerateInput {
  accountName: string;
  industry?: string | null;
  size?: string | null;
  notes?: string | null;
  // 営業担当が把握している追加コンテキスト（任意の自由記述）
  context?: string;
}

/**
 * アカウントプランを生成する。
 * 失敗時は例外を投げる（呼び出し側でハンドリング）。
 */
export async function generateAccountPlan(
  input: GenerateInput
): Promise<AccountPlanContent> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY が未設定です。Vercel の環境変数を確認してください。"
    );
  }

  const client = new Anthropic({ apiKey });

  const userMessage = [
    `# 顧客情報`,
    `会社名: ${input.accountName}`,
    input.industry ? `業界: ${input.industry}` : "",
    input.size ? `規模: ${input.size}` : "",
    input.notes ? `メモ: ${input.notes}` : "",
    input.context ? `\n# 営業担当からの追加コンテキスト\n${input.context}` : "",
    `\n上記をもとにアカウントプランをJSONで作成してください。`,
  ]
    .filter(Boolean)
    .join("\n");

  const res = await client.messages.create({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: userMessage }],
  });

  // テキストブロックを連結して取り出す
  const text = res.content
    .filter((b): b is Anthropic.TextBlock => b.type === "text")
    .map((b) => b.text)
    .join("")
    .trim();

  // ```json フェンスが付いた場合に備えて除去
  const cleaned = text.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();

  try {
    return JSON.parse(cleaned) as AccountPlanContent;
  } catch {
    // パース失敗時は、生テキストを company_challenges に入れて返す
    // （UIで内容を確認でき、完全な失敗にはならない）
    return {
      company_challenges: cleaned,
      _parse_error: true,
    } as AccountPlanContent;
  }
}
