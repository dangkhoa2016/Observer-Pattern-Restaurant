class Observable {
  #observers = [];

  subscribe(fn_to_call) {
    if (typeof fn_to_call !== 'function' || this.#observers.includes(fn_to_call))
      return false;

    this.#observers.push(fn_to_call);
    return true;
  }

  unsubscribe(fn_to_remove) {
    const previousLength = this.#observers.length;
    this.#observers = this.#observers.filter(observer => observer !== fn_to_remove);
    return previousLength !== this.#observers.length;
  }

  notify(...args) {
    this.#observers.slice().forEach(observer => observer(...args));
  }

  clearObservers() {
    this.#observers = [];
  }

  listenerCount() {
    return this.#observers.length;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = Observable;