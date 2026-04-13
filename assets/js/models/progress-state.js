class ProgressState {
  #time_to_complete = 1000;
  #parts = [];
  #current_part_index = 0;

  constructor(options = {}) {
    this.#time_to_complete = options.time_to_complete_ms || 3000;
    this.#parts = Array.isArray(options.parts) ? [...options.parts] : [];
  }

  getCurrentPartIndex() {
    return this.#current_part_index;
  }

  hasRemainingParts() {
    return this.#current_part_index < this.#parts.length;
  }

  getCurrentPercent() {
    if (!this.hasRemainingParts())
      return null;

    return this.#parts[this.#current_part_index];
  }

  getCurrentDelay() {
    const percent = this.getCurrentPercent();
    if (percent === null)
      return 0;

    return (percent * this.#time_to_complete) / 100;
  }

  advance() {
    const percent = this.getCurrentPercent();
    if (percent === null)
      return null;

    this.#current_part_index += 1;
    return percent;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = ProgressState;