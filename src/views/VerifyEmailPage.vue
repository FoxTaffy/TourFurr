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
  background: #0a0806;
}

.bg-forest {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, #1a1410 0%, #2a1f1a 50%, #1a1410 100%);
  z-index: 0;
  animation: bgShift 20s ease-in-out infinite;
}

@keyframes bgShift {
  0%, 100% {
    transform: scale(1) translateY(0);
  }
  50% {
    transform: scale(1.05) translateY(-10px);
  }
}

.bg-forest::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 20% 30%, rgba(255, 107, 53, 0.15) 0%, transparent 50%),
    radial-gradient(circle at 80% 70%, rgba(255, 179, 71, 0.12) 0%, transparent 50%),
    radial-gradient(circle at 50% 50%, rgba(255, 138, 62, 0.08) 0%, transparent 70%);
  animation: glowPulse 8s ease-in-out infinite;
}

@keyframes glowPulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.fog {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(ellipse at center, transparent 0%, rgba(26, 20, 16, 0.4) 100%),
    radial-gradient(ellipse at 30% 40%, rgba(42, 31, 26, 0.3) 0%, transparent 50%);
  pointer-events: none;
  z-index: 1;
  animation: fogMove 15s ease-in-out infinite;
}

@keyframes fogMove {
  0%, 100% {
    transform: translateX(0) translateY(0);
  }
  50% {
    transform: translateX(20px) translateY(-20px);
  }
}

/* Add ambient particles */
.verify-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(2px 2px at 20% 30%, rgba(255, 179, 71, 0.2), transparent),
    radial-gradient(2px 2px at 60% 70%, rgba(255, 107, 53, 0.2), transparent),
    radial-gradient(2px 2px at 50% 50%, rgba(255, 138, 62, 0.2), transparent),
    radial-gradient(2px 2px at 80% 10%, rgba(255, 179, 71, 0.2), transparent),
    radial-gradient(2px 2px at 90% 60%, rgba(255, 107, 53, 0.2), transparent);
  background-size: 200% 200%;
  animation: sparkle 3s linear infinite;
  z-index: 2;
  pointer-events: none;
}

@keyframes sparkle {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 100% 100%;
  }
}

.verify-container {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 500px;
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.75), rgba(61, 45, 36, 0.75));
  backdrop-filter: blur(30px);
  border: 1px solid rgba(139, 111, 71, 0.6);
  border-radius: 24px;
  padding: 1rem;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.7),
    0 0 40px rgba(255, 138, 62, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
}

@media (max-width: 640px) {
  .verify-container {
    padding: 0.5rem;
  }
}
</style>
