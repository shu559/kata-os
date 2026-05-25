-- =============================================================
--  KATA — Supabase スキーマ（accounts + account_plans）
-- -------------------------------------------------------------
--  使い方:
--   Supabase ダッシュボード → SQL Editor に貼り付けて Run。
--   既存テーブルがあると `create table` で止まるので、
--   作り直す場合は先頭の drop 2行のコメントを外す。
--
--  設計方針:
--   - accounts: 一覧・検索したい「固定項目」だけカラム化
--   - account_plans: プラン本体は content(JSONB)で柔軟に持つ。
--     項目が増減してもマイグレーション不要。
--   - 1アカウントに複数プラン（版）を許す（履歴が消えない）。
-- =============================================================

-- drop table if exists account_plans cascade;
-- drop table if exists accounts cascade;

-- ---------- 顧客（アカウント） ----------
create table accounts (
  id            uuid primary key default gen_random_uuid(),
  name          text not null,                 -- 会社名
  industry      text,                          -- 業界
  size          text,                          -- 規模（従業員数レンジ等）
  status        text default 'active',         -- active / prospect / closed 等
  notes         text,                          -- 自由メモ
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- アカウントプラン ----------
--  content(JSONB)の想定キー（あくまで目安。自由に増減可）:
--   {
--     "company_challenges": "...",     // 会社レベルの課題
--     "contact_challenges": "...",     // 担当者レベルの課題
--     "decision_makers": [...],        // 意思決定者
--     "competitors": [...],            // 競合
--     "hypotheses": [...],             // 仮説
--     "next_actions": [...],           // 次アクション
--     "meddpicc": { ... }              // MEDDPICC各項目
--   }
create table account_plans (
  id            uuid primary key default gen_random_uuid(),
  account_id    uuid not null references accounts(id) on delete cascade,
  title         text not null default 'アカウントプラン',
  content       jsonb not null default '{}'::jsonb,  -- プラン本体（柔軟）
  version       int  not null default 1,             -- 版番号
  created_by    text default 'sales-agent',          -- 生成元（将来: 人/エージェント識別）
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- ---------- インデックス ----------
create index idx_account_plans_account_id on account_plans(account_id);
create index idx_account_plans_created_at on account_plans(created_at desc);

-- ---------- updated_at 自動更新 ----------
create or replace function set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_accounts_updated
  before update on accounts
  for each row execute function set_updated_at();

create trigger trg_account_plans_updated
  before update on account_plans
  for each row execute function set_updated_at();

-- =============================================================
--  RLS（Row Level Security）について
-- -------------------------------------------------------------
--  顧客データを扱うため、本番投入前に必ず RLS を有効化すること。
--  プロトタイプ段階（認証なし・自分だけが触る）では、まず
--  下記のように「全許可」ポリシーで動かしてもよいが、外部に
--  公開する前に必ず見直す。
--
--  ↓ プロトタイプ用（anon に全権限。本番では絶対に外す）
-- alter table accounts enable row level security;
-- alter table account_plans enable row level security;
-- create policy "proto_all_accounts" on accounts for all using (true) with check (true);
-- create policy "proto_all_plans"    on account_plans for all using (true) with check (true);
-- =============================================================

-- ---------- 動作確認用のサンプル投入（任意） ----------
insert into accounts (name, industry, size, status, notes) values
  ('Acme株式会社', 'SaaS', '101-500名', 'active', 'パイロット導入を検討中'),
  ('Globex Corp',   '製造', '1000名以上', 'prospect', '次回MTG調整中');
