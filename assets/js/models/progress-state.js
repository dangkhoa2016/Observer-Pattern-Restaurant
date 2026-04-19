class ProgressState {
  #timeToComplete = 1000;
  #parts = [];
  #currentPartIndex = 0;

  constructor(options = {}) {
    this.#timeToComplete = options.timeToCompleteMs || options.time_to_complete_ms || 3000;
    this.#parts = Array.isArray(options.parts) ? [...options.parts] : [];
  }

  getCurrentPartIndex() {
    return this.#currentPartIndex;
  }

  hasRemainingParts() {
    return this.#currentPartIndex < this.#parts.length;
  }

  getCurrentPercent() {
    if (!this.hasRemainingParts())
      return null;

    return this.#parts[this.#currentPartIndex];
  }

  getCurrentDelay() {
    const percent = this.getCurrentPercent();
    if (percent === null)
      return 0;

    return (percent * this.#timeToComplete) / 100;
  }

  advance() {
    const percent = this.getCurrentPercent();
    if (percent === null)
      return null;

    this.#currentPartIndex += 1;
    return percent;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = ProgressState;