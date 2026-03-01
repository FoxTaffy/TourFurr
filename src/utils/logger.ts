/**
 * Production-safe Logger
 *
 * Автоматически отключает логи в production режиме
 * Использует вместо прямых вызовов console.log
 */

import { IS_DEVELOPMENT } from './env'

/**
 * Типы логов
 */
type LogLevel = 'log' | 'info' | 'warn' | 'error' | 'debug'

/**
 * Безопасный логгер
 */
class Logger {
  private isEnabled: boolean

  constructor() {
    // В production логи отключены (кроме errors)
    this.isEnabled = IS_DEVELOPMENT
  }

  /**
   * Обычный лог (только в dev)
   */
  log(...args: any[]): void {
    if (this.isEnabled) {
      console.log(...args)
    }
  }

  /**
   * Информационное сообщение (только в dev)
   */
  info(...args: any[]): void {
    if (this.isEnabled) {
      console.info(...args)
    }
  }

  /**
   * Предупреждение (только в dev)
   */
  warn(...args: any[]): void {
    if (this.isEnabled) {
      console.warn(...args)
    }
  }

  /**
   * Ошибка (всегда показывается, даже в production)
   */
  error(...args: any[]): void {
    // Ошибки показываем всегда
    console.error(...args)
  }

  /**
   * Отладочная информация (только в dev)
   */
  debug(...args: any[]): void {
    if (this.isEnabled) {
      console.debug(...args)
    }
  }

  /**
   * Группа логов (только в dev)
   */
  group(label: string): void {
    if (this.isEnabled) {
      console.group(label)
    }
  }

  /**
   * Закрыть группу логов (только в dev)
   */
  groupEnd(): void {
    if (this.isEnabled) {
      console.groupEnd()
    }
  }

  /**
   * Таблица (только в dev)
   */
  table(data: any): void {
    if (this.isEnabled) {
      console.table(data)
    }
  }

  /**
   * Время начала (только в dev)
   */
  time(label: string): void {
    if (this.isEnabled) {
      console.time(label)
    }
  }

  /**
   * Время окончания (только в dev)
   */
  timeEnd(label: string): void {
    if (this.isEnabled) {
      console.timeEnd(label)
    }
  }
}

// Экспортируем единственный экземпляр
export const logger = new Logger()

// Для обратной совместимости
export default logger
