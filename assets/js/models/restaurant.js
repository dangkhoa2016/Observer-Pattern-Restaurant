class Restaurant {
  #number_test_tables = 0;
  #table_holder = null;
  #chef_holder = null;
  #assistant = null;
  #panel_action = null;
  #options = {};
  #number_chefs = 0;

  constructor(options = {}) {
    this.#options = options;
    this.chefs = [];
    this.food_list = null;
    this.tables = [];
  }

  add_table() {
    const t = this;
    const fn_subscribe = function(data) { tb.receive_food(data); };
    const fn_help = function(type, table) {
      if (type === 'remove') {
        t.#panel_action.show_confirm(
          'Are you sure to remove this table ?',
          function() {
            t.#remove_table(table);
            table.destroy();
          }
        );
        return;
      }

      // console.log('fn_help', tb, table);
      if (table) t.#assistant.subscribe(fn_subscribe);
      else t.#assistant.unsubscribe(fn_subscribe);
    };

    const tb = new Table({
      holder: t.#table_holder,
      food_list: this.food_list,
      fn_help
    });

    t.#assistant.subscribe(fn_subscribe);
    t.tables.push(tb);
  }

  async init() {

    await (new Template()).init();

    if (this.#options.table_holder)
      this.#table_holder = $(this.#options.table_holder);
    this.#chef_holder = this.#options.chef_holder;
    this.#number_test_tables = this.#options.number_test_tables || 0;

    this.#panel_action = new PanelAction(this);

    this.#add_chefs();

    this.#assistant = new Assistant(this.chefs, '#assistant');

    this.#init_food_list();

    this.#add_tables();

    console.log('App started at: ', new Date());
  }


  // private methods

  #add_chefs() {
    this.#number_chefs = this.#options.number_chefs || 2;
    for (let i = 0; i < this.#number_chefs; i++)
      this.chefs.push(new Chef(i + 1, this.#chef_holder));
  }

  #add_tables() {
    if (
      typeof this.#number_test_tables === 'number' &&
      this.#number_test_tables > 0
    ) {
      for (let i = 0; i < this.#number_test_tables; i++)
        this.add_table();
    }
  }

  #remove_table(table) {
    const indx = this.tables.indexOf(table);
    if (indx === -1)
      return;

    this.tables.splice(indx, 1);
  }

  #init_food_list() {
    const t = this;
    t.food_list = new FoodList();
    t.food_list.subscribe(function(table_id, data) {
      t.#assistant.add_orders(table_id, data);
    });
    t.food_list.render();
  }

  // private methods

}
