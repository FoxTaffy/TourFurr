import { supabase } from '../lib/supabase'

export interface VerificationCode {
  id: string
  email: string
  code: string
  created_at: string
  expires_at: string
  attempts: number
  used: boolean
  verified_at?: string
}

/**
 * Generate a random 6-digit verification code
 */
export function generateVerificationCode(): string {
  // Generate a number between 100000 and 999999
  const code = Math.floor(100000 + Math.random() * 900000)
  return code.toString()
}

/**
 * Create and store a new verification code
 * @param email - User's email address
 * @returns The generated code and expiration time
 */
export async function createVerificationCode(email: string): Promise<{
  success: boolean
  code?: string
  expiresAt?: Date
  error?: string
}> {
  try {
    const code = generateVerificationCode()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes from now

    const { data, error } = await supabase
      .from('email_verification_codes')
      .insert({
        email: email.toLowerCase(),
        code,
        expires_at: expiresAt.toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating verification code:', error)
      return { success: false, error: 'Не удалось создать код подтверждения' }
    }

    return {
      success: true,
      code,
      expiresAt
    }
  } catch (err: any) {
    console.error('Exception creating verification code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Verify a code entered by the user
 * @param email - User's email address
 * @param code - 6-digit code entered by user
 * @returns Success status and error message if any
 */
export async function verifyCode(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // Find the most recent unused code for this email
    const { data: codes, error: fetchError } = await supabase
      .from('email_verification_codes')
      .select('*')
      .eq('email', email.toLowerCase())
      .eq('used', false)
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError) {
      console.error('Error fetching verification code:', fetchError)
      return { success: false, error: 'Ошибка проверки кода' }
    }

    if (!codes || codes.length === 0) {
      return { success: false, error: 'Код не найден. Запросите новый код.' }
    }

    const verificationRecord = codes[0] as VerificationCode

    // Check if code has expired
    if (new Date(verificationRecord.expires_at) < new Date()) {
      return { success: false, error: 'Код истёк. Запросите новый код.' }
    }

    // Check if too many attempts
    if (verificationRecord.attempts >= 3) {
      return { success: false, error: 'Превышено количество попыток. Запросите новый код.' }
    }

    // Check if code matches
    if (verificationRecord.code !== code) {
      // Increment attempts
      await supabase
        .from('email_verification_codes')
        .update({ attempts: verificationRecord.attempts + 1 })
        .eq('id', verificationRecord.id)

      const attemptsLeft = 3 - (verificationRecord.attempts + 1)
      return {
        success: false,
        error: `Неверный код. Осталось попыток: ${attemptsLeft}`
      }
    }

    // Code is correct! Mark as used
    const { error: updateError } = await supabase
      .from('email_verification_codes')
      .update({
        used: true,
        verified_at: new Date().toISOString()
      })
      .eq('id', verificationRecord.id)

    if (updateError) {
      console.error('Error updating verification code:', updateError)
      return { success: false, error: 'Ошибка обновления кода' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Exception verifying code:', err)
    return { success: false, error: err.message || 'Неизвестная ошибка' }
  }
}

/**
 * Send verification code via email
 * Note: This requires a backend endpoint to actually send emails
 * For now, we'll log the code (in production, use a proper email service)
 */
export async function sendVerificationEmail(email: string, code: string): Promise<{
  success: boolean
  error?: string
}> {
  try {
    // TODO: Replace with actual email sending service (SendGrid, Mailgun, etc.)
    // For development, we'll use Supabase Edge Function or similar

    // Option 1: Use Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('send-verification-email', {
      body: {
        email,
        code
      }
    })

    if (error) {
      console.error('Error sending verification email:', error)
      // Fallback: Log to console in development
      console.log('='.repeat(50))
      console.log('📧 VERIFICATION CODE FOR:', email)
      console.log('🔢 CODE:', code)
      console.log('='.repeat(50))
      return { success: false, error: 'Не удалось отправить email. Проверьте консоль для кода.' }
    }

    return { success: true }
  } catch (err: any) {
    console.error('Exception sending verification email:', err)
    // Fallback: Log to console
    console.log('='.repeat(50))
    console.log('📧 VERIFICATION CODE FOR:', email)
    console.log('🔢 CODE:', code)
    console.log('='.repeat(50))
    return { success: false, error: 'Email отправлен (проверьте консоль)' }
  }
}

/**
 * Invalidate all unused codes for an email (when requesting a new code)
 */
export async function invalidateOldCodes(email: string): Promise<void> {
  await supabase
    .from('email_verification_codes')
    .update({ used: true })
    .eq('email', email.toLowerCase())
    .eq('used', false)
}
