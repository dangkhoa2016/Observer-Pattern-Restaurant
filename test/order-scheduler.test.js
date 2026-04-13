const test = require('node:test');
const assert = require('node:assert/strict');

const OrderScheduler = require('../assets/js/models/order-scheduler');

const STATUS = {
  PENDING: 1,
  PROCESSING: 2,
  DONE: 3
};

function createOrder(id, status = STATUS.PENDING) {
  return { id, status };
}

test('order scheduler dispatches pending orders in FIFO order across free chefs', () => {
  const scheduler = new OrderScheduler(STATUS);
  const chefs = [
    { id: 1, free: true },
    { id: 2, free: false },
    { id: 3, free: true }
  ];
  const orders = [
    createOrder(1),
    createOrder(2, STATUS.PROCESSING),
    createOrder(3),
    createOrder(4)
  ];
  const assignments = [];

  scheduler.enqueue(orders);

  const dispatched = scheduler.dispatchAvailable(
    chefs,
    chef => chef.free,
    (chef, order) => {
      order.status = STATUS.PROCESSING;
      assignments.push([chef.id, order.id]);
    }
  );

  assert.deepEqual(assignments, [[1, 1], [3, 3]]);
  assert.equal(dispatched.length, 2);
  assert.equal(scheduler.getNextPendingOrder().id, 4);
});

test('order scheduler removes finished orders and reports pending state correctly', () => {
  const scheduler = new OrderScheduler(STATUS);
  const orderOne = createOrder(1);
  const orderTwo = createOrder(2);

  scheduler.enqueue([orderOne, orderTwo]);

  assert.equal(scheduler.hasPendingOrders(), true);
  assert.equal(scheduler.remove(orderOne), true);
  assert.deepEqual(scheduler.snapshot().map(order => order.id), [orderTwo.id]);

  orderTwo.status = STATUS.DONE;
  assert.equal(scheduler.hasPendingOrders(), false);
  assert.equal(scheduler.remove(orderOne), false);
});