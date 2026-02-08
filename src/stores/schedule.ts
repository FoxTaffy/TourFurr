import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '../services/supabase'
import { logger } from '../utils/logger'

export interface ScheduleEvent {
  id: string
  day_number: number
  day_date: string
  start_time: string
  title: string
  location: string | null
  host: string | null
  category: string
  sort_order: number
}

export interface ScheduleDay {
  dayNumber: number
  date: string
  events: ScheduleEvent[]
}

const DAY_LABELS: Record<number, string> = {
  1: 'День 1',
  2: 'День 2',
  3: 'День 3',
  4: 'День 4'
}

export const useScheduleStore = defineStore('schedule', () => {
  const events = ref<ScheduleEvent[]>([])
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  let realtimeChannel: ReturnType<typeof supabase.channel> | null = null

  const days = computed<ScheduleDay[]>(() => {
    const dayMap: Record<number, ScheduleDay> = {}

    for (const event of events.value) {
      if (!dayMap[event.day_number]) {
        dayMap[event.day_number] = {
          dayNumber: event.day_number,
          date: event.day_date,
          events: []
        }
      }
      dayMap[event.day_number].events.push(event)
    }

    // Sort events within each day by sort_order
    for (const day of Object.values(dayMap)) {
      day.events.sort((a, b) => a.sort_order - b.sort_order)
    }

    return Object.values(dayMap).sort((a, b) => a.dayNumber - b.dayNumber)
  })

  const currentEvent = computed<ScheduleEvent | null>(() => {
    const now = new Date()

    // Find events for today (or the closest past day)
    const todayEvents = events.value.filter(e => {
      const eventDate = new Date(e.day_date + 'T' + e.start_time)
      return eventDate.toDateString() === now.toDateString()
    }).sort((a, b) => a.sort_order - b.sort_order)

    if (todayEvents.length === 0) return null

    // Find the current or most recent event
    for (let i = todayEvents.length - 1; i >= 0; i--) {
      const eventTime = new Date(todayEvents[i].day_date + 'T' + todayEvents[i].start_time)
      if (eventTime <= now) {
        return todayEvents[i]
      }
    }

    return null
  })

  const nextEvent = computed<ScheduleEvent | null>(() => {
    const now = new Date()

    const futureEvents = events.value.filter(e => {
      const eventTime = new Date(e.day_date + 'T' + e.start_time)
      return eventTime > now
    }).sort((a, b) => {
      const aTime = new Date(a.day_date + 'T' + a.start_time).getTime()
      const bTime = new Date(b.day_date + 'T' + b.start_time).getTime()
      return aTime - bTime
    })

    return futureEvents[0] || null
  })

  async function fetchSchedule() {
    isLoading.value = true
    error.value = null

    try {
      const { data, error: dbError } = await supabase
        .from('schedule_events')
        .select('*')
        .order('day_number')
        .order('sort_order')

      if (dbError) {
        logger.error('Failed to fetch schedule:', dbError)
        error.value = dbError.message
        return
      }

      events.value = data || []
    } catch (err: any) {
      logger.error('Error fetching schedule:', err)
      error.value = err.message || 'Failed to load schedule'
    } finally {
      isLoading.value = false
    }
  }

  function subscribeToRealtime() {
    if (realtimeChannel) return

    realtimeChannel = supabase
      .channel('schedule-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'schedule_events' },
        (payload) => {
          logger.log('Schedule realtime update:', payload.eventType)

          if (payload.eventType === 'INSERT') {
            events.value.push(payload.new as ScheduleEvent)
          } else if (payload.eventType === 'UPDATE') {
            const idx = events.value.findIndex(e => e.id === (payload.new as ScheduleEvent).id)
            if (idx !== -1) {
              events.value[idx] = payload.new as ScheduleEvent
            }
          } else if (payload.eventType === 'DELETE') {
            events.value = events.value.filter(e => e.id !== (payload.old as any).id)
          }
        }
      )
      .subscribe()
  }

  function unsubscribeFromRealtime() {
    if (realtimeChannel) {
      supabase.removeChannel(realtimeChannel)
      realtimeChannel = null
    }
  }

  function getDayLabel(dayNumber: number): string {
    return DAY_LABELS[dayNumber] || `День ${dayNumber}`
  }

  return {
    events,
    isLoading,
    error,
    days,
    currentEvent,
    nextEvent,
    fetchSchedule,
    subscribeToRealtime,
    unsubscribeFromRealtime,
    getDayLabel
  }
})
