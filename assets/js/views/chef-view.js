class ChefView {
  #element = null;
  #timeout_unhighlight = null;

  constructor(options = {}) {
    const holder = options.holder ? $(options.holder) : null;

    if (!Chef.template)
      return;

    const chef = $(Chef.template({ name: options.name, slogan: options.slogan }));
    this.#element = chef;
    if (holder) chef.appendTo(holder);
  }

  getCookProgressHolder() {
    if (!this.#element)
      return $();

    return this.#element.find('.cook-progress');
  }

  syncProcessing(isProcessing) {
    if (!this.#element)
      return;

    if (isProcessing) {
      this.#element.addClass('processing');
      return;
    }

    this.#element.removeClass('processing');
  }

  highlight(timeoutMs) {
    if (!this.#element)
      return;

    this.clearHighlight();
    this.#element.addClass('highlight');
    this.#timeout_unhighlight = setTimeout(() => this.clearHighlight(), timeoutMs);
  }

  clearHighlight() {
    if (this.#timeout_unhighlight) {
      clearTimeout(this.#timeout_unhighlight);
      this.#timeout_unhighlight = null;
    }

    if (this.#element)
      this.#element.removeClass('highlight');
  }

  destroy() {
    this.clearHighlight();
    if (!this.#element)
      return;

    this.#element.remove();
    this.#element = null;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = ChefView;