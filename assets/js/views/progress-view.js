class ProgressView {
  #holder = null;
  #element = null;
  #button = null;

  constructor(options = {}) {
    if (options.holder) this.#holder = $(options.holder);
    this.#render(options);
  }

  #render(options) {
    const templateProgress = Progress.templateProgress || Progress.template_pg;
    if (!templateProgress)
      return;

    const progress = $(
      templateProgress({
        icon: options.icon,
        html: options.html
      })
    );

    this.#button = $('.btn-complete', progress);
    this.#button.tooltip({ customClass: 'custom-tooltip', placement: 'right' });

    if (!this.#holder)
      return;

    const templateProgressBar = Progress.templateProgressBar || Progress.template_pg_bar;
    (options.parts || []).forEach(() => {
      const progressBar = templateProgressBar({
        color: Helper.randomProgressColor(),
        percent: 0
      });
      progress.find('.progress').append(progressBar);
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