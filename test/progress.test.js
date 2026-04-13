const test = require('node:test');
const assert = require('node:assert/strict');

const { loadApp } = require('./support/app-harness');

test('progress completes and invokes callback with reference after queued timers finish', () => {
  const { app, $, timers } = loadApp();
  const completed = [];

  app.Helper.random_progress_test = function() {
    return [100];
  };

  new app.Progress({
    holder: $('#table-holder'),
    reference: { id: 42 },
    time_to_complete: 1,
    call_back_complete(progress, reference) {
      completed.push(reference.id);
      progress.destroy();
    }
  });

  assert.equal($('#table-holder .pg-test').length, 1);

  timers.runAll();

  assert.deepEqual(completed, [42]);
  assert.equal($('#table-holder .pg-test').length, 0);
  assert.equal(timers.pendingCount(), 0);
});

test('progress destroy clears timers so completion callback does not run later', () => {
  const { app, $, timers } = loadApp();
  let completeCount = 0;

  app.Helper.random_progress_test = function() {
    return [40, 60];
  };

  const progress = new app.Progress({
    holder: $('#table-holder'),
    time_to_complete: 1,
    call_back_complete() {
      completeCount += 1;
    }
  });

  assert.ok(timers.pendingCount() > 0);

  progress.destroy();
  timers.runAll();

  assert.equal(completeCount, 0);
  assert.equal($('#table-holder .pg-test').length, 0);
  assert.equal(timers.pendingCount(), 0);
});