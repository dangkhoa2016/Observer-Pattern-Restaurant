const test = require('node:test');
const assert = require('node:assert/strict');

const Observable = require('../assets/js/utilities/observable');
const Logger = require('../assets/js/utilities/logger');
const {
  APP_LOG_LEVELS,
  APP_MESSAGES,
  APP_TIMEOUTS,
  CHEF_STATUS,
  ORDER_STATUS
} = require('../assets/js/utilities/constants');

test('observable deduplicates subscriptions and stops notifications after unsubscribe', () => {
  const observable = new Observable();
  const received = [];
  const listener = (...args) => received.push(args);

  assert.equal(observable.subscribe(listener), true);
  assert.equal(observable.subscribe(listener), false);
  assert.equal(observable.listenerCount(), 1);

  observable.notify('table', 2);
  assert.deepEqual(received, [['table', 2]]);

  assert.equal(observable.unsubscribe(listener), true);
  assert.equal(observable.unsubscribe(listener), false);
  observable.notify('table', 3);
  assert.deepEqual(received, [['table', 2]]);
});

test('logger respects configured log level', () => {
  const originalInfo = console.info;
  const originalError = console.error;
  const calls = [];

  console.info = (...args) => calls.push(['info', ...args]);
  console.error = (...args) => calls.push(['error', ...args]);

  Logger.configure({ level: APP_LOG_LEVELS.ERROR });
  Logger.info('ignored');
  Logger.error('visible');
  Logger.configure({ level: APP_LOG_LEVELS.INFO });

  console.info = originalInfo;
  console.error = originalError;

  assert.deepEqual(calls, [['error', 'visible']]);
});

test('shared constants stay standardized across status and timeout domains', () => {
  assert.equal(ORDER_STATUS.PENDING, 1);
  assert.equal(ORDER_STATUS.DONE, 3);
  assert.equal(CHEF_STATUS.IDLE, 1);
  assert.equal(APP_TIMEOUTS.ASSISTANT_DISPATCH_MS, 3000);
  assert.equal(APP_MESSAGES.TABLE_REMOVE_CONFIRM, 'Are you sure to remove this table ?');
});