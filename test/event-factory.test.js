const test = require('node:test');
const assert = require('node:assert/strict');

const AppEventFactory = require('../assets/js/utilities/event-factory');
const { APP_EVENTS } = require('../assets/js/utilities/constants');

test('event factory creates standardized order submission events', () => {
  const event = AppEventFactory.foodListOrdersSubmitted(5, [{ id: 1 }]);

  assert.equal(event.type, APP_EVENTS.FOOD_LIST_ORDERS_SUBMITTED);
  assert.equal(event.payload.tableId, 5);
  assert.deepEqual(event.payload.orders, [{ id: 1 }]);
});

test('event factory creates standardized assistant completion events', () => {
  const order = { id: 7, table_id: 3 };
  const event = AppEventFactory.assistantOrderCompleted(2, order);

  assert.equal(event.type, APP_EVENTS.ASSISTANT_ORDER_COMPLETED);
  assert.equal(event.payload.chefId, 2);
  assert.equal(event.payload.tableId, 3);
  assert.equal(event.payload.order, order);
});