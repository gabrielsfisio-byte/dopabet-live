-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query → paste → Run)

create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  is_premium boolean not null default false,
  stripe_customer_id text,
  stripe_subscription_id text,
  premium_since timestamptz,
  bingo_premium boolean not null default false,
  bingo_stripe_customer_id text,
  bingo_stripe_subscription_id text,
  bingo_premium_since timestamptz,
  dopabet_premium boolean not null default false,
  dopabet_stripe_customer_id text,
  dopabet_stripe_subscription_id text,
  dopabet_premium_since timestamptz,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- Each user can read only their own profile row.
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

-- Each user can update their own profile row (needed so the checkout route
-- can save the Stripe customer id tied to their account).
create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Automatically create a profile row whenever a new user signs up.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
