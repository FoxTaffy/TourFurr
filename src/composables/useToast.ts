import { reactive } from 'vue'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: number
  type: ToastType
  message: string
  duration: number
}

let nextId = 1

// Module-level singleton so all components share the same toast list
const state = reactive<{ toasts: Toast[] }>({ toasts: [] })

export function useToast() {
  function add(message: string, type: ToastType = 'info', duration = 4500) {
    const id = nextId++
    state.toasts.push({ id, type, message, duration })
    if (duration > 0) {
      setTimeout(() => remove(id), duration)
    }
  }

  function remove(id: number) {
    const idx = state.toasts.findIndex(t => t.id === id)
    if (idx !== -1) state.toasts.splice(idx, 1)
  }

  return {
    toasts: state.toasts,
    success: (msg: string, duration?: number) => add(msg, 'success', duration),
    error:   (msg: string, duration?: number) => add(msg, 'error', duration),
    warning: (msg: string, duration?: number) => add(msg, 'warning', duration),
    info:    (msg: string, duration?: number) => add(msg, 'info', duration),
    remove,
  }
}
