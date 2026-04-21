<template>
  <section id="participants">
    <div class="container">
      <h2 class="section-title">Участники</h2>

      <div v-if="isLoading" class="participants-loading">
        <div class="page-spinner"></div>
      </div>

      <template v-else>
        <p class="participants-count">{{ participants.length }} участников едут на ТурФурр</p>

        <div class="participants-grid">
          <div
            v-for="p in participants"
            :key="p.id"
            class="participant-card glass-card"
          >
            <div class="p-avatar">
              <img
                v-if="p.avatar_url"
                :src="p.avatar_url"
                :alt="p.nickname"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <span v-else class="p-initial">{{ p.nickname?.[0]?.toUpperCase() }}</span>
            </div>
            <div class="p-name">{{ p.nickname }}</div>
            <div v-if="p.team" class="p-house">
              <img
                :src="p.team.crest_url || `/images/crests/${p.team.slug}.png`"
                :alt="p.team.name"
                class="p-crest"
                @error="($event.target as HTMLImageElement).style.display = 'none'"
              />
              <span :style="{ color: p.team.color }">{{ p.team.name }}</span>
            </div>
            <div v-else class="p-house p-no-house">Дом не выбран</div>
          </div>
        </div>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '../services/supabase'

interface Team {
  id: string
  name: string
  slug: string
  color: string
  crest_url: string | null
}

interface Participant {
  id: string
  nickname: string
  avatar_url: string | null
  team_id: string | null
  team: Team | null
}

const participants = ref<Participant[]>([])
const isLoading = ref(true)

onMounted(async () => {
  try {
    const { data: teamsData, error: teamsError } = await supabase.from('teams').select('id, name, slug, color, crest_url')
    
    if (teamsError) {
      console.error('Ошибка при загрузке домов:', teamsError)
      return
    }
    
    const teamsMap: Record<string, Team> = {}
    for (const t of (teamsData || [])) {
      teamsMap[t.id] = t
    }

    const { data, error } = await supabase
      .from('users')
      .select('id, nickname, avatar_url, team_id')
      .in('status', ['approved', 'paid'])
      .order('nickname')

    if (error) {
      console.error('Ошибка при загрузке участников:', error)
      return
    }

    participants.value = (data || []).map((u: any) => ({
      ...u,
      team: u.team_id ? (teamsMap[u.team_id] || null) : null
    }))
  } catch (err) {
    console.error('Ошибка подключения к базе данных:', err)
  } finally {
    isLoading.value = false
  }
})
</script>

<style scoped>
#participants {
  padding: 4rem 0;
}

.container {
  max-width: 1300px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-title {
  font-family: 'Merriweather', serif;
  font-size: 2.2rem;
  color: var(--fire-glow);
  text-align: center;
  margin-bottom: 0.5rem;
}

.participants-count {
  text-align: center;
  color: var(--sage);
  font-size: 0.95rem;
  margin-bottom: 2rem;
  opacity: 0.8;
}

.participants-loading {
  display: flex;
  justify-content: center;
  padding: 3rem 0;
}

.participants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
  gap: 1rem;
}

.participant-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1.2rem 0.8rem !important;
  text-align: center;
  transition: transform 0.2s;
}

.participant-card:hover {
  transform: translateY(-4px);
}

.p-avatar {
  width: 56px;
  height: 56px;
  border-radius: 50%;
  background: var(--forest-mid, #2a1f1a);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  flex-shrink: 0;
  border: 2px solid rgba(255, 179, 71, 0.25);
}

.p-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.p-initial {
  font-size: 1.3rem;
  font-weight: 700;
  color: var(--fire-glow);
}

.p-name {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--cream, #f5e6d3);
  word-break: break-word;
  line-height: 1.3;
}

.p-house {
  display: flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.75rem;
  font-weight: 500;
}

.p-crest {
  width: 16px;
  height: 16px;
  object-fit: contain;
  flex-shrink: 0;
}

.p-no-house {
  color: var(--sage, #8a9a7a);
  font-size: 0.72rem;
  opacity: 0.6;
}
</style>
