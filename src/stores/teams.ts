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
    name: 'Старки',
    slug: 'stark',
    description: '«Зима близко». Благородные волки Севера, связанные честью и долгом.',
    crest_url: '/images/crests/stark.png',
    color: '#8B9DAF',
    created_at: ''
  },
  {
    id: 'lannister',
    name: 'Ланнистеры',
    slug: 'lannister',
    description: '«Услышь мой рёв!» Золотые львы Утёса Кастерли, владеющие властью и богатством.',
    crest_url: '/images/crests/lannister.png',
    color: '#C8A951',
    created_at: ''
  },
  {
    id: 'tyrell',
    name: 'Тиреллы',
    slug: 'tyrell',
    description: '«Вырастая — крепнем». Золотые розы Хайгардена, мастера дипломатии и изобилия.',
    crest_url: '/images/crests/tyrell.png',
    color: '#2D6A4F',
    created_at: ''
  },
  {
    id: 'baratheon',
    name: 'Баратеоны',
    slug: 'baratheon',
    description: '«Нам является ярость». Могучие олени Штормового Предела, закалённые в битвах.',
    crest_url: '/images/crests/baratheon.png',
    color: '#FFD700',
    created_at: ''
  },
  {
    id: 'martell',
    name: 'Мартеллы',
    slug: 'martell',
    description: '«Непреклонные, несгибаемые, несломленные». Солнечные копья Дорна, яростные и непокорные.',
    crest_url: '/images/crests/martell.png',
    color: '#E07A1E',
    created_at: ''
  }
]

// After this date, house selection is locked
export const HOUSE_LOCK_DATE = new Date('2026-08-01T00:00:00')

export function isHouseLocked(): boolean {
  return new Date() >= HOUSE_LOCK_DATE
}

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
    // Try DB first
    try {
      const { data, error: dbError } = await supabase
        .from('users')
        .select('id, nickname, avatar_url, status, team_id')
        .eq('team_id', teamId)
        .order('nickname')

      if (!dbError && data && data.length > 0) {
        members.value[teamId] = data
        return
      }
    } catch {
      // DB column may not exist
    }

    // Fallback: check current user from localStorage
    try {
      const stored = localStorage.getItem('current_user')
      if (stored) {
        const currentUser = JSON.parse(stored)
        const userTeam = currentUser.teamId || localStorage.getItem(`user_team_${currentUser.id}`)
        if (userTeam === teamId) {
          members.value[teamId] = [{
            id: currentUser.id,
            nickname: currentUser.nickname,
            avatar_url: currentUser.avatar || null,
            status: currentUser.status || 'approved',
            team_id: teamId
          }]
          return
        }
      }
    } catch {
      // ignore parse errors
    }

    if (!members.value[teamId]) {
      members.value[teamId] = []
    }
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
