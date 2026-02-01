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
            Согласен с <a href="/#rules">правилами конвента</a>
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
  telegram: yup.string().required('Telegram обязателен')
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
  // Validate file
  const validTypes = ['image/jpeg', 'image/png', 'image/webp']
  if (!validTypes.includes(file.type)) {
    errors.avatar = 'Недопустимый формат файла'
    return
  }
  if (file.size > 5 * 1024 * 1024) {
    errors.avatar = 'Файл слишком большой (макс. 5MB)'
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
  background: linear-gradient(135deg, rgba(42, 31, 26, 0.98), rgba(26, 17, 14, 0.98));
  border: 1px solid var(--moss);
  border-radius: 20px;
  max-width: 700px;
  width: 100%;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.3);
}

.modal-header h3 {
  font-family: 'Playfair Display', serif;
  font-size: 1.25rem;
  color: var(--cream);
  margin: 0;
}

.close-btn {
  background: none;
  border: none;
  color: var(--sage);
  cursor: pointer;
  padding: 0.25rem;
  transition: color 0.3s ease;
}

.close-btn:hover {
  color: var(--cream);
}

.close-btn svg {
  width: 24px;
  height: 24px;
}

.modal-content {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
  color: var(--sage);
  font-size: 0.9rem;
  line-height: 1.6;
}

.modal-content h4 {
  font-family: 'Playfair Display', serif;
  color: var(--fire-glow);
  font-size: 1rem;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.modal-content h4:first-child {
  margin-top: 0;
}

.modal-content p {
  margin-bottom: 0.75rem;
}

.modal-content ul {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
  list-style: disc;
}

.modal-content li {
  margin-bottom: 0.5rem;
  line-height: 1.5;
}

.modal-content strong {
  color: var(--cream);
  font-weight: 600;
}

.modal-content a {
  color: var(--fire-glow);
  text-decoration: none;
}

.modal-content a:hover {
  text-decoration: underline;
}

.policy-date {
  text-align: center;
  font-style: italic;
  color: var(--sage);
  opacity: 0.8;
  margin-bottom: 1.5rem;
}

.policy-footer {
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid rgba(139, 111, 71, 0.3);
  text-align: center;
  font-size: 0.85rem;
  color: var(--sage);
  opacity: 0.8;
}

.modal-footer {
  padding: 1.5rem;
  border-top: 1px solid rgba(139, 111, 71, 0.3);
}

.privacy-btn {
  width: 100%;
  padding: 0.75rem;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 10px;
  color: white;
  font-family: 'Lora', serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.privacy-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(255, 107, 53, 0.4);
}

/* Scrollbar Styles for Modal Content */
.modal-content::-webkit-scrollbar {
  width: 8px;
}

.modal-content::-webkit-scrollbar-track {
  background: rgba(26, 17, 14, 0.4);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb {
  background: var(--moss);
  border-radius: 4px;
}

.modal-content::-webkit-scrollbar-thumb:hover {
  background: var(--sage);
}

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
</style>
