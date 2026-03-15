<template>
  <Teleport to="body">
    <div class="toast-wrapper" aria-live="polite" aria-label="Уведомления">
      <TransitionGroup name="toast" tag="div" class="toast-list">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="toast"
          :class="`toast--${toast.type}`"
          role="alert"
          @click="remove(toast.id)"
        >
          <!-- Icon -->
          <span class="toast__icon">
            <!-- success -->
            <svg v-if="toast.type === 'success'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <!-- error -->
            <svg v-else-if="toast.type === 'error'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            <!-- warning -->
            <svg v-else-if="toast.type === 'warning'" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <!-- info -->
            <svg v-else viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </span>

          <p class="toast__message">{{ toast.message }}</p>

          <button
            type="button"
            class="toast__close"
            @click.stop="remove(toast.id)"
            aria-label="Закрыть"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>

          <!-- Progress bar -->
          <div
            class="toast__progress"
            :style="{ animationDuration: `${toast.duration}ms` }"
          ></div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { useToast } from '../../composables/useToast'

const { toasts, remove } = useToast()
</script>

<style scoped>
.toast-wrapper {
  position: fixed;
  top: 1.25rem;
  right: 1.25rem;
  z-index: 9999;
  pointer-events: none;
}

.toast-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  align-items: flex-end;
}

.toast {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  width: min(360px, calc(100vw - 2.5rem));
  padding: 0.9rem 1rem;
  border-radius: 14px;
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  cursor: pointer;
  pointer-events: all;
  position: relative;
  overflow: hidden;
  box-shadow:
    0 8px 32px rgba(0, 0, 0, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.toast:hover {
  transform: translateX(-3px);
  box-shadow:
    0 12px 40px rgba(0, 0, 0, 0.45),
    inset 0 1px 0 rgba(255, 255, 255, 0.12);
}

/* Colours per type */
.toast--success {
  background: linear-gradient(135deg, rgba(17, 35, 20, 0.92) 0%, rgba(21, 45, 26, 0.88) 100%);
  border-color: rgba(34, 197, 94, 0.35);
}
.toast--error {
  background: linear-gradient(135deg, rgba(35, 12, 12, 0.92) 0%, rgba(50, 15, 15, 0.88) 100%);
  border-color: rgba(239, 68, 68, 0.4);
}
.toast--warning {
  background: linear-gradient(135deg, rgba(35, 28, 8, 0.92) 0%, rgba(50, 38, 10, 0.88) 100%);
  border-color: rgba(245, 158, 11, 0.4);
}
.toast--info {
  background: linear-gradient(135deg, rgba(20, 31, 48, 0.92) 0%, rgba(26, 40, 60, 0.88) 100%);
  border-color: rgba(96, 165, 250, 0.35);
}

/* Icon */
.toast__icon {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 1px;
}

.toast__icon svg {
  width: 100%;
  height: 100%;
}

.toast--success .toast__icon { color: #4ade80; }
.toast--error   .toast__icon { color: #f87171; }
.toast--warning .toast__icon { color: #fbbf24; }
.toast--info    .toast__icon { color: #60a5fa; }

/* Message */
.toast__message {
  flex: 1;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #f0ece6;
  margin: 0;
  word-break: break-word;
}

/* Close button */
.toast__close {
  flex-shrink: 0;
  background: none;
  border: none;
  padding: 2px;
  cursor: pointer;
  color: rgba(240, 236, 230, 0.45);
  transition: color 0.2s;
  margin-top: 1px;
}

.toast__close:hover {
  color: rgba(240, 236, 230, 0.9);
}

.toast__close svg {
  width: 16px;
  height: 16px;
}

/* Progress bar */
.toast__progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  width: 100%;
  border-radius: 0 0 14px 14px;
  animation: toast-shrink linear forwards;
  transform-origin: left;
}

.toast--success .toast__progress { background: #4ade80; }
.toast--error   .toast__progress { background: #f87171; }
.toast--warning .toast__progress { background: #fbbf24; }
.toast--info    .toast__progress { background: #60a5fa; }

@keyframes toast-shrink {
  from { transform: scaleX(1); }
  to   { transform: scaleX(0); }
}

/* TransitionGroup animations */
.toast-enter-active {
  transition: all 0.35s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.toast-leave-active {
  transition: all 0.25s cubic-bezier(0.4, 0, 1, 1);
}
.toast-enter-from {
  opacity: 0;
  transform: translateX(120%);
}
.toast-leave-to {
  opacity: 0;
  transform: translateX(120%);
  max-height: 0;
  padding: 0;
  margin: 0;
}
.toast-move {
  transition: transform 0.3s ease;
}

/* Mobile */
@media (max-width: 480px) {
  .toast-wrapper {
    top: auto;
    bottom: 1rem;
    right: 0.75rem;
    left: 0.75rem;
  }

  .toast-list {
    align-items: stretch;
  }

  .toast {
    width: 100%;
  }

  .toast-enter-from,
  .toast-leave-to {
    transform: translateY(120%);
  }
}
</style>
