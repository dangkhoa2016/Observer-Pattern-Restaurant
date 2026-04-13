class TableView {
  #element = null;
  #holder = null;
  #timeout_unhighlight = null;

  constructor(options = {}) {
    this.#holder = options.holder;

    if (!Table.template)
      return;

    const table = $(Table.template({ id: options.id, slogan: options.slogan }));
    if (this.#holder) {
      let count = this.#holder.find('.draggable').length + 1;
      const margin_left = 20;
      table.css('left', ((count - 1) * margin_left) + 'px');
      table.appendTo(this.#holder);
      table.attr('data-bs-original-title', 'Receive updates from the assistant').tooltip({ trigger: 'manual' });
    }

    this.#element = table;
  }

  initInteractions(handlers = {}) {
    if (!this.#element)
      return;

    this.#element.find('.btn-add-foods')
      .off('click.table-view')
      .on('click.table-view', function(e) {
        e.preventDefault();
        if (handlers.onAddFoods) handlers.onAddFoods();
      });

    this.#element.find('.btn-remove')
      .off('click.table-view')
      .on('click.table-view', function(e) {
        e.preventDefault();
        if (handlers.onRemove) handlers.onRemove();
      });

    this.#element.find('.btn-unsubscribe')
      .off('click.table-view')
      .on('click.table-view', function(e) {
        e.preventDefault();
        if (handlers.onToggleSubscription) handlers.onToggleSubscription(false);
      });

    this.#element.find('.btn-subscribe')
      .off('click.table-view')
      .on('click.table-view', function(e) {
        e.preventDefault();
        if (handlers.onToggleSubscription) handlers.onToggleSubscription(true);
      });

    new Draggabilly(this.#element[0], { handle: '.card-header' });
    $('[data-bs-toggle="tooltip"]', this.#element).tooltip();
  }

  appendOrders(orders) {
    if (!this.#element || !orders || orders.length === 0)
      return;

    this.#element.find('.food-list').append(Table.template_foods({ orders }));
  }

  getEatProgressHolder(orderId) {
    if (!this.#element)
      return $();

    return this.#element.find(`.order${orderId} .eat-progress`);
  }

  removeOrder(order) {
    if (!this.#element)
      return;

    const orderElement = this.#element.find(`.food-list .order${order.id}`);
    if (orderElement.length === 0)
      return;

    orderElement.slideUp(() => orderElement.remove());
  }

  syncSubscriptionButtons(isSubscribed) {
    if (!this.#element)
      return;

    const btnUnsubscribe = this.#element.find('.btn-unsubscribe');
    const btnSubscribe = this.#element.find('.btn-subscribe');

    if (isSubscribed) {
      btnSubscribe.addClass('d-none');
      btnUnsubscribe.removeClass('d-none');
      return;
    }

    btnSubscribe.removeClass('d-none');
    btnUnsubscribe.addClass('d-none');
  }

  highlight(timeoutMs) {
    if (!this.#element)
      return;

    this.clearHighlight();
    this.#element.addClass('highlight').tooltip('show');
    this.#timeout_unhighlight = setTimeout(() => this.clearHighlight(), timeoutMs);
  }

  clearHighlight() {
    if (this.#timeout_unhighlight) {
      clearTimeout(this.#timeout_unhighlight);
      this.#timeout_unhighlight = null;
    }

    if (this.#element)
      this.#element.removeClass('highlight').tooltip('hide');
  }

  destroy() {
    this.clearHighlight();

    if (!this.#element)
      return;

    this.#element.find('.btn-add-foods, .btn-remove, .btn-unsubscribe, .btn-subscribe').off('click.table-view');
    $('[data-bs-toggle="tooltip"]', this.#element).tooltip('dispose');
    this.#element.tooltip('dispose');
    this.#element.remove();
    this.#element = null;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = TableView;