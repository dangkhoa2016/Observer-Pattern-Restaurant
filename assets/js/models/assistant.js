class Assistant extends Observable {
  static template = null;
  static template_receive = null;
  static template_info = null;

  #chefs = [];
  #scheduler = null;
  #holder = null;
  #element = null;
  #timeout_unhighlight = null;
  #dispatch_timeout = null;
  #is_dispatching = false;
  #chef_subscriptions = new Map();
  #info_timeouts = new Set();

  constructor(chefs, holder) {
    super();
    const t = this;
    t.#holder = holder;
    t.#scheduler = new OrderScheduler(Order.STATUS);
    t.#render();
    if (!chefs)
      return;

    t.#subscribe_to_chefs(chefs);
  }

  add_orders(table_id, orders) {
    this.#highlight_test(`Receive ${orders.length} order(s) from Table [${table_id}]`);
    this.#scheduler.enqueue(orders || []);
    Logger.info(`Receive ${orders.length} order(s)`, orders, 'from table', table_id, 'total', this.#scheduler.size);
    this.#schedule_dispatch();
  }

  destroy() {
    this.#clear_timeout();
    this.#clear_dispatch_timeout();

    this.#clear_info_timeouts();
    this.#unsubscribe_from_chefs();
    this.#dispose_element();
    this.clearObservers();
    if (this.#scheduler)
      this.#scheduler.clear();
  }


  // private methods

  #add_info(chef_id, order, bg, action) {
    if (action === 'completed')
      Logger.info(`Chef [${chef_id}] completed Order [${order.id}:${order.food.name}]`);

    if (!this.#element)
      return;

    const info = $(
      Assistant.template_info({ chef_id, order, bg, action, date: new Date() })
    );

    this.#element.find('.card-footer').append(info);
    const timeoutId = setTimeout(() => {
      this.#info_timeouts.delete(timeoutId);
      info.slideUp(() => info.remove());
    }, APP_TIMEOUTS.ASSISTANT_INFO_MS);
    this.#info_timeouts.add(timeoutId);
  }

  #chef_done(chef_id, order) {
    const t = this;
    t.#add_info(chef_id, order, 'info bg-opacity-75', 'completed');

    t.#highlight_test(`Receive completed food from Chef [${chef_id}]`);
    t.notify(AppEventFactory.assistantOrderCompleted(chef_id, order));

    t.#scheduler.remove(order);
    Logger.debug('Remain: ', t.#scheduler.snapshot());
    t.#schedule_dispatch();
  }

  #subscribe_to_chefs(chefs) {
    this.#chefs = chefs;
    $.each(chefs, (indx, chef) => {
      const onChefDone = (chef_id, order) => {
        this.#chef_done(chef_id, order);
      };

      chef.subscribe(onChefDone);
      this.#chef_subscriptions.set(chef.id, { chef, onChefDone });
    });
  }

  #clear_info_timeouts() {
    this.#info_timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.#info_timeouts.clear();
  }

  #unsubscribe_from_chefs() {
    this.#chef_subscriptions.forEach(({ chef, onChefDone }) => {
      chef.unsubscribe(onChefDone);
    });
    this.#chef_subscriptions.clear();
  }

  #dispose_element() {
    if (!this.#element)
      return;

    this.#element.tooltip('dispose');
    this.#element.remove();
    this.#element = null;
  }

  #highlight_test(message, unhighlight = false) {
    const t = this;
    if (!t.#element)
      return;

    if (unhighlight) {
      t.#element.removeClass('highlight').tooltip('hide');
      t.#clear_timeout();
    }

    t.#element.attr('data-bs-original-title', message)
      .addClass('highlight').tooltip('show');
    t.#clear_timeout();

    t.#timeout_unhighlight = setTimeout(function() {
      if (!t.#element)
        return;

      t.#element.removeClass('highlight').tooltip('hide');
    }, APP_TIMEOUTS.ASSISTANT_HIGHLIGHT_MS);
  }

  #clear_timeout() {
    if (!this.#timeout_unhighlight)
      return;

    clearTimeout(this.#timeout_unhighlight);
    this.#timeout_unhighlight = null;
  }

  #clear_dispatch_timeout() {
    if (!this.#dispatch_timeout)
      return;

    clearTimeout(this.#dispatch_timeout);
    this.#dispatch_timeout = null;
  }

  #has_pending_orders() {
    return this.#scheduler && this.#scheduler.hasPendingOrders();
  }

  #has_free_chef() {
    return this.#chefs.some(chef => chef.status === Chef.STATUS.IDLE);
  }

  #schedule_dispatch() {
    if (!this.#has_pending_orders()) {
      Logger.debug('No orders.');
      return;
    }

    if (!this.#has_free_chef() || this.#dispatch_timeout || this.#is_dispatching)
      return;

    const time_wait = APP_TIMEOUTS.ASSISTANT_DISPATCH_MS;
    Logger.debug(`Wait for ${time_wait} to send orders to chefs.`);

    this.#dispatch_timeout = setTimeout(() => {
      this.#dispatch_timeout = null;
      this.#dispatch_orders();
    }, time_wait);
  }

  #dispatch_orders() {
    if (this.#is_dispatching)
      return;

    this.#is_dispatching = true;

    try {
      this.#scheduler.dispatchAvailable(
        this.#chefs,
        chef => chef.status === Chef.STATUS.IDLE,
        (chef, order) => this.#send_to_chef(chef, order)
      );
    } finally {
      this.#is_dispatching = false;
    }

    if (this.#has_pending_orders())
      this.#schedule_dispatch();
  }

  #send_to_chef(chef, order) {
    const t = this;
    if (!chef || !order)
      return;

    if (chef.status === Chef.STATUS.IDLE) {
      Logger.info(`Send Order [${order.id}] to Chef [${chef.id}]`);
      t.#add_info(chef.id, order, 'warning bg-opacity-75', 'received');
      chef.process_order(order);
      return;
    }

    Logger.debug(`Chef [${chef.id}] is busy.`);
  }

  #render() {
    if (!Assistant.template)
      return;

    const assistant = $(Assistant.template({ }));
    assistant.tooltip({ customClass: 'assistant-tooltip', trigger: 'manual' });
    this.#element = assistant;
    assistant.appendTo(this.#holder);
  }
}
