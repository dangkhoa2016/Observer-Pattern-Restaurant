class Progress {
  static template_pg = null;
  static template_pg_bar = null;

  #state = null;
  #view = null;
  #timeout_next = null;
  #call_back_complete = null;
  #html = 'Doing...';
  #icon = 'fas fa-clipboard-check';
  #reference = null;
  #timeout_complete = null;

  constructor(options = {}) {
    this.#call_back_complete = options.call_back_complete;
    this.#reference = options.reference;
    if (options.html && typeof options.html === 'string')
      this.#html = options.html;
    if (options.icon && typeof options.icon === 'string')
      this.#icon = options.icon;

    const parts = Helper.random_progress_test(100);
    this.#state = new ProgressState({
      time_to_complete_ms: (options.time_to_complete || 3) * 1000,
      parts
    });
    this.#view = new ProgressView({
      holder: options.holder,
      html: this.#html,
      icon: this.#icon,
      parts
    });
    this.#bind_click();
    this.#do_step();
  }

  destroy() {
    const t = this;
    t.#clear_timeout();
    t.#clear_complete_timeout();
    if (t.#view) {
      t.#view.destroy();
      t.#view = null;
    }
  }


  // private methods

  #complete_part(skip_timeout = false) {
    if (!this.#state || !this.#view)
      return;

    const partIndex = this.#state.getCurrentPartIndex();
    const percent = this.#state.advance();
    if (percent === null)
      return;

    this.#view.updatePart(partIndex, percent);
    this.#do_step(skip_timeout);
  }

  #do_step(skip_timeout = false) {
    if (!this.#state || !this.#state.hasRemainingParts()) {
      this.#call_complete();
      return;
    }

    if (skip_timeout) {
      this.#clear_timeout();
      this.#complete_part(skip_timeout);
      return;
    }
    
    this.#timeout_next = setTimeout(() => {
      this.#complete_part();
    }, this.#state.getCurrentDelay());
  }

  #call_complete() {
    const t = this;
    const call_func = function() {
      if (typeof t.#call_back_complete === 'function')
        t.#call_back_complete(t, t.#reference);
    };

    if (t.#view) {
      t.#timeout_complete = setTimeout(() => {
        t.#timeout_complete = null;
        if (!t.#view) {
          call_func();
          return;
        }

        t.#view.completeWithDelay(() => { call_func(); });
      }, APP_TIMEOUTS.PROGRESS_COMPLETE_DELAY_MS);
      return;
    }

    call_func();
  }

  #clear_timeout() {
    if (!this.#timeout_next)
      return;

    clearTimeout(this.#timeout_next);
    this.#timeout_next = null;
  }

  #clear_complete_timeout() {
    if (!this.#timeout_complete)
      return;

    clearTimeout(this.#timeout_complete);
    this.#timeout_complete = null;
  }

  #bind_click() {
    if (!this.#view)
      return;

    this.#view.bindComplete(() => {
      this.#view.disposeButtonTooltip();
      this.#clear_timeout();
      this.#do_step(true);
    });
  }

  // private methods

}
