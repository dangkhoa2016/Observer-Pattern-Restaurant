class Progress {
  static template_pg = null;
  static template_pg_bar = null;

  #time_to_complete = 1;
  #parts = [];
  #timeout_next = null;
  #button = null;
  #call_back_complete = null;
  #holder = null;
  #html = 'Doing...';
  #icon = 'fas fa-clipboard-check';
  #element = null;
  #current_part_index = 0;
  #reference = null;
  #timeout_complete = null;

  constructor(options = {}) {
    this.#time_to_complete = (options.time_to_complete || 3) * 1000;
    this.#call_back_complete = options.call_back_complete;
    this.#reference = options.reference;
    if (options.holder) this.#holder = $(options.holder);
    if (options.html && typeof options.html === 'string')
      this.#html = options.html;
    if (options.icon && typeof options.icon === 'string')
      this.#icon = options.icon;

    this.#parts = Helper.random_progress_test(100);
    this.#render();
    this.#do_step();
  }

  destroy() {
    const t = this;
    t.#clear_timeout();
    t.#clear_complete_timeout();
    if (t.#button) {
      t.#button.off('click.progress').tooltip('dispose');
      t.#button = null;
    }
    if (t.#element) {
      t.#element.remove();
      t.#element = null;
    }
  }


  // private methods

  #render() {
    if (!Progress.template_pg)
      return;

    const progress = $(
      Progress.template_pg({
        icon: this.#icon,
        html: this.#html
      })
    );

    this.#button = $('.btn-complete', progress);
    this.#button.tooltip({ customClass: 'custom-tooltip', placement: 'right' });

    if (!this.#holder)
      return;

    this.#parts.map(part => {
      const pg_bar = Progress.template_pg_bar({
        color: Helper.random_progress_color(),
        percent: 0
      });
      progress.find('.progress').append(pg_bar);
    })

    this.#element = progress;
    progress.appendTo(this.#holder);
    this.#bind_click();
  }

  #get_time(percent) {
    return (percent * this.#time_to_complete) / 100;
  }

  #complete_part(skip_timeout = false) {
    const t = this;
    if (t.#parts.length <= 0)
      return;

    if (!Progress.template_pg_bar || !this.#element)
      return;

    const percent = t.#parts[t.#current_part_index];
    t.#element.find(`.progress .progress-bar:eq(${t.#current_part_index})`)
      .css('width', `${percent}%`).attr('aria-valuenow', percent);

    t.#current_part_index +=1;
    t.#do_step(skip_timeout);
  }

  #do_step(skip_timeout = false) {
    const t = this;
    if (typeof t.#current_part_index !== 'number' || !t.#parts || t.#parts.length <= t.#current_part_index) {
      t.#call_complete();
      return;
    }

    if (skip_timeout) {
      t.#clear_timeout();
      t.#complete_part(skip_timeout);
      return;
    }
    
    t.#timeout_next = setTimeout(function() {
      t.#complete_part();
    }, t.#get_time(t.#parts[t.#current_part_index]));
  }

  #call_complete() {
    const t = this;
    const call_func = function() {
      if (typeof t.#call_back_complete === 'function')
        t.#call_back_complete(t, t.#reference);
    };

    if (t.#element) {
      t.#timeout_complete = setTimeout(() => {
        t.#timeout_complete = null;
        if (!t.#element) {
          call_func();
          return;
        }

        t.#element.slideUp(() => { call_func(); });
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
    const t = this;
    if (!t.#button)
      return;

    t.#button
      .off('click.progress')
      .on('click.progress', function(e) {
        e.preventDefault();
        t.#button.tooltip('dispose');

        t.#clear_timeout();
        t.#do_step(true);
      });
  }

  // private methods

}
