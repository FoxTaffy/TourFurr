import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePaymentRequest {
  application_id: string
  amount: number
  description?: string
  return_url: string
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { application_id, amount, description, return_url }: CreatePaymentRequest = await req.json()

    if (!application_id || !amount || !return_url) {
      return new Response(
        JSON.stringify({ error: 'application_id, amount and return_url are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get YooKassa credentials from environment
    const shopId = Deno.env.get('YOOKASSA_SHOP_ID')
    const secretKey = Deno.env.get('YOOKASSA_SECRET_KEY')

    if (!shopId || !secretKey) {
      console.error('YooKassa credentials not configured')
      return new Response(
        JSON.stringify({ error: 'Payment service not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Verify the application exists and is approved
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    const { data: application, error: appError } = await supabase
      .from('applications')
      .select('id, user_id, status, payment_status')
      .eq('id', application_id)
      .single()

    if (appError || !application) {
      return new Response(
        JSON.stringify({ error: 'Application not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (application.status !== 'approved') {
      return new Response(
        JSON.stringify({ error: 'Application is not approved for payment' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    if (application.payment_status === 'paid') {
      return new Response(
        JSON.stringify({ error: 'Payment already completed' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Generate idempotency key
    const idempotencyKey = crypto.randomUUID()

    // Create payment via YooKassa API
    const yookassaResponse = await fetch('https://api.yookassa.ru/v3/payments', {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${shopId}:${secretKey}`),
        'Content-Type': 'application/json',
        'Idempotence-Key': idempotencyKey,
      },
      body: JSON.stringify({
        amount: {
          value: amount.toFixed(2),
          currency: 'RUB',
        },
        confirmation: {
          type: 'redirect',
          return_url: return_url,
        },
        capture: true,
        description: description || `Оплата участия в TourFurr 2026 (заявка ${application_id.slice(0, 8)})`,
        metadata: {
          application_id: application_id,
        },
      }),
    })

    const paymentData = await yookassaResponse.json()

    if (!yookassaResponse.ok) {
      console.error('YooKassa API error:', paymentData)
      return new Response(
        JSON.stringify({ error: 'Failed to create payment', details: paymentData }),
        { status: yookassaResponse.status, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Store payment ID in the application
    await supabase
      .from('applications')
      .update({ yookassa_payment_id: paymentData.id })
      .eq('id', application_id)

    console.log('Payment created:', { applicationId: application_id, paymentId: paymentData.id })

    return new Response(
      JSON.stringify({
        payment_id: paymentData.id,
        confirmation_url: paymentData.confirmation.confirmation_url,
        status: paymentData.status,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in create-payment function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
