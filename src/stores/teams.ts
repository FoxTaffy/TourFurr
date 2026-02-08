import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import type { Team } from '../types'
import { logger } from '../utils/logger'

export interface TeamMember {
  id: string
  nickname: string
  avatar_url: string | null
  status: string
  team_id: string
}

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>([])
  const members = ref<Record<string, TeamMember[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  const teamsById = computed(() => {
    const map: Record<string, Team> = {}
    for (const team of teams.value) {
      map[team.id] = team
    }
    return map
  })

  async function fetchTeams() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('teams')
        .select('*')
        .order('name')

      if (dbError) {
        logger.error('Failed to fetch teams:', dbError)
        error.value = dbError.message
        return
      }

      teams.value = data || []
    } catch (err: any) {
      logger.error('Error fetching teams:', err)
      error.value = err.message || 'Failed to load teams'
    } finally {
      isLoading.value = false
    }
  }

  async function fetchTeamMembers(teamId: string) {
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, nickname, avatar_url, status, team_id')
        .eq('team_id', teamId)
        .order('nickname')

      if (dbError) {
        logger.error('Failed to fetch team members:', dbError)
        return
      }

      members.value[teamId] = data || []
    } catch (err: any) {
      logger.error('Error fetching team members:', err)
    }
  }

  function getTeamById(teamId: string | null): Team | null {
    if (!teamId) return null
    return teamsById.value[teamId] || null
  }

  return {
    teams,
    members,
    isLoading,
    error,
    teamsById,
    fetchTeams,
    fetchTeamMembers,
    getTeamById
  }
})
