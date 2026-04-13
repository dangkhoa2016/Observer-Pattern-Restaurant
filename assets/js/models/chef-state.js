let chefStateConstants = null;

if (typeof module !== 'undefined' && module.exports) {
  chefStateConstants = require('../utilities/constants');
}

const CHEF_STATE_STATUS = typeof CHEF_STATUS !== 'undefined'
  ? CHEF_STATUS
  : chefStateConstants.CHEF_STATUS;

const CHEF_STATE_ORDER_STATUS = typeof ORDER_STATUS !== 'undefined'
  ? ORDER_STATUS
  : chefStateConstants.ORDER_STATUS;

class ChefState {
  #current_order = null;
  #status = CHEF_STATE_STATUS.IDLE;

  get status() {
    return this.#status;
  }

  get currentOrder() {
    return this.#current_order;
  }

  canAcceptOrder() {
    return this.#status === CHEF_STATE_STATUS.IDLE && this.#current_order === null;
  }

  startOrder(order) {
    if (!order || !this.canAcceptOrder())
      return false;

    this.#status = CHEF_STATE_STATUS.BUSY;
    order.status = CHEF_STATE_ORDER_STATUS.PROCESSING;
    this.#current_order = order;
    return true;
  }

  completeCurrentOrder() {
    if (!this.#current_order)
      return null;

    const completedOrder = this.#current_order;
    completedOrder.status = CHEF_STATE_ORDER_STATUS.DONE;
    this.#current_order = null;
    this.#status = CHEF_STATE_STATUS.IDLE;
    return completedOrder;
  }

  clear() {
    this.#current_order = null;
    this.#status = CHEF_STATE_STATUS.IDLE;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = ChefState;