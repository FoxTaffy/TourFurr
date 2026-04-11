import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import type { Team } from '../types'
import { logger } from '../utils/logger'
import { safeStorage } from '../utils/safeStorage'

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
    description: '«Зима близко». Непоколебимые Хранители Севера.',
    crest_url: '/images/crests/stark.png',
    color: '#8B9DAF',
    created_at: ''
  },
  {
    id: 'lannister',
    name: 'Ланнистеры',
    slug: 'lannister',
    description: '«Услышь мой рёв!» Стратеги, не знающие поражений.',
    crest_url: '/images/crests/lannister.png',
    color: '#C8A951',
    created_at: ''
  },
  {
    id: 'tyrell',
    name: 'Тиреллы',
    slug: 'tyrell',
    description: '«Вырастая — крепнем». Цветок, что непоколебим в буре.',
    crest_url: '/images/crests/tyrell.png',
    color: '#2D6A4F',
    created_at: ''
  },
  {
    id: 'baratheon',
    name: 'Баратеоны',
    slug: 'baratheon',
    description: '«Нам ярость!» Доблесть, закалённая в огне побед.',
    crest_url: '/images/crests/baratheon.png',
    color: '#FFD700',
    created_at: ''
  },
  {
    id: 'martell',
    name: 'Мартеллы',
    slug: 'martell',
    description: '«Непреклонные. Несгибаемые. Непобеждённые». Несгибаемые под палящим солнцем Дорна.',
    crest_url: '/images/crests/martell.png',
    color: '#E07A1E',
    created_at: ''
  },
  {
    id: 'nights-watch',
    name: 'Ночной Дозор',
    slug: 'nights-watch',
    description: 'Девиза нет. Есть клятва — но это на другой раз. И вообще мы отдыхаем.',
    crest_url: '/images/crests/the-wall-bg.png',
    color: '#555565',
    created_at: ''
  },
  // Minor houses (organizers only)
  {
    id: 'arryn',
    name: 'Аррен',
    slug: 'arryn',
    description: '«Высоко, как честь». Владыки Долины Аррен.',
    crest_url: '/images/crests/arryn.png',
    color: '#6BAED6',
    created_at: ''
  },
  {
    id: 'florent',
    name: 'Флорент',
    slug: 'florent',
    description: '«Наша честь чиста». Лорды Бьюфорта.',
    crest_url: '/images/crests/florent.png',
    color: '#C94040',
    created_at: ''
  },
  {
    id: 'greyjoy',
    name: 'Грейджой',
    slug: 'greyjoy',
    description: '«Мы не сеем». Владыки Железных островов.',
    crest_url: '/images/crests/greyjoy.png',
    color: '#8B7355',
    created_at: ''
  },
  {
    id: 'tarth',
    name: 'Тарт',
    slug: 'tarth',
    description: 'Лорды сапфирового острова Тарт.',
    crest_url: '/images/crests/tarth.png',
    color: '#4A9BBF',
    created_at: ''
  },
  {
    id: 'strong',
    name: 'Стронг',
    slug: 'strong',
    description: 'Древний дом Речных земель.',
    crest_url: '/images/crests/strong.png',
    color: '#7B6EA8',
    created_at: ''
  },
  {
    id: 'hightower',
    name: 'Хайтауэр',
    slug: 'hightower',
    description: '«Мы освещаем путь». Владыки Древней Дубравы.',
    crest_url: '/images/crests/hightower.png',
    color: '#7BB7C4',
    created_at: ''
  },
  {
    id: 'tully',
    name: 'Талли',
    slug: 'tully',
    description: '«Семья, долг, честь». Лорды-сюзерены Речных земель.',
    crest_url: '/images/crests/tully.png',
    color: '#3B82B0',
    created_at: ''
  },
  {
    id: 'baelish',
    name: 'Бейлиш',
    slug: 'baelish',
    description: 'Дом пересмешника. Хитрость и знание — оружие.',
    crest_url: '/images/crests/baelish.png',
    color: '#6B5B95',
    created_at: ''
  }
]

// Slugs of minor (organizer-only) houses
export const MINOR_HOUSE_SLUGS = [
  'arryn', 'florent', 'greyjoy', 'tarth', 'strong', 'hightower', 'tully', 'baelish'
]

export interface HouseLore {
  hookQuestion: string
  emblem: string
  fullDescription: string
  traits: string[]
  flavorText: string
  closingRemark: string
  emoji: string
  isOrder?: boolean
  isAfk?: boolean
  curator?: string
  curatorHandle?: string
}

export const HOUSE_LORE: Record<string, HouseLore> = {
  stark: {
    hookQuestion: 'Ты веришь, что главная сила — в верности своим?',
    emblem: 'Серый лютоволк на белоснежном поле',
    fullDescription: 'Дом Старков — это уютный лагерь верных союзников у костра, надёжное плечо в квестах и гордое знамя, под которым не стыдно стоять.\n\nЕсли для тебя честь — это не пустое слово, если ты надёжен как скала и умеешь отличать добро от зла даже в самой гуще событий — этот дом для тебя.',
    traits: [
      'Верен своим друзьям (которые стали семьей) до конца.',
      'Ценишь честную игру и прямые слова.',
      'Сохраняешь спокойствие и силу духа в любой «буре».',
      'Ищешь в игре не просто победу, а братство и уважение.',
    ],
    flavorText: 'Помни: настоящие Старки всегда держатся вместе!',
    closingRemark: 'Наши механики и сюжет продуманы так, что будут понятны и увлекательны даже для тех, кто не смотрел сериал. Увидимся на ТурФурре! 🐾',
    emoji: '🐺',
    curator: 'Маркус',
    curatorHandle: '@MarcusR1te',
  },
  lannister: {
    hookQuestion: 'Ты идёшь к своей цели с улыбкой и железной волей?',
    emblem: 'Золотой лев на алом поле',
    fullDescription: 'Дом Ланнистеров — это блеск победных наград, умные интриги за игровым столом и законная роскошь, которая говорит сама за себя.\n\nЕсли ты веришь, что побеждает не только сила, но и ум, если твой стиль — твоё оружие, а амбиции ведут тебя только вперёд — этот дом для тебя.',
    traits: [
      'Идёшь к цели с интеллектом и непоколебимой уверенностью.',
      'Ценишь стиль, комфорт и умеешь создать вокруг себя праздник.',
      'Любишь продумывать стратегии и наслаждаться плодами своих побед.',
      'Видишь в игре шанс не просто участвовать, а блистать и править бал.',
    ],
    flavorText: 'Помни: Лев не спрашивает разрешения. Он берёт своё!',
    closingRemark: 'Наши механики и сюжет продуманы так, что будут понятны и увлекательны даже для тех, кто не смотрел сериал. Главное — твоя жажда триумфа! Увидимся на ТурФурре! 🦁✨',
    emoji: '🦁',
    curator: 'Акиро',
    curatorHandle: '@akiro_wolf',
  },
  baratheon: {
    hookQuestion: 'Ты побеждаешь с размахом, а празднуешь с душой?',
    emblem: 'Коронованный угольно-чёрный олень на золотом поле',
    fullDescription: 'Дом Баратеонов — это громкий смех победителей, щедрые пиры после честной борьбы и энергия, которая заряжает весь лагерь.\n\nЕсли ты веришь, что сила и отвага заслуживают такого же грандиозного праздника, если ты играешь на полную и делишься победой со всеми — этот дом для тебя.',
    traits: [
      'Бросаешься в игру и ивенты с азартом и «богатырским» духом.',
      'Ценишь щедрость, прямодушие и умение праздновать от всей души.',
      'Создаёшь вокруг себя атмосферу всеобщего веселья и товарищества.',
      'Видишь в победе не просто результат, а повод для легендарных историй у костра.',
    ],
    flavorText: 'Помни: олень горд и силён, но настоящая мощь — его стадо!',
    closingRemark: 'Наши механики и сюжет продуманы так, что будут понятны и увлекательны даже для тех, кто не смотрел сериал. Главное — твоя страсть к жизни и честной игре! Увидимся на ТурФурре! 🦌🔥',
    emoji: '🦌',
    curator: 'Ройскрим',
    curatorHandle: '@Royskrim',
  },
  tyrell: {
    hookQuestion: 'Ты ценишь изящество, красоту и силу, что скрыта в лепестках розы?',
    emblem: 'Золотая роза на изумрудно-зелёном поле',
    fullDescription: 'Дом Тиреллов — это утончённая эстетика в каждой детали, тёплые и умные беседы в тенистом саду и гармония, которую ты создаёшь вокруг себя.\n\nЕсли ты веришь, что сила — в дипломатии и мудрости, а настоящая роскошь — это красота, искусство и изысканное общение — этот дом для тебя.',
    traits: [
      'Видишь красоту в деталях и создаёшь уют своим присутствием.',
      'Предпочитаешь решать вопросы остроумием и дипломатией, а не грубой силой.',
      'Ценишь искусство, природу и глубокие, искренние разговоры.',
      'Стремишься к росту — не только в игре, но и в кругу достойных союзников.',
    ],
    flavorText: 'Помни: даже самый крепкий камень уступает натиску корней.',
    closingRemark: 'Наши механики и сюжет продуманы так, что будут понятны и увлекательны даже для тех, кто не смотрел сериал. Главное — твоё стремление к гармонии и изяществу! Увидимся на ТурФурре! 🌹✨',
    emoji: '🌹',
    curator: 'Кусака',
    curatorHandle: '@Kusaka_Yep',
  },
  martell: {
    hookQuestion: 'Ты живёшь с неукротимой страстью и пылающим сердцем?',
    emblem: 'Алое солнце, пронзённое золотым копьём',
    fullDescription: 'Дом Мартеллов — это ритм барабанов у ночного костра, жар танца, пылкая преданность и справедливость, за которую не жалко сразиться.\n\nЕсли ты веришь, что жизнь стоит того, чтобы прожить её максимально ярко, если твои эмоции — это сила, а не слабость, и ты всегда встаёшь на защиту того, что считаешь правдой — этот дом для тебя.',
    traits: [
      'Живёшь и любишь со всей страстью, которую вмещает твоё сердце.',
      'Готов отстаивать справедливость и защищать тех, кто в этом нуждается.',
      'Относишься к сражениям так же как к танцам — заряжая энергией всех, кто рядом.',
      'Ценишь свободу, эмоциональную искренность и жаркое солнце настоящей дружбы.',
    ],
    flavorText: 'Дорн — единственный регион Семи Королевств, который никогда не смогли победить. Лишь дипломатия и свадьбы смогли положить конец распрям и войнам с жителями юга.\n\nПомни: копьё солнца не знает страха, оно знает только цель.',
    closingRemark: 'Наши механики и сюжет продуманы так, что будут понятны и увлекательны даже для тех, кто не смотрел сериал. Главное — твоё пылающее сердце и любовь к жизни! Увидимся на ТурФурре! ☀️✨',
    emoji: '☀️',
    curator: 'Кесаран',
    curatorHandle: '@Kesaran_Pasaran',
  },
  'nights-watch': {
    hookQuestion: 'Твоя цель на ТурФурр — отдыхать, отключиться от всего и просто кайфовать?',
    emblem: 'Чёрный щит',
    fullDescription: 'Ночной Дозор на ТурФурр — это посиделки в таверне, разговоры под звёздами до утра, свобода от любых обязательств и почётное право просто быть собой без графиков и ивентов.\n\nЕсли ты приехал не за победой в турнирах, а за победой над усталостью и городской суетой, если ролевые и сюжетные процессы не твоя история — этот орден для тебя.',
    traits: [
      'Хочешь выдохнуть и вообще ничего не планировать.',
      'Ценишь тусовки у бара, душевные разговоры и ночную атмосферу.',
      'Уважаешь личное пространство — своё и чужое.',
      'Готов охранять покой отдыхающих и создавать тёплую расслабленную атмосферу для всех, кто устал от игр.',
    ],
    flavorText: 'Помни: Дозор не играет — он отдыхает. Но отдыхает со вкусом!',
    closingRemark: 'Наши механики и сюжет продуманы так, что даже в Ночном Дозоре ты ничего не упустишь. Просто потому, что твоя механика — это твоё удовольствие. Увидимся на ТурФурре... особенно после заката! 🌙🍻',
    emoji: '🌙',
    isOrder: true,
    isAfk: true,
  },
}

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
        // Always show minor (organizer) houses — supplement if DB doesn't have them
        const dbSlugs = new Set(data.map((t: any) => t.slug))
        const missingMinor = FALLBACK_TEAMS.filter(
          t => MINOR_HOUSE_SLUGS.includes(t.slug) && !dbSlugs.has(t.slug)
        )
        teams.value = [...data, ...missingMinor]
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

    // Fallback: check current user from safeStorage (teamId comes from DB via mapDbUserToUser)
    try {
      const stored = safeStorage.getItem('current_user')
      if (stored) {
        const currentUser = JSON.parse(stored)
        if (currentUser.teamId === teamId) {
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
        logger.error('DB update failed for team selection:', dbError)
        return { success: false, error: dbError.message || 'Ошибка сохранения команды' }
      }
    } catch (err: any) {
      logger.error('Error selecting team:', err)
      return { success: false, error: err.message || 'Ошибка выбора команды' }
    }

    // Save locally only after successful DB write (write-through cache)
    safeStorage.setItem(`user_team_${userId}`, teamId)
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
