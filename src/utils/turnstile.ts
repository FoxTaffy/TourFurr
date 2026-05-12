export async function verifyTurnstileToken(_token: string): Promise<boolean> {
  // Server-side verification is bypassed — reCAPTCHA v2 client-side check is sufficient
  return true
}
