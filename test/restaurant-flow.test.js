const test = require('node:test');
const assert = require('node:assert/strict');

const { createFakeChef, loadApp } = require('./support/app-harness');

function createFood(name) {
  return {
    name,
    color: { css: 'bg-dark text-white', bg: '#343a40' }
  };
}

test('table subscription lifecycle follows subscribe, unsubscribe, resubscribe, and destroy', () => {
  const { app, $ } = loadApp();
  const listeners = new Set();
  const assistant = {
    subscribe(listener) {
      listeners.add(listener);
    },
    unsubscribe(listener) {
      listeners.delete(listener);
    },
    notify(order) {
      listeners.forEach(listener => listener(order));
    },
    listenerCount() {
      return listeners.size;
    }
  };

  const table = new app.Table({
    assistant,
    food_list: { show_menu_for() {} },
    holder: $('#table-holder')
  });

  const received = [];
  table.receive_food = function(order) {
    received.push(order.id);
  };

  const ownOrder = new app.Order(table.id, createFood('Steak'));
  const otherOrder = new app.Order(table.id + 1, createFood('Soup'));

  assert.equal(assistant.listenerCount(), 1);
  assistant.notify(ownOrder);
  assistant.notify(otherOrder);
  assert.deepEqual(received, [ownOrder.id]);

  assert.equal(table.unsubscribe_from_assistant(), true);
  assert.equal(assistant.listenerCount(), 0);
  assistant.notify(ownOrder);
  assert.deepEqual(received, [ownOrder.id]);

  assert.equal(table.subscribe_to_assistant(), true);
  assert.equal(assistant.listenerCount(), 1);
  assistant.notify(ownOrder);
  assert.deepEqual(received, [ownOrder.id, ownOrder.id]);

  table.destroy();
  assert.equal(assistant.listenerCount(), 0);
  assistant.notify(ownOrder);
  assert.deepEqual(received, [ownOrder.id, ownOrder.id]);
});

test('assistant keeps FIFO queue and does not double-dispatch when orders arrive before the timer runs', () => {
  const { app, timers } = loadApp();
  const chef = createFakeChef(app, 1);
  const assistant = new app.Assistant([chef], '#assistant');

  const orderOne = new app.Order(1, createFood('Burger'));
  const orderTwo = new app.Order(1, createFood('Fries'));

  assistant.add_orders(1, [orderOne]);
  assistant.add_orders(1, [orderTwo]);

  assert.equal(timers.pendingCount(), 2);

  timers.runNext();

  assert.deepEqual(chef.assignments, [orderOne.id]);
  assert.equal(orderOne.status, app.Order.STATUS.PROCESSING);
  assert.equal(orderTwo.status, app.Order.STATUS.PENDING);
  assert.ok(timers.pendingCount() >= 1);

  chef.completeCurrent();
  assert.ok(timers.pendingCount() >= 2);

  timers.runAll();

  assert.deepEqual(chef.assignments, [orderOne.id, orderTwo.id]);
  assert.equal(orderTwo.status, app.Order.STATUS.PROCESSING);

  assistant.destroy();
  assert.equal(chef.listenerCount(), 0);
});

test('assistant assigns available chefs first and holds remaining orders until a chef becomes idle', () => {
  const { app, timers } = loadApp();
  const chefOne = createFakeChef(app, 1);
  const chefTwo = createFakeChef(app, 2);
  const assistant = new app.Assistant([chefOne, chefTwo], '#assistant');

  const orderOne = new app.Order(10, createFood('Pho'));
  const orderTwo = new app.Order(10, createFood('Rice'));
  const orderThree = new app.Order(10, createFood('Tea'));

  assistant.add_orders(10, [orderOne, orderTwo, orderThree]);
  timers.runNext();

  assert.deepEqual(chefOne.assignments, [orderOne.id]);
  assert.deepEqual(chefTwo.assignments, [orderTwo.id]);
  assert.equal(orderThree.status, app.Order.STATUS.PENDING);

  chefTwo.completeCurrent();
  timers.runAll();

  assert.deepEqual(chefOne.assignments, [orderOne.id]);
  assert.deepEqual(chefTwo.assignments, [orderTwo.id, orderThree.id]);
  assert.equal(orderThree.status, app.Order.STATUS.PROCESSING);
});