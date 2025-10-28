/**
 * 폼 유효성 검사 유틸리티 함수
 */

/**
 * 사용자명 유효성 검사
 */
export function validateUsername(value) {
  if (!value) {
    return '사용자명을 입력해주세요.';
  }
  if (value.length < 2) {
    return '사용자명은 2자 이상이어야 합니다.';
  }
  if (value.length > 20) {
    return '사용자명은 20자 이하여야 합니다.';
  }
  if (!/^[a-zA-Z0-9가-힣_]+$/.test(value)) {
    return '사용자명은 영문, 한글, 숫자, 언더스코어만 사용 가능합니다.';
  }
  return null;
}

/**
 * 이메일 유효성 검사
 */
export function validateEmail(value) {
  if (!value) {
    return '이메일을 입력해주세요.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
    return '올바른 이메일 형식을 입력해주세요.';
  }
  return null;
}

/**
 * 비밀번호 유효성 검사
 */
export function validatePassword(value) {
  if (!value) {
    return '비밀번호를 입력해주세요.';
  }
  if (value.length < 8) {
    return '비밀번호는 8자 이상이어야 합니다.';
  }
  if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(value)) {
    return '비밀번호는 영문과 숫자를 포함해야 합니다.';
  }
  return null;
}

/**
 * 비밀번호 확인 유효성 검사
 */
export function validateConfirmPassword(value, password) {
  if (!value) {
    return '비밀번호 확인을 입력해주세요.';
  }
  if (value !== password) {
    return '비밀번호가 일치하지 않습니다.';
  }
  return null;
}

/**
 * 필드별 유효성 검사 (단일 필드)
 */
export function validateField(fieldName, value, formData = {}) {
  switch (fieldName) {
    case 'username':
      return validateUsername(value);
    case 'email':
      return validateEmail(value);
    case 'password':
      return validatePassword(value);
    case 'confirmPassword':
      return validateConfirmPassword(value, formData.password);
    default:
      return null;
  }
}

/**
 * 전체 폼 유효성 검사
 */
export function validateSignupForm(formData) {
  const errors = {};

  const usernameError = validateUsername(formData.username);
  if (usernameError) errors.username = usernameError;

  const emailError = validateEmail(formData.email);
  if (emailError) errors.email = emailError;

  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  const confirmPasswordError = validateConfirmPassword(formData.confirmPassword, formData.password);
  if (confirmPasswordError) errors.confirmPassword = confirmPasswordError;

  return errors;
}
