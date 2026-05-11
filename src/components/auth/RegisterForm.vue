<template>
  <form @submit.prevent="handleSubmit" class="register-form">
    <!-- Progress Indicator -->
    <div class="progress-section">
      <div class="progress-header">
        <span class="progress-step">Шаг {{ currentStep }} из 3</span>
        <span class="progress-title">{{ stepTitles[currentStep - 1] }}</span>
      </div>
      <div class="progress-bar">
        <div
          v-for="step in 3"
          :key="step"
          class="progress-segment"
          :class="{ active: step <= currentStep }"
        />
      </div>
    </div>

    <!-- Step 1: Basic Info -->
    <div v-show="currentStep === 1" class="form-step" :class="{ 'step-entering': stepAnimating && currentStep === 1 }">
      <!-- Email -->
      <div class="form-group">
        <label class="form-label">
          Email <span class="required">*</span>
        </label>
        <input
          v-model="form.email"
          type="email"
          placeholder="email@example.com"
          class="form-input"
          :class="{ 'has-error': errors.email }"
          @blur="checkEmail"
        />
        <p v-if="errors.email" class="error-text">{{ errors.email }}</p>
      </div>

      <!-- Password -->
      <div class="form-group">
        <label class="form-label">
          Пароль <span class="required">*</span>
        </label>
        <div class="input-wrapper">
          <input
            v-model="form.password"
            :type="showPassword ? 'text' : 'password'"
            placeholder="Минимум 8 символов"
            class="form-input"
            :class="{ 'has-error': errors.password }"
          />          <button type="button" @click="showPassword = !showPassword" class="toggle-password">
            <svg class="toggle-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path v-if="showPassword" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
              <path v-else stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
            </svg>
          </button>
        </div>
        <p v-if="errors.password" class="error-text">{{ errors.password }}</p>
        <!-- Password Strength -->
        <div v-if="form.password" class="strength-meter">
          <div class="strength-bar">
            <div
              v-for="i in 4"
              :key="i"
              class="strength-segment"
              :class="{ [`strength-${passwordStrength}`]: passwordStrength >= i }"
            />
          </div>
          <p class="strength-text" :class="`strength-${passwordStrength}`">
            {{ strengthLabels[passwordStrength - 1] || 'Очень слабый' }}
          </p>
        </div>
      </div>

      <!-- Confirm Password -->
      <div class="form-group">
        <label class="form-label">
          Подтверждение пароля <span class="required">*</span>
        </label>
        <input
          v-model="form.confirmPassword"
          :type="showPassword ? 'text' : 'password'"
          placeholder="Повторите пароль"
          class="form-input"
          :class="{ 'has-error': errors.confirmPassword }"
        />
        <p v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</p>
      </div>
    </div>

    <!-- Step 2: Profile -->
    <div v-show="currentStep === 2" class="form-step" :class="{ 'step-entering': stepAnimating && currentStep === 2 }">
      <!-- Nickname -->
      <div class="form-group">
        <label class="form-label">
          Никнейм <span class="required">*</span>
        </label>
        <input
          v-model="form.nickname"
          type="text"
          placeholder="3-30 символов, рус/лат буквы, цифры, _"
          class="form-input"
          :class="{ 'has-error': errors.nickname }"
          @blur="checkNickname"
        />
        <p v-if="errors.nickname" class="error-text">{{ errors.nickname }}</p>
      </div>

      <!-- Phone -->
      <div class="form-group">
        <label class="form-label">
          Телефон <span class="required">*</span>
        </label>
        <input
          v-model="form.phone"
          v-maska
          data-maska="+7 (###) ###-##-##"
          type="tel"
          placeholder="+7 (XXX) XXX-XX-XX"
          class="form-input"
          :class="{ 'has-error': errors.phone }"
        />
        <p v-if="errors.phone" class="error-text">{{ errors.phone }}</p>
      </div>

      <!-- Telegram -->
      <TelegramInput
        v-model="form.telegram"
        label="Telegram"
        :required="true"
        :has-error="!!errors.telegram"
        :error-message="errors.telegram"
        @converted="handleTelegramConverted"
      />
    </div>

    <!-- Step 3: Additional -->
    <div v-show="currentStep === 3" class="form-step" :class="{ 'step-entering': stepAnimating && currentStep === 3 }">
      <!-- Avatar Upload -->
      <div class="form-group">
        <label class="form-label">Аватар</label>
        <div
          class="avatar-upload"
          :class="{ dragging: isDragging }"
          @click="triggerFileInput"
          @dragover.prevent="isDragging = true"
          @dragleave="isDragging = false"
          @drop.prevent="handleDrop"
        >
          <input
            ref="fileInput"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            class="hidden"
            @change="handleFileSelect"
          />
          <div v-if="avatarPreview" class="avatar-preview">
            <img :src="avatarPreview" alt="Preview" />
          </div>
          <p class="upload-text">
            {{ avatarPreview ? 'Нажмите чтобы заменить' : 'Перетащите файл или нажмите' }}
          </p>
          <p class="upload-hint">JPG, PNG, WebP до 5MB</p>
          <div class="badge-warning">
            <svg class="warning-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
            </svg>
            <span>Этот аватар будет напечатан на вашем физическом бейджике!</span>
          </div>
        </div>
        <p v-if="errors.avatar" class="error-text">{{ errors.avatar }}</p>
      </div>

      <!-- Description -->
      <div class="form-group">
        <label class="form-label">О себе</label>
        <textarea
          v-model="form.description"
          rows="3"
          maxlength="500"
          placeholder="Расскажи о себе..."
          class="form-input form-textarea"
        />
        <p class="char-count">{{ form.description.length }}/500</p>
      </div>

      <!-- Pet -->
      <div class="form-group">
        <label class="checkbox-label special">
          <input v-model="form.bringingPet" type="checkbox" class="checkbox" />
          <span>Планирую взять с собой питомца</span>
        </label>
        <div v-if="form.bringingPet" class="conditional-field">
          <textarea
            v-model="form.petDescription"
            rows="2"
            maxlength="300"
            placeholder="Опишите животное (вид, порода, кличка, особенности)..."
            class="form-input form-textarea"
          />
          <p class="char-count">{{ form.petDescription.length }}/300</p>
        </div>
      </div>

      <!-- Consent Oaths -->
      <div class="oaths-group">
        <div class="oaths-header">
          <svg class="oaths-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
          </svg>
          <span>Клятвы участника</span>
        </div>

        <label class="oath-label" :class="{ checked: form.confirmAge, error: errors.confirmAge }">
          <input v-model="form.confirmAge" type="checkbox" class="oath-input" />
          <span class="oath-box">
            <svg class="oath-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
          <span class="oath-text">
            Подтверждаю, что мне исполнилось 18 лет
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.confirmAge" class="error-text oath-error">{{ errors.confirmAge }}</p>

        <label class="oath-label" :class="{ checked: form.agreeRules, error: errors.agreeRules }">
          <input v-model="form.agreeRules" type="checkbox" class="oath-input" />
          <span class="oath-box">
            <svg class="oath-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
          <span class="oath-text">
            Согласен с <a href="#" @click.prevent="showRulesModal = true">правилами конвента</a>
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.agreeRules" class="error-text oath-error">{{ errors.agreeRules }}</p>

        <label class="oath-label" :class="{ checked: form.agreePrivacy, error: errors.agreePrivacy }">
          <input v-model="form.agreePrivacy" type="checkbox" class="oath-input" />
          <span class="oath-box">
            <svg class="oath-check" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="3" d="M5 13l4 4L19 7"/>
            </svg>
          </span>
          <span class="oath-text">
            Согласен на <a href="#" @click.prevent="showPrivacyModal = true">обработку персональных данных</a>
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.agreePrivacy" class="error-text oath-error">{{ errors.agreePrivacy }}</p>
      </div>

      <!-- Email Notification Info -->
      <div class="info-notice">
        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>На указанный email будет отправлен статус подтверждения вашей заявки. Если письмо не пришло — проверьте папку «Спам»</p>
      </div>
    </div>

    <!-- Yandex SmartCaptcha (показывается на шаге 3) -->
    <div v-if="currentStep === 3" class="captcha-wrapper">
      <YandexSmartCaptcha
        ref="captchaRef"
        :siteKey="captchaSiteKey"
        @verify="handleCaptchaVerify"
        @error="handleCaptchaError"
        @expired="handleCaptchaExpired"
      />
      <p v-if="captchaError" class="error-text">{{ captchaError }}</p>
      <p class="vpn-hint">Если капча не загружается, рекомендуем отключить VPN</p>
    </div>

    <!-- Server Error -->
    <div v-if="serverError" class="server-error">
      <p>{{ serverError }}</p>
    </div>

    <!-- Navigation Buttons -->
    <div class="form-buttons">
      <button v-if="currentStep > 1" type="button" @click="prevStep" class="btn btn-secondary">
        Назад
      </button>
      <button v-if="currentStep < 3" type="button" @click="nextStep" :disabled="isStepTransitioning" class="btn btn-primary">
        <svg v-if="isStepTransitioning" class="spinner" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        {{ isStepTransitioning ? 'Проверка...' : 'Далее' }}
      </button>
      <button v-else type="submit" :disabled="isLoading" class="btn btn-primary">
        <svg v-if="isLoading" class="spinner" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
        </svg>
        {{ isLoading ? 'Регистрация...' : 'Зарегистрироваться' }}
      </button>
    </div>
  </form>

  <!-- Success Modal -->
  <Teleport to="body">
    <div v-if="showSuccessModal" class="success-overlay">
      <div class="success-modal">
        <!-- Animated Background -->
        <div class="modal-glow"></div>

        <!-- Icon with animation -->
        <div class="success-icon-wrapper">
          <div class="success-icon-bg"></div>
          <svg class="success-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
          </svg>
          <div class="success-particles">
            <span v-for="i in 8" :key="i" class="particle"></span>
          </div>
        </div>

        <!-- Content -->
        <h3 class="success-title">Регистрация успешна! 🎉</h3>
        <p class="success-text">
          Мы отправили 6-значный код подтверждения на вашу почту.<br>
          Введите код из письма для активации аккаунта.
        </p>

        <!-- Email hint -->
        <div class="status-badge email-badge">
          <svg class="email-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="width: 20px; height: 20px; margin-right: 8px;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
          </svg>
          Проверьте папку "Спам", если письмо не пришло
        </div>

        <!-- Button -->
        <button type="button" @click.stop="redirectToLogin" class="success-btn">
          <svg class="btn-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"/>
          </svg>
          Перейти ко входу
        </button>
      </div>
    </div>
  </Teleport>

  <!-- Rules Modal -->
  <Teleport to="body">
    <div v-if="showRulesModal" class="rules-overlay" @click="showRulesModal = false">
      <div class="rules-modal" @click.stop>
        <div class="rules-header">
          <div class="rules-header-content">
            <div class="rules-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
              </svg>
            </div>
            <div>
              <h3>Правила конвента TourFurr 2026</h3>
              <p class="rules-subtitle">Пожалуйста, ознакомьтесь перед участием</p>
            </div>
          </div>
          <button @click="showRulesModal = false" class="rules-close-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <div class="rules-content">
          <div class="rules-date-card">
            <svg class="date-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
            </svg>
            <div>
              <strong>г. Москва</strong>
              <span>Версия от «01» января 2026 г.</span>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4>1. Общие положения</h4>
            </div>
            <div class="rule-card-content">
              <p>1.1. Настоящие Правила регулируют порядок участия в мероприятии TourFurr 2026 (далее — Конвент).</p>
              <p>1.2. Участие в Конвенте означает полное и безоговорочное согласие участника с настоящими Правилами.</p>
              <p>1.3. Организаторы вправе отказать в участии или удалить участника с мероприятия при нарушении настоящих Правил без возврата оплаты.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4>2. Возрастные ограничения</h4>
            </div>
            <div class="rule-card-content">
              <p>2.1. К участию в Конвенте допускаются лица, достигшие 18 лет на момент начала мероприятия.</p>
              <p>2.2. При регистрации и на входе может быть запрошен документ, удостоверяющий личность.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                </svg>
              </div>
              <h4>3. Правила поведения</h4>
            </div>
            <div class="rule-card-content">
              <p>3.1. <strong>Уважение к участникам:</strong> Запрещены любые формы дискриминации, harassment, буллинга по признаку расы, национальности, пола, сексуальной ориентации, религии или иным признакам.</p>
              <p>3.2. <strong>Фотографирование:</strong> Фото- и видеосъемка других участников разрешена только с их явного согласия. Запрещена съемка в раздевалках, душевых и туалетах.</p>
              <p>3.3. <strong>Физический контакт:</strong> Любые прикосновения, объятия и физический контакт допустимы только с явного согласия другого участника.</p>
              <p>3.4. <strong>Алкоголь и вещества:</strong> Запрещено появление на мероприятии в состоянии алкогольного или наркотического опьянения. Употребление алкоголя допускается только в отведенных местах и в умеренных количествах.</p>
              <p>3.5. <strong>Безопасность:</strong> Соблюдайте правила пожарной безопасности, не блокируйте эвакуационные выходы.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4>4. Дресс-код и фурсьюты</h4>
            </div>
            <div class="rule-card-content">
              <p>4.1. Участники могут носить фурсьюты, частичные костюмы (partial suits), маски и аксессуары.</p>
              <p>4.2. Обязательно соблюдение правил гигиены при ношении костюмов.</p>
              <p>4.3. В помещениях с повышенной температурой (сауна, бассейн) фурсьюты могут быть запрещены по соображениям безопасности.</p>
              <p>4.4. Запрещено ношение костюмов и атрибутики, содержащих нацистскую, экстремистскую или оскорбительную символику.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"/>
                </svg>
              </div>
              <h4>5. Животные-компаньоны (петы)</h4>
            </div>
            <div class="rule-card-content">
              <p>5.1. Участники могут привозить домашних животных с обязательным указанием в регистрационной форме.</p>
              <p>5.2. Животные должны быть привиты, иметь ветеринарный паспорт.</p>
              <p>5.3. Владелец несет полную ответственность за поведение животного, его гигиену и возможный ущерб.</p>
              <p>5.4. Животные должны находиться под присмотром владельца и не должны создавать дискомфорт другим участникам.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/>
                </svg>
              </div>
              <h4>6. Контент и материалы</h4>
            </div>
            <div class="rule-card-content">
              <p>6.1. Запрещено размещение, демонстрация или распространение материалов:</p>
              <ul>
                <li>Содержащих детскую порнографию или эксплуатацию несовершеннолетних</li>
                <li>Пропагандирующих насилие, жестокость, экстремизм</li>
                <li>Нарушающих авторские права</li>
                <li>Порнографического содержания в общедоступных зонах</li>
              </ul>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
                </svg>
              </div>
              <h4>7. Коммерческая деятельность</h4>
            </div>
            <div class="rule-card-content">
              <p>7.1. Продажа товаров и услуг на территории Конвента разрешена только в специально отведенных местах (Artist Alley, Dealers Den) и по согласованию с организаторами.</p>
              <p>7.2. Запрещена несанкционированная реклама и промо-акции.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
              </div>
              <h4>8. Ответственность и безопасность</h4>
            </div>
            <div class="rule-card-content">
              <p>8.1. Организаторы не несут ответственности за утерю, кражу или порчу личного имущества участников.</p>
              <p>8.2. Участник обязан бережно относиться к имуществу площадки проведения мероприятия.</p>
              <p>8.3. В случае порчи имущества площадки участник обязан возместить причиненный ущерб.</p>
              <p>8.4. При обнаружении подозрительных предметов, угроз безопасности немедленно сообщайте организаторам или службе безопасности.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
              </div>
              <h4>9. Санкции за нарушения</h4>
            </div>
            <div class="rule-card-content">
              <p>9.1. В зависимости от серьезности нарушения организаторы имеют право:</p>
              <ul>
                <li>Вынести устное предупреждение</li>
                <li>Временно ограничить доступ к отдельным активностям</li>
                <li>Удалить участника с мероприятия без возврата средств</li>
                <li>Запретить участие в будущих мероприятиях</li>
                <li>Обратиться в правоохранительные органы (при серьезных правонарушениях)</li>
              </ul>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <h4>10. Прочие условия</h4>
            </div>
            <div class="rule-card-content">
              <p>10.1. Организаторы вправе вносить изменения в Правила и программу мероприятия.</p>
              <p>10.2. Организаторы могут производить фото- и видеосъемку мероприятия для публикации в открытых источниках. Если вы не хотите попасть в кадр, сообщите об этом оператору или организаторам.</p>
              <p>10.3. В случае форс-мажорных обстоятельств (пандемия, стихийные бедствия и т.п.) мероприятие может быть отменено или перенесено. Условия возврата средств будут сообщены отдельно.</p>
            </div>
          </div>

          <div class="rule-card">
            <div class="rule-card-header">
              <div class="rule-icon" style="background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                </svg>
              </div>
              <h4>11. Контакты</h4>
            </div>
            <div class="rule-card-content">
              <p>11.1. При возникновении конфликтных ситуаций, вопросов или проблем обращайтесь к сотрудникам с бейджами "STAFF" или "ОРГАНИЗАТОР".</p>
              <p>11.2. Контактный email: <a href="mailto:info@tourfurr.ru">info@tourfurr.ru</a></p>
            </div>
          </div>

          <div class="rules-footer-card">
            <svg class="footer-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5"/>
            </svg>
            <p><em>Приятного времяпрепровождения на TourFurr 2026! 🐾</em></p>
          </div>
        </div>

        <div class="rules-footer">
          <button @click="showRulesModal = false" class="rules-close-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Понятно, закрыть</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>

  <!-- Privacy Policy Modal -->
  <Teleport to="body">
    <div v-if="showPrivacyModal" class="privacy-overlay" @click="showPrivacyModal = false">
      <div class="privacy-modal" @click.stop>
        <!-- Header -->
        <div class="privacy-header">
          <div class="privacy-header-content">
            <div class="privacy-header-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
            </div>
            <div>
              <h3>Политика обработки персональных данных</h3>
              <p class="privacy-subtitle">TourFurr 2026 — г. Москва, «01» января 2026 г.</p>
            </div>
          </div>
          <button @click="showPrivacyModal = false" class="privacy-close-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        <!-- Content -->
        <div class="privacy-content">
          <!-- Section 1 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4>1. Общие положения</h4>
            </div>
            <div class="privacy-card-content">
              <p>1.1. Настоящая Политика конфиденциальности персональных данных (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей (далее — Пользователь) организаторами мероприятия TourFurr 2026 (далее — Организаторы) при использовании ими сайта и регистрации на мероприятие.</p>
              <p>1.2. Использование Пользователем сайта и сервисов регистрации означает безоговорочное согласие с настоящей Политикой и указанными в ней условиями обработки его персональных данных.</p>
              <p>1.3. Настоящая Политика применяется исключительно к сайту TourFurr 2026.</p>
            </div>
          </div>

          <!-- Section 2 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
              </div>
              <h4>2. Основные понятия</h4>
            </div>
            <div class="privacy-card-content">
              <p><strong>Организаторы (Оператор персональных данных)</strong> — уполномоченные представители мероприятия TourFurr 2026.</p>
              <p><strong>Персональные данные</strong> — любая информация, относящаяся к прямо или косвенно определённому физическому лицу.</p>
              <p><strong>Обработка персональных данных</strong> — любые действия с персональными данными: сбор, хранение, использование, передача, уничтожение.</p>
              <p><strong>Конфиденциальность</strong> — обязательное требование не допускать распространения данных без согласия субъекта.</p>
            </div>
          </div>

          <!-- Section 3 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                </svg>
              </div>
              <h4>3. Перечень обрабатываемых данных</h4>
            </div>
            <div class="privacy-card-content">
              <p>При регистрации собираются следующие данные:</p>
              <ul>
                <li>Адрес электронной почты (e-mail);</li>
                <li>Никнейм (псевдоним);</li>
                <li>Номер телефона;</li>
                <li>Идентификатор в мессенджере Telegram;</li>
                <li>Фотография (аватар);</li>
                <li>Дополнительные сведения о себе, информация о сопровождающих питомцах.</li>
              </ul>
              <p>Автоматически собираются данные о подключении (IP-адрес, cookies, данные браузера и устройства).</p>
            </div>
          </div>

          <!-- Section 4 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/>
                </svg>
              </div>
              <h4>4. Цели обработки персональных данных</h4>
            </div>
            <div class="privacy-card-content">
              <ul>
                <li>Регистрация и идентификация участника мероприятия TourFurr 2026;</li>
                <li>Связь с участником и отправка уведомлений о мероприятии;</li>
                <li>Обеспечение безопасности во время мероприятия;</li>
                <li>Печать бейджей и атрибутики;</li>
                <li>Выполнение обязательств, предусмотренных законодательством РФ.</li>
              </ul>
            </div>
          </div>

          <!-- Section 5 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3"/>
                </svg>
              </div>
              <h4>5. Правовые основания</h4>
            </div>
            <div class="privacy-card-content">
              <ul>
                <li>Статья 6 Федерального закона № 152-ФЗ «О персональных данных»;</li>
                <li>Согласие Пользователя (заполнение формы регистрации);</li>
                <li>Уставные документы Организаторов;</li>
                <li>Договоры между Организаторами и Пользователем.</li>
              </ul>
            </div>
          </div>

          <!-- Section 6 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"/>
                </svg>
              </div>
              <h4>6. Порядок обработки и передачи данных</h4>
            </div>
            <div class="privacy-card-content">
              <p>6.1. Обработка ведётся законными способами — автоматизированными и неавтоматизированными.</p>
              <p>6.2. Организаторы не раскрывают данные третьим лицам без согласия Пользователя, если иное не предусмотрено законом.</p>
              <p>6.3. Передача третьим лицам допускается при наличии согласия, необходимости выполнения целей (например, печать бейджей) или требований закона.</p>
              <p>6.4. Обработка осуществляется на территории Российской Федерации.</p>
            </div>
          </div>

          <!-- Section 7 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #a1c4fd 0%, #c2e9fb 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4>7. Сроки хранения данных</h4>
            </div>
            <div class="privacy-card-content">
              <p>7.1. Данные обрабатываются в течение срока, необходимого для достижения целей, указанных в разделе 4.</p>
              <p>7.2. После достижения целей данные уничтожаются или обезличиваются, если иное не предусмотрено законом.</p>
            </div>
          </div>

          <!-- Section 8 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h4>8. Права субъектов персональных данных</h4>
            </div>
            <div class="privacy-card-content">
              <p>Вы вправе:</p>
              <ul>
                <li>Получить полный доступ к своим данным и их копиям;</li>
                <li>Уточнить, заблокировать или уничтожить свои данные;</li>
                <li>Отозвать согласие на обработку персональных данных;</li>
                <li>Принять предусмотренные законом меры по защите своих прав.</li>
              </ul>
            </div>
          </div>

          <!-- Section 9 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                </svg>
              </div>
              <h4>9. Защита персональных данных</h4>
            </div>
            <div class="privacy-card-content">
              <p>9.1. Организаторы принимают технические и организационные меры для защиты данных от несанкционированного доступа, изменения, копирования и уничтожения.</p>
              <p>9.2. Меры включают: шифрование данных, регламентированный доступ, антивирусную защиту и системы обнаружения вторжений.</p>
            </div>
          </div>

          <!-- Section 10 -->
          <div class="privacy-card">
            <div class="privacy-card-header">
              <div class="privacy-icon" style="background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/>
                </svg>
              </div>
              <h4>10. Заключительные положения</h4>
            </div>
            <div class="privacy-card-content">
              <p>10.1. Организаторы вправе вносить изменения в настоящую Политику.</p>
              <p>10.2. К Политике применяется право Российской Федерации.</p>
              <p>10.3. Споры разрешаются в судебном порядке по месту нахождения Организаторов.</p>
              <p>10.4. По вопросам обработки данных: <a href="mailto:privacy@tourfurr.ru">privacy@tourfurr.ru</a></p>
            </div>
          </div>

          <!-- Footer card -->
          <div class="privacy-footer-card">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" style="width:36px;height:36px;color:var(--fire-glow);margin-bottom:0.5rem;flex-shrink:0">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
            </svg>
            <p><em>Документ составлен с учётом требований Федерального закона от 27.07.2006 г. № 152-ФЗ «О персональных данных». 🐾</em></p>
          </div>
        </div>

        <!-- Footer button -->
        <div class="privacy-footer">
          <button @click="showPrivacyModal = false" class="privacy-close-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
            </svg>
            <span>Понятно, закрыть</span>
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { vMaska } from 'maska/vue'
import { useAuthStore } from '../../stores/auth'
import { verifyTurnstileToken } from '../../utils/turnstile'
import TelegramInput from './TelegramInput.vue'
import YandexSmartCaptcha from '../common/YandexSmartCaptcha.vue'
import * as yup from 'yup'
import { useToast } from '../../composables/useToast'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const isStepTransitioning = ref(false)
const stepAnimating = ref(false)
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')
const showSuccessModal = ref(false)
const showPrivacyModal = ref(false)
const showRulesModal = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)

const toast = useToast()

// Trigger CSS enter-animation whenever the active step changes
watch(currentStep, () => {
  stepAnimating.value = true
  setTimeout(() => { stepAnimating.value = false }, 320)
})

// Yandex SmartCaptcha state
const captchaSiteKey = import.meta.env.VITE_SMARTCAPTCHA_SITE_KEY || ''
const captchaToken = ref<string | null>(null)
const captchaError = ref('')
const captchaRef = ref<InstanceType<typeof YandexSmartCaptcha> | null>(null)
const EMAIL_VERIFY_CODE_STORAGE_PREFIX = 'verify_code_'

const stepTitles = ['Основное', 'Профиль', 'Дополнительно']

const form = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  telegram: '',
  telegramConverted: '',
  avatar: null as File | null,
  description: '',
  bringingPet: false,
  petDescription: '',
  confirmAge: false,
  agreeRules: false,
  agreePrivacy: false
})

const errors = reactive({
  email: '',
  password: '',
  confirmPassword: '',
  nickname: '',
  phone: '',
  telegram: '',
  avatar: '',
  confirmAge: '',
  agreeRules: '',
  agreePrivacy: ''
})

// Password strength calculation (required: 8+, uppercase, digit; special chars = bonus)
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength++
  if (/[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++ // bonus
  return strength
})

const strengthLabels = ['Слабый', 'Средний', 'Хороший', 'Отличный']

// Validation schemas per step
const step1Schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string()
    .required('Пароль обязателен')
    .min(8, 'Минимум 8 символов'),
  confirmPassword: yup.string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
})

const step2Schema = yup.object({
  nickname: yup.string()
    .required('Никнейм обязателен')
    .min(3, 'Минимум 3 символа')
    .max(30, 'Максимум 30 символов')
    .matches(/^[a-zA-Zа-яёА-ЯЁ0-9_ ]+$/, 'Только буквы (рус/лат), цифры, пробел и подчеркивание'),
  phone: yup.string()
    .required('Телефон обязателен')
    .matches(/^\+7 \(\d{3}\) \d{3}-\d{2}-\d{2}$/, 'Неверный формат телефона'),
  telegram: yup.string()
    .required('Telegram обязателен')
    .matches(/^[a-zA-Z0-9_@\/\.:]+$/, 'Telegram должен содержать только латинские буквы, цифры и подчеркивание')
    .test('valid-telegram', 'Telegram должен содержать только латинские символы', function(value) {
      if (!value) return false
      // Extract username from various formats
      let username = value.replace(/^https?:\/\//, '').replace(/^t\.me\//, '').replace(/^@/, '')
      return /^[a-zA-Z0-9_]+$/.test(username)
    })
})

const step3Schema = yup.object({
  confirmAge: yup.boolean().oneOf([true], 'Необходимо подтвердить возраст 18+'),
  agreeRules: yup.boolean().oneOf([true], 'Необходимо согласиться с правилами'),
  agreePrivacy: yup.boolean().oneOf([true], 'Необходимо дать согласие')
})

function clearErrors() {
  Object.keys(errors).forEach(key => {
    (errors as any)[key] = ''
  })
}

async function validateStep(step: number) {
  clearErrors()
  const schemas = [step1Schema, step2Schema, step3Schema]

  try {
    await schemas[step - 1].validate(form, { abortEarly: false })
    return true
  } catch (err: any) {
    err.inner.forEach((e: any) => {
      if (e.path in errors) {
        (errors as any)[e.path] = e.message
      }
    })
    return false
  }
}

async function nextStep() {
  if (isStepTransitioning.value) return
  isStepTransitioning.value = true
  try {
    if (await validateStep(currentStep.value)) {
      // On step 1 → 2 transition, verify email uniqueness before proceeding
      if (currentStep.value === 1 && form.email) {
        await checkEmail()
        if (errors.email) return
      }
      if (currentStep.value < 3) {
        currentStep.value++
      }
    }
  } finally {
    isStepTransitioning.value = false
  }
}

function prevStep() {
  currentStep.value--
}

async function checkEmail() {
  const normalizedEmail = form.email.trim().toLowerCase()

  if (!normalizedEmail) {
    errors.email = ''
    return
  }

  form.email = normalizedEmail
  errors.email = ''
  const isUnique = await authStore.checkEmailUnique(normalizedEmail)
  if (!isUnique) {
    errors.email = 'Этот email уже зарегистрирован'
  }
}

async function checkNickname() {
  const normalizedNickname = form.nickname.trim()

  if (!normalizedNickname) {
    errors.nickname = '' // Clear error if field is empty
    return
  }

  form.nickname = normalizedNickname
  errors.nickname = '' // Clear previous error before checking
  const isUnique = await authStore.checkNicknameUnique(normalizedNickname)
  if (!isUnique) {
    errors.nickname = 'Этот никнейм уже занят'
  }
}

function handleTelegramConverted(value: string) {
  form.telegramConverted = value
}

function triggerFileInput() {
  fileInput.value?.click()
}

function handleFileSelect(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  if (file) processFile(file)
}

function handleDrop(event: DragEvent) {
  isDragging.value = false
  const file = event.dataTransfer?.files[0]
  if (file) processFile(file)
}

function processFile(file: File) {
  // Validate file size first
  if (file.size > 5 * 1024 * 1024) {
    errors.avatar = 'Файл слишком большой (макс. 5MB)'
    return
  }

  // Check MIME type OR extension (some files may have incorrect MIME type)
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  const validExtensions = ['.jpg', '.jpeg', '.png', '.webp']
  const ext = file.name.lastIndexOf('.') > -1
    ? file.name.slice(file.name.lastIndexOf('.')).toLowerCase()
    : ''

  const hasValidMime = validTypes.includes(file.type)
  const hasValidExt = validExtensions.includes(ext)

  if (!hasValidMime && !hasValidExt) {
    errors.avatar = 'Недопустимый формат файла. Разрешены: JPG, PNG, WebP'
    return
  }

  form.avatar = file
  errors.avatar = ''

  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    avatarPreview.value = e.target?.result as string
  }
  reader.readAsDataURL(file)
}

// SmartCaptcha handlers
function handleCaptchaVerify(token: string) {
  captchaToken.value = token
  captchaError.value = ''
}

function handleCaptchaError(error: string) {
  captchaToken.value = null
  captchaError.value = error || 'Ошибка проверки. Попробуйте еще раз'
}

function handleCaptchaExpired() {
  captchaToken.value = null
  captchaError.value = 'Проверка истекла. Пожалуйста, пройдите проверку снова'
}

async function handleSubmit() {
  if (!(await validateStep(3))) return

  // Проверка SmartCaptcha
  if (!captchaToken.value) {
    // Fallback: try to get the token directly from the widget
    const directToken = captchaRef.value?.getResponse()
    if (directToken) {
      captchaToken.value = directToken
    } else {
      captchaError.value = 'Пожалуйста, пройдите проверку безопасности'
      return
    }
  }

  // Server-side CAPTCHA verification
  const isCaptchaValid = await verifyTurnstileToken(captchaToken.value)

  if (!isCaptchaValid) {
    captchaError.value = 'Проверка CAPTCHA не пройдена. Попробуйте снова.'
    captchaToken.value = null
    return
  }

  serverError.value = ''
  captchaError.value = ''
  isLoading.value = true

  const result = await authStore.register({
    email: form.email,
    password: form.password,
    nickname: form.nickname,
    phone: form.phone,
    telegram: form.telegramConverted || form.telegram,
    avatar: form.avatar || undefined,
    description: form.description,
    bringingPet: form.bringingPet,
    petDescription: form.petDescription,
    agreeRules: form.agreeRules,
    agreePrivacy: form.agreePrivacy
  })

  isLoading.value = false

  if (result.success) {
    captchaToken.value = null
    captchaRef.value?.reset()

    if (result.emailSent) {
      toast.success('Код подтверждения отправлен на ваш email!')
    } else {
      toast.info('Регистрация успешна! Подтвердите email для входа.')
    }

    // Redirect to email verification page
    router.push({
      path: '/auth/verify-email',
      query: {
        email: result.email,
        emailSent: result.emailSent ? 'true' : 'false',
        ...(result.emailError ? { emailError: result.emailError } : {})
      }
    })
  } else {
    const msg = result.error || 'Ошибка регистрации'
    serverError.value = msg
    toast.error(msg)
  }
}

function redirectToLogin() {
  showSuccessModal.value = false
  router.push('/auth')
}
</script>

<style scoped>
/* Form Base */
.register-form {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

/* Progress Section */
.progress-section {
  margin-bottom: 0.5rem;
}

.progress-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.progress-step,
.progress-title {
  font-size: 0.8rem;
  color: var(--sage);
}

.progress-bar {
  display: flex;
  gap: 0.5rem;
}

.progress-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--moss);
  transition: all 0.3s ease;
}

.progress-segment.active {
  background: linear-gradient(90deg, var(--fire), var(--fire-glow));
}

/* Form Steps */
.form-step {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Step enter animation (fired by stepAnimating watcher) */
@keyframes stepFadeSlide {
  from {
    opacity: 0;
    transform: translateY(12px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.step-entering {
  animation: stepFadeSlide 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94) both;
}

/* Form Groups */
.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-label {
  font-size: 0.85rem;
  font-weight: 500;
  color: var(--cream);
}

.required {
  color: var(--fire);
}

/* Form Inputs */
.form-input {
  width: 100%;
  padding: 0.75rem 1rem;
  background: rgba(26, 17, 14, 0.6);
  border: 1px solid var(--moss);
  border-radius: 10px;
  color: var(--cream);
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.form-input::placeholder {
  color: var(--sage);
  opacity: 0.7;
}

.form-input:focus {
  outline: none;
  border-color: var(--fire);
  box-shadow: 0 0 0 3px rgba(255, 107, 53, 0.1);
}

.form-input.has-error {
  border-color: #ef4444;
}

.form-textarea {
  resize: none;
  min-height: 80px;
}

/* Input Wrapper for Password */
.input-wrapper {
  position: relative;
}

.input-wrapper .form-input {
  padding-right: 3rem;
}

.toggle-password {
  position: absolute;
  right: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  color: var(--sage);
  transition: color 0.3s ease;
}

.toggle-password:hover {
  color: var(--cream);
}

.toggle-icon {
  width: 18px;
  height: 18px;
}

/* Error Text */
.error-text {
  font-size: 0.75rem;
  color: #fca5a5;
}

/* Strength Meter */
.strength-meter {
  margin-top: 0.5rem;
}

.strength-bar {
  display: flex;
  gap: 4px;
  margin-bottom: 0.25rem;
}

.strength-segment {
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background: var(--moss);
  transition: all 0.3s ease;
}

.strength-segment.strength-1 { background: #ef4444; }
.strength-segment.strength-2 { background: #f97316; }
.strength-segment.strength-3 { background: #eab308; }
.strength-segment.strength-4 { background: #22c55e; }

.strength-text {
  font-size: 0.75rem;
  color: var(--sage);
}

.strength-text.strength-1 { color: #ef4444; }
.strength-text.strength-2 { color: #f97316; }
.strength-text.strength-3 { color: #eab308; }
.strength-text.strength-4 { color: #22c55e; }

/* Avatar Upload */
.avatar-upload {
  border: 2px dashed var(--moss);
  border-radius: 12px;
  padding: 1.5rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background: rgba(26, 17, 14, 0.4);
}

.avatar-upload:hover,
.avatar-upload.dragging {
  border-color: var(--fire);
  background: rgba(255, 107, 53, 0.05);
}

.avatar-preview {
  margin-bottom: 0.75rem;
}

.avatar-preview img {
  width: 90px;
  height: 90px;
  margin: 0 auto;
  border-radius: 10px;
  object-fit: cover;
  display: block;
}

.upload-text {
  font-size: 0.85rem;
  color: var(--sage);
}

.upload-hint {
  font-size: 0.75rem;
  color: var(--sage);
  opacity: 0.7;
  margin-top: 0.25rem;
}

.badge-warning {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.75rem;
  padding: 0.75rem 1rem;
  background: linear-gradient(135deg, rgba(255, 179, 71, 0.15), rgba(255, 107, 53, 0.15));
  border: 1.5px solid var(--fire-glow);
  border-radius: 10px;
  color: var(--fire-glow);
  font-size: 0.85rem;
  font-weight: 600;
}

.warning-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  color: var(--amber);
}

.char-count {
  text-align: right;
  font-size: 0.75rem;
  color: var(--sage);
}

/* Consent Oaths */
.oaths-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem;
  background: linear-gradient(135deg, rgba(26, 17, 14, 0.6), rgba(42, 31, 26, 0.4));
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 16px;
}

.oaths-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.25);
  font-family: 'Playfair Display', serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--fire-glow);
}

.oaths-icon {
  width: 20px;
  height: 20px;
  flex-shrink: 0;
}

.oath-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.75rem;
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.25s ease;
  border: 1px solid transparent;
}

.oath-label:hover {
  background: rgba(255, 179, 71, 0.06);
  border-color: rgba(139, 111, 71, 0.2);
}

.oath-label.checked {
  background: rgba(34, 197, 94, 0.08);
  border-color: rgba(34, 197, 94, 0.25);
}

.oath-label.error:not(.checked) {
  border-color: rgba(239, 68, 68, 0.4);
  background: rgba(239, 68, 68, 0.05);
}

.oath-input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
  pointer-events: none;
}

.oath-box {
  flex-shrink: 0;
  width: 22px;
  height: 22px;
  margin-top: 1px;
  border: 2px solid rgba(139, 111, 71, 0.5);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s ease;
  background: rgba(26, 17, 14, 0.4);
}

.oath-label:hover .oath-box {
  border-color: var(--fire-glow);
}

.oath-label.checked .oath-box {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-color: var(--fire-glow);
  box-shadow: 0 0 8px rgba(255, 179, 71, 0.3);
}

.oath-check {
  width: 14px;
  height: 14px;
  color: white;
  opacity: 0;
  transform: scale(0.5);
  transition: all 0.2s ease;
}

.oath-label.checked .oath-check {
  opacity: 1;
  transform: scale(1);
}

.oath-text {
  font-size: 0.88rem;
  color: var(--sage);
  line-height: 1.5;
  transition: color 0.25s ease;
}

.oath-label:hover .oath-text {
  color: var(--cream);
}

.oath-label.checked .oath-text {
  color: var(--cream);
}

.oath-text a {
  color: var(--fire-glow);
  text-decoration: none;
  border-bottom: 1px dashed rgba(255, 179, 71, 0.4);
  transition: all 0.2s ease;
}

.oath-text a:hover {
  border-bottom-style: solid;
  border-bottom-color: var(--fire-glow);
}

.oath-error {
  margin-left: 2.75rem;
  font-size: 0.8rem;
}

.conditional-field {
  margin-top: 0.75rem;
  padding: 1rem;
  background: rgba(61, 45, 36, 0.3);
  border-radius: 10px;
  border-left: 3px solid var(--fire-glow);
  animation: slideDown 0.3s ease-out;
}

@keyframes slideDown {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Info Notice */
.info-notice {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 10px;
  margin-top: 0.5rem;
}

.info-notice .info-icon {
  width: 20px;
  height: 20px;
  color: #60a5fa;
  flex-shrink: 0;
  margin-top: 2px;
}

.info-notice p {
  color: var(--sage);
  font-size: 0.85rem;
  line-height: 1.5;
  margin: 0;
}

/* Server Error */
.server-error {
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 10px;
  padding: 0.75rem 1rem;
}

.server-error p {
  font-size: 0.85rem;
  color: #fca5a5;
}

/* Buttons */
.form-buttons {
  display: flex;
  gap: 0.75rem;
}

.btn {
  flex: 1;
  padding: 0.75rem 1rem;
  border-radius: 10px;
  font-family: 'Lora', serif;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  border: none;
}

.btn-primary {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  color: white;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.btn-secondary {
  background: rgba(26, 17, 14, 0.8);
  border: 1px solid var(--moss);
  color: var(--cream);
}

.btn-secondary:hover {
  background: rgba(42, 31, 26, 0.9);
}

.spinner {
  width: 18px;
  height: 18px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}

/* Success Modal */
.success-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
}

.success-modal {
  position: relative;
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.95), rgba(26, 17, 14, 0.98));
  border: 1px solid var(--moss);
  border-radius: 24px;
  padding: 2.5rem;
  max-width: 400px;
  width: 100%;
  text-align: center;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5), 0 0 100px rgba(255, 107, 53, 0.1);
  overflow: hidden;
}

.modal-glow {
  position: absolute;
  top: -50%;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.3), transparent 70%);
  filter: blur(40px);
  animation: pulse-glow 3s ease-in-out infinite;
}

@keyframes pulse-glow {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 0.8; }
}

.success-icon-wrapper {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 1.5rem;
}

.success-icon-bg {
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-radius: 50%;
  animation: icon-pulse 2s ease-in-out infinite;
}

@keyframes icon-pulse {
  0%, 100% { transform: scale(1); opacity: 0.3; }
  50% { transform: scale(1.1); opacity: 0.5; }
}

.success-icon {
  position: relative;
  width: 100%;
  height: 100%;
  padding: 20px;
  color: white;
  z-index: 1;
  animation: check-draw 0.5s ease-out 0.3s both;
}

@keyframes check-draw {
  0% { stroke-dashoffset: 100; opacity: 0; }
  100% { stroke-dashoffset: 0; opacity: 1; }
}

.success-particles {
  position: absolute;
  inset: 0;
}

.success-particles .particle {
  position: absolute;
  width: 6px;
  height: 6px;
  background: var(--fire-glow);
  border-radius: 50%;
  animation: particle-burst 1s ease-out forwards;
}

.success-particles .particle:nth-child(1) { top: 50%; left: 50%; --angle: 0deg; }
.success-particles .particle:nth-child(2) { top: 50%; left: 50%; --angle: 45deg; }
.success-particles .particle:nth-child(3) { top: 50%; left: 50%; --angle: 90deg; }
.success-particles .particle:nth-child(4) { top: 50%; left: 50%; --angle: 135deg; }
.success-particles .particle:nth-child(5) { top: 50%; left: 50%; --angle: 180deg; }
.success-particles .particle:nth-child(6) { top: 50%; left: 50%; --angle: 225deg; }
.success-particles .particle:nth-child(7) { top: 50%; left: 50%; --angle: 270deg; }
.success-particles .particle:nth-child(8) { top: 50%; left: 50%; --angle: 315deg; }

@keyframes particle-burst {
  0% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(0) scale(1); opacity: 1; }
  100% { transform: translate(-50%, -50%) rotate(var(--angle)) translateY(-50px) scale(0); opacity: 0; }
}

.success-title {
  font-family: 'Merriweather', serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: var(--cream);
  margin-bottom: 0.75rem;
}

.success-text {
  color: var(--sage);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
}

.status-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: rgba(255, 179, 71, 0.1);
  border: 1px solid rgba(255, 179, 71, 0.3);
  border-radius: 20px;
  color: var(--fire-glow);
  font-size: 0.85rem;
  margin-bottom: 1.5rem;
}

.status-dot {
  width: 8px;
  height: 8px;
  background: var(--fire-glow);
  border-radius: 50%;
  animation: dot-pulse 1.5s ease-in-out infinite;
}

@keyframes dot-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

.success-btn {
  position: relative;
  width: 100%;
  padding: 14px 24px;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  overflow: hidden;
  transition: all 0.3s ease;
}

.success-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

.success-btn .btn-glow {
  position: absolute;
  inset: 0;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transform: translateX(-100%);
}

.success-btn:hover .btn-glow {
  animation: shimmer 0.8s ease;
}

@keyframes shimmer {
  100% { transform: translateX(100%); }
}

.success-btn .btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.success-btn .btn-icon {
  width: 20px;
  height: 20px;
}

/* Rules Modal - Dark fire theme matching privacy modal */
.rules-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.rules-modal {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 20, 16, 0.98) 0%, rgba(42, 31, 26, 0.98) 100%);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 28px;
  max-width: 900px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 107, 53, 0.08);
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 179, 71, 0.15) 100%);
  border-bottom: 1px solid rgba(139, 111, 71, 0.3);
  position: relative;
  overflow: hidden;
}

.rules-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.rules-header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
}

.rules-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.35);
}

.rules-icon svg {
  width: 28px;
  height: 28px;
  color: #ffffff;
  stroke-width: 2.5;
}

.rules-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cream);
  margin: 0;
}

.rules-subtitle {
  font-size: 0.85rem;
  color: var(--sage);
  margin: 0.25rem 0 0 0;
}

.rules-close-btn {
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: var(--cream);
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.rules-close-btn:hover {
  background: rgba(255, 107, 53, 0.25);
  border-color: var(--fire);
  transform: scale(1.05) rotate(90deg);
}

.rules-close-btn svg {
  width: 22px;
  height: 22px;
  stroke-width: 2.5;
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.75rem 2rem;
}

.rules-content::-webkit-scrollbar {
  width: 8px;
}

.rules-content::-webkit-scrollbar-track {
  background: rgba(26, 17, 14, 0.4);
  border-radius: 8px;
  margin: 6px 0;
}

.rules-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border-radius: 8px;
}

.rules-date-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 179, 71, 0.06) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 16px;
  margin-bottom: 1.5rem;
}

.date-icon {
  width: 40px;
  height: 40px;
  color: var(--fire-glow);
  flex-shrink: 0;
  stroke-width: 2;
}

.rules-date-card div {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.rules-date-card strong {
  font-size: 1rem;
  font-weight: 700;
  color: var(--cream);
}

.rules-date-card span {
  font-size: 0.875rem;
  color: var(--sage);
  font-style: italic;
}

.rule-card {
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.6) 0%, rgba(61, 45, 36, 0.4) 100%);
  border: 1px solid rgba(139, 111, 71, 0.25);
  border-radius: 16px;
  margin-bottom: 1.25rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.rule-card:hover {
  border-color: rgba(255, 107, 53, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.rule-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
  background: rgba(26, 17, 14, 0.3);
}

.rule-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.rule-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
}

.rule-icon svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
  stroke-width: 2.5;
  position: relative;
  z-index: 1;
}

.rule-card-header h4 {
  font-family: 'Lora', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cream);
  margin: 0;
}

.rule-card-content {
  padding: 1.25rem 1.5rem;
  line-height: 1.7;
}

.rule-card-content p {
  margin-bottom: 0.875rem;
  color: var(--sage);
  font-size: 0.9rem;
}

.rule-card-content p:last-child {
  margin-bottom: 0;
}

.rule-card-content p strong {
  color: var(--fire-glow);
  font-weight: 600;
}

.rule-card-content ul {
  margin: 0.5rem 0 0.875rem 0;
  padding-left: 0;
  list-style: none;
}

.rule-card-content li {
  margin-bottom: 0.6rem;
  padding-left: 1.75rem;
  position: relative;
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.6;
}

.rule-card-content li:last-child {
  margin-bottom: 0;
}

.rule-card-content li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.rule-card-content a {
  color: var(--fire-glow);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.rule-card-content a:hover {
  border-bottom-color: var(--fire-glow);
}

.rules-footer-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 179, 71, 0.06) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.footer-icon {
  width: 36px;
  height: 36px;
  color: var(--fire-glow);
  stroke-width: 2;
}

.rules-footer-card p {
  font-size: 0.875rem;
  color: var(--sage);
  margin: 0;
  line-height: 1.6;
}

.rules-footer {
  padding: 1.5rem 2rem;
  background: rgba(26, 17, 14, 0.4);
  border-top: 1px solid rgba(139, 111, 71, 0.25);
}

.rules-close-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.rules-close-button svg {
  width: 20px;
  height: 20px;
  stroke-width: 3;
}

.rules-close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
  filter: brightness(1.1);
}

.rules-close-button:active {
  transform: translateY(0);
}

/* Privacy Modal - Card Design (dark fire theme matching convention rules) */
.privacy-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  animation: fadeIn 0.3s ease;
}

.privacy-modal {
  position: relative;
  background: linear-gradient(135deg, rgba(26, 20, 16, 0.98) 0%, rgba(42, 31, 26, 0.98) 100%);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 28px;
  max-width: 800px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 107, 53, 0.08);
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

.privacy-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.75rem 2rem;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2) 0%, rgba(255, 179, 71, 0.15) 100%);
  border-bottom: 1px solid rgba(139, 111, 71, 0.3);
  position: relative;
  overflow: hidden;
}

.privacy-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -30%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 107, 53, 0.08) 0%, transparent 60%);
  pointer-events: none;
}

.privacy-header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
}

.privacy-header-icon {
  width: 52px;
  height: 52px;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(255, 107, 53, 0.35);
}

.privacy-header-icon svg {
  width: 28px;
  height: 28px;
  color: #ffffff;
  stroke-width: 2.5;
}

.privacy-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--cream);
  margin: 0;
}

.privacy-subtitle {
  font-size: 0.85rem;
  color: var(--sage);
  margin: 0.25rem 0 0 0;
}

.privacy-close-btn {
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.3);
  color: var(--cream);
  cursor: pointer;
  padding: 0.6rem;
  border-radius: 12px;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  flex-shrink: 0;
}

.privacy-close-btn:hover {
  background: rgba(255, 107, 53, 0.25);
  border-color: var(--fire);
  transform: scale(1.05) rotate(90deg);
}

.privacy-close-btn svg {
  width: 22px;
  height: 22px;
  stroke-width: 2.5;
}

.privacy-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.75rem 2rem;
}

.privacy-content::-webkit-scrollbar {
  width: 8px;
}

.privacy-content::-webkit-scrollbar-track {
  background: rgba(26, 17, 14, 0.4);
  border-radius: 8px;
  margin: 6px 0;
}

.privacy-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border-radius: 8px;
}

/* Privacy cards */
.privacy-card {
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.6) 0%, rgba(61, 45, 36, 0.4) 100%);
  border: 1px solid rgba(139, 111, 71, 0.25);
  border-radius: 16px;
  margin-bottom: 1.25rem;
  overflow: hidden;
  transition: all 0.3s ease;
}

.privacy-card:hover {
  border-color: rgba(255, 107, 53, 0.3);
  transform: translateX(4px);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
}

.privacy-card:last-of-type {
  margin-bottom: 0;
}

.privacy-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.2);
  background: rgba(26, 17, 14, 0.3);
}

.privacy-icon {
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.25);
  position: relative;
  overflow: hidden;
}

.privacy-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.2) 0%, transparent 100%);
}

.privacy-icon svg {
  width: 24px;
  height: 24px;
  color: #ffffff;
  stroke-width: 2.5;
  position: relative;
  z-index: 1;
}

.privacy-card-header h4 {
  font-family: 'Lora', serif;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--cream);
  margin: 0;
}

.privacy-card-content {
  padding: 1.25rem 1.5rem;
  line-height: 1.7;
}

.privacy-card-content p {
  margin-bottom: 0.875rem;
  color: var(--sage);
  font-size: 0.9rem;
}

.privacy-card-content p:last-child {
  margin-bottom: 0;
}

.privacy-card-content p strong {
  color: var(--fire-glow);
  font-weight: 600;
}

.privacy-card-content ul {
  margin: 0.5rem 0 0.875rem 0;
  padding-left: 0;
  list-style: none;
}

.privacy-card-content li {
  margin-bottom: 0.6rem;
  padding-left: 1.75rem;
  position: relative;
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.6;
}

.privacy-card-content li:last-child {
  margin-bottom: 0;
}

.privacy-card-content li::before {
  content: '';
  position: absolute;
  left: 0;
  top: 0.5rem;
  width: 8px;
  height: 8px;
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.privacy-card-content a {
  color: var(--fire-glow);
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border-bottom: 1px solid transparent;
}

.privacy-card-content a:hover {
  border-bottom-color: var(--fire-glow);
}

/* Privacy footer card */
.privacy-footer-card {
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.08) 0%, rgba(255, 179, 71, 0.06) 100%);
  border: 1px solid rgba(255, 107, 53, 0.2);
  border-radius: 16px;
  padding: 1.5rem;
  margin-top: 1.5rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.75rem;
}

.privacy-footer-card p {
  font-size: 0.875rem;
  color: var(--sage);
  margin: 0;
  line-height: 1.6;
}

/* Privacy bottom footer */
.privacy-footer {
  padding: 1.5rem 2rem;
  background: rgba(26, 17, 14, 0.4);
  border-top: 1px solid rgba(139, 111, 71, 0.25);
}

.privacy-close-button {
  width: 100%;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, var(--fire) 0%, var(--fire-glow) 100%);
  border: none;
  border-radius: 14px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.privacy-close-button svg {
  width: 20px;
  height: 20px;
  stroke-width: 3;
}

.privacy-close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
}

.privacy-close-button:active {
  transform: translateY(0);
}

@media (max-width: 640px) {
  .privacy-header {
    padding: 1.25rem 1.25rem;
    gap: 0.75rem;
  }

  .privacy-header h3 {
    font-size: 1.2rem;
  }

  .privacy-header-icon {
    width: 44px;
    height: 44px;
  }

  .privacy-content {
    padding: 1.25rem;
  }

  .privacy-card-header {
    padding: 1rem 1.25rem;
  }

  .privacy-card-content {
    padding: 1rem 1.25rem;
  }

  .privacy-footer {
    padding: 1.25rem;
  }
}

/* SmartCaptcha Styles */
.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 1rem 0;
}

.vpn-hint {
  font-size: 0.78rem;
  color: var(--sage);
  opacity: 0.75;
  text-align: center;
}

.captcha-wrapper > div {
  transform: scale(0.95);
  transform-origin: center;
}

@media (max-width: 640px) {
  .captcha-wrapper > div {
    transform: scale(0.85);
  }
}

/* Rules Modal Responsive Styles */
@media (max-width: 768px) {
  .rules-modal {
    max-width: 95%;
    border-radius: 24px;
    max-height: 95vh;
  }

  .rules-header {
    padding: 1.5rem 1.25rem;
    flex-wrap: wrap;
  }

  .rules-header-content {
    gap: 1rem;
  }

  .rules-icon {
    width: 48px;
    height: 48px;
  }

  .rules-icon svg {
    width: 28px;
    height: 28px;
  }

  .rules-header h3 {
    font-size: 1.4rem;
  }

  .rules-subtitle {
    font-size: 0.8rem;
  }

  .rules-close-btn {
    padding: 0.5rem;
  }

  .rules-close-btn svg {
    width: 20px;
    height: 20px;
  }

  .rules-content {
    padding: 1.5rem 1.25rem;
  }

  .rules-date-card {
    padding: 1rem 1.25rem;
    gap: 0.75rem;
  }

  .date-icon {
    width: 32px;
    height: 32px;
  }

  .rules-date-card strong {
    font-size: 0.9rem;
  }

  .rules-date-card span {
    font-size: 0.8rem;
  }

  .rule-card {
    border-radius: 16px;
    margin-bottom: 1.25rem;
  }

  .rule-card-header {
    padding: 1.25rem 1.25rem;
    gap: 0.875rem;
  }

  .rule-icon {
    width: 42px;
    height: 42px;
  }

  .rule-icon svg {
    width: 22px;
    height: 22px;
  }

  .rule-card-header h4 {
    font-size: 1.1rem;
  }

  .rule-card-content {
    padding: 1.25rem;
  }

  .rule-card-content p,
  .rule-card-content li {
    font-size: 0.9rem;
  }

  .rule-card-content li {
    padding-left: 1.5rem;
  }

  .rules-footer-card {
    padding: 1.5rem;
  }

  .footer-icon {
    width: 40px;
    height: 40px;
  }

  .rules-footer-card p {
    font-size: 1rem;
  }

  .rules-footer {
    padding: 1.25rem 1.25rem 1.5rem;
  }

  .rules-close-button {
    padding: 1rem 1.25rem;
    font-size: 0.95rem;
  }

  .rules-close-button svg {
    width: 20px;
    height: 20px;
  }
}

@media (max-width: 480px) {
  .rules-header {
    padding: 1.25rem 1rem;
  }

  .rules-header-content {
    gap: 0.75rem;
  }

  .rules-icon {
    width: 40px;
    height: 40px;
  }

  .rules-icon svg {
    width: 24px;
    height: 24px;
  }

  .rules-header h3 {
    font-size: 1.2rem;
  }

  .rules-subtitle {
    font-size: 0.75rem;
  }

  .rules-content {
    padding: 1.25rem 1rem;
  }

  .rules-date-card {
    padding: 0.875rem 1rem;
    flex-direction: column;
    text-align: center;
  }

  .date-icon {
    width: 28px;
    height: 28px;
  }

  .rule-card-header {
    padding: 1rem;
  }

  .rule-icon {
    width: 36px;
    height: 36px;
  }

  .rule-icon svg {
    width: 20px;
    height: 20px;
  }

  .rule-card-header h4 {
    font-size: 1rem;
  }

  .rule-card-content {
    padding: 1rem;
  }

  .rule-card-content p,
  .rule-card-content li {
    font-size: 0.875rem;
  }

  .rules-footer-card {
    padding: 1.25rem;
  }

  .footer-icon {
    width: 36px;
    height: 36px;
  }

  .rules-footer-card p {
    font-size: 0.95rem;
  }

  .rules-footer {
    padding: 1rem 1rem 1.25rem;
  }

  .rules-close-button {
    padding: 0.875rem 1rem;
    font-size: 0.9rem;
    gap: 0.5rem;
  }

  .rules-close-button svg {
    width: 18px;
    height: 18px;
  }
}
</style>
