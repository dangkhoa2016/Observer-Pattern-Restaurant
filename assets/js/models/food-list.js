class FoodList extends Observable {
  #state = null;
  #view = null;

  constructor() {
    super();
    this.#state = new FoodListState();
    this.#view = new FoodListView();

    this.foods = [];
  }

  show_menu_for(table) {
    if (!this.#view.hasList())
      return;

    this.#state.setCurrentTable(table);
    this.#sync_food_selection();

    this.#view.show();
  }

  async render() {
    const t = this;
    if (t.#view.hasList() && t.foods.length > 0)
      return;

    try {
      const data = await $.get('/assets/data.json');
      $.each(data, function(indx, obj) {
        const food = new Food(t.#view.getFoodContainer(), obj);
        food.set_toggle_handler(function(currentFood, isSelected) {
          t.#state.toggleFood(currentFood.id, isSelected);
        });
        t.foods.push(food);
        food.render();
      });

      t.#state.setFoods(t.foods);
      t.#view.attach();
      t.#bind_click();
    } catch (error) {
      t.#view.showLoadError(APP_MESSAGES.MENU_LOAD_ERROR);
      throw new Error(`Unable to load menu data: ${error.message || error}`);
    }
  }

  destroy() {
    this.#view.destroy();
    this.#state.clear();
    this.clearObservers();
  }


  // private methods

  #bind_click() {
    this.#view.bindSubmit(() => {
      const submission = this.#build_order_submission();
      if (submission) {
        this.notify(submission);
        this.#view.setFooterMessage('');
        this.#view.hide();
        return;
      }

      this.#view.setFooterMessage(APP_MESSAGES.FOOD_SELECTION_REQUIRED);
    });
  }

  #build_order_submission() {
    const tableId = this.#state.getCurrentTableId();
    const foods = this.#state.getSelectedFoods();
    if (!tableId || foods.length === 0)
      return null;

    const orders = foods.map(food => new Order(tableId, food));

    return AppEventFactory.foodListOrdersSubmitted(tableId, orders);
  }

  #sync_food_selection() {
    $.each(this.foods, (indx, food) => {
      food.set_state(this.#state.isSelected(food.id));
    });
  }

}
