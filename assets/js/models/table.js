class Table {
  static template = null;
  static template_foods = null;
  static #id_increase = 0;
  static #slogans = ['For the President...', 'The best of the best...',
    'Only very important person...', 'Greatest person...'];

  #element = null;
  #holder = null;
  #food_list = null;
  #state = null;
  #timeout_unhighlight = null;
  #progress = [];
  #fn_remove = null;
  #assistant = null;
  #assistant_subscription = null;

  constructor(options = {}) {
    this.#holder = options.holder;
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

    this.#render();
    this.#init_table();
    this.subscribe_to_assistant();
  }

  destroy() {
    this.unsubscribe_from_assistant();
    this.#clear_timeout();
    this.#progress.slice().forEach(progress => progress.destroy());
    this.#progress = [];
    this.#state.clear();

    if (this.#element) {
      this.#element.find('.btn-add-foods, .btn-remove, .btn-unsubscribe, .btn-subscribe').off('click.table');
      $('[data-bs-toggle="tooltip"]', this.#element).tooltip('dispose');
      this.#element.tooltip('dispose');
      this.#element.remove();
    }

    this.#element = null;
  }

  add_orders(orders) {
    this.#state.addOrders(orders || []);
    this.#render_foods(orders);
  }

  receive_food(order) {
    const t = this;

    t.#highlight_test();

    if (!t.#state.hasOrder(order))
      return;

    const time_to_complete = Math.floor(Math.random() * 30) + 1;
    t.#progress.push(
      new Progress({
        icon: 'fas fa-check-double',
        html: `Eating...`,
        holder: t.#element.find(`.order${order.id} .eat-progress`),
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

  #render() {
    if (!Table.template)
      return;
      
    const table = $(Table.template({ id: this.id, slogan: this.#state.slogan }));

    if (this.#holder) {
      let count = this.#holder.find('.draggable').length + 1;
      const margin_left = 20;
      table.css('left', ((count - 1) * margin_left) + 'px');

      table.appendTo(this.#holder);
      table.attr('data-bs-original-title', 'Receive info from Assistant').tooltip({ trigger: 'manual' });
    }

    this.#element = table;
  }

  #init_table() {
    this.#bind_click();
    new Draggabilly(this.#element[0], { handle: '.card-header' });
    $('[data-bs-toggle="tooltip"]', this.#element).tooltip();
  }

  #render_foods(orders) {
    if (!orders || orders.length === 0)
      return;

    this.#element.find('.food-list').append(Table.template_foods({ orders }));
  }

  #bind_click() {
    const t = this;
    t.#element.find('.btn-add-foods')
      .off('click.table')
      .on('click.table', function(e) {
        e.preventDefault();
        t.#food_list.show_menu_for(t);
      });

    t.#element.find('.btn-remove')
      .off('click.table')
      .on('click.table', function(e) {
        e.preventDefault();
        if (t.#fn_remove) t.#fn_remove(t);
      });

    const btn_unsubscribe = t.#element.find('.btn-unsubscribe');
    const btn_subscribe = t.#element.find('.btn-subscribe');

    const toggle_subscribe = function(subscribe) {
      if (subscribe) t.subscribe_to_assistant();
      else t.unsubscribe_from_assistant();

      t.#sync_subscription_buttons();
    };

    btn_unsubscribe
      .off('click.table')
      .on('click.table', function(e) {
        e.preventDefault();
        toggle_subscribe(false);
      });

    btn_subscribe
      .off('click.table')
      .on('click.table', function(e) {
        e.preventDefault();
        toggle_subscribe(true);
      });

    t.#sync_subscription_buttons();
  }

  #remove_order(order) {
    if (!this.#state.removeOrder(order) || !this.#element)
      return;
      
    const ord = this.#element.find(`.food-list .order${order.id}`);
    if (ord.length === 0)
      return;

    ord.slideUp(() => ord.remove());
  }

  #highlight_test(unhighlight = false) {
    const t = this;
    const call_func = function() {
      if (t.#element) t.#element.removeClass('highlight').tooltip('hide');
    };

    if (unhighlight) {
      call_func();
      t.#clear_timeout();
    }

    if (!t.#element)
      return;

    t.#element.addClass('highlight').tooltip('show');
    t.#clear_timeout();

    t.#timeout_unhighlight = setTimeout(call_func, APP_TIMEOUTS.TABLE_HIGHLIGHT_MS);
  }

  #clear_timeout() {
    if (!this.#timeout_unhighlight)
      return;

    clearTimeout(this.#timeout_unhighlight);
    this.#timeout_unhighlight = null;
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
    if (!this.#element)
      return;

    const btn_unsubscribe = this.#element.find('.btn-unsubscribe');
    const btn_subscribe = this.#element.find('.btn-subscribe');

    if (this.#state.isSubscribed()) {
      btn_subscribe.addClass('d-none');
      btn_unsubscribe.removeClass('d-none');
      return;
    }

    btn_subscribe.removeClass('d-none');
    btn_unsubscribe.addClass('d-none');
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
