class Table {
  static template = null;
  static template_foods = null;
  static #id_increase = 0;
  static #slogans = ['Reserved for the president...', 'Reserved for our finest guests...',
    'Reserved for a very important guest...', 'Reserved for a distinguished guest...'];

  #food_list = null;
  #state = null;
  #progress = [];
  #fn_remove = null;
  #assistant = null;
  #assistant_subscription = null;
  #view = null;

  constructor(options = {}) {
    Table.#id_increase += 1;
    this.#state = new TableState({
      id: Table.#id_increase,
      slogan: Table.#random_slogan()
    });
    this.id = this.#state.id;

    this.#food_list = options.food_list;
    this.#fn_remove = options.fn_remove;
    this.#assistant = options.assistant || null;
    this.#assistant_subscription = this.#create_assistant_subscription();
    this.#view = new TableView({
      holder: options.holder,
      id: this.id,
      slogan: this.#state.slogan
    });

    this.#init_table();
    this.subscribe_to_assistant();
  }

  destroy() {
    this.unsubscribe_from_assistant();
    this.#progress.slice().forEach(progress => progress.destroy());
    this.#progress = [];
    this.#state.clear();
    this.#view.destroy();
  }

  add_orders(orders) {
    this.#state.addOrders(orders || []);
    this.#render_foods(orders);
  }

  receive_food(order) {
    const t = this;

    t.#view.highlight(APP_TIMEOUTS.TABLE_HIGHLIGHT_MS);

    if (!t.#state.hasOrder(order))
      return;

    const time_to_complete = Math.floor(Math.random() * 30) + 1;
    t.#progress.push(
      new Progress({
        icon: 'fas fa-check-double',
        html: `Enjoying the dish...`,
        holder: t.#view.getEatProgressHolder(order.id),
        time_to_complete,
        reference: order,
        call_back_complete: function(progress, ord) {
          const indx_pg = t.#progress.indexOf(progress);
          if (indx_pg !== -1) t.#progress.splice(indx_pg, 1);
          t.#remove_order(ord);

          progress.destroy();
        }
      })
    );
  }


  // private methods

  #init_table() {
    this.#view.initInteractions({
      onAddFoods: () => this.#food_list.show_menu_for(this),
      onRemove: () => {
        if (this.#fn_remove) this.#fn_remove(this);
      },
      onToggleSubscription: subscribe => {
        if (subscribe) this.subscribe_to_assistant();
        else this.unsubscribe_from_assistant();

        this.#sync_subscription_buttons();
      }
    });
    this.#sync_subscription_buttons();
  }

  #render_foods(orders) {
    this.#view.appendOrders(orders);
  }

  #remove_order(order) {
    if (!this.#state.removeOrder(order))
      return;
    this.#view.removeOrder(order);
  }

  #create_assistant_subscription() {
    return (event) => {
      if (!event || event.type !== APP_EVENTS.ASSISTANT_ORDER_COMPLETED)
        return;

      const { order, tableId } = event.payload;
      if (!order || tableId !== this.id)
        return;

      this.receive_food(order);
    };
  }

  #sync_subscription_buttons() {
    this.#view.syncSubscriptionButtons(this.#state.isSubscribed());
  }

  subscribe_to_assistant() {
    if (!this.#assistant || !this.#assistant_subscription || !this.#state.markSubscribed())
      return false;

    this.#assistant.subscribe(this.#assistant_subscription);
    this.#sync_subscription_buttons();
    return true;
  }

  unsubscribe_from_assistant() {
    if (!this.#assistant || !this.#assistant_subscription || !this.#state.markUnsubscribed())
      return false;

    this.#assistant.unsubscribe(this.#assistant_subscription);
    this.#sync_subscription_buttons();
    return true;
  }

  static #random_slogan() {
    return this.#slogans[Math.floor(Math.random() * this.#slogans.length)]
  }

  // private methods

}
