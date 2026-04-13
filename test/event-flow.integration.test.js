const test = require('node:test');
const assert = require('node:assert/strict');

const { loadApp } = require('./support/app-harness');

function createMenuData() {
  return [{ name: 'Pho' }];
}

test('restaurant wires food selection through assistant dispatch to the target table', async () => {
  const { app, $, context, timers } = loadApp();

  context.$.get = async function(url) {
    if (url === '/assets/data.json')
      return createMenuData();

    throw new Error(`Unexpected url: ${url}`);
  };

  class StubTemplate {
    async init() {}
  }

  class StubPanelAction {
    show_confirm() {}
  }

  class InstantChef {
    static nextId = 1;

    constructor() {
      this.id = InstantChef.nextId;
      InstantChef.nextId += 1;
      this.status = app.Chef.STATUS.IDLE;
      this.listeners = new Set();
    }

    subscribe(listener) {
      this.listeners.add(listener);
    }

    unsubscribe(listener) {
      this.listeners.delete(listener);
    }

    process_order(order) {
      this.status = app.Chef.STATUS.BUSY;
      order.status = app.Order.STATUS.PROCESSING;
      this.status = app.Chef.STATUS.IDLE;
      this.listeners.forEach(listener => listener(this.id, order));
      return true;
    }
  }

  const restaurant = new app.Restaurant({
    ChefClass: InstantChef,
    PanelActionClass: StubPanelAction,
    TemplateClass: StubTemplate,
    chef_holder: '#chef-holder',
    number_chefs: 1,
    number_test_tables: 1,
    table_holder: '#table-holder'
  });

  await restaurant.init();

  const table = restaurant.tables[0];
  const added = [];
  const received = [];
  const originalAddOrders = table.add_orders.bind(table);
  const originalReceiveFood = table.receive_food.bind(table);

  table.add_orders = function(orders) {
    added.push(...orders.map(order => order.id));
    return originalAddOrders(orders);
  };

  table.receive_food = function(order) {
    received.push(order.id);
    return originalReceiveFood(order);
  };

  restaurant.food_list.show_menu_for(table);
  $('.list-group-item .btn').first().trigger('click');
  $('.btn-order').trigger('click');

  assert.equal(added.length, 1);
  assert.deepEqual(received, []);

  timers.runNext();

  assert.deepEqual(received, [added[0]]);
});