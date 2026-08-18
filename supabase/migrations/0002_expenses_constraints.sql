-- 지출 입력값 상한/범위 제약 추가
-- 클라이언트(validation.js)는 금액을 검증하지만, DB API를 직접 호출하면
-- 우회할 수 있으므로 DB 레벨에서도 상식적인 범위를 강제한다.

alter table public.expenses
  add constraint expenses_amount_max check (amount <= 100000000);

alter table public.expenses
  add constraint expenses_memo_length check (memo is null or char_length(memo) <= 200);

alter table public.expenses
  add constraint expenses_date_range check (date >= date '2000-01-01' and date <= date '2100-12-31');
