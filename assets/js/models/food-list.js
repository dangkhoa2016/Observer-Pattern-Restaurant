class FoodList extends Observable {
  #root = null;
  #list = null;
  #state = null;

  constructor() {
    super();
    let root = $('#modal-holder');
    if (root.length === 0) root = $('body');
    this.#root = root;
    this.#state = new FoodListState();

    this.foods = [];
  }

  show_menu_for(table) {
    if (!this.#list || this.#list.length === 0)
      return;

    this.#state.setCurrentTable(table);
    this.#sync_food_selection();

    this.#list.modal('show', { backdrop: 'static' });
  }

  async render() {
    const t = this;
    if (t.#list !== null && t.#list.length > 0)
      return;

    t.#list = $('#modal-foods');

    try {
      const data = await $.get('/assets/data.json');
      $.each(data, function(indx, obj) {
        const food = new Food(t.#list.find('#food-list'), obj);
        food.set_toggle_handler(function(currentFood, isSelected) {
          t.#state.toggleFood(currentFood.id, isSelected);
        });
        t.foods.push(food);
        food.render();
      });

      t.#state.setFoods(t.foods);

      t.#root.append(t.#list);

      t.#bind_click();
    } catch (error) {
      t.#show_load_error(APP_MESSAGES.MENU_LOAD_ERROR);
      throw new Error(`Unable to load menu data: ${error.message || error}`);
    }
  }

  destroy() {
    if (this.#list && this.#list.length > 0) {
      $('.btn-order', this.#list).off('click.food-list');
      this.#list.modal('hide');
      this.#list.remove();
    }

    this.#list = null;
    this.#state.clear();
    this.clearObservers();
  }


  // private methods

  #bind_click() {
    const t = this;
    $('.btn-order', t.#list)
      .off('click.food-list')
      .on('click.food-list', function(e) {
        e.preventDefault();

        const submission = t.#build_order_submission();
        if (submission) {
          t.notify(submission);
          $('.modal-footer label', t.#list).text('');
          t.#list.modal('hide');
          return;
        }

        $('.modal-footer label', t.#list).text(APP_MESSAGES.FOOD_SELECTION_REQUIRED);
      });
  }

  #build_order_submission() {
    const tableId = this.#state.getCurrentTableId();
    const foods = this.#state.getSelectedFoods();
    if (!tableId || foods.length === 0)
      return null;

    const orders = foods.map(food => new Order(tableId, food));

    return {
      type: APP_EVENTS.FOOD_LIST_ORDERS_SUBMITTED,
      payload: {
        tableId,
        orders
      }
    };
  }

  #sync_food_selection() {
    $.each(this.foods, (indx, food) => {
      food.set_state(this.#state.isSelected(food.id));
    });
  }

  #show_load_error(message) {
    if (!this.#list || this.#list.length === 0)
      return;

    const modalBody = this.#list.find('.modal-body');
    if (modalBody.length === 0)
      return;

    modalBody.prepend(
      $(
        `<div class='alert alert-danger food-list-error' role='alert'>${message}</div>`
      )
    );
  }

}
