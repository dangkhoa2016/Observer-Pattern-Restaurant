class Chef extends Observable {
  static #id_increase = 0;
  static STATUS = CHEF_STATUS;
  static template = null;
  static #slogans = ['Bring out the foodie in you.', 'Find joy in cooking.',
    'Awaken your inner chef.', 'Let your inner chef shine.'];

  #slogan = '';
  #state = null;
  #progress = [];
  #view = null;

  constructor(name, holder) {
    super();
    Chef.#id_increase += 1;
    this.id = Chef.#id_increase;
    this.#state = new ChefState();
    this.#slogan = Chef.#random_slogan();
    this.#view = new ChefView({ holder, name, slogan: this.#slogan });
  }

  get status() {
    return this.#state.status;
  }

  process_order(order) {
    const t = this;
    if (!t.#state.startOrder(order))
      return false;

    t.#sync_processing_ui();

    const time_to_complete = Math.floor(Math.random() * 30) + 1;
    t.#progress.push(
      new Progress({
        html: `Preparing <strong>${order.food.name}</strong>`,
        holder: t.#view.getCookProgressHolder(),
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
    this.#progress.slice().forEach(progress => progress.destroy());
    this.#progress = [];
    this.clearObservers();
    this.#state.clear();
    this.#view.destroy();
  }


  // private methods

  #complete_order() {
    const completedOrder = this.#state.completeCurrentOrder();
    if (!completedOrder)
      return;

    this.#sync_processing_ui();
    this.#highlight_test();
    this.notify(this.id, completedOrder);
  }

  #sync_processing_ui() {
    this.#view.syncProcessing(this.status === Chef.STATUS.BUSY);
  }

  #highlight_test() {
    this.#view.highlight(APP_TIMEOUTS.CHEF_HIGHLIGHT_MS);
  }

  static #random_slogan() {
    return this.#slogans[Math.floor(Math.random() * this.#slogans.length)]
  }
}
