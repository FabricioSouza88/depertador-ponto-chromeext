/**
 * Sistema de logging consistente
 */

export class Logger {
  constructor(module) {
    this.module = module;
  }

  _formatMessage(emoji, level, ...args) {
    return [`${emoji} [${this.module}]`, ...args];
  }

  info(...args) {
    console.log(...this._formatMessage('ℹ️', 'info', ...args));
  }

  success(...args) {
    console.log(...this._formatMessage('✅', 'success', ...args));
  }

  warn(...args) {
    console.warn(...this._formatMessage('⚠️', 'warn', ...args));
  }

  error(...args) {
    console.error(...this._formatMessage('❌', 'error', ...args));
  }

  debug(...args) {
    console.log(...this._formatMessage('🔍', 'debug', ...args));
  }
}
