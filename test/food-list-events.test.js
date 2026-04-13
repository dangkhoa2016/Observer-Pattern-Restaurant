const test = require('node:test');
const assert = require('node:assert/strict');

const { loadApp } = require('./support/app-harness');

function createMenuData() {
  return [{ name: 'Pho' }, { name: 'Tea' }];
}

test('food list emits structured order submission events for the current table', async () => {
  const { app, $, context } = loadApp();
  const emitted = [];

  context.$.get = async function(url) {
    if (url === '/assets/data.json')
      return createMenuData();

    throw new Error(`Unexpected url: ${url}`);
  };

  const foodList = new app.FoodList();
  const table = {
    id: 11,
    add_orders() {
      throw new Error('FoodList should emit events instead of mutating table state directly');
    }
  };

  foodList.subscribe(event => emitted.push(event));

  await foodList.render();
  foodList.show_menu_for(table);

  $('.list-group-item .btn').first().trigger('click');
  $('.btn-order').trigger('click');

  assert.equal(emitted.length, 1);
  assert.equal(emitted[0].type, app.APP_EVENTS.FOOD_LIST_ORDERS_SUBMITTED);
  assert.equal(emitted[0].payload.tableId, 11);
  assert.equal(emitted[0].payload.orders.length, 1);
  assert.equal(emitted[0].payload.orders[0].table_id, 11);
});