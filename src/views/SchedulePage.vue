<template>
  <div class="schedule-page">
    <!-- Animated Background -->
    <div class="bg-forest"></div>
    <div class="fog"></div>

    <!-- Header -->
    <Header :isDashboard="true" />

    <!-- Main Content -->
    <main class="schedule-main">
      <h1 class="page-title">Расписание</h1>
      <p class="page-subtitle">TourFurr 3: Game of Thrones &mdash; 6-9 августа 2026</p>

      <!-- Now Banner -->
      <ScheduleNowBanner />

      <!-- Loading -->
      <div v-if="isLoading" class="loading">
        <div class="spinner"></div>
        <p>Загрузка расписания...</p>
      </div>

      <!-- Error -->
      <div v-else-if="error" class="error-banner">
        <p>{{ error }}</p>
        <button @click="reload" class="retry-btn">Попробовать снова</button>
      </div>

      <!-- Schedule Days -->
      <div v-else class="schedule-days">
        <!-- Day Tabs -->
        <div class="day-tabs">
          <button
            v-for="day in days"
            :key="day.dayNumber"
            @click="activeDay = day.dayNumber"
            class="day-tab"
            :class="{ active: activeDay === day.dayNumber }"
          >
            {{ getDayLabel(day.dayNumber) }}
            <span class="day-date">{{ formatDayDate(day.date) }}</span>
          </button>
        </div>

        <!-- Events Table -->
        <div class="events-table-wrapper">
          <table class="events-table">
            <thead>
              <tr>
                <th class="col-time">Время</th>
                <th class="col-event">Ивент</th>
                <th class="col-location">Локация</th>
                <th class="col-host">Ведущий</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="event in activeDayEvents"
                :key="event.id"
                class="event-row"
                :class="[
                  `category-${event.category}`,
                  { 'is-current': isCurrentEvent(event) }
                ]"
              >
                <td class="col-time">
                  <span class="time-value">{{ formatTime(event.start_time) }}</span>
                </td>
                <td class="col-event">
                  <div class="event-title-cell">
                    <span v-if="isCurrentEvent(event)" class="live-dot"></span>
                    <span class="event-title">{{ event.title }}</span>
                  </div>
                </td>
                <td class="col-location">
                  <span v-if="event.location" class="location-text">{{ event.location }}</span>
                  <span v-else class="empty-cell">&mdash;</span>
                </td>
                <td class="col-host">
                  <span v-if="event.host" class="host-text">{{ event.host }}</span>
                  <span v-else class="empty-cell">&mdash;</span>
                </td>
              </tr>
            </tbody>
          </table>
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
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '../stores/schedule'
import type { ScheduleEvent } from '../stores/schedule'
import Header from '../components/Header.vue'
import ScheduleNowBanner from '../components/ScheduleNowBanner.vue'

const scheduleStore = useScheduleStore()

const isLoading = computed(() => scheduleStore.isLoading)
const error = computed(() => scheduleStore.error)
const days = computed(() => scheduleStore.days)
const activeDay = ref(1)

// Re-evaluate "current" status every 30s
const tick = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

const activeDayEvents = computed(() => {
  void tick.value
  const day = days.value.find(d => d.dayNumber === activeDay.value)
  return day?.events || []
})

function isCurrentEvent(event: ScheduleEvent): boolean {
  void tick.value
  const current = scheduleStore.currentEvent
  return current?.id === event.id
}

function formatTime(time: string): string {
  return time.slice(0, 5)
}

function formatDayDate(dateStr: string): string {
  const date = new Date(dateStr + 'T12:00:00')
  return date.toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' })
}

function getDayLabel(dayNumber: number): string {
  return scheduleStore.getDayLabel(dayNumber)
}

async function reload() {
  await scheduleStore.fetchSchedule()
}

onMounted(async () => {
  await scheduleStore.fetchSchedule()
  scheduleStore.subscribeToRealtime()
  interval = setInterval(() => { tick.value++ }, 30000)

  // Auto-select the current day
  const now = new Date()
  for (const day of days.value) {
    const dayDate = new Date(day.date + 'T12:00:00')
    if (dayDate.toDateString() === now.toDateString()) {
      activeDay.value = day.dayNumber
      break
    }
  }
})

onUnmounted(() => {
  scheduleStore.unsubscribeFromRealtime()
  if (interval) clearInterval(interval)
})
</script>

<style scoped>
.schedule-page {
  min-height: 100vh;
  position: relative;
}

.schedule-main {
  position: relative;
  z-index: 10;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 6rem;
}

.page-title {
  font-family: 'Merriweather', serif;
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: var(--fire-glow);
  text-align: center;
  margin-bottom: 0.25rem;
}

.page-subtitle {
  text-align: center;
  color: var(--sage);
  font-size: 1rem;
  margin-bottom: 1.5rem;
}

/* Loading & Error */
.loading {
  text-align: center;
  padding: 3rem;
  color: var(--sage);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--moss);
  border-top-color: var(--fire);
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 1rem;
}

@keyframes spin {
  100% { transform: rotate(360deg); }
}

.error-banner {
  text-align: center;
  padding: 2rem;
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.4);
  border-radius: 12px;
  color: #ef4444;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background: rgba(255, 107, 53, 0.2);
  border: 1px solid var(--fire);
  border-radius: 8px;
  color: var(--fire-glow);
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background: rgba(255, 107, 53, 0.3);
}

/* Day Tabs */
.day-tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

.day-tab {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.2rem;
  padding: 0.75rem 1.5rem;
  background: rgba(42, 31, 26, 0.6);
  border: 1px solid rgba(139, 111, 71, 0.3);
  border-radius: 10px;
  color: var(--sage);
  font-family: 'Inter', sans-serif;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  flex-shrink: 0;
}

.day-tab:hover {
  border-color: var(--fire);
  color: var(--cream);
}

.day-tab.active {
  background: linear-gradient(135deg, var(--fire), var(--fire-glow));
  border-color: var(--fire);
  color: white;
}

.day-date {
  font-size: 0.75rem;
  font-weight: 400;
  opacity: 0.8;
}

/* Events Table */
.events-table-wrapper {
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  background: rgba(42, 31, 26, 0.85);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(139, 111, 71, 0.4);
  border-radius: 16px;
  margin-bottom: 2rem;
}

.events-table {
  width: 100%;
  border-collapse: collapse;
}

.events-table th {
  padding: 0.75rem 1rem;
  text-align: left;
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--sage);
  border-bottom: 2px solid rgba(139, 111, 71, 0.3);
  background: rgba(26, 17, 14, 0.4);
}

.events-table th:first-child {
  border-radius: 16px 0 0 0;
}

.events-table th:last-child {
  border-radius: 0 16px 0 0;
}

/* Table columns */
.col-time { width: 70px; }
.col-event { min-width: 200px; }
.col-location { width: 160px; }
.col-host { width: 200px; }

/* Event Rows */
.event-row {
  transition: background 0.2s ease;
}

.event-row:hover {
  background: rgba(255, 255, 255, 0.03);
}

.event-row td {
  padding: 0.65rem 1rem;
  border-bottom: 1px solid rgba(139, 111, 71, 0.15);
  font-size: 0.9rem;
  vertical-align: middle;
}

.event-row:last-child td {
  border-bottom: none;
}

.time-value {
  font-family: 'Courier New', monospace;
  font-weight: 600;
  color: var(--cream);
  font-size: 0.9rem;
}

.event-title-cell {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.event-title {
  color: var(--cream);
  font-weight: 500;
}

.location-text {
  color: var(--sage);
}

.host-text {
  color: var(--fire-glow);
  font-size: 0.85rem;
}

.empty-cell {
  color: rgba(139, 111, 71, 0.4);
}

/* Category row colors */
.event-row.category-meal {
  background: rgba(34, 197, 94, 0.06);
}
.event-row.category-meal .event-title { color: #86efac; }

.event-row.category-ceremony {
  background: rgba(168, 85, 247, 0.06);
}
.event-row.category-ceremony .event-title { color: #c084fc; }

.event-row.category-meeting {
  background: rgba(59, 130, 246, 0.06);
}
.event-row.category-meeting .event-title { color: #93c5fd; }

.event-row.category-entertainment {
  background: rgba(236, 72, 153, 0.06);
}
.event-row.category-entertainment .event-title { color: #f9a8d4; }

.event-row.category-exercise {
  background: rgba(251, 191, 36, 0.04);
}
.event-row.category-exercise .event-title { color: #fbbf24; }

/* Current event highlight */
.event-row.is-current {
  background: rgba(255, 107, 53, 0.12) !important;
  border-left: 3px solid var(--fire);
}

.event-row.is-current .event-title {
  color: var(--fire-glow) !important;
  font-weight: 700;
}

.live-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--fire);
  flex-shrink: 0;
  animation: pulse-dot 2s infinite;
}

@keyframes pulse-dot {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.4; }
}

/* Back Section */
.back-section {
  text-align: center;
}

.back-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: rgba(255, 107, 53, 0.15);
  border: 1px solid rgba(255, 107, 53, 0.4);
  border-radius: 12px;
  color: var(--fire-glow);
  font-family: 'Inter', sans-serif;
  font-size: 0.9rem;
  text-decoration: none;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 107, 53, 0.25);
  transform: translateY(-2px);
}

.back-btn svg {
  width: 18px;
  height: 18px;
}

/* Responsive */
@media (max-width: 768px) {
  .schedule-main {
    padding: 1rem;
    padding-top: 5.5rem;
  }

  .events-table th,
  .event-row td {
    padding: 0.5rem 0.65rem;
    font-size: 0.8rem;
  }

  .col-location,
  .col-host {
    display: none;
  }

  th.col-location,
  th.col-host {
    display: none;
  }

  .events-table-wrapper {
    border-radius: 12px;
  }

  .day-tab {
    padding: 0.6rem 1rem;
    font-size: 0.85rem;
  }
}
</style>
