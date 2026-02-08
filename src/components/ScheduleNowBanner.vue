<template>
  <div v-if="currentEvent || nextEvent" class="now-banner" :class="bannerClass">
    <div class="now-pulse"></div>
    <div class="now-content">
      <template v-if="currentEvent">
        <span class="now-label">Сейчас</span>
        <span class="now-separator">&mdash;</span>
        <span class="now-title">{{ currentEvent.title }}</span>
        <span v-if="currentEvent.location" class="now-location">{{ currentEvent.location }}</span>
      </template>
      <template v-else-if="nextEvent">
        <span class="now-label upcoming">Далее в {{ formatTime(nextEvent.start_time) }}</span>
        <span class="now-separator">&mdash;</span>
        <span class="now-title">{{ nextEvent.title }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useScheduleStore } from '../stores/schedule'

const scheduleStore = useScheduleStore()

// Re-evaluate current/next every 30 seconds
const tick = ref(0)
let interval: ReturnType<typeof setInterval> | null = null

onMounted(() => {
  interval = setInterval(() => { tick.value++ }, 30000)
})

onUnmounted(() => {
  if (interval) clearInterval(interval)
})

const currentEvent = computed(() => {
  void tick.value // trigger reactivity on tick
  return scheduleStore.currentEvent
})

const nextEvent = computed(() => {
  void tick.value
  return scheduleStore.nextEvent
})

const bannerClass = computed(() => {
  if (currentEvent.value) {
    return `category-${currentEvent.value.category}`
  }
  return 'upcoming-only'
})

function formatTime(time: string): string {
  return time.slice(0, 5)
}
</script>

<style scoped>
.now-banner {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem 1.5rem;
  background: linear-gradient(135deg, rgba(255, 107, 53, 0.2), rgba(255, 179, 71, 0.15));
  border: 1.5px solid rgba(255, 107, 53, 0.5);
  border-radius: 14px;
  margin-bottom: 1.5rem;
  position: relative;
  overflow: hidden;
}

.now-banner.category-meal {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(22, 163, 74, 0.1));
  border-color: rgba(34, 197, 94, 0.5);
}

.now-banner.category-ceremony {
  background: linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(139, 92, 246, 0.1));
  border-color: rgba(168, 85, 247, 0.5);
}

.now-banner.category-meeting {
  background: linear-gradient(135deg, rgba(59, 130, 246, 0.15), rgba(37, 99, 235, 0.1));
  border-color: rgba(59, 130, 246, 0.5);
}

.now-banner.category-entertainment {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.15), rgba(219, 39, 119, 0.1));
  border-color: rgba(236, 72, 153, 0.5);
}

.now-banner.upcoming-only {
  background: linear-gradient(135deg, rgba(139, 111, 71, 0.15), rgba(97, 78, 50, 0.1));
  border-color: rgba(139, 111, 71, 0.4);
}

.now-pulse {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--fire);
  flex-shrink: 0;
  animation: pulse 2s infinite;
}

.now-banner.category-meal .now-pulse { background: #22c55e; }
.now-banner.category-ceremony .now-pulse { background: #a855f7; }
.now-banner.category-meeting .now-pulse { background: #3b82f6; }
.now-banner.category-entertainment .now-pulse { background: #ec4899; }
.now-banner.upcoming-only .now-pulse { background: var(--sage); animation: none; }

@keyframes pulse {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.3); }
}

.now-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.now-label {
  font-size: 0.85rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: var(--fire);
}

.now-label.upcoming {
  color: var(--sage);
}

.now-banner.category-meal .now-label { color: #22c55e; }
.now-banner.category-ceremony .now-label { color: #a855f7; }
.now-banner.category-meeting .now-label { color: #3b82f6; }
.now-banner.category-entertainment .now-label { color: #ec4899; }

.now-separator {
  color: var(--sage);
}

.now-title {
  font-size: 1.05rem;
  font-weight: 600;
  color: var(--cream);
}

.now-location {
  font-size: 0.85rem;
  color: var(--sage);
  padding: 2px 8px;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 6px;
}

@media (max-width: 768px) {
  .now-banner {
    padding: 0.75rem 1rem;
    gap: 0.5rem;
  }

  .now-label {
    font-size: 0.75rem;
  }

  .now-title {
    font-size: 0.95rem;
  }
}
</style>
