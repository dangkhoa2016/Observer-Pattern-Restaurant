let eventFactoryConstants = null;

if (typeof module !== 'undefined' && module.exports) {
  eventFactoryConstants = require('./constants');
}

const EVENT_FACTORY_TYPES = typeof APP_EVENTS !== 'undefined'
  ? APP_EVENTS
  : eventFactoryConstants.APP_EVENTS;

class AppEventFactory {
  static create(type, payload = {}) {
    return { type, payload };
  }

  static foodListOrdersSubmitted(tableId, orders) {
    return this.create(EVENT_FACTORY_TYPES.FOOD_LIST_ORDERS_SUBMITTED, {
      tableId,
      orders
    });
  }

  static assistantOrderCompleted(chefId, order) {
    return this.create(EVENT_FACTORY_TYPES.ASSISTANT_ORDER_COMPLETED, {
      chefId,
      order,
      tableId: order ? order.table_id : null
    });
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = AppEventFactory;