<template>
  <div class="house-picker">
    <h3 class="picker-title">{{ isChangeMode ? 'Сменить Великий Дом' : 'Выберите свой Великий Дом' }}</h3>
    <p class="picker-subtitle">Присягните на верность одному из Великих Домов Вестероса</p>

    <div class="houses-grid">
      <button
        v-for="team in teams"
        :key="team.id"
        class="house-card"
        :class="{ selected: selectedTeamId === team.id }"
        :style="{ '--house-color': team.color, '--house-bg': team.color + '20' }"
        @click="selectedTeamId = team.id"
      >
        <div class="house-crest">
          <img
            :src="team.crest_url || `/images/crests/${team.slug}.png`"
            :alt="team.name"
            @error="($event.target as HTMLImageElement).style.display = 'none'"
          />
          <span class="house-letter">{{ team.name[0] }}</span>
        </div>
        <span class="house-name">{{ team.name }}</span>
        <p class="house-motto">{{ team.description }}</p>
      </button>
    </div>

    <div v-if="selectedTeamId" class="confirm-section">
      <button
        class="confirm-btn"
        :disabled="isSaving"
        @click="confirmSelection"
      >
        <template v-if="isSaving">Сохранение...</template>
        <template v-else>Присягнуть дому {{ selectedTeamName }}</template>
      </button>
    </div>

    <p v-if="errorMsg" class="error-text">{{ errorMsg }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useTeamsStore } from '../stores/teams'
import { useAuthStore } from '../stores/auth'
import { safeStorage } from '../utils/safeStorage'

const props = defineProps<{
  changeMode?: boolean
}>()

const emit = defineEmits<{
  (e: 'selected', teamId: string): void
}>()

const teamsStore = useTeamsStore()
const authStore = useAuthStore()

const teams = computed(() => teamsStore.teams)
const selectedTeamId = ref<string | null>(null)
const isSaving = ref(false)
const errorMsg = ref('')
const isChangeMode = computed(() => props.changeMode || false)

const selectedTeamName = computed(() => {
  if (!selectedTeamId.value) return ''
  const team = teamsStore.getTeamById(selectedTeamId.value)
  return team?.name || ''
})

async function confirmSelection() {
  if (!selectedTeamId.value || !authStore.user) return

  isSaving.value = true
  errorMsg.value = ''

  const result = await teamsStore.selectTeam(authStore.user.id, selectedTeamId.value)

  if (result.success) {
    // Update local user state
    authStore.user.teamId = selectedTeamId.value
    safeStorage.setItem('current_user', JSON.stringify(authStore.user))
    emit('selected', selectedTeamId.value)
  } else {
    errorMsg.value = result.error || 'Не удалось выбрать дом. Попробуйте позже.'
  }

  isSaving.value = false
}

onMounted(async () => {
  if (teamsStore.teams.length === 0) {
    await teamsStore.fetchTeams()
  }
  // Pre-select current team in change mode
  if (isChangeMode.value && authStore.user?.teamId) {
    selectedTeamId.value = authStore.user.teamId
  }
})
</script>

<style scoped>
.house-picker {
  text-align: center;
  padding: 1.5rem 0;
}

.picker-title {
  font-family: 'Merriweather', serif;
  font-size: 1.3rem;
  color: var(--fire-glow);
  margin-bottom: 0.25rem;
}

.picker-subtitle {
  font-size: 0.85rem;
  color: var(--sage);
  margin-bottom: 1.5rem;
}

.houses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.house-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0.75rem;
  background: rgba(42, 31, 26, 0.6);
  border: 2px solid rgba(139, 111, 71, 0.3);
  border-radius: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  color: inherit;
  font-family: inherit;
}

.house-card:hover {
  border-color: var(--house-color, var(--fire));
  background: var(--house-bg, rgba(255, 107, 53, 0.1));
  transform: translateY(-3px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.house-card.selected {
  border-color: var(--house-color, var(--fire));
  background: var(--house-bg, rgba(255, 107, 53, 0.15));
  box-shadow: 0 0 20px color-mix(in srgb, var(--house-color, var(--fire)) 40%, transparent);
}

.house-crest {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
}

.house-crest img {
  width: 48px;
  height: 48px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.house-letter {
  font-family: 'Merriweather', serif;
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--house-color, var(--fire));
  position: absolute;
}

.house-name {
  font-family: 'Merriweather', serif;
  font-size: 1rem;
  font-weight: 600;
  color: var(--cream);
}

.house-motto {
  font-size: 0.7rem;
  color: var(--sage);
  line-height: 1.3;
  margin: 0;
}

.confirm-section {
  margin-top: 0.5rem;
}

.confirm-btn {
  padding: 0.75rem 2rem;
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border: none;
  border-radius: 12px;
  color: var(--forest-deep);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
}

.confirm-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 53, 0.4);
}

.confirm-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.error-text {
  color: #ef4444;
  font-size: 0.85rem;
  margin-top: 0.75rem;
}

@media (max-width: 768px) {
  .houses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 400px) {
  .houses-grid {
    grid-template-columns: 1fr;
  }
}
</style>
