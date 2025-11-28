<template>
  <div class="verify-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <div class="verify-container">
      <VerificationCodeInput
        :email="email"
        @verified="handleVerified"
        @resend="handleResend"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../services/supabase'
import VerificationCodeInput from '../components/auth/VerificationCodeInput.vue'
import { createVerificationCode, sendVerificationEmail } from '../utils/emailVerification'

const route = useRoute()
const router = useRouter()
const email = ref<string>('')

onMounted(() => {
  // Get email from query params
  const emailParam = route.query.email as string

  if (!emailParam) {
    // If no email in query, redirect to auth page
    router.push('/auth')
    return
  }

  email.value = emailParam
})

async function handleVerified() {
  try {
    // Update user's email_verified status in database
    const { error } = await supabase
      .from('users')
      .update({
        email_verified: true,
        email_verified_at: new Date().toISOString()
      })
      .eq('email', email.value)

    if (error) {
      console.error('Error updating email verification status:', error)
      alert('Ошибка обновления статуса. Свяжитесь с поддержкой.')
      return
    }

    // Redirect to login with success message
    router.push('/auth?verified=true')
  } catch (err: any) {
    console.error('Error in handleVerified:', err)
    alert('Произошла ошибка. Попробуйте войти в систему.')
    router.push('/auth')
  }
}

async function handleResend() {
  try {
    const result = await createVerificationCode(email.value)

    if (result.success && result.code) {
      await sendVerificationEmail(email.value, result.code)
    } else {
      alert(result.error || 'Не удалось отправить код')
    }
  } catch (err: any) {
    console.error('Error resending code:', err)
    alert('Ошибка отправки кода')
  }
}
</script>

<style scoped>
.verify-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  position: relative;
  overflow: hidden;
}

.bg-forest {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1410 0%, #2a1f1a 50%, #1a1410 100%);
  z-index: 0;
}

.bg-forest::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.1) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 179, 71, 0.08) 0%, transparent 50%);
}

.fog {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse at center, transparent 0%, rgba(26, 20, 16, 0.3) 100%);
  pointer-events: none;
  z-index: 1;
}

.verify-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.95), rgba(61, 45, 36, 0.95));
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.5);
  border-radius: 24px;
  padding: 1rem;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
}

@media (max-width: 640px) {
  .verify-container {
    padding: 0.5rem;
  }
}
</style>
