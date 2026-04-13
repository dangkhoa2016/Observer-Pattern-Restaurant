let loggerConstants = null;

if (typeof module !== 'undefined' && module.exports) {
  loggerConstants = require('./constants');
}

const LOGGER_LEVELS = typeof APP_LOG_LEVELS !== 'undefined'
  ? APP_LOG_LEVELS
  : loggerConstants.APP_LOG_LEVELS;

class Logger {
  static #level = Logger.#resolveInitialLevel();

  static configure(options = {}) {
    if (options.level)
      this.#level = this.#normalizeLevel(options.level);
  }

  static getLevel() {
    return this.#level;
  }

  static debug(...args) {
    this.#write(LOGGER_LEVELS.DEBUG, 'debug', args);
  }

  static info(...args) {
    this.#write(LOGGER_LEVELS.INFO, 'info', args);
  }

  static warn(...args) {
    this.#write(LOGGER_LEVELS.WARN, 'warn', args);
  }

  static error(...args) {
    this.#write(LOGGER_LEVELS.ERROR, 'error', args);
  }

  static #resolveInitialLevel() {
    if (typeof APP_LOG_LEVEL !== 'undefined')
      return this.#normalizeLevel(APP_LOG_LEVEL);

    return LOGGER_LEVELS.INFO;
  }

  static #normalizeLevel(level) {
    const normalized = String(level || '').toLowerCase();
    const supportedLevels = Object.values(LOGGER_LEVELS);

    if (supportedLevels.includes(normalized))
      return normalized;

    return LOGGER_LEVELS.INFO;
  }

  static #write(level, method, args) {
    if (!this.#shouldLog(level))
      return;

    const writer = console[method] || console.log;
    writer.apply(console, args);
  }

  static #shouldLog(level) {
    return this.#getRank(level) >= this.#getRank(this.#level);
  }

  static #getRank(level) {
    switch (level) {
      case LOGGER_LEVELS.DEBUG:
        return 10;
      case LOGGER_LEVELS.INFO:
        return 20;
      case LOGGER_LEVELS.WARN:
        return 30;
      case LOGGER_LEVELS.ERROR:
        return 40;
      case LOGGER_LEVELS.SILENT:
        return 100;
      default:
        return 20;
    }
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = Logger;