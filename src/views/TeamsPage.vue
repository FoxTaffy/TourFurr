<template>
  <div class="teams-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Header -->
    <Header :isDashboard="true" />

    <!-- Main Content -->
    <main class="teams-main">
      <h1 class="page-title">Великие Дома</h1>
      <p class="page-subtitle">Выберите свой дом и сразитесь за его честь</p>

      <div v-if="isLoading" class="loading">
        <div class="page-spinner"></div>
        <p>Загрузка домов...</p>
      </div>

      <div v-else class="teams-grid">
        <div
          v-for="team in teams"
          :key="team.id"
          class="team-card"
          :style="{ '--team-color': team.color, '--team-bg': team.color + '20' }"
        >
          <!-- Team Header -->
          <div class="team-header">
            <div class="team-crest-wrapper">
              <img
                :src="getCrestSrc(team)"
                :alt="team.name"
                class="team-crest-large"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <span class="team-crest-letter">{{ team.name[0] }}</span>
            </div>
            <div class="team-info">
              <h2 class="team-name">{{ team.name }}</h2>
              <p class="team-description">{{ team.description }}</p>
            </div>
            <div class="member-count-badge">
              {{ getMemberCount(team.id) }}
            </div>
          </div>

          <!-- Toggle Members -->
          <button
            class="toggle-members-btn"
            @click="toggleMembers(team.id)"
          >
            <span>{{ expandedTeams[team.id] ? 'Скрыть участников' : 'Показать участников' }}</span>
            <svg
              class="toggle-icon"
              :class="{ rotated: expandedTeams[team.id] }"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Members List -->
          <div v-if="expandedTeams[team.id]" class="members-list">
            <div v-if="!members[team.id] || members[team.id].length === 0" class="empty-members">
              Пока нет участников
            </div>
            <div
              v-for="member in members[team.id]"
              :key="member.id"
              class="member-item"
            >
              <div class="member-avatar">
                <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.nickname" />
                <span v-else class="member-initial">{{ member.nickname?.[0]?.toUpperCase() }}</span>
              </div>
              <span class="member-nickname">{{ member.nickname }}</span>
              <span class="member-status" :class="member.status">
                {{ statusLabels[member.status] || member.status }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Back to Dashboard -->
      <div class="back-section">
        <router-link to="/dashboard" class="back-btn">
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"/>
          </svg>
          Вернуться в личный кабинет
        </router-link>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useTeamsStore } from '../stores/teams'
import Header from '../components/Header.vue'

const CREST_MAP: Record<string, string> = {
  stark: '/images/crests/stark.png',
  lannister: '/images/crests/lannister.png',
  tyrell: '/images/crests/tyrell.png',
  baratheon: '/images/crests/baratheon.png',
  martell: '/images/crests/martell.png'
}

const teamsStore = useTeamsStore()

const teams = ref(teamsStore.teams)
const members = ref(teamsStore.members)
const isLoading = ref(true)
const expandedTeams = ref<Record<string, boolean>>({})

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

function getCrestSrc(team: { crest_url: string | null; slug: string }): string {
  if (team.crest_url) return team.crest_url
  return CREST_MAP[team.slug] || ''
}

function getMemberCount(teamId: string): number {
  return members.value[teamId]?.length || 0
}

async function toggleMembers(teamId: string) {
  expandedTeams.value[teamId] = !expandedTeams.value[teamId]
  if (expandedTeams.value[teamId] && !members.value[teamId]) {
    await teamsStore.fetchTeamMembers(teamId)
    members.value = { ...teamsStore.members }
  }
}

onMounted(async () => {
  await teamsStore.fetchTeams()
  teams.value = teamsStore.teams

  // Pre-fetch member counts for all teams
  for (const team of teams.value) {
    await teamsStore.fetchTeamMembers(team.id)
  }
  members.value = { ...teamsStore.members }
  isLoading.value = false
})
</script>

<style scoped>
.teams-page {
  min-height: 100vh;
  position: relative;
}

.teams-main {
  position: relative;
  z-index: 10;
  max-width: 900px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 6rem;
}

.page-title {
  font-family: 'Merriweather', serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: var(--fire-glow);
  text-align: center;
  margin-bottom: 0.5rem;
}

.page-subtitle {
  text-align: center;
  color: var(--sage);
  font-size: 1rem;
  margin-bottom: 2rem;
}

/* Loading */
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--sage);
}


/* Teams Grid */
.teams-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.team-card {
  background: rgba(42, 31, 26, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-left: 4px solid var(--team-color, var(--fire));
  border-radius: 16px;
  padding: 1.5rem;
  animation: fadeIn 0.4s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(12px); }
  to { opacity: 1; transform: translateY(0); }
}

/* Team Header */
.team-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.team-crest-wrapper {
  width: 56px;
  height: 56px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;
}

.team-crest-large {
  width: 48px;
  height: 48px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.team-crest-letter {
  font-family: 'Merriweather', serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--team-color, var(--fire));
  position: absolute;
}

.team-info {
  flex: 1;
  min-width: 0;
}

.team-name {
  font-family: 'Merriweather', serif;
  font-size: 1.3rem;
  color: var(--cream);
  margin-bottom: 0.25rem;
}

.team-description {
  font-size: 0.85rem;
  color: var(--sage);
  line-height: 1.4;
}

.member-count-badge {
  min-width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 10px;
  background: var(--team-bg, rgba(255, 107, 53, 0.15));
  color: var(--team-color, var(--fire));
  font-weight: 700;
  font-size: 1rem;
  flex-shrink: 0;
}

/* Toggle Button */
.toggle-members-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0.75rem;
  margin-top: 1rem;
  background: rgba(26, 17, 14, 0.4);
  border: 1px solid rgba(139, 111, 71, 0.25);
  border-radius: 10px;
  color: var(--sage);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle-members-btn:hover {
  background: rgba(26, 17, 14, 0.6);
  color: var(--cream);
  border-color: var(--team-color, var(--fire));
}

.toggle-icon {
  width: 18px;
  height: 18px;
  transition: transform 0.3s ease;
}

.toggle-icon.rotated {
  transform: rotate(180deg);
}

/* Members List */
.members-list {
  margin-top: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.empty-members {
  text-align: center;
  padding: 1rem;
  color: var(--sage);
  font-size: 0.9rem;
  font-style: italic;
}

.member-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.6rem 0.75rem;
  background: rgba(26, 17, 14, 0.3);
  border-radius: 10px;
  transition: background 0.2s ease;
}

.member-item:hover {
  background: rgba(26, 17, 14, 0.5);
}

.member-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-initial {
  font-size: 0.8rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.member-nickname {
  flex: 1;
  color: var(--cream);
  font-size: 0.9rem;
  font-weight: 500;
}

.member-status {
  font-size: 0.75rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 6px;
}

.member-status.pending {
  background: rgba(255, 179, 71, 0.2);
  color: var(--fire-glow);
}

.member-status.approved {
  background: rgba(34, 197, 94, 0.2);
  color: #22c55e;
}

.member-status.rejected {
  background: rgba(239, 68, 68, 0.2);
  color: #ef4444;
}

/* Back Section */
.back-section {
  text-align: center;
  margin-top: 2rem;
}

/* Responsive */
@media (max-width: 768px) {
  .teams-main {
    padding: 1rem;
    padding-top: 5.5rem;
  }

  .team-header {
    flex-wrap: wrap;
    gap: 0.75rem;
  }

  .team-crest-wrapper {
    width: 44px;
    height: 44px;
  }

  .team-crest-large {
    width: 40px;
    height: 40px;
  }

  .team-name {
    font-size: 1.1rem;
  }

  .team-description {
    font-size: 0.8rem;
  }
}
</style>
