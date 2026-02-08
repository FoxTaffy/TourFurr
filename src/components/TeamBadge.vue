<template>
  <span
    v-if="team"
    class="team-badge"
    :style="badgeStyle"
    :title="team.name"
  >
    <img
      :src="crestSrc"
      :alt="team.name"
      class="team-crest"
      @error="onImgError"
    />
    <span v-if="imgFailed" class="team-initial">{{ team.name[0] }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import { useTeamsStore } from '../stores/teams'

// Local crest fallback mapping by slug
const CREST_MAP: Record<string, string> = {
  stark: '/images/crests/stark.png',
  lannister: '/images/crests/lannister.png',
  tyrell: '/images/crests/tyrell.png',
  baratheon: '/images/crests/baratheon.png',
  martell: '/images/crests/martell.png'
}

const props = defineProps<{
  teamId: string | null | undefined
}>()

const teamsStore = useTeamsStore()
const imgFailed = ref(false)

onMounted(async () => {
  if (teamsStore.teams.length === 0) {
    await teamsStore.fetchTeams()
  }
})

const team = computed(() => {
  if (!props.teamId) return null
  return teamsStore.getTeamById(props.teamId)
})

const crestSrc = computed(() => {
  if (!team.value) return ''
  // Prefer the DB crest_url, fall back to local map by slug
  if (team.value.crest_url) return team.value.crest_url
  return CREST_MAP[team.value.slug] || ''
})

const badgeStyle = computed(() => {
  if (!team.value) return {}
  return {
    '--team-color': team.value.color,
    '--team-bg': team.value.color + '30'
  }
})

function onImgError() {
  imgFailed.value = true
}
</script>

<style scoped>
.team-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border-radius: 6px;
  background: var(--team-bg, rgba(255, 107, 53, 0.2));
  border: 1.5px solid var(--team-color, var(--fire));
  flex-shrink: 0;
  vertical-align: middle;
  margin-right: 6px;
  transition: all 0.2s ease;
  cursor: default;
}

.team-badge:hover {
  transform: scale(1.15);
  box-shadow: 0 0 8px var(--team-color, var(--fire));
}

.team-crest {
  width: 14px;
  height: 14px;
  object-fit: contain;
  border-radius: 2px;
}

.team-initial {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--team-color, var(--fire));
  line-height: 1;
  text-transform: uppercase;
}
</style>
