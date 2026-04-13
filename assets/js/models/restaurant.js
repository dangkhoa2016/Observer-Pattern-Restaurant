class Restaurant {
  #number_test_tables = 0;
  #table_holder = null;
  #chef_holder = null;
  #assistant = null;
  #panel_action = null;
  #options = {};
  #number_chefs = 0;
  #deps = {};

  constructor(options = {}) {
    this.#options = options;
    this.#deps = {
      Assistant: options.AssistantClass || Assistant,
      Chef: options.ChefClass || Chef,
      FoodList: options.FoodListClass || FoodList,
      PanelAction: options.PanelActionClass || PanelAction,
      Table: options.TableClass || Table,
      Template: options.TemplateClass || Template
    };
    this.chefs = [];
    this.food_list = null;
    this.tables = [];
  }

  add_table() {
    const t = this;
    const fn_remove = function(table) {
      t.#panel_action.show_confirm(
        'Are you sure to remove this table ?',
        function() {
          t.#remove_table(table);
          table.destroy();
        }
      );
    };

    const tb = new this.#deps.Table({
      holder: t.#table_holder,
      food_list: this.food_list,
      assistant: t.#assistant,
      fn_remove
    });

    t.tables.push(tb);
  }

  async init() {
    try {
      await (new this.#deps.Template()).init();

      if (this.#options.table_holder)
        this.#table_holder = $(this.#options.table_holder);
      this.#chef_holder = this.#options.chef_holder;
      this.#number_test_tables = this.#options.number_test_tables || 0;

      this.#panel_action = new this.#deps.PanelAction(this);

      this.#add_chefs();

      this.#assistant = new this.#deps.Assistant(this.chefs, '#assistant');

      await this.#init_food_list();

      this.#add_tables();

      console.log('App started at: ', new Date());
    } catch (error) {
      this.#render_init_error(error);
      throw error;
    }
  }


  // private methods

  #add_chefs() {
    this.#number_chefs = this.#options.number_chefs || 2;
    for (let i = 0; i < this.#number_chefs; i++)
      this.chefs.push(new this.#deps.Chef(i + 1, this.#chef_holder));
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

  async #init_food_list() {
    const t = this;
    t.food_list = new this.#deps.FoodList();
    t.food_list.subscribe(function(table_id, data) {
      t.#assistant.add_orders(table_id, data);
    });
    await t.food_list.render();
  }

  #render_init_error(error) {
    const root = $('#modal-holder').length > 0 ? $('#modal-holder') : $('body');
    const message = error instanceof Error ? error.message : String(error);

    root.find('.app-init-error').remove();
    root.prepend(
      $(
        `<div class='alert alert-danger app-init-error' role='alert'>${message}</div>`
      )
    );
  }

  // private methods

}
