const test = require('node:test');
const assert = require('node:assert/strict');

const TableState = require('../assets/js/models/table-state');
const { CHEF_STATUS, ORDER_STATUS } = require('../assets/js/utilities/constants');
const ChefState = require('../assets/js/models/chef-state');

test('table state tracks orders and subscription state without DOM concerns', () => {
  const tableState = new TableState({ id: 7, slogan: 'VIP' });
  const orderOne = { id: 1 };
  const orderTwo = { id: 2 };

  assert.equal(tableState.id, 7);
  assert.equal(tableState.slogan, 'VIP');
  assert.equal(tableState.markSubscribed(), true);
  assert.equal(tableState.markSubscribed(), false);
  assert.equal(tableState.isSubscribed(), true);

  tableState.addOrders([orderOne, orderTwo]);
  assert.equal(tableState.ordersCount(), 2);
  assert.equal(tableState.hasOrder(orderOne), true);
  assert.equal(tableState.removeOrder(orderOne), true);
  assert.deepEqual(tableState.listOrders(), [orderTwo]);

  assert.equal(tableState.markUnsubscribed(), true);
  assert.equal(tableState.isSubscribed(), false);
});

test('chef state owns current order and status transitions without UI dependencies', () => {
  const chefState = new ChefState();
  const order = { id: 10, status: ORDER_STATUS.PENDING };

  assert.equal(chefState.status, CHEF_STATUS.IDLE);
  assert.equal(chefState.canAcceptOrder(), true);
  assert.equal(chefState.startOrder(order), true);
  assert.equal(order.status, ORDER_STATUS.PROCESSING);
  assert.equal(chefState.status, CHEF_STATUS.BUSY);
  assert.equal(chefState.canAcceptOrder(), false);
  assert.equal(chefState.startOrder({ id: 11, status: ORDER_STATUS.PENDING }), false);

  const completed = chefState.completeCurrentOrder();
  assert.equal(completed, order);
  assert.equal(order.status, ORDER_STATUS.DONE);
  assert.equal(chefState.status, CHEF_STATUS.IDLE);
  assert.equal(chefState.currentOrder, null);
});