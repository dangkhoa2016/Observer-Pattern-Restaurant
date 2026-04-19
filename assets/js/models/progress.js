class Progress {
  static template_pg = null;
  static template_pg_bar = null;

  static get templateProgress() {
    return this.template_pg;
  }

  static set templateProgress(value) {
    this.template_pg = value;
  }

  static get templateProgressBar() {
    return this.template_pg_bar;
  }

  static set templateProgressBar(value) {
    this.template_pg_bar = value;
  }

  #state = null;
  #view = null;
  #timeoutNext = null;
  #onComplete = null;
  #html = 'Doing...';
  #icon = 'fas fa-clipboard-check';
  #reference = null;
  #completeTimeout = null;

  constructor(options = {}) {
    this.#onComplete = options.onComplete || options.call_back_complete;
    this.#reference = options.reference;
    if (options.html && typeof options.html === 'string')
      this.#html = options.html;
    if (options.icon && typeof options.icon === 'string')
      this.#icon = options.icon;

    const parts = Helper.randomProgressParts(100);
    this.#state = new ProgressState({
      timeToCompleteMs: (options.timeToComplete || options.time_to_complete || 3) * 1000,
      parts
    });
    this.#view = new ProgressView({
      holder: options.holder,
      html: this.#html,
      icon: this.#icon,
      parts
    });
    this.#bindClick();
    this.#runStep();
  }

  destroy() {
    const t = this;
    t.#clearTimeout();
    t.#clearCompleteTimeout();
    if (t.#view) {
      t.#view.destroy();
      t.#view = null;
    }
  }


  // private methods

  #completePart(skipTimeout = false) {
    if (!this.#state || !this.#view)
      return;

    const partIndex = this.#state.getCurrentPartIndex();
    const percent = this.#state.advance();
    if (percent === null)
      return;

    this.#view.updatePart(partIndex, percent);
    this.#runStep(skipTimeout);
  }

  #runStep(skipTimeout = false) {
    if (!this.#state || !this.#state.hasRemainingParts()) {
      this.#invokeComplete();
      return;
    }

    if (skipTimeout) {
      this.#clearTimeout();
      this.#completePart(skipTimeout);
      return;
    }
    
    this.#timeoutNext = setTimeout(() => {
      this.#completePart();
    }, this.#state.getCurrentDelay());
  }

  #invokeComplete() {
    const t = this;
    const callFunc = function() {
      if (typeof t.#onComplete === 'function')
        t.#onComplete(t, t.#reference);
    };

    if (t.#view) {
      t.#completeTimeout = setTimeout(() => {
        t.#completeTimeout = null;
        if (!t.#view) {
          callFunc();
          return;
        }

        t.#view.completeWithDelay(() => { callFunc(); });
      }, APP_TIMEOUTS.PROGRESS_COMPLETE_DELAY_MS);
      return;
    }

    callFunc();
  }

  #clearTimeout() {
    if (!this.#timeoutNext)
      return;

    clearTimeout(this.#timeoutNext);
    this.#timeoutNext = null;
  }

  #clearCompleteTimeout() {
    if (!this.#completeTimeout)
      return;

    clearTimeout(this.#completeTimeout);
    this.#completeTimeout = null;
  }

  #bindClick() {
    if (!this.#view)
      return;

    this.#view.bindComplete(() => {
      this.#view.disposeButtonTooltip();
      this.#clearTimeout();
      this.#runStep(true);
    });
  }

  // private methods

}
