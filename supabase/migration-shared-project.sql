-- Rode isso no SQL Editor do MESMO projeto Supabase que você já usa no Travel Quest
-- e no Bingo da Sorte. Adiciona colunas separadas para o status Premium do DopaBet,
-- sem se misturar com o Premium dos outros dois sites.

alter table public.profiles
  add column if not exists dopabet_premium boolean not null default false,
  add column if not exists dopabet_stripe_customer_id text,
  add column if not exists dopabet_stripe_subscription_id text,
  add column if not exists dopabet_premium_since timestamptz;
