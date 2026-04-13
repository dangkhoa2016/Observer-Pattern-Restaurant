class Assistant {
  static template = null;
  static template_receive = null;
  static template_info = null;

  #chefs = [];
  #orders = [];
  #timeout_to_send = 3;
  #holder = null;
  #element = null;
  #timeout_unhighlight = null;
  #dispatch_timeout = null;
  #is_dispatching = false;
  #chef_subscriptions = new Map();
  #info_timeouts = new Set();

  // each instance of the Observer class
  // starts with an empty array of things (observers)
  // that react to a state change
  #observer_tables = [];

  constructor(chefs, holder) {
    const t = this;
    t.#holder = holder;
    t.#render();
    if (!chefs)
      return;

    t.#chefs = chefs;
    $.each(chefs, function(indx, chef) {
      const onChefDone = function(chef_id, order) {
        t.#chef_done(chef_id, order);
      };

      chef.subscribe(onChefDone);
      t.#chef_subscriptions.set(chef.id, { chef, onChefDone });
    });
  }

  add_orders(table_id, orders) {
    this.#highlight_test(`Receive ${orders.length} order(s) from Table [${table_id}]`);
    this.#orders = [...this.#orders, ...(orders || [])];
    console.log(`Receive ${orders.length} order(s)`, orders, 'from table', table_id, 'total', this.#orders.length);
    this.#schedule_dispatch();
  }

  destroy() {
    this.#clear_timeout();
    this.#clear_dispatch_timeout();

    this.#info_timeouts.forEach(timeoutId => clearTimeout(timeoutId));
    this.#info_timeouts.clear();

    this.#chef_subscriptions.forEach(({ chef, onChefDone }) => {
      chef.unsubscribe(onChefDone);
    });
    this.#chef_subscriptions.clear();

    if (this.#element) {
      this.#element.tooltip('dispose');
      this.#element.remove();
    }

    this.#element = null;
    this.#observer_tables = [];
  }


  // private methods

  #add_info(chef_id, order, bg, action) {
    if (action === 'completed')
      console.log(`Chef [${chef_id}] completed Order [${order.id}:${order.food.name}]`);

    if (!this.#element)
      return;

    const info = $(
      Assistant.template_info({ chef_id, order, bg, action, date: new Date() })
    );

    this.#element.find('.card-footer').append(info);
    const timeoutId = setTimeout(() => {
      this.#info_timeouts.delete(timeoutId);
      info.slideUp(() => info.remove());
    }, 8000);
    this.#info_timeouts.add(timeoutId);
  }

  #chef_done(chef_id, order) {
    const t = this;
    t.#add_info(chef_id, order, 'info bg-opacity-75', 'completed');

    t.#highlight_test(`Receive completed food from Chef [${chef_id}]`);
    t.notify(order);

    const indx = t.#orders.indexOf(order);
    if (indx !== -1) t.#orders.splice(indx, 1);
    console.log('Remain: ', t.#orders);
    t.#schedule_dispatch();
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
    }, 4000);
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
    return this.#orders.some(order => order.status === Order.STATUS.PENDING);
  }

  #get_next_pending_order() {
    return this.#orders.find(order => order.status === Order.STATUS.PENDING) || null;
  }

  #has_free_chef() {
    return this.#chefs.some(chef => chef.status === Chef.STATUS.IDLE);
  }

  #schedule_dispatch() {
    if (!this.#has_pending_orders()) {
      console.log('No orders.');
      return;
    }

    if (!this.#has_free_chef() || this.#dispatch_timeout || this.#is_dispatching)
      return;

    const time_wait = this.#timeout_to_send * 1000;
    console.log(`Wait for ${time_wait} to send orders to chefs.`);

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
      for (let i = 0; i < this.#chefs.length; i++) {
        const chef = this.#chefs[i];
        if (chef.status !== Chef.STATUS.IDLE)
          continue;

        const order = this.#get_next_pending_order();
        if (!order)
          break;

        this.#send_to_chef(chef, order);
      }
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
      console.log(`Send Order [${order.id}] to Chef [${chef.id}]`);
      t.#add_info(chef.id, order, 'warning bg-opacity-75', 'received');
      chef.process_order(order);
      return;
    }

    console.log(`Chef [${chef.id}] is busy.`);
  }

  #render() {
    if (!Assistant.template)
      return;

    const assistant = $(Assistant.template({ }));
    assistant.tooltip({ customClass: 'assistant-tooltip', trigger: 'manual' });
    this.#element = assistant;
    assistant.appendTo(this.#holder);
  }

  // private methods


  // add the ability to subscribe to a new object / DOM element
  // essentially, add something to the observers array
  subscribe(fn_to_call) {
    this.#observer_tables.push(fn_to_call);
  }

  // add the ability to unsubscribe from a particular object
  // essentially, remove something from the observers array
  unsubscribe(fn_to_remote) {
    this.#observer_tables = this.#observer_tables.filter(
      subscriber => subscriber !== fn_to_remote
    );
    // console.log('this.#observer_tables', this.#observer_tables.length);
  }

  // update all subscribed objects / DOM elements
  // and pass some data to each of them
  notify(data) {
    this.#observer_tables.forEach(observer => observer(data));
  }
}
