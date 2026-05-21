// 추천인 코드: WM + 6자리 (대문자 + 숫자, 헷갈리는 문자 제외)
const CHARS = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function generateReferralCode(): string {
  let code = 'WM';
  for (let i = 0; i < 6; i++) {
    code += CHARS[Math.floor(Math.random() * CHARS.length)];
  }
  return code;
}

export function isValidReferralCode(code: string): boolean {
  return /^WM[A-Z2-9]{6}$/.test(code);
}
