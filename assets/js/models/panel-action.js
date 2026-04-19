class PanelAction {
  #panel_action = $('#panel-action');
  #restaurant = null;
  #confirm = null;
  #confirm_text = 'Are you sure?';
  #call_back = null;
  #root = null;

  constructor(restaurant) {
    this.#restaurant = restaurant;
    let root = $('#modal-holder');
    if (root.length === 0) root = $('body');
    this.#root = root;

    this.#render();
  }

  showConfirm(msg, cb) {
    const t = this;

    if (typeof cb === 'function') t.#call_back = cb;
    msg = msg || t.#confirm_text;
    t.#confirm
      .find('.modal-body')
      .html(msg)
      .end()
      .modal('show');
  }

  show_confirm(msg, cb) {
    return this.showConfirm(msg, cb);
  }

  destroy() {
    $('.btn-action-main', this.#panel_action).off('click.panel-action');
    $('.btn-add-table', this.#panel_action).off('click.panel-action');

    if (this.#confirm) {
      this.#confirm.find('.btn-sure').off('click.panel-action');
      this.#confirm.modal('hide');
      this.#confirm.remove();
    }

    this.#confirm = null;
    this.#call_back = null;
  }


  // private methods

  #render() {
    const t = this;
    t.#bind_click();

    t.#confirm = $('#modal-confirm');

    t.#confirm.find('.btn-sure')
      .off('click.panel-action')
      .on('click.panel-action', function(e) {
        e.preventDefault();

        if (t.#call_back) t.#call_back();
        t.#confirm.modal('hide');
      });

    t.#root.append(t.#confirm);

    t.#init_add_table();
  }

  #init_add_table() {
    const t = this;
    $('.btn-add-table', t.#panel_action)
      .off('click.panel-action')
      .on('click.panel-action', function(e) {
        e.preventDefault();

        const addTable = typeof t.#restaurant.addTable === 'function'
          ? t.#restaurant.addTable.bind(t.#restaurant)
          : t.#restaurant.add_table.bind(t.#restaurant);
        addTable();
      });
  }

  #bind_click() {
    const t = this;
    const pa = t.#panel_action;
    $('.btn-action-main', pa)
      .off('click.panel-action')
      .on('click.panel-action', function(e) {
        e.preventDefault();

        let left = 10;
        const isHide = pa.hasClass('hide-panel');
        if (isHide === false) {
          const wp = pa.outerWidth();
          left = -wp;
        }

        pa.stop().animate({ left }, function() {
          if (isHide) pa.removeClass('hide-panel');
          else pa.addClass('hide-panel');
        });
      });
  }

  // private methods

}
