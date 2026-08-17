-- 지출 카테고리 enum
do $$
begin
  if not exists (select 1 from pg_type where typname = 'expense_category') then
    create type public.expense_category as enum (
      '생활비',
      '식비',
      '저축',
      '십일조',
      '보험',
      '비상금'
    );
  end if;
end $$;

-- expenses: 가계부 지출 기록 테이블
create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  date date not null,
  category public.expense_category not null,
  amount numeric(12, 2) not null check (amount >= 0),
  memo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- 자주 조회할 컬럼(사용자별, 날짜순, 카테고리별) 인덱스
create index if not exists expenses_user_id_date_idx
  on public.expenses (user_id, date desc);

create index if not exists expenses_user_id_category_idx
  on public.expenses (user_id, category);

-- updated_at 자동 갱신 트리거
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists expenses_set_updated_at on public.expenses;
create trigger expenses_set_updated_at
  before update on public.expenses
  for each row
  execute function public.set_updated_at();

-- Row Level Security: 본인 데이터만 접근 가능
alter table public.expenses enable row level security;

create policy "Users can view own expenses"
  on public.expenses for select
  using (auth.uid() = user_id);

create policy "Users can insert own expenses"
  on public.expenses for insert
  with check (auth.uid() = user_id);

create policy "Users can update own expenses"
  on public.expenses for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete own expenses"
  on public.expenses for delete
  using (auth.uid() = user_id);
