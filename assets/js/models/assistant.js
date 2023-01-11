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
      chef.subscribe(function(chef_id, order) {
        t.#chef_done(chef_id, order);
      });
    });
  }

  add_orders(table_id, orders) {
    this.#hight_light_test(`Receive ${orders.length} order(s) from Table [${table_id}]`);
    this.#orders = [...this.#orders, ...(orders || [])];
    console.log(`Receive ${orders.length} order(s)`, orders, 'from table', table_id, 'total', this.#orders.length);
    this.#send_to_chefs();
  }


  // private methods

  #add_info(chef_id, order, bg, action) {
    if (action === 'completed')
      console.log(`Chef [${chef_id}] completed Order [${order.id}:${order.food.name}]`);

    const info = $(
      Assistant.template_info({ chef_id, order, bg, action, date: new Date() })
    );

    this.#element.find('.card-footer').append(info);
    setTimeout(function() {
      info.slideUp(() => info.remove());
    }, 8000);
  }

  #assign_job(chef_id) {
    const t = this;
    if (t.#orders.length === 0) {
      console.log('No orders.');
      return;
    }

    const time_wait = t.#timeout_to_send * 1000;
    console.log(`Wait for ${time_wait} to send order to next free chef.`);

    setTimeout(function() {
      $.each(t.#chefs, function(idx, chef) {
        if (chef.id === chef_id) {
          $.each(t.#orders, function(indxo, orderx) {
            if (orderx.status === 1) {
              t.#send_to_chef(chef, orderx);
              return false;
            }
          });
          return false;
        }
      });
    }, time_wait);
  }

  #chef_done(chef_id, order) {
    const t = this;
    t.#add_info(chef_id, order, 'info bg-opacity-75', 'completed');

    t.#hight_light_test(`Receive completed food from Chef [${chef_id}]`);
    t.notify(order);

    const indx = t.#orders.indexOf(order);
    t.#orders.splice(indx, 1);
    console.log('Remain: ', t.#orders);
    t.#assign_job(chef_id);
  }

  #hight_light_test(message, unhighlight = false) {
    const t = this;
    if (unhighlight) {
      t.#element.removeClass('hight-light').tooltip('hide');
      t.#clear_timeout();
    }

    t.#element.attr('data-bs-original-title', message)
      .addClass('hight-light').tooltip('show');
    t.#clear_timeout();

    t.#timeout_unhighlight = setTimeout(function() {
      t.#element.removeClass('hight-light').tooltip('hide');
    }, 4000);
  }

  #clear_timeout() {
    if (!this.#timeout_unhighlight)
      return;

    clearTimeout(this.#timeout_unhighlight);
    this.#timeout_unhighlight = null;
  }

  #send_to_chef(chef, order) {
    const t = this;
    if (!chef || !order)
      return;

    if (chef.status === 1) {
      console.log(`Send Order [${order.id}] to Chef [${chef.id}]`);
      t.#add_info(chef.id, order, 'warning bg-opacity-75', 'received');
      chef.process_order(order);
      return;
    }

    console.log(`Chef [${chef.id}] is busy.`);
  }

  #send_to_chefs() {
    const t = this;
    if (t.#orders.length === 0)
      return;

    const time_wait = t.#timeout_to_send * 1000;
    console.log(`Wait for ${time_wait} to send orders to chefs.`);
    setTimeout(function() {
      for (let i = 0; i < t.#chefs.length; i++) {
        if (t.#orders.length > i)
          t.#send_to_chef(t.#chefs[i], t.#orders[i]);
        else break;
      }
    }, time_wait);
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
