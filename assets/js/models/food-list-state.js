class FoodListState {
  #foods = [];
  #current_table_id = null;
  #selected_food_ids = new Set();

  setFoods(foods = []) {
    this.#foods = Array.isArray(foods) ? [...foods] : [];
    return this.getFoods();
  }

  getFoods() {
    return [...this.#foods];
  }

  setCurrentTable(table) {
    this.#current_table_id = table ? table.id : null;
    this.resetSelection();
  }

  getCurrentTableId() {
    return this.#current_table_id;
  }

  toggleFood(foodId, isSelected) {
    if (isSelected) {
      this.#selected_food_ids.add(foodId);
      return true;
    }

    this.#selected_food_ids.delete(foodId);
    return false;
  }

  isSelected(foodId) {
    return this.#selected_food_ids.has(foodId);
  }

  getSelectedFoods() {
    return this.#foods.filter(food => this.#selected_food_ids.has(food.id));
  }

  resetSelection() {
    this.#selected_food_ids.clear();
  }

  clear() {
    this.#foods = [];
    this.#current_table_id = null;
    this.#selected_food_ids.clear();
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = FoodListState;