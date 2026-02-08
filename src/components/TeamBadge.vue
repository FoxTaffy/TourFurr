<template>
  <span
    v-if="team"
    class="team-badge"
    :style="badgeStyle"
    :title="team.name"
  >
    <img
      v-if="team.crest_url"
      :src="team.crest_url"
      :alt="team.name"
      class="team-crest"
    />
    <span v-else class="team-initial">{{ team.name[0] }}</span>
  </span>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useTeamsStore } from '../stores/teams'

const props = defineProps<{
  teamId: string | null | undefined
}>()

const teamsStore = useTeamsStore()

onMounted(async () => {
  if (teamsStore.teams.length === 0) {
    await teamsStore.fetchTeams()
  }
})

const team = computed(() => {
  if (!props.teamId) return null
  return teamsStore.getTeamById(props.teamId)
})

const badgeStyle = computed(() => {
  if (!team.value) return {}
  return {
    '--team-color': team.value.color,
    '--team-bg': team.value.color + '30'
  }
})
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
  margin-left: 6px;
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
