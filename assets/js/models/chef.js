class Chef extends Observable {
  static #id_increase = 0;
  static STATUS = CHEF_STATUS;
  static template = null;
  static #slogans = ['Bring Out The Foodie In You.', 'Find Happiness In Cooking.',
    'Awaken Your Inner Chef.', 'Bring Out The Chef In You.'];

  #holder = null;
  #element = null;
  #slogan = '';
  #current_order = null;
  #progress = [];
  #timeout_unhighlight = null;

  constructor(name, holder) {
    super();
    Chef.#id_increase += 1;
    this.id = Chef.#id_increase;
    this.status = Chef.STATUS.IDLE;
    this.#slogan = Chef.#random_slogan();
    if (holder) this.#holder = $(holder);

    if (!Chef.template)
      return;

    const chef = $(Chef.template({ name, slogan: this.#slogan }));
    this.#element = chef;

    chef.appendTo(this.#holder);
  }

  process_order(order) {
    const t = this;
    if (t.status === Chef.STATUS.BUSY || (t.#current_order && t.#current_order.status !== Order.STATUS.DONE))
      return false;

    //this.#highlight_test(true);

    this.#update_status(Chef.STATUS.BUSY);
    order.status = Order.STATUS.PROCESSING;
    t.#current_order = order;

    const time_to_complete = Math.floor(Math.random() * 30) + 1;
    t.#progress.push(
      new Progress({
        html: `Processing <strong>${order.food.name}</strong>`,
        holder: t.#element.find('.cook-progress'),
        time_to_complete,
        call_back_complete: function(progress) {
          t.#complete_order();
          const indx_pg = t.#progress.indexOf(progress);
          if (indx_pg !== -1) t.#progress.splice(indx_pg, 1);
          progress.destroy();
        }
      })
    );

    return true;
  }

  destroy() {
    this.#clear_timeout();
    this.#progress.slice().forEach(progress => progress.destroy());
    this.#progress = [];
    this.clearObservers();

    if (this.#element) {
      this.#element.remove();
      this.#element = null;
    }

    this.#current_order = null;
  }


  // private methods

  #complete_order() {
    if (!this.#current_order)
      return;

    const completedOrder = this.#current_order;
    completedOrder.status = Order.STATUS.DONE;
    this.#current_order = null;
    this.#update_status(Chef.STATUS.IDLE);
    this.#highlight_test();
    this.notify(this.id, completedOrder);
  }

  #update_status(status) {
    this.status = status;
    this.#set_bg_process(status === Chef.STATUS.IDLE);
  }

  #set_bg_process(complete) {
    if (complete) this.#element.removeClass('processing');
    else this.#element.addClass('processing');
  }

  #highlight_test(unhighlight = false) {
    const t = this;
    const call_func = function() {
      if (t.#element) t.#element.removeClass('highlight');
    };

    if (unhighlight) {
      call_func();
      t.#clear_timeout();
    }

    t.#clear_timeout();
    if (!t.#element)
      return;

    t.#element.addClass('highlight');
    t.#timeout_unhighlight = setTimeout(call_func, APP_TIMEOUTS.CHEF_HIGHLIGHT_MS);
  }

  #clear_timeout() {
    if (!this.#timeout_unhighlight)
      return;

    clearTimeout(this.#timeout_unhighlight);
    this.#timeout_unhighlight = null;
  }

  static #random_slogan() {
    return this.#slogans[Math.floor(Math.random() * this.#slogans.length)]
  }
}
