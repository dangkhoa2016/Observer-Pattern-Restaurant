class Order {
  static #id_increase = 0;

  #table_id = null;

  constructor(table, food) {
    Order.#id_increase += 1;
    this.id = Order.#id_increase;
    this.food = food;
    this.status = 1;
    this.#table_id = table;
  }
}
