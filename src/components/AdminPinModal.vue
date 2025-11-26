<template>
  <div v-if="isOpen" class="modal-overlay" @click="closeModal">
    <div class="modal-content" @click.stop>
      <h3>Админ-доступ</h3>
      <p class="modal-subtitle">Введите пин-код для доступа к регистрации</p>

      <input
        v-model="pinInput"
        type="password"
        placeholder="Введите пин-код"
        @keyup.enter="checkPin"
        class="pin-input"
        maxlength="6"
        autofocus
      />

      <p v-if="error" class="error-message">{{ error }}</p>

      <div class="modal-buttons">
        <button @click="checkPin" class="btn-primary">Войти</button>
        <button @click="closeModal" class="btn-secondary">Отмена</button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AdminPinModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      pinInput: '',
      error: ''
    }
  },
  methods: {
    checkPin() {
      // Пин-код для админов (можно изменить)
      const ADMIN_PIN = '2026TF'

      if (this.pinInput === ADMIN_PIN) {
        localStorage.setItem('admin_access', 'true')
        this.$emit('pin-verified')
        this.closeModal()
      } else {
        this.error = 'Неверный пин-код'
        this.pinInput = ''
      }
    },
    closeModal() {
      this.pinInput = ''
      this.error = ''
      this.$emit('close')
    }
  }
}
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

.modal-content {
  background: linear-gradient(
    135deg,
    rgba(42, 31, 26, 0.98) 0%,
    rgba(61, 45, 36, 0.98) 100%
  );
  border: 1px solid rgba(139, 111, 71, 0.5);
  border-radius: 16px;
  padding: 1.5rem;
  max-width: 320px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.8);
  animation: slideDown 0.3s ease;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  color: var(--fire-glow);
  margin-bottom: 0.5rem;
  text-align: center;
}

.modal-subtitle {
  color: var(--sage);
  font-size: 0.85rem;
  margin-bottom: 1.25rem;
  text-align: center;
}

.pin-input {
  width: 100%;
  padding: 0.75rem;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 10px;
  color: var(--cream);
  font-size: 1rem;
  text-align: center;
  letter-spacing: 0.3em;
  transition: all 0.3s ease;
}

.pin-input:focus {
  outline: none;
  border-color: var(--fire-glow);
  box-shadow: 0 0 0 3px rgba(255, 179, 71, 0.2);
}

.pin-input::placeholder {
  letter-spacing: normal;
  color: var(--moss);
}

.error-message {
  color: var(--fire);
  font-size: 0.9rem;
  margin-top: 0.75rem;
  text-align: center;
  animation: shake 0.4s ease;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-10px); }
  75% { transform: translateX(10px); }
}

.modal-buttons {
  display: flex;
  gap: 0.75rem;
  margin-top: 1.25rem;
}

.btn-primary,
.btn-secondary {
  flex: 1;
  padding: 0.625rem 1rem;
  border: none;
  border-radius: 10px;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-primary {
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  color: var(--forest-deep);
}

.btn-primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.btn-secondary {
  background: rgba(93, 74, 58, 0.3);
  color: var(--sage);
  border: 1px solid rgba(139, 111, 71, 0.4);
}

.btn-secondary:hover {
  background: rgba(93, 74, 58, 0.5);
  color: var(--cream);
}
</style>
