class Order {
  static #id_increase = 0;
  static STATUS = ORDER_STATUS;

  #table_id = null;

  constructor(table, food) {
    Order.#id_increase += 1;
    this.id = Order.#id_increase;
    this.food = food;
    this.status = Order.STATUS.PENDING;
    this.#table_id = table;
  }

  get table_id() {
    return this.#table_id;
  }
}
