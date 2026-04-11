<template>
  <div class="teams-page">
    <div class="bg-forest"></div>
    <div class="fog"></div>
    <Header :isDashboard="true" />

    <main class="teams-main">

      <!-- Page Header -->
      <div class="page-header">
        <p class="page-eyebrow">TourFurr 3 · Game of Thrones</p>
        <h1 class="page-title">Великие Дома</h1>
        <p class="page-subtitle">Выберите сторону — и будьте верны ей до конца</p>
      </div>

      <div v-if="isLoading" class="loading">
        <div class="page-spinner"></div>
        <p>Загрузка домов...</p>
      </div>

      <template v-else>

        <!-- Great Houses Grid -->
        <div class="houses-grid">
          <div
            v-for="team in greatHouses"
            :key="team.id"
            class="house-card"
            :class="{ nw: team.slug === 'nights-watch' }"
            :style="{ '--tc': team.color, '--tc20': team.color + '20', '--tc40': team.color + '40' }"
          >
            <div class="card-accent"></div>

            <div class="card-top">
              <div class="crest-ring">
                <img
                  :src="getCrestSrc(team)"
                  :alt="team.name"
                  class="crest-img"
                  @error="($event.target as HTMLImageElement).style.display = 'none'"
                />
              </div>
              <div class="count-pill">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                {{ getMemberCount(team.id) }}
              </div>
            </div>

            <div class="card-identity">
              <span class="card-tag">{{ HOUSE_LORE[team.slug]?.isOrder ? 'Орден' : 'Великий Дом' }}</span>
              <h2 class="card-name">{{ team.name }}</h2>
              <span v-if="HOUSE_LORE[team.slug]?.isAfk" class="afk-badge">⛺ Полностью АФК</span>
            </div>

            <p v-if="HOUSE_LORE[team.slug]" class="card-hook">
              {{ HOUSE_LORE[team.slug].emoji }} {{ HOUSE_LORE[team.slug].hookQuestion }}
            </p>

            <ul v-if="HOUSE_LORE[team.slug]" class="traits-list">
              <li v-for="(trait, i) in HOUSE_LORE[team.slug].traits" :key="i">
                <span class="trait-dot" :style="{ background: team.color }"></span>
                {{ trait }}
              </li>
            </ul>

            <div v-if="HOUSE_LORE[team.slug]?.curator" class="curator-row">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
              </svg>
              <span class="curator-label">Куратор:</span>
              <a
                :href="`https://t.me/${HOUSE_LORE[team.slug]!.curatorHandle!.replace('@', '')}`"
                target="_blank"
                rel="noopener noreferrer"
                class="curator-link"
              >{{ HOUSE_LORE[team.slug]!.curator }} {{ HOUSE_LORE[team.slug]!.curatorHandle }}</a>
            </div>

            <div class="members-panel">
              <div class="members-header">Участники</div>
              <div v-if="!members[team.id] || members[team.id].length === 0" class="empty-members">
                Пока никого нет
              </div>
              <div v-for="member in members[team.id]" :key="member.id" class="member-row">
                <div class="member-avatar">
                  <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.nickname"
                    @error="($event.target as HTMLImageElement).style.display = 'none'" />
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

        <!-- Minor Houses -->
        <template v-if="otherHouses.length > 0">
          <div class="minor-header">
            <span class="minor-line"></span>
            <div class="minor-title-block">
              <h2 class="minor-title">Прочие Дома</h2>
              <span class="minor-subtitle">Дома организаторов — не для выбора участниками</span>
            </div>
            <span class="minor-line"></span>
          </div>

          <div class="minor-grid">
            <div
              v-for="team in otherHouses"
              :key="team.id"
              class="minor-card"
              :style="{ '--tc': team.color }"
            >
              <div class="minor-top">
                <div class="minor-crest-wrap">
                  <img
                    :src="team.crest_url || ''"
                    :alt="team.name"
                    class="minor-crest-img"
                    @error="($event.target as HTMLImageElement).style.display = 'none'"
                  />
                  <span class="minor-letter" :style="{ color: team.color }">{{ team.name[0] }}</span>
                </div>
                <div class="minor-info">
                  <div class="minor-name-row">
                    <span class="minor-name">{{ team.name }}</span>
                    <span class="minor-org-badge">орг.</span>
                  </div>
                  <span class="minor-desc">{{ team.description }}</span>
                </div>
                <div class="minor-count">{{ getMemberCount(team.id) }} уч.</div>
              </div>

              <div class="minor-members">
                <p v-if="!members[team.id] || members[team.id].length === 0" class="minor-empty">Пока пусто</p>
                <div v-for="member in members[team.id]" :key="member.id" class="minor-member">
                  <div class="member-avatar small">
                    <img v-if="member.avatar_url" :src="member.avatar_url" :alt="member.nickname"
                      @error="($event.target as HTMLImageElement).style.display = 'none'" />
                    <span v-else class="member-initial">{{ member.nickname?.[0]?.toUpperCase() }}</span>
                  </div>
                  <span>{{ member.nickname }}</span>
                </div>
              </div>
            </div>
          </div>
        </template>

      </template>

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
  stark:          '/images/crests/stark.png',
  lannister:      '/images/crests/lannister.png',
  tyrell:         '/images/crests/tyrell.png',
  baratheon:      '/images/crests/baratheon.png',
  martell:        '/images/crests/martell.png',
  'nights-watch': '/images/crests/the-wall-bg.png'
}

const teamsStore = useTeamsStore()
const teams      = ref(teamsStore.teams)
const members    = ref(teamsStore.members)
const isLoading  = ref(true)

const greatHouses = computed(() => teams.value.filter(t => !MINOR_HOUSE_SLUGS.includes(t.slug)))
const otherHouses = computed(() => teams.value.filter(t =>  MINOR_HOUSE_SLUGS.includes(t.slug)))

const statusLabels: Record<string, string> = {
  pending:  'На рассмотрении',
  approved: 'Одобрено',
  paid:     'Оплачено',
  rejected: 'Отклонено'
}

function getCrestSrc(team: { crest_url: string | null; slug: string }): string {
  return team.crest_url || CREST_MAP[team.slug] || ''
}

function getMemberCount(teamId: string): number {
  return members.value[teamId]?.length || 0
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
/* ── PAGE SHELL ───────────────────────────── */
.teams-page {
  min-height: 100vh;
  position: relative;
}

.teams-main {
  position: relative;
  z-index: 10;
  max-width: 1600px;
  margin: 0 auto;
  padding: 5.5rem 1.5rem 5rem;
}

/* ── PAGE HEADER ──────────────────────────── */
.page-header {
  text-align: center;
  margin-bottom: 3rem;
}

.page-eyebrow {
  font-size: 0.72rem;
  letter-spacing: 0.25em;
  text-transform: uppercase;
  color: var(--fire-glow);
  opacity: 0.7;
  margin-bottom: 0.5rem;
}

.page-title {
  font-family: 'Merriweather', serif;
  font-size: clamp(2.2rem, 5vw, 4rem);
  color: var(--cream);
  text-shadow: 0 0 40px rgba(255,179,71,.4), 0 2px 10px rgba(0,0,0,.8);
  letter-spacing: .04em;
  margin-bottom: .5rem;
}

.page-subtitle {
  font-size: 1rem;
  color: var(--sage);
  font-style: italic;
  opacity: .8;
}

/* ── LOADING ──────────────────────────────── */
.loading {
  text-align: center;
  padding: 4rem;
  color: var(--sage);
}

/* ── GREAT HOUSES GRID ────────────────────── */
.houses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1.5rem;
  margin-bottom: 3rem;
}

/* ── HOUSE CARD ───────────────────────────── */
.house-card {
  background: rgba(20,13,10,.9);
  border: 1px solid color-mix(in srgb, var(--tc,var(--fire)) 20%, rgba(139,111,71,.2));
  border-radius: 20px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  backdrop-filter: blur(20px);
  transition: transform .3s ease, box-shadow .3s ease;
  animation: cardIn .45s ease-out both;
}

.house-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 20px 50px rgba(0,0,0,.5),
              0 0 30px color-mix(in srgb, var(--tc,var(--fire)) 20%, transparent);
}

@keyframes cardIn {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* top accent line */
.card-accent {
  height: 4px;
  background: linear-gradient(90deg,
    transparent 0%,
    var(--tc,var(--fire)) 40%,
    var(--tc,var(--fire)) 60%,
    transparent 100%
  );
}

/* ── crest + count ── */
.card-top {
  position: relative;
  display: flex;
  justify-content: center;
  padding: 1.75rem 1.5rem 1rem;
  background: linear-gradient(180deg,
    color-mix(in srgb, var(--tc,var(--fire)) 8%, transparent) 0%,
    transparent 100%
  );
}

.crest-ring {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  background: color-mix(in srgb, var(--tc,var(--fire)) 10%, rgba(20,13,10,.8));
  border: 2px solid color-mix(in srgb, var(--tc,var(--fire)) 40%, transparent);
  box-shadow: 0 0 0 4px color-mix(in srgb, var(--tc,var(--fire)) 10%, transparent),
              0 8px 30px rgba(0,0,0,.5),
              inset 0 1px 0 rgba(255,255,255,.05);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.crest-img {
  width: 74px;
  height: 74px;
  object-fit: contain;
  filter: drop-shadow(0 2px 6px rgba(0,0,0,.5));
}

.count-pill {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  display: flex;
  align-items: center;
  gap: .3rem;
  background: color-mix(in srgb, var(--tc,var(--fire)) 15%, rgba(20,13,10,.7));
  border: 1px solid color-mix(in srgb, var(--tc,var(--fire)) 30%, transparent);
  color: var(--tc,var(--fire-glow));
  font-size: .78rem;
  font-weight: 700;
  padding: .25rem .6rem;
  border-radius: 50px;
}

.count-pill svg { width: 13px; height: 13px; }

/* Night's Watch */
.house-card.nw .crest-ring {
  width: 110px;
  height: 110px;
  background: rgba(230,230,238,.9);
  border-color: rgba(160,160,185,.6);
  box-shadow: 0 0 0 4px rgba(90,90,110,.15),
              0 8px 30px rgba(0,0,0,.5),
              inset 0 1px 0 rgba(255,255,255,.2);
}
.house-card.nw .crest-img {
  width: 88px;
  height: 88px;
  opacity: 1;
  filter: drop-shadow(0 1px 4px rgba(0,0,0,.4));
}

/* ── identity ── */
.card-identity {
  text-align: center;
  padding: .7rem 1.25rem 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .3rem;
}

.card-tag {
  font-size: .6rem;
  letter-spacing: .2em;
  text-transform: uppercase;
  color: var(--tc,var(--fire-glow));
  background: color-mix(in srgb, var(--tc,var(--fire)) 12%, transparent);
  border: 1px solid color-mix(in srgb, var(--tc,var(--fire)) 28%, transparent);
  border-radius: 4px;
  padding: 2px 8px;
}

.card-name {
  font-family: 'Merriweather', serif;
  font-size: 1.3rem;
  color: var(--cream);
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0,0,0,.6);
  margin: 0;
}

.afk-badge {
  font-size: .68rem;
  font-weight: 600;
  background: rgba(80,80,100,.3);
  border: 1px solid rgba(130,130,160,.45);
  color: #b0b0c8;
  padding: .15rem .6rem;
  border-radius: 50px;
  letter-spacing: .04em;
}

/* ── hook ── */
.card-hook {
  margin: .85rem 1.25rem 0;
  padding: .65rem .9rem;
  font-size: .84rem;
  font-style: italic;
  color: var(--cream);
  opacity: .85;
  line-height: 1.55;
  text-align: center;
  background: color-mix(in srgb, var(--tc,var(--fire)) 6%, rgba(255,255,255,.02));
  border-radius: 10px;
  border: 1px solid color-mix(in srgb, var(--tc,var(--fire)) 15%, transparent);
}

/* ── traits ── */
.traits-list {
  list-style: none;
  margin: .85rem 1.25rem 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: .4rem;
}

.traits-list li {
  display: flex;
  align-items: flex-start;
  gap: .55rem;
  font-size: .81rem;
  color: var(--sage);
  line-height: 1.45;
}

.trait-dot {
  flex-shrink: 0;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  margin-top: .44em;
  opacity: .85;
}

/* ── curator ── */
.curator-row {
  display: flex;
  align-items: center;
  gap: .4rem;
  margin: .85rem 1.25rem 0;
  padding: .5rem .8rem;
  background: rgba(41,120,191,.07);
  border: 1px solid rgba(41,120,191,.2);
  border-radius: 8px;
  flex-wrap: wrap;
}

.curator-row svg {
  width: 13px;
  height: 13px;
  color: #7dc4f5;
  flex-shrink: 0;
}

.curator-label {
  font-size: .72rem;
  color: var(--sage);
  opacity: .8;
}

.curator-link {
  font-size: .75rem;
  font-weight: 600;
  color: #7dc4f5;
  text-decoration: none;
  transition: color .2s;
}

.curator-link:hover {
  color: #a3d4f7;
  text-decoration: underline;
}

/* ── members ── */
.members-panel {
  margin: .85rem .75rem .75rem;
  display: flex;
  flex-direction: column;
  gap: .25rem;
  flex: 1;
}

.members-header {
  font-size: .62rem;
  letter-spacing: .15em;
  text-transform: uppercase;
  color: var(--sage);
  opacity: .55;
  padding: 0 .25rem .3rem;
  border-bottom: 1px solid rgba(139,111,71,.15);
  margin-bottom: .15rem;
}

.empty-members {
  text-align: center;
  padding: .9rem;
  color: var(--sage);
  font-size: .82rem;
  font-style: italic;
  opacity: .6;
}

.member-row {
  display: flex;
  align-items: center;
  gap: .55rem;
  padding: .4rem .6rem;
  background: rgba(255,255,255,.03);
  border-radius: 8px;
  transition: background .2s;
}

.member-row:hover { background: rgba(255,255,255,.06); }

.member-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  overflow: hidden;
  background: var(--forest-mid,#2a1f1a);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  border: 1px solid rgba(139,111,71,.25);
}

.member-avatar.small { width: 22px; height: 22px; }

.member-avatar img { width: 100%; height: 100%; object-fit: cover; }

.member-initial {
  font-size: .7rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.member-name { flex: 1; color: var(--cream); font-size: .85rem; font-weight: 500; }

.member-status {
  font-size: .67rem;
  font-weight: 600;
  padding: 2px 7px;
  border-radius: 5px;
}

.member-status.pending  { background: rgba(255,179,71,.15); color: var(--fire-glow); }
.member-status.approved { background: rgba(34,197,94,.15);  color: #22c55e; }
.member-status.paid     { background: rgba(34,197,94,.2);   color: #4ade80; }
.member-status.rejected { background: rgba(239,68,68,.15);  color: #ef4444; }

/* ── MINOR HOUSES ─────────────────────────── */
.minor-header {
  display: flex;
  align-items: center;
  gap: 1.25rem;
  margin: .5rem 0 1.75rem;
}

.minor-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, transparent, rgba(139,111,71,.35), transparent);
}

.minor-title-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: .2rem;
  white-space: nowrap;
}

.minor-title {
  font-family: 'Merriweather', serif;
  font-size: 1.35rem;
  color: var(--cream);
  opacity: .6;
  letter-spacing: .06em;
}

.minor-subtitle {
  font-size: .65rem;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--sage);
  opacity: .5;
}

.minor-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
  margin-bottom: 3rem;
}

.minor-card {
  background: rgba(20,13,10,.75);
  border: 1px solid color-mix(in srgb, var(--tc,var(--fire)) 18%, rgba(139,111,71,.2));
  border-top: 2px solid color-mix(in srgb, var(--tc,var(--fire)) 50%, transparent);
  border-radius: 14px;
  padding: .85rem .9rem;
  transition: transform .25s, box-shadow .25s;
}

.minor-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 25px rgba(0,0,0,.35);
}

.minor-top {
  display: flex;
  align-items: center;
  gap: .65rem;
  margin-bottom: .7rem;
}

.minor-crest-wrap {
  position: relative;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  background: rgba(255,255,255,.04);
  border: 1px solid rgba(139,111,71,.2);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
}

.minor-crest-img {
  width: 30px;
  height: 30px;
  object-fit: contain;
  position: relative;
  z-index: 1;
}

.minor-letter {
  position: absolute;
  font-family: 'Merriweather', serif;
  font-size: 1rem;
  font-weight: 700;
  z-index: 0;
}

.minor-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: .12rem;
}

.minor-name-row {
  display: flex;
  align-items: center;
  gap: .4rem;
}

.minor-name {
  font-family: 'Merriweather', serif;
  font-size: .88rem;
  color: var(--cream);
  font-weight: 700;
}

.minor-org-badge {
  font-size: .58rem;
  letter-spacing: .1em;
  text-transform: uppercase;
  font-weight: 600;
  background: rgba(139,111,71,.15);
  border: 1px solid rgba(139,111,71,.3);
  color: rgba(197,167,110,.8);
  padding: 1px 5px;
  border-radius: 4px;
  flex-shrink: 0;
}

.minor-desc {
  font-size: .7rem;
  color: var(--sage);
  opacity: .7;
  line-height: 1.35;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.minor-count {
  font-size: .72rem;
  font-weight: 600;
  color: color-mix(in srgb, var(--tc,var(--fire)) 80%, var(--cream));
  flex-shrink: 0;
}

.minor-members {
  display: flex;
  flex-direction: column;
  gap: .28rem;
  border-top: 1px solid rgba(139,111,71,.12);
  padding-top: .55rem;
}

.minor-member {
  display: flex;
  align-items: center;
  gap: .45rem;
  font-size: .78rem;
  color: var(--sage);
}

.minor-empty {
  font-size: .75rem;
  color: var(--sage);
  opacity: .5;
  font-style: italic;
  text-align: center;
  margin: 0;
}

/* ── BACK ─────────────────────────────────── */
.back-section {
  text-align: center;
  margin-top: 2rem;
}

/* ── RESPONSIVE ───────────────────────────── */
@media (max-width: 1200px) {
  .houses-grid { grid-template-columns: repeat(3, 1fr); }
  .minor-grid  { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 900px) {
  .houses-grid { grid-template-columns: repeat(2, 1fr); }
  .minor-grid  { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 600px) {
  .teams-main  { padding: 5rem .75rem 3rem; }
  .houses-grid { grid-template-columns: 1fr; }
  .crest-ring  { width: 80px; height: 80px; }
  .crest-img   { width: 60px; height: 60px; }
}

@media (max-width: 380px) {
  .minor-grid { grid-template-columns: 1fr; }
}
</style>
