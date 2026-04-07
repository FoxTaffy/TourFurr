<template>
  <div class="teams-page">
    <!-- Animated background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Header -->
    <Header :isDashboard="true" />

    <!-- Main Content -->
    <main class="teams-main">

      <h1 class="page-title">Великие Дома</h1>

      <div v-if="isLoading" class="loading">
        <div class="page-spinner"></div>
        <p>Загрузка домов...</p>
      </div>

      <template v-else>
        <!-- Great Houses + Night's Watch -->
        <div class="houses-grid">
          <div
            v-for="team in greatHouses"
            :key="team.id"
            class="house-card"
            :class="{ 'nw': team.slug === 'nights-watch' }"
            :style="{ '--tc': team.color, '--tc20': team.color + '20', '--tc40': team.color + '40' }"
          >
            <!-- Card Banner -->
            <div class="card-banner">
              <div class="banner-glow"></div>
              <img
                :src="getCrestSrc(team)"
                :alt="team.name"
                class="banner-crest"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <div class="banner-text">
                <span class="banner-tag">{{ HOUSE_LORE[team.slug]?.isOrder ? 'Орден' : 'Великий Дом' }}</span>
                <h2 class="banner-name">{{ team.name }}</h2>

              </div>
              <div class="banner-count">
                <span class="count-num">{{ getMemberCount(team.id) }}</span>
                <span class="count-label">участников</span>
              </div>
            </div>

            <!-- Hook question -->
            <p v-if="HOUSE_LORE[team.slug]" class="card-hook">
              {{ HOUSE_LORE[team.slug].emoji }} {{ HOUSE_LORE[team.slug].hookQuestion }}
            </p>

            <!-- Action row: lore only -->
            <div class="card-actions">
              <button class="action-btn lore-btn" @click="toggleLore(team.id)">
                <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                </svg>
                {{ expandedLore[team.id] ? 'Свернуть' : (HOUSE_LORE[team.slug]?.isOrder ? 'Об ордене' : 'О доме') }}
              </button>
            </div>

            <!-- Lore panel -->
            <Transition name="expand">
              <div v-if="expandedLore[team.id] && HOUSE_LORE[team.slug]" class="lore-panel">
                <div class="lore-emblem-row">
                  <span class="lore-badge">Герб</span>
                  <span class="lore-emblem-text">{{ HOUSE_LORE[team.slug].emblem }}</span>
                </div>

                <div class="lore-desc">
                  <p v-for="(para, i) in HOUSE_LORE[team.slug].fullDescription.split('\n\n')" :key="i">{{ para }}</p>
                </div>

                <div class="lore-traits-box">
                  <p class="traits-heading">
                    {{ HOUSE_LORE[team.slug].isOrder ? 'Вступай в Ночной Дозор, если ты:' : `Выбери ${team.name}, если ты:` }}
                  </p>
                  <ul class="traits-list">
                    <li v-for="(trait, i) in HOUSE_LORE[team.slug].traits" :key="i">
                      <span class="trait-check">✦</span>{{ trait }}
                    </li>
                  </ul>
                </div>

                <div class="lore-flavor-block">
                  <p v-for="(line, i) in HOUSE_LORE[team.slug].flavorText.split('\n\n')" :key="i">{{ line }}</p>
                </div>

                <p class="lore-closing">{{ HOUSE_LORE[team.slug].closingRemark }}</p>
              </div>
            </Transition>

            <!-- Members: always visible -->
            <div class="members-panel">
              <div v-if="!members[team.id] || members[team.id].length === 0" class="empty-members">
                Пока нет участников
              </div>
              <div v-for="member in members[team.id]" :key="member.id" class="member-row">
                <div class="member-avatar">
                  <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.nickname" @error="($event.target as HTMLImageElement).style.display='none'" />
                  <span v-else class="member-initial">{{ member.nickname?.[0]?.toUpperCase() }}</span>
                </div>
                <span class="member-name">{{ member.nickname }}</span>
                <span class="member-status" :class="member.status">
                  {{ statusLabels[member.status] || member.status }}
                </span>
              </div>
            </div>
          </div>
        </div>

        <!-- Other Houses (organizers only) -->
        <template v-if="otherHouses.length > 0">
          <h2 class="section-subtitle">Прочие Дома</h2>
          <div class="houses-grid minor-grid">
            <div
              v-for="team in otherHouses"
              :key="team.id"
              class="house-card minor-card"
              :style="{ '--tc': team.color, '--tc20': team.color + '20', '--tc40': team.color + '40' }"
            >
              <!-- Card Banner -->
              <div class="card-banner">
                <div class="banner-glow"></div>
                <div class="house-letter-crest" :style="{ color: team.color }">{{ team.name[0] }}</div>
                <div class="banner-text">
                  <span class="banner-tag">Дом</span>
                  <h2 class="banner-name">{{ team.name }}</h2>
                </div>
                <div class="banner-count">
                  <span class="count-num">{{ getMemberCount(team.id) }}</span>
                  <span class="count-label">участников</span>
                </div>
              </div>

              <!-- Description -->
              <p v-if="team.description" class="card-hook minor-desc">{{ team.description }}</p>

              <!-- Members: approved + applicants -->
              <div class="members-panel">
                <div v-if="!members[team.id] || members[team.id].length === 0" class="empty-members">
                  Пока нет организаторов
                </div>
                <div
                  v-for="member in members[team.id]"
                  :key="member.id"
                  class="member-row"
                >
                  <div class="member-avatar">
                    <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.nickname" @error="($event.target as HTMLImageElement).style.display='none'" />
                    <span v-else class="member-initial">{{ member.nickname?.[0]?.toUpperCase() }}</span>
                  </div>
                  <span class="member-name">{{ member.nickname }}</span>
                  <span class="member-status" :class="member.status">
                    {{ statusLabels[member.status] || member.status }}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </template>
      </template>

      <!-- Back -->
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
import { ref, computed, onMounted } from 'vue'
import { useTeamsStore, HOUSE_LORE, MINOR_HOUSE_SLUGS } from '../stores/teams'
import Header from '../components/Header.vue'

const CREST_MAP: Record<string, string> = {
  stark: '/images/crests/stark.png',
  lannister: '/images/crests/lannister.png',
  tyrell: '/images/crests/tyrell.png',
  baratheon: '/images/crests/baratheon.png',
  martell: '/images/crests/martell.png',
  'nights-watch': '/images/crests/the-wall-bg.png'
}

const teamsStore = useTeamsStore()

const teams = ref(teamsStore.teams)
const members = ref(teamsStore.members)
const isLoading = ref(true)
const expandedLore = ref<Record<string, boolean>>({})

const greatHouses = computed(() => teams.value.filter(t => !MINOR_HOUSE_SLUGS.includes(t.slug)))
const otherHouses = computed(() => teams.value.filter(t => MINOR_HOUSE_SLUGS.includes(t.slug)))

const statusLabels: Record<string, string> = {
  pending: 'На рассмотрении',
  approved: 'Одобрено',
  rejected: 'Отклонено'
}

// All teams rendered in one unified grid

function getCrestSrc(team: { crest_url: string | null; slug: string }): string {
  if (team.crest_url) return team.crest_url
  return CREST_MAP[team.slug] || ''
}

function getMemberCount(teamId: string): number {
  return members.value[teamId]?.length || 0
}

function toggleLore(teamId: string) {
  const isOpen = expandedLore.value[teamId]
  // close all
  for (const key in expandedLore.value) {
    expandedLore.value[key] = false
  }
  // open clicked only if it was closed
  if (!isOpen) {
    expandedLore.value[teamId] = true
  }
}

onMounted(async () => {
  await teamsStore.fetchTeams()
  teams.value = teamsStore.teams
  for (const team of teams.value) {
    await teamsStore.fetchTeamMembers(team.id)
  }
  members.value = { ...teamsStore.members }
  isLoading.value = false
})
</script>

<style scoped>
/* ================================================
   PAGE SHELL
   ================================================ */
.teams-page {
  min-height: 100vh;
  position: relative;
}

/* ================================================
   MAIN
   ================================================ */
.teams-main {
  position: relative;
  z-index: 10;
  width: 100%;
  max-width: 2400px;
  margin: 0 auto;
  padding: 5.5rem 1.5rem 4rem;
}

/* ================================================
   PAGE TITLE
   ================================================ */
.page-title {
  font-family: serif;
  font-size: clamp(2.5rem, 5vw, 4rem);
  color: var(--cream);
  text-align: center;
  margin-bottom: 1.5rem;
  text-shadow:
    0 0 40px rgba(255, 179, 71, 0.5),
    0 2px 8px rgba(0, 0, 0, 0.8);
  letter-spacing: 0.04em;
}

/* ================================================
   LOADING
   ================================================ */
.loading {
  text-align: center;
  padding: 4rem;
  color: var(--sage);
}

/* ================================================
   SECTION SUBTITLE (for "Прочие Дома")
   ================================================ */
.section-subtitle {
  font-family: serif;
  font-size: clamp(1.5rem, 3vw, 2.2rem);
  color: var(--cream);
  text-align: center;
  margin: 2.5rem 0 1.5rem;
  opacity: 0.75;
  letter-spacing: 0.04em;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.6);
}

/* Letter crest for houses without an image */
.house-letter-crest {
  font-family: 'Merriweather', serif;
  font-size: 2rem;
  font-weight: 700;
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
  position: relative;
  z-index: 1;
}

/* Minor houses grid: more compact */
.minor-grid {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.minor-card .card-hook.minor-desc {
  font-size: 0.75rem;
  font-style: italic;
  color: var(--sage);
  text-align: center;
  padding: 0.5rem 0.75rem;
  border-top: 1px solid rgba(139, 111, 71, 0.15);
  margin: 0;
  line-height: 1.4;
  flex: 1;
}

/* ================================================
   HOUSES GRID (5 houses)
   ================================================ */
.houses-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* ================================================
   HOUSE CARD
   ================================================ */
.house-card {
  background: rgba(26, 17, 14, 0.88);
  border: 1px solid var(--tc40, rgba(139,111,71,0.35));
  border-top: 3px solid var(--tc, var(--fire));
  border-radius: 18px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(18px);
  animation: cardIn 0.5s ease-out both;
  transition: box-shadow 0.3s ease, transform 0.3s ease;
}

.house-card:hover {
  box-shadow: 0 8px 32px color-mix(in srgb, var(--tc, var(--fire)) 25%, transparent);
  transform: translateY(-3px);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(20px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* Banner (top part of card) */
.card-banner {
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.6rem;
  padding: 1.1rem 1rem 0.9rem;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--tc, var(--fire)) 12%, transparent) 0%,
    transparent 100%
  );
  text-align: center;
  overflow: hidden;
}

.banner-glow {
  position: absolute;
  top: -40px;
  left: -40px;
  width: 130px;
  height: 130px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--tc, var(--fire)) 18%, transparent);
  filter: blur(35px);
  pointer-events: none;
}

.banner-crest {
  width: 52px;
  height: 52px;
  object-fit: contain;
  flex-shrink: 0;
  filter: drop-shadow(0 2px 8px rgba(0,0,0,0.5));
  position: relative;
  z-index: 1;
}

.banner-text {
  width: 100%;
  min-width: 0;
  position: relative;
  z-index: 1;
}

.banner-tag {
  display: inline-block;
  font-size: 0.65rem;
  letter-spacing: 0.15em;
  text-transform: uppercase;
  color: var(--tc, var(--fire-glow));
  background: color-mix(in srgb, var(--tc, var(--fire)) 15%, transparent);
  border: 1px solid color-mix(in srgb, var(--tc, var(--fire)) 35%, transparent);
  border-radius: 4px;
  padding: 2px 7px;
  margin-bottom: 0.35rem;
}

.banner-name {
  font-family: 'Merriweather', serif;
  font-size: 1rem;
  color: var(--cream);
  line-height: 1.2;
  margin-bottom: 0.2rem;
}

.banner-motto {
  font-size: 0.78rem;
  color: var(--sage);
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.banner-count {
  position: absolute;
  top: 0.7rem;
  right: 0.7rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  z-index: 2;
}

.count-num {
  font-family: 'Merriweather', serif;
  font-size: 1.15rem;
  font-weight: 700;
  color: var(--tc, var(--fire-glow));
  line-height: 1;
}

.count-label {
  font-size: 0.62rem;
  color: var(--sage);
  text-align: center;
  letter-spacing: 0.05em;
  margin-top: 2px;
}

/* Hook question */
.card-hook {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
  padding: 0.6rem 0.75rem;
  font-size: 0.78rem;
  font-style: italic;
  color: var(--cream);
  line-height: 1.45;
  border-top: 1px solid rgba(139, 111, 71, 0.15);
  flex: 1;
}

/* NW gets slightly bigger crest */
.house-card.nw .banner-crest {
  width: 64px;
  height: 64px;
}

/* ================================================
   ACTION ROW
   ================================================ */
.card-actions {
  display: flex;
  padding: 0.6rem 0.75rem;
  border-top: 1px solid rgba(139, 111, 71, 0.12);
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.35rem;
  padding: 0.5rem 0.5rem;
  border-radius: 8px;
  font-family: 'Inter', sans-serif;
  font-size: 0.75rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.25s ease;
  border: none;
}

.action-btn svg {
  width: 15px;
  height: 15px;
  flex-shrink: 0;
}

.lore-btn {
  background: color-mix(in srgb, var(--tc, var(--fire)) 12%, rgba(26,17,14,0.6));
  color: var(--tc, var(--fire-glow));
  border: 1px solid color-mix(in srgb, var(--tc, var(--fire)) 30%, transparent);
  flex: 1;
}

.lore-btn:hover {
  background: color-mix(in srgb, var(--tc, var(--fire)) 22%, rgba(26,17,14,0.8));
  border-color: color-mix(in srgb, var(--tc, var(--fire)) 60%, transparent);
}

/* ================================================
   LORE PANEL
   ================================================ */
.lore-panel {
  margin: 0 0.75rem 0.75rem;
  padding: 0.9rem 0.85rem;
  background: rgba(18, 11, 9, 0.55);
  border: 1px solid rgba(139, 111, 71, 0.18);
  border-left: 3px solid var(--tc, var(--fire));
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 0.7rem;
}

.lore-emblem-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-wrap: wrap;
}

.lore-badge {
  font-size: 0.65rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--tc, var(--fire-glow));
  background: color-mix(in srgb, var(--tc, var(--fire)) 14%, transparent);
  border: 1px solid color-mix(in srgb, var(--tc, var(--fire)) 30%, transparent);
  border-radius: 4px;
  padding: 2px 6px;
  white-space: nowrap;
}

.lore-emblem-text {
  font-size: 0.82rem;
  color: var(--sage);
}

.lore-desc {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.lore-desc p {
  font-size: 0.87rem;
  color: var(--cream);
  line-height: 1.65;
  margin: 0;
}

.lore-traits-box {
  background: rgba(26, 17, 14, 0.5);
  border-radius: 10px;
  padding: 0.8rem 0.9rem;
}

.traits-heading {
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--cream);
  margin: 0 0 0.5rem 0;
}

.traits-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.traits-list li {
  font-size: 0.84rem;
  color: var(--sage);
  line-height: 1.45;
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
}

.trait-check {
  color: var(--tc, var(--fire-glow));
  font-size: 0.65rem;
  margin-top: 0.25rem;
  flex-shrink: 0;
}

.lore-flavor-block {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
  padding: 0.6rem 0.8rem;
  border-left: 2px solid rgba(139, 111, 71, 0.25);
}

.lore-flavor-block p {
  font-size: 0.84rem;
  color: var(--cream);
  font-style: italic;
  margin: 0;
  line-height: 1.55;
}

.lore-closing {
  font-size: 0.8rem;
  color: var(--sage);
  text-align: center;
  padding-top: 0.5rem;
  border-top: 1px solid rgba(139, 111, 71, 0.15);
  margin: 0;
  line-height: 1.5;
}

/* ================================================
   MEMBERS PANEL
   ================================================ */
.members-panel {
  padding: 0 0.75rem 0.75rem;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.empty-members {
  text-align: center;
  padding: 1rem;
  color: var(--sage);
  font-size: 0.88rem;
  font-style: italic;
}

.member-row {
  display: flex;
  align-items: center;
  gap: 0.7rem;
  padding: 0.55rem 0.8rem;
  background: rgba(26, 17, 14, 0.4);
  border-radius: 10px;
  transition: background 0.2s;
}

.member-row:hover {
  background: rgba(26, 17, 14, 0.65);
}

.member-avatar {
  width: 30px;
  height: 30px;
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
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.member-name {
  flex: 1;
  color: var(--cream);
  font-size: 0.88rem;
  font-weight: 500;
}

.member-status {
  font-size: 0.72rem;
  font-weight: 600;
  padding: 2px 8px;
  border-radius: 6px;
}

.member-status.pending  { background: rgba(255,179,71,0.18); color: var(--fire-glow); }
.member-status.approved { background: rgba(34,197,94,0.18);  color: #22c55e; }
.member-status.rejected { background: rgba(239,68,68,0.18);  color: #ef4444; }

/* ================================================
   NIGHT'S WATCH — full-width dark card in grid
   ================================================ */
.house-card.nw {
  /* no special span — sits in grid like others */
  background: rgba(10, 8, 7, 0.94);
  border-color: rgba(80, 80, 100, 0.5);
}

.house-card.nw .card-banner {
  background: linear-gradient(135deg, rgba(80,80,100,0.1) 0%, transparent 60%);
}

.house-card.nw .banner-crest {
  width: 80px;
  height: 80px;
  opacity: 0.85;
  filter: drop-shadow(0 2px 10px rgba(0,0,0,0.7)) grayscale(0.2);
}

.house-card.nw .banner-motto {
  -webkit-line-clamp: 3;
}

/* ================================================
   EXPAND TRANSITION
   ================================================ */
.expand-enter-active,
.expand-leave-active {
  transition: all 0.3s ease;
  overflow: hidden;
}

.expand-enter-from,
.expand-leave-to {
  opacity: 0;
  max-height: 0;
  transform: translateY(-6px);
}

.expand-enter-to,
.expand-leave-from {
  opacity: 1;
  max-height: 2000px;
  transform: translateY(0);
}

/* ================================================
   BACK
   ================================================ */
.back-section {
  text-align: center;
  margin-top: 2.5rem;
}

/* ================================================
   RESPONSIVE
   ================================================ */

/* 4K / ultrawide (≥2560px) */
@media (min-width: 2560px) {
  .teams-main { padding: 6rem 4rem 5rem; }
  .houses-grid { gap: 1.5rem; }
  .banner-crest { width: 68px; height: 68px; }
  .banner-name { font-size: 1.15rem; }
  .page-title { font-size: 5rem; }
}

/* 2K QHD (1920≃2559px) */
@media (min-width: 1920px) and (max-width: 2559px) {
  .teams-main { padding: 5.5rem 3rem 4rem; }
  .houses-grid { gap: 1.25rem; }
  .banner-name { font-size: 1.1rem; }
}

/* FHD range handled by 6-col default */

/* HD/wide tablets (1301–1919px) */
/* already 6 cols */

@media (max-width: 1300px) {
  .houses-grid { grid-template-columns: repeat(4, 1fr); }
}

@media (max-width: 1000px) {
  .houses-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 700px) {
  .teams-main {
    padding: 5rem 0.75rem 3rem;
  }

  .houses-grid { grid-template-columns: repeat(2, 1fr); }

  .banner-crest {
    width: 48px;
    height: 48px;
  }
}

@media (max-width: 420px) {
  .houses-grid { grid-template-columns: 1fr; }
}
</style>
