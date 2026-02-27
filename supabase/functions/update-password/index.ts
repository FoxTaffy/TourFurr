import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface UpdatePasswordRequest {
  email: string
  newPassword: string
}

// How long (ms) after verifying a reset code the password can be updated
const VERIFIED_CODE_WINDOW_MS = 10 * 60 * 1000 // 10 minutes

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { email, newPassword }: UpdatePasswordRequest = await req.json()

    // Validate input
    if (!email || !newPassword) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Email and new password are required'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Invalid email format'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Validate password requirements
    if (newPassword.length < 8) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Password must be at least 8 characters'
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get Supabase service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

    if (!supabaseUrl || !supabaseServiceRoleKey) {
      console.error('Missing Supabase configuration')
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Service configuration error'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Create Supabase admin client
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    })

    // Security: Verify that a reset code was recently verified for this email.
    // This prevents calling the endpoint directly without completing the reset flow.
    const verifiedAfter = new Date(Date.now() - VERIFIED_CODE_WINDOW_MS).toISOString()
    const { data: verifiedCodes, error: codeCheckError } = await supabaseAdmin
      .from('password_reset_codes')
      .select('id')
      .eq('email', email.toLowerCase())
      .eq('used', true)
      .gte('verified_at', verifiedAfter)
      .limit(1)

    if (codeCheckError) {
      console.error('Error checking reset code verification:', codeCheckError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to verify reset authorization'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    if (!verifiedCodes || verifiedCodes.length === 0) {
      console.warn('Password update attempted without valid verified reset code for:', email)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Reset code not verified or expired. Please restart the password reset process.'
        }),
        {
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Get user by email
    const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers()

    if (listError) {
      console.error('Error listing users:', listError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to find user'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    const user = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())

    if (!user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'User not found'
        }),
        {
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    // Update user password
    const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
      user.id,
      { password: newPassword }
    )

    if (updateError) {
      console.error('Error updating password:', updateError)
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Failed to update password'
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      )
    }

    console.log('Password updated successfully for user:', email)

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Password updated successfully'
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )

  } catch (error: any) {
    console.error('Error in update-password function:', error)

    return new Response(
      JSON.stringify({
        success: false,
        error: 'Internal server error'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    )
  }
})
