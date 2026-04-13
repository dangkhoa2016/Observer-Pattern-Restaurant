class ProgressView {
  #holder = null;
  #element = null;
  #button = null;

  constructor(options = {}) {
    if (options.holder) this.#holder = $(options.holder);
    this.#render(options);
  }

  #render(options) {
    if (!Progress.template_pg)
      return;

    const progress = $(
      Progress.template_pg({
        icon: options.icon,
        html: options.html
      })
    );

    this.#button = $('.btn-complete', progress);
    this.#button.tooltip({ customClass: 'custom-tooltip', placement: 'right' });

    if (!this.#holder)
      return;

    (options.parts || []).forEach(() => {
      const pgBar = Progress.template_pg_bar({
        color: Helper.random_progress_color(),
        percent: 0
      });
      progress.find('.progress').append(pgBar);
    });

    this.#element = progress;
    progress.appendTo(this.#holder);
  }

  bindComplete(handler) {
    if (!this.#button)
      return;

    this.#button
      .off('click.progress-view')
      .on('click.progress-view', function(e) {
        e.preventDefault();
        if (handler) handler();
      });
  }

  disposeButtonTooltip() {
    if (this.#button)
      this.#button.tooltip('dispose');
  }

  updatePart(index, percent) {
    if (!this.#element)
      return;

    this.#element.find(`.progress .progress-bar:eq(${index})`)
      .css('width', `${percent}%`)
      .attr('aria-valuenow', percent);
  }

  completeWithDelay(callback) {
    if (!this.#element) {
      if (callback) callback();
      return;
    }

    this.#element.slideUp(() => {
      if (callback) callback();
    });
  }

  destroy() {
    if (this.#button) {
      this.#button.off('click.progress-view').tooltip('dispose');
      this.#button = null;
    }

    if (this.#element) {
      this.#element.remove();
      this.#element = null;
    }
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = ProgressView;