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

// Hardcoded fallback teams — used when the DB table doesn't exist yet
const FALLBACK_TEAMS: Team[] = [
  {
    id: 'stark',
    name: 'Stark',
    slug: 'stark',
    description: 'Winter is Coming. The noble wolves of the North, bound by honor and duty.',
    crest_url: '/images/crests/stark.png',
    color: '#8B9DAF',
    created_at: ''
  },
  {
    id: 'lannister',
    name: 'Lannister',
    slug: 'lannister',
    description: 'Hear Me Roar! The golden lions of Casterly Rock, wielding power and wealth.',
    crest_url: '/images/crests/lannister.png',
    color: '#C8A951',
    created_at: ''
  },
  {
    id: 'tyrell',
    name: 'Tyrell',
    slug: 'tyrell',
    description: 'Growing Strong. The golden roses of Highgarden, masters of diplomacy and abundance.',
    crest_url: '/images/crests/tyrell.png',
    color: '#2D6A4F',
    created_at: ''
  },
  {
    id: 'baratheon',
    name: 'Baratheon',
    slug: 'baratheon',
    description: 'Ours is the Fury. The mighty stags of Storm\'s End, forged in battle.',
    crest_url: '/images/crests/baratheon.png',
    color: '#FFD700',
    created_at: ''
  },
  {
    id: 'martell',
    name: 'Martell',
    slug: 'martell',
    description: 'Unbowed, Unbent, Unbroken. The sun spears of Dorne, fierce and unyielding.',
    crest_url: '/images/crests/martell.png',
    color: '#E07A1E',
    created_at: ''
  }
]

export const useTeamsStore = defineStore('teams', () => {
  const teams = ref<Team[]>([])
  const members = ref<Record<string, TeamMember[]>>({})
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  const usingFallback = ref(false)

  const teamsById = computed(() => {
    const map: Record<string, Team> = {}
    for (const team of teams.value) {
      map[team.id] = team
    }
    return map
  })

  const teamsBySlug = computed(() => {
    const map: Record<string, Team> = {}
    for (const team of teams.value) {
      map[team.slug] = team
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
        logger.error('Failed to fetch teams from DB, using fallback:', dbError)
        teams.value = FALLBACK_TEAMS
        usingFallback.value = true
        return
      }

      if (data && data.length > 0) {
        teams.value = data
        usingFallback.value = false
      } else {
        teams.value = FALLBACK_TEAMS
        usingFallback.value = true
      }
    } catch (err: any) {
      logger.error('Error fetching teams, using fallback:', err)
      teams.value = FALLBACK_TEAMS
      usingFallback.value = true
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

      if (!dbError && data) {
        members.value[teamId] = data
        return
      }
    } catch {
      // Silently fail — no members to show
    }
    members.value[teamId] = []
  }

  async function selectTeam(userId: string, teamId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const { error: dbError } = await supabase
        .from('users')
        .update({ team_id: teamId })
        .eq('id', userId)

      if (dbError) {
        logger.error('DB update failed for team selection, saving locally:', dbError)
      }
    } catch (err: any) {
      logger.error('Error selecting team, saving locally:', err)
    }

    // Always save locally regardless of DB result
    localStorage.setItem(`user_team_${userId}`, teamId)
    return { success: true }
  }

  function getTeamById(teamId: string | null): Team | null {
    if (!teamId) return null
    return teamsById.value[teamId] || null
  }

  function getTeamBySlug(slug: string): Team | null {
    return teamsBySlug.value[slug] || null
  }

  return {
    teams,
    members,
    isLoading,
    error,
    usingFallback,
    teamsById,
    teamsBySlug,
    fetchTeams,
    fetchTeamMembers,
    selectTeam,
    getTeamById,
    getTeamBySlug
  }
})
