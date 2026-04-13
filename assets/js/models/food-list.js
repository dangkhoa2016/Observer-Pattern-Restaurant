class FoodList {
  #root = null;
  #current_table = null;
  #list = null;

  // each instance of the Observer class
  // starts with an empty array of things (observers)
  // that react to a state change
  #observer_assistants = [];

  constructor() {
    let root = $('#modal-holder');
    if (root.length === 0) root = $('body');
    this.#root = root;

    this.foods = [];
  }

  show_menu_for(table) {
    if (!this.#list || this.#list.length === 0)
      return;

    this.#current_table = table;

    $.each(this.foods, function(indx, food) {
      food.set_state(false);
    });

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
        t.foods.push(food);
        food.render();
      });

      t.#root.append(t.#list);

      t.#bind_click();
    } catch (error) {
      t.#show_load_error('Unable to load menu data.');
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
    this.#current_table = null;
    this.#observer_assistants = [];
  }


  // private methods

  #bind_click() {
    const t = this;
    $('.btn-order', t.#list)
      .off('click.food-list')
      .on('click.food-list', function(e) {
        e.preventDefault();

        const orders = t.#get_orders();
        if (orders.length > 0) {
          t.#current_table.add_orders(orders);
          t.notify(t.#current_table.id, orders);
          $('.modal-footer label', t.#list).text('');
          t.#list.modal('hide');
          return;
        }

        $('.modal-footer label', t.#list).text('Please select at least one food !');
      });
  }

  #get_orders() {
    const selected = [];
    const t = this;
    $.each(this.foods, function(indx, food) {
      if (food.is_selected())
        selected.push(new Order(t.#current_table.id, food));
    });
    return selected;
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

  // private methods


  // add the ability to subscribe to a new object / DOM element
  // essentially, add something to the observers array
  subscribe(fn_to_call) {
    this.#observer_assistants.push(fn_to_call);
  }

  // add the ability to unsubscribe from a particular object
  // essentially, remove something from the observers array
  unsubscribe(fn_to_remote) {
    this.#observer_assistants = this.#observer_assistants.filter(
      subscriber => subscriber !== fn_to_remote
    );
  }

  // update all subscribed objects / DOM elements
  // and pass some data to each of them
  notify(table_id, data) {
    this.#observer_assistants.forEach(observer => observer(table_id, data));
  }
}
