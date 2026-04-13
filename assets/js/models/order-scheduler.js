class OrderScheduler {
  #orders = [];
  #statuses = null;

  constructor(statuses = typeof ORDER_STATUS !== 'undefined' ? ORDER_STATUS : { PENDING: 1 }) {
    this.#statuses = statuses;
  }

  get size() {
    return this.#orders.length;
  }

  enqueue(orders = []) {
    if (!Array.isArray(orders) || orders.length === 0)
      return this.size;

    this.#orders.push(...orders);
    return this.size;
  }

  remove(order) {
    const index = this.#orders.indexOf(order);
    if (index === -1)
      return false;

    this.#orders.splice(index, 1);
    return true;
  }

  clear() {
    this.#orders = [];
  }

  snapshot() {
    return [...this.#orders];
  }

  hasPendingOrders() {
    return this.#orders.some(order => order.status === this.#statuses.PENDING);
  }

  getNextPendingOrder() {
    return this.#orders.find(order => order.status === this.#statuses.PENDING) || null;
  }

  dispatchAvailable(chefs = [], isChefAvailable, assignOrder) {
    const assignments = [];
    if (typeof isChefAvailable !== 'function' || typeof assignOrder !== 'function')
      return assignments;

    for (let i = 0; i < chefs.length; i++) {
      const chef = chefs[i];
      if (!isChefAvailable(chef))
        continue;

      const order = this.getNextPendingOrder();
      if (!order)
        break;

      assignOrder(chef, order);
      assignments.push({ chef, order });
    }

    return assignments;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = OrderScheduler;