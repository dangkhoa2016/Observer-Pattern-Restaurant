const test = require('node:test');
const assert = require('node:assert/strict');

const FoodListState = require('../assets/js/models/food-list-state');

test('food list state tracks current table and selected foods independently from DOM', () => {
  const state = new FoodListState();
  const foods = [{ id: 1, name: 'Pho' }, { id: 2, name: 'Tea' }];

  state.setFoods(foods);
  state.setCurrentTable({ id: 9 });
  state.toggleFood(1, true);
  state.toggleFood(2, false);

  assert.equal(state.getCurrentTableId(), 9);
  assert.equal(state.isSelected(1), true);
  assert.equal(state.isSelected(2), false);
  assert.deepEqual(state.getSelectedFoods(), [foods[0]]);

  state.setCurrentTable({ id: 10 });
  assert.equal(state.getCurrentTableId(), 10);
  assert.deepEqual(state.getSelectedFoods(), []);
});