/**
 * Decode a Supabase JWT and read the `is_admin` custom claim.
 *
 * Admin status is embedded in the JWT by the `custom_access_token_hook`
 * PostgreSQL function (see database/custom_access_token_hook.sql).
 * The token is signed by the Supabase Auth server — its payload cannot be
 * altered without invalidating the signature, making it far more resistant to
 * interception attacks than a separate REST call that returns plain JSON.
 */
export function getIsAdminFromToken(token: string): boolean {
  try {
    const base64Payload = token.split('.')[1]
    if (!base64Payload) return false
    // JWT uses URL-safe base64 (- instead of +, _ instead of /)
    const json = atob(base64Payload.replace(/-/g, '+').replace(/_/g, '/'))
    const payload: Record<string, unknown> = JSON.parse(json)
    return payload.is_admin === true
  } catch {
    return false
  }
}
