import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const event = await req.json()

    // YooKassa sends payment notifications in this format
    // https://yookassa.ru/developers/using-api/webhooks
    if (!event || !event.object) {
      return new Response(
        JSON.stringify({ error: 'Invalid webhook payload' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const payment = event.object
    const paymentId = payment.id
    const paymentStatus = payment.status
    const applicationId = payment.metadata?.application_id

    console.log('Webhook received:', { paymentId, paymentStatus, applicationId })

    if (!applicationId) {
      console.error('No application_id in payment metadata')
      return new Response(
        JSON.stringify({ error: 'Missing application_id in metadata' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Initialize Supabase with service role key for admin operations
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    if (paymentStatus === 'succeeded') {
      // Payment succeeded — update application
      const paidAmount = parseFloat(payment.amount?.value || '0')

      const { error: updateError } = await supabase
        .from('applications')
        .update({
          payment_status: 'paid',
          payment_amount: paidAmount,
          payment_date: new Date().toISOString(),
          yookassa_payment_id: paymentId,
        })
        .eq('id', applicationId)

      if (updateError) {
        console.error('Error updating application payment status:', updateError)
        return new Response(
          JSON.stringify({ error: 'Failed to update payment status' }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Also update user status to 'paid'
      const { data: application } = await supabase
        .from('applications')
        .select('user_id')
        .eq('id', applicationId)
        .single()

      if (application?.user_id) {
        await supabase
          .from('users')
          .update({ status: 'paid' })
          .eq('id', application.user_id)
      }

      console.log('Payment confirmed for application:', applicationId)

    } else if (paymentStatus === 'canceled') {
      // Payment was canceled
      console.log('Payment canceled for application:', applicationId)

      await supabase
        .from('applications')
        .update({
          yookassa_payment_id: paymentId,
        })
        .eq('id', applicationId)
    }

    // Always return 200 to acknowledge webhook receipt
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: any) {
    console.error('Error in payment-webhook function:', error)
    return new Response(
      JSON.stringify({ error: 'Internal server error', message: error.message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
