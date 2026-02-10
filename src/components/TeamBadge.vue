<template>
  <span
    v-if="team"
    class="team-badge"
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
  flex-shrink: 0;
  vertical-align: middle;
  margin-right: 6px;
  cursor: default;
}

.team-crest {
  width: 22px;
  height: 22px;
  object-fit: contain;
}

.team-initial {
  font-size: 0.7rem;
  font-weight: 700;
  color: var(--team-color, var(--fire));
  line-height: 1;
  text-transform: uppercase;
}
</style>
