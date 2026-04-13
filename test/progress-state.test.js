const test = require('node:test');
const assert = require('node:assert/strict');

const ProgressState = require('../assets/js/models/progress-state');

test('progress state advances parts and computes delay from configured duration', () => {
  const state = new ProgressState({
    time_to_complete_ms: 1000,
    parts: [25, 75]
  });

  assert.equal(state.hasRemainingParts(), true);
  assert.equal(state.getCurrentPartIndex(), 0);
  assert.equal(state.getCurrentPercent(), 25);
  assert.equal(state.getCurrentDelay(), 250);
  assert.equal(state.advance(), 25);

  assert.equal(state.getCurrentPartIndex(), 1);
  assert.equal(state.getCurrentPercent(), 75);
  assert.equal(state.getCurrentDelay(), 750);
  assert.equal(state.advance(), 75);
  assert.equal(state.hasRemainingParts(), false);
  assert.equal(state.getCurrentPercent(), null);
});