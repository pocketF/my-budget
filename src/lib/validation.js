export function validateAmount(value) {
  if (value === '' || value === null || value === undefined) {
    return '금액을 입력해 주세요.'
  }

  const num = Number(value)

  if (!Number.isFinite(num)) {
    return '금액이 올바르지 않습니다.'
  }

  if (!Number.isInteger(num)) {
    return '금액은 소수점 없이 입력해 주세요.'
  }

  if (num <= 0) {
    return '금액은 0보다 커야 합니다.'
  }

  return null
}
