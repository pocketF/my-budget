# 가계부 앱 (week2-practice)

개인 지출을 기록하고 관리하는 가계부 앱.

## 스택

- 프론트엔드: Vite + React
- DB/Auth: Supabase (Postgres)

## 환경 변수

DB 키는 `.env`에 보관하며 git에 커밋하지 않는다 (`.gitignore`에 포함됨).
필요한 값은 `.env.example`을 참고해 `.env`에 채운다.
Vite는 `VITE_` 접두사가 붙은 변수만 클라이언트 코드에 노출하므로 반드시 접두사를 붙인다.
코드에서는 `import.meta.env.VITE_SUPABASE_URL` 형태로 접근한다 (`src/lib/supabaseClient.js` 참고).

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

publishable key는 Supabase 설계상 클라이언트에 노출되는 공개 키이며, 실제 접근 제어는 DB의 RLS 정책이 담당한다.

## 데이터베이스

마이그레이션: `supabase/migrations/`

### expenses 테이블

지출 항목을 기록하는 테이블. `supabase/migrations/0001_create_expenses.sql`,
`0002_expenses_constraints.sql` 참고.

| 컬럼 | 타입 | 설명 |
|---|---|---|
| id | uuid | 기본키 |
| user_id | uuid | `auth.users` 참조, RLS로 본인 데이터만 접근 |
| date | date | 지출 날짜 (2000-01-01 ~ 2100-12-31) |
| category | expense_category (enum) | 생활비 / 식비 / 저축 / 십일조 / 보험 / 비상금 |
| amount | numeric(12,2) | 금액 (0 이상, 1억원 이하) |
| memo | text | 메모 (선택, 최대 200자) |
| created_at / updated_at | timestamptz | 자동 관리 |

- 카테고리는 Postgres enum(`expense_category`)으로 고정되어 있으며, 목록 변경 시 마이그레이션 필요.
- RLS 활성화 상태: 사용자는 본인 소유(`user_id = auth.uid()`) 행만 조회/생성/수정/삭제 가능.
- 금액/메모 길이/날짜 범위는 클라이언트 검증과 별개로 DB CHECK 제약으로도 강제된다(API 직접 호출 우회 방지).
