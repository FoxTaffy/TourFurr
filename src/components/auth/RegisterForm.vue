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
    <div v-show="currentStep === 1" class="form-step">
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
          />
          <button type="button" @click="showPassword = !showPassword" class="toggle-password">
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
    <div v-show="currentStep === 2" class="form-step">
      <!-- Nickname -->
      <div class="form-group">
        <label class="form-label">
          Никнейм <span class="required">*</span>
        </label>
        <input
          v-model="form.nickname"
          type="text"
          placeholder="3-30 символов"
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
    <div v-show="currentStep === 3" class="form-step">
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

      <!-- Checkboxes -->
      <div class="checkbox-group">
        <label class="checkbox-label">
          <input v-model="form.confirmAge" type="checkbox" class="checkbox" />
          <span>
            Подтверждаю, что мне исполнилось 18 лет
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.confirmAge" class="error-text checkbox-error">{{ errors.confirmAge }}</p>

        <label class="checkbox-label">
          <input v-model="form.agreeRules" type="checkbox" class="checkbox" />
          <span>
            Согласен с <a href="#" @click.prevent="showRulesModal = true">правилами конвента</a>
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.agreeRules" class="error-text checkbox-error">{{ errors.agreeRules }}</p>

        <label class="checkbox-label">
          <input v-model="form.agreePrivacy" type="checkbox" class="checkbox" />
          <span>
            Согласен на <a href="#" @click.prevent="showPrivacyModal = true">обработку персональных данных</a>
            <span class="required">*</span>
          </span>
        </label>
        <p v-if="errors.agreePrivacy" class="error-text checkbox-error">{{ errors.agreePrivacy }}</p>

      </div>

      <!-- Email Notification Info -->
      <div class="info-notice">
        <svg class="info-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
        </svg>
        <p>На указанный email будет отправлен статус подтверждения вашей заявки</p>
      </div>
    </div>

    <!-- Cloudflare Turnstile (показывается на шаге 3) -->
    <div v-if="currentStep === 3" class="captcha-wrapper">
      <CloudflareTurnstile
        :siteKey="turnstilesiteKey"
        theme="dark"
        @verify="handleCaptchaVerify"
        @error="handleCaptchaError"
        @expired="handleCaptchaExpired"
      />
      <p v-if="captchaError" class="error-text">{{ captchaError }}</p>
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
      <button v-if="currentStep < 3" type="button" @click="nextStep" class="btn btn-primary">
        Далее
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
          Мы отправили письмо с подтверждением на вашу почту.<br>
          Пожалуйста, проверьте ваш email и перейдите по ссылке для активации аккаунта.
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
                <li>Порнографического содержания в общедоступных зонах (для 18+ контента предусмотрены специальные помещения)</li>
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
        <div class="modal-header">
          <h3>Политика обработки персональных данных</h3>
          <button @click="showPrivacyModal = false" class="close-btn">
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <div class="modal-content">
          <p class="policy-date">г. Москва<br>«01» января 2026 г.</p>

          <h4>1. Общие положения</h4>
          <p>1.1. Настоящая Политика конфиденциальности персональных данных (далее — Политика) определяет порядок обработки и защиты персональных данных пользователей (далее — Пользователь) организаторами мероприятия TourFurr 2026 (далее — Организаторы) при использовании ими сайта и регистрации на мероприятие.</p>
          <p>1.2. Использование Пользователем сайта и сервисов регистрации означает безоговорочное согласие с настоящей Политикой и указанными в ней условиями обработки его персональных данных. В случае несогласия с этими условиями Пользователь должен немедленно прекратить использование сайта.</p>
          <p>1.3. Настоящая Политика применяется исключительно к сайту TourFurr 2026. Организаторы не несут ответственности за сайты третьих лиц, на которые Пользователь может перейти по ссылкам, доступным на Сайте.</p>

          <h4>2. Основные понятия, используемые в Политике</h4>
          <p>2.1. <strong>Организаторы (Оператор персональных данных)</strong> – уполномоченные представители мероприятия TourFurr 2026, которые организуют и осуществляют обработку персональных данных, а также определяют цели их обработки, состав данных и действия (операции), совершаемые с ними.</p>
          <p>2.2. <strong>Персональные данные</strong> – любая информация, относящаяся к прямо или косвенно определенному, или определяемому физическому лицу (субъекту персональных данных).</p>
          <p>2.3. <strong>Обработка персональных данных</strong> – любое действие (операция) или совокупность действий (операций), совершаемых с персональными данными, включая сбор, запись, систематизацию, накопление, хранение, уточнение (обновление, изменение), извлечение, использование, передачу (распространение, предоставление, доступ), обезличивание, блокирование, удаление, уничтожение персональных данных.</p>
          <p>2.4. <strong>Конфиденциальность персональных данных</strong> – обязательное для соблюдения Организаторами требование не допускать их распространения без согласия субъекта персональных данных или наличия иного законного основания.</p>

          <h4>3. Перечень обрабатываемых персональных данных</h4>
          <p>3.1. В рамках настоящей Политики под персональными данными Пользователя понимаются:</p>
          <p>3.1.1. Предоставленные Пользователем при регистрации:</p>
          <ul>
            <li>Адрес электронной почты (e-mail);</li>
            <li>Никнейм (псевдоним);</li>
            <li>Номер телефона;</li>
            <li>Идентификатор в мессенджере Telegram;</li>
            <li>Фотография (аватар);</li>
            <li>Иная информация, предоставленная добровольно: дополнительные сведения о себе, информация о сопровождающих животных.</li>
          </ul>
          <p>3.1.2. Автоматически собираемые данные:</p>
          <ul>
            <li>Данные о подключении и использовании сайта (IP-адрес, информация из cookies, данные о браузере и устройстве Пользователя).</li>
          </ul>

          <h4>4. Цели обработки персональных данных</h4>
          <p>4.1. Организаторы осуществляют обработку персональных данных Пользователя в следующих целях:</p>
          <p>4.1.1. Регистрация Пользователя в качестве участника мероприятия TourFurr 2026 и его идентификация;</p>
          <p>4.1.2. Связь с Пользователем для отправки уведомлений, важной информации, связанной с мероприятием, и изменениями в программе;</p>
          <p>4.1.3. Обеспечение безопасности и поддержания правопорядка во время проведения мероприятия;</p>
          <p>4.1.4. Печать бейджей и иной необходимой для мероприятия атрибутики;</p>
          <p>4.1.5. Выполнение обязательств, предусмотренных действующим законодательством Российской Федерации.</p>

          <h4>5. Правовые основания обработки персональных данных</h4>
          <p>5.1. Правовыми основаниями обработки персональных данных Организаторами являются:</p>
          <ul>
            <li>Статья 6 Федерального закона № 152-ФЗ «О персональных данных»;</li>
            <li>Согласие Пользователя на обработку его персональных данных, выражаемое путем совершения конклюдентных действий (заполнения формы регистрации);</li>
            <li>Уставные документы Организаторов;</li>
            <li>Договоры, заключаемые между Организаторами и Пользователем.</li>
          </ul>

          <h4>6. Порядок и условия обработки персональных данных</h4>
          <p>6.1. Обработка персональных данных Пользователя осуществляется любым законным способом, как автоматизированными, так и неавтоматизированными средствами.</p>
          <p>6.2. Организаторы обязуются не раскрывать третьим лицам и не распространять персональные данные без согласия Пользователя, если иное не предусмотрено федеральным законом.</p>
          <p>6.3. Организаторы вправе передавать персональные данные Пользователя третьим лицам в следующих случаях:</p>
          <ul>
            <li>Пользователь выразил свое согласие на такие действия;</li>
            <li>Передача необходима для достижения целей обработки (например, передача данных в типографию для печати бейджей). При этом с такими третьими лицами заключается соглашение о конфиденциальности и соблюдении требований законодательства о персональных данных;</li>
            <li>Передача предусмотрена законодательством РФ в установленном порядке.</li>
          </ul>
          <p>6.4. Обработка персональных данных Пользователя осуществляется на территории Российской Федерации.</p>

          <h4>7. Сроки обработки (хранения) персональных данных</h4>
          <p>7.1. Сроки обработки персональных данных определяются исходя из целей их обработки. Организаторы обрабатывают персональные данные в течение срока, необходимого для достижения целей, указанных в разделе 4 настоящей Политики.</p>
          <p>7.2. Персональные данные подлежат уничтожению либо обезличиванию по достижении целей обработки или в случае утраты необходимости в их достижении, если иное не предусмотрено федеральным законом.</p>

          <h4>8. Права субъектов персональных данных</h4>
          <p>8.1. Пользователь имеет право на:</p>
          <p>8.1.1. Полный доступ к своим персональным данным и их копиям;</p>
          <p>8.1.2. Уточнение, блокирование или уничтожение своих персональных данных в случае, если они являются неполными, устаревшими, неточными, незаконно полученными или не являются необходимыми для заявленной цели обработки;</p>
          <p>8.1.3. Отзыв данного им согласия на обработку персональных данных;</p>
          <p>8.1.4. Принятие предусмотренных законом мер по защите своих прав;</p>
          <p>8.1.5. Осуществление иных прав, предусмотренных действующим законодательством РФ.</p>

          <h4>9. Защита персональных данных</h4>
          <p>9.1. Организаторы принимают необходимые и достаточные правовые, организационные и технические меры для защиты персональных данных Пользователя от неправомерного или случайного доступа, уничтожения, изменения, блокирования, копирования, распространения, а также от иных неправомерных действий с ними третьих лиц.</p>
          <p>9.2. Меры защиты включают в себя, но не ограничиваются: использование систем шифрования, регламентированный доступ к данным, использование антивирусных средств и систем обнаружения вторжений.</p>

          <h4>10. Заключительные положения</h4>
          <p>10.1. Организаторы вправе вносить изменения в настоящую Политику. Новая редакция Политики вступает в силу с момента ее размещения на Сайте, если иное не предусмотрено новой редакцией.</p>
          <p>10.2. К настоящей Политике и отношениям между Пользователем и Организаторами, возникающим в связи с ее применением, подлежит применению право Российской Федерации.</p>
          <p>10.3. Все споры и разногласия подлежат разрешению в судебном порядке по месту нахождения Организаторов.</p>
          <p>10.4. По всем вопросам, связанным с обработкой ваших персональных данных, вы можете связаться с Организаторами по электронной почте: <a href="mailto:privacy@tourfurr.ru">privacy@tourfurr.ru</a></p>

          <p class="policy-footer"><em>Документ составлен с учётом требований Федерального закона от 27.07.2006 г. № 152-ФЗ «О персональных данных».</em></p>
        </div>
        <div class="modal-footer">
          <button @click="showPrivacyModal = false" class="privacy-btn">Закрыть</button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue'
import { useRouter } from 'vue-router'
import { vMaska } from 'maska/vue'
import { useAuthStore } from '../../stores/auth'
import TelegramInput from './TelegramInput.vue'
import CloudflareTurnstile from '../common/CloudflareTurnstile.vue'
import * as yup from 'yup'

const router = useRouter()
const authStore = useAuthStore()

const currentStep = ref(1)
const showPassword = ref(false)
const isLoading = ref(false)
const serverError = ref('')
const showSuccessModal = ref(false)
const showPrivacyModal = ref(false)
const showRulesModal = ref(false)
const isDragging = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const avatarPreview = ref<string | null>(null)

// Cloudflare Turnstile state
const turnstilesiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY || '1x00000000000000000000AA'
const captchaToken = ref<string | null>(null)
const captchaError = ref('')

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

// Password strength calculation
const passwordStrength = computed(() => {
  const pwd = form.password
  if (!pwd) return 0
  let strength = 0
  if (pwd.length >= 8) strength++
  if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
  if (/\d/.test(pwd)) strength++
  if (/[^a-zA-Z0-9]/.test(pwd)) strength++
  return strength
})

const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500']
const strengthTextColors = ['text-red-400', 'text-orange-400', 'text-yellow-400', 'text-green-400']
const strengthLabels = ['Слабый', 'Средний', 'Хороший', 'Отличный']

// Validation schemas per step
const step1Schema = yup.object({
  email: yup.string().required('Email обязателен').email('Неверный формат email'),
  password: yup.string()
    .required('Пароль обязателен')
    .min(8, 'Минимум 8 символов')
    .matches(/[a-zA-Z]/, 'Должен содержать буквы')
    .matches(/\d/, 'Должен содержать цифры')
    .matches(/[^a-zA-Z0-9]/, 'Должен содержать специальный символ'),
  confirmPassword: yup.string()
    .required('Подтвердите пароль')
    .oneOf([yup.ref('password')], 'Пароли не совпадают')
})

const step2Schema = yup.object({
  nickname: yup.string()
    .required('Никнейм обязателен')
    .min(3, 'Минимум 3 символа')
    .max(30, 'Максимум 30 символов')
    .matches(/^[a-zA-Z0-9_]+$/, 'Только буквы, цифры и подчеркивание'),
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
  if (await validateStep(currentStep.value)) {
    // On step 1 → 2 transition, verify email uniqueness before proceeding
    if (currentStep.value === 1 && form.email) {
      await checkEmail()
      if (errors.email) return
    }
    currentStep.value++
  }
}

function prevStep() {
  currentStep.value--
}

async function checkEmail() {
  if (!form.email) {
    errors.email = '' // Clear error if field is empty
    return
  }
  errors.email = '' // Clear previous error before checking
  const isUnique = await authStore.checkEmailUnique(form.email)
  if (!isUnique) {
    errors.email = 'Этот email уже зарегистрирован'
  }
}

async function checkNickname() {
  if (!form.nickname) {
    errors.nickname = '' // Clear error if field is empty
    return
  }
  errors.nickname = '' // Clear previous error before checking
  const isUnique = await authStore.checkNicknameUnique(form.nickname)
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

// Cloudflare Turnstile handlers
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

  // Проверка Turnstile
  if (!captchaToken.value) {
    captchaError.value = 'Пожалуйста, пройдите проверку безопасности'
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
    // Redirect to email verification page with email in query params
    const email = (result as any).email || form.email
    const emailSent = (result as any).emailSent
    const emailError = (result as any).emailError

    // Show warning if email wasn't sent (but registration succeeded)
    if (!emailSent && emailError) {
      console.warn('Email not sent:', emailError)
      // Still redirect, but user will see the code in console (dev mode)
      // or can request a new code on the verification page
    }

    router.push({
      path: '/auth/verify-email',
      query: {
        email,
        emailSent: emailSent ? 'true' : 'false',
        emailError: emailError || ''
      }
    })
  } else {
    serverError.value = result.error || 'Ошибка регистрации'
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
  width: 80px;
  height: 80px;
  margin: 0 auto;
  border-radius: 50%;
  object-fit: cover;
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

/* Checkboxes */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  cursor: pointer;
  font-size: 0.85rem;
  color: var(--sage);
  transition: color 0.3s ease;
}

.checkbox-label:hover {
  color: var(--cream);
}

.checkbox-label span {
  line-height: 1.4;
}

.checkbox {
  margin-top: 2px;
  width: 16px;
  height: 16px;
  accent-color: var(--fire);
  flex-shrink: 0;
}

.checkbox-label a {
  color: var(--fire-glow);
  text-decoration: none;
}

.checkbox-label a:hover {
  text-decoration: underline;
}

.checkbox-error {
  margin-left: 1.75rem;
}

.checkbox-label.special {
  font-weight: 600;
  color: var(--cream);
  margin-bottom: 0.75rem;
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

/* Rules Modal - Modern Design */
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

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.rules-modal {
  position: relative;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-radius: 28px;
  max-width: 900px;
  width: 100%;
  max-height: 92vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 80px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(30px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.rules-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa366 100%);
  border-bottom: none;
  position: relative;
  overflow: hidden;
}

.rules-header::before {
  content: '';
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.15) 0%, transparent 70%);
  animation: pulse 8s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.rules-header-content {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  position: relative;
  z-index: 1;
}

.rules-icon {
  width: 56px;
  height: 56px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 2px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.1);
}

.rules-icon svg {
  width: 32px;
  height: 32px;
  color: #ffffff;
  stroke-width: 2.5;
}

.rules-header h3 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.85rem;
  font-weight: 800;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.03em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
}

.rules-subtitle {
  font-size: 0.9rem;
  font-weight: 500;
  color: rgba(255, 255, 255, 0.9);
  margin: 0.25rem 0 0 0;
  letter-spacing: 0.01em;
}

.rules-close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: #ffffff;
  cursor: pointer;
  padding: 0.65rem;
  border-radius: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  backdrop-filter: blur(10px);
}

.rules-close-btn:hover {
  background: rgba(255, 255, 255, 0.35);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.08) rotate(90deg);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.rules-close-btn:active {
  transform: scale(0.95) rotate(90deg);
}

.rules-close-btn svg {
  width: 24px;
  height: 24px;
  stroke-width: 2.5;
}

.rules-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem 2.5rem;
  background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
}

.rules-content::-webkit-scrollbar {
  width: 10px;
}

.rules-content::-webkit-scrollbar-track {
  background: #f1f3f5;
  border-radius: 10px;
  margin: 8px 0;
}

.rules-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 10px;
  border: 2px solid #f1f3f5;
}

.rules-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #ff8c42 0%, #ffa366 100%);
}

.rules-date-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.25rem 1.5rem;
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%);
  border-radius: 16px;
  border: 2px solid rgba(255, 107, 53, 0.15);
  margin-bottom: 2rem;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.08);
}

.date-icon {
  width: 40px;
  height: 40px;
  color: #ff6b35;
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
  color: #2d3748;
}

.rules-date-card span {
  font-size: 0.875rem;
  color: #718096;
  font-style: italic;
}

.rule-card {
  background: #ffffff;
  border-radius: 20px;
  margin-bottom: 1.5rem;
  overflow: hidden;
  border: 2px solid #e9ecef;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.rule-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border-color: rgba(255, 107, 53, 0.3);
}

.rule-card-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem 1.75rem;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border-bottom: 2px solid #f1f3f5;
}

.rule-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  position: relative;
  overflow: hidden;
}

.rule-icon::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.3) 0%, transparent 100%);
}

.rule-icon svg {
  width: 26px;
  height: 26px;
  color: #ffffff;
  stroke-width: 2.5;
  position: relative;
  z-index: 1;
}

.rule-card-header h4 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: #2d3748;
  margin: 0;
  letter-spacing: -0.02em;
}

.rule-card-content {
  padding: 1.75rem;
  line-height: 1.7;
}

.rule-card-content p {
  margin-bottom: 1rem;
  color: #4a5568;
  font-size: 0.95rem;
}

.rule-card-content p:last-child {
  margin-bottom: 0;
}

.rule-card-content p strong {
  color: #2d3748;
  font-weight: 700;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.rule-card-content ul {
  margin: 1rem 0 0 0;
  padding-left: 0;
  list-style: none;
}

.rule-card-content li {
  margin-bottom: 0.875rem;
  padding-left: 2rem;
  position: relative;
  color: #4a5568;
  font-size: 0.95rem;
  line-height: 1.65;
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
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(255, 107, 53, 0.3);
}

.rule-card-content a {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.2s ease;
  border-bottom: 2px solid transparent;
}

.rule-card-content a:hover {
  color: #ff8c42;
  border-bottom-color: #ff8c42;
}

.rules-footer-card {
  background: linear-gradient(135deg, #fff5f0 0%, #ffe8dc 100%);
  border: 2px solid rgba(255, 107, 53, 0.15);
  border-radius: 20px;
  padding: 2rem;
  margin-top: 2rem;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.08);
}

.footer-icon {
  width: 48px;
  height: 48px;
  color: #ff6b35;
  stroke-width: 2;
}

.rules-footer-card p {
  font-size: 1.1rem;
  color: #2d3748;
  margin: 0;
  font-weight: 500;
}

.rules-footer {
  padding: 1.75rem 2.5rem 2rem;
  background: linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%);
  border-top: 2px solid #e9ecef;
}

.rules-close-button {
  width: 100%;
  padding: 1.15rem 1.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 50%, #ffa366 100%);
  border: none;
  border-radius: 16px;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.05rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  letter-spacing: 0.01em;
}

.rules-close-button svg {
  width: 22px;
  height: 22px;
  stroke-width: 3;
}

.rules-close-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 30px rgba(255, 107, 53, 0.4);
  background: linear-gradient(135deg, #ff8c42 0%, #ffa366 50%, #ffb380 100%);
}

.rules-close-button:active {
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(255, 107, 53, 0.3);
}

/* Privacy Modal */
.privacy-overlay {
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

.privacy-modal {
  position: relative;
  background: #ffffff;
  border-radius: 24px;
  max-width: 800px;
  width: 100%;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(0, 0, 0, 0.05);
  overflow: hidden;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2rem 2.5rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border-bottom: none;
}

.modal-header h3 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0;
  letter-spacing: -0.02em;
}

.close-btn {
  background: rgba(255, 255, 255, 0.2);
  border: none;
  color: #ffffff;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 12px;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: scale(1.05);
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 2.5rem;
  color: #2d3748;
  font-size: 0.95rem;
  line-height: 1.7;
  background: #ffffff;
}

.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: #f7fafc;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: #cbd5e0;
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: #a0aec0;
}

.modal-content h4 {
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  color: #2d3748;
  font-size: 1.25rem;
  font-weight: 700;
  margin-top: 2rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #ff6b35;
  display: inline-block;
}

.modal-content h4:first-child {
  margin-top: 0;
}

.modal-content p {
  margin-bottom: 1rem;
  color: #4a5568;
}

.modal-content p strong {
  color: #2d3748;
  font-weight: 600;
}

.modal-content ul {
  margin-left: 0;
  margin-bottom: 1.25rem;
  list-style: none;
  padding-left: 0;
}

.modal-content li {
  margin-bottom: 0.75rem;
  padding-left: 1.75rem;
  position: relative;
  color: #4a5568;
  line-height: 1.6;
}

.modal-content li::before {
  content: "→";
  position: absolute;
  left: 0;
  color: #ff6b35;
  font-weight: 700;
  font-size: 1.1rem;
}

.modal-content a {
  color: #ff6b35;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.2s ease;
}

.modal-content a:hover {
  color: #ff8c42;
  text-decoration: underline;
}

.policy-date {
  text-align: center;
  font-style: italic;
  color: #718096;
  font-size: 0.85rem;
  margin-bottom: 2rem;
  padding: 1rem;
  background: #f7fafc;
  border-radius: 8px;
  border-left: 3px solid #ff6b35;
}

.policy-footer {
  margin-top: 2.5rem;
  padding-top: 1.5rem;
  border-top: 2px solid #e2e8f0;
  text-align: center;
  font-size: 0.9rem;
  color: #718096;
}

.modal-footer {
  padding: 1.5rem 2.5rem 2rem;
  background: #f8fafc;
  border-top: 1px solid #e2e8f0;
}

.privacy-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #ff6b35 0%, #ff8c42 100%);
  border: none;
  border-radius: 12px;
  color: white;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 4px 12px rgba(255, 107, 53, 0.2);
}

.privacy-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.3);
}

.privacy-btn:active {
  transform: translateY(0);
}

/* Modal overlay background - clean modern design */

/* Cloudflare Turnstile Styles */
.captcha-wrapper {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  align-items: center;
  padding: 1rem 0;
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
