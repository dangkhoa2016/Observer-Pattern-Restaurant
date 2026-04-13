class TableState {
  #orders = [];
  #is_subscribed = false;

  constructor(options = {}) {
    this.id = options.id;
    this.slogan = options.slogan || '';
  }

  addOrders(orders = []) {
    if (!Array.isArray(orders) || orders.length === 0)
      return this.ordersCount();

    this.#orders.push(...orders);
    return this.ordersCount();
  }

  hasOrder(order) {
    return this.getOrderIndex(order) !== -1;
  }

  removeOrder(order) {
    const index = this.getOrderIndex(order);
    if (index === -1)
      return false;

    this.#orders.splice(index, 1);
    return true;
  }

  getOrderIndex(order) {
    if (!order)
      return -1;

    return this.#orders.findIndex(currentOrder => currentOrder.id === order.id);
  }

  listOrders() {
    return [...this.#orders];
  }

  ordersCount() {
    return this.#orders.length;
  }

  markSubscribed() {
    if (this.#is_subscribed)
      return false;

    this.#is_subscribed = true;
    return true;
  }

  markUnsubscribed() {
    if (!this.#is_subscribed)
      return false;

    this.#is_subscribed = false;
    return true;
  }

  isSubscribed() {
    return this.#is_subscribed;
  }

  clear() {
    this.#orders = [];
    this.#is_subscribed = false;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = TableState;