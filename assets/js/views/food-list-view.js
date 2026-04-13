class FoodListView {
  #root = null;
  #list = null;

  constructor(options = {}) {
    this.#root = $(options.rootSelector || '#modal-holder');
    if (this.#root.length === 0)
      this.#root = $('body');

    this.#list = $(options.listSelector || '#modal-foods');
  }

  hasList() {
    return this.#list && this.#list.length > 0;
  }

  getFoodContainer() {
    return this.#list.find('#food-list');
  }

  attach() {
    this.#root.append(this.#list);
  }

  show() {
    this.#list.modal('show', { backdrop: 'static' });
  }

  hide() {
    this.#list.modal('hide');
  }

  bindSubmit(handler) {
    $('.btn-order', this.#list)
      .off('click.food-list-view')
      .on('click.food-list-view', function(e) {
        e.preventDefault();
        if (handler) handler();
      });
  }

  setFooterMessage(message) {
    $('.modal-footer label', this.#list).text(message || '');
  }

  showLoadError(message) {
    const modalBody = this.#list.find('.modal-body');
    if (modalBody.length === 0)
      return;

    modalBody.find('.food-list-error').remove();
    modalBody.prepend(
      $(`<div class='alert alert-danger food-list-error' role='alert'>${message}</div>`)
    );
  }

  destroy() {
    if (!this.hasList())
      return;

    $('.btn-order', this.#list).off('click.food-list-view');
    this.hide();
    this.#list.remove();
    this.#list = null;
  }
}

if (typeof module !== 'undefined' && module.exports)
  module.exports = FoodListView;