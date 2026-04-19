class Food {
  static template = null;
  static #id_increase = 0;

  #parent = null;
  #button = null;
  #element = null;
  #active_class = '';
  #class_name = '';
  #inactive_class = `far fa-square`;
  color = null;
  #bg_color = '';
  #hover_color = '';
  #not_select_text = 'Not selected';
  #selected_text = 'Selected';
  #on_toggle = null;

  constructor(parent, data) {
    this.name = data['name'] ? data['name'] : data;
    this.#parent = $(parent);
    Food.#id_increase += 1;
    this.id = Food.#id_increase;
    this.#get_color();

    this.#class_name = `food-color-${this.id}`;
    this.#active_class = `fa fa-check-square ${this.#class_name}`;

    this.#register_style();
  }

  is_selected() {
    return this.#button.hasClass('focus');
  }

  set_toggle_handler(handler) {
    this.#on_toggle = typeof handler === 'function' ? handler : null;
  }

  set_state(is_selected = false) {
    const t = this;
    const btn = t.#button;
    const elem = t.#element;
    const status = elem.find('.food-status');
    if (is_selected) {
      btn.addClass('focus');
      status.addClass(t.#active_class).removeClass(t.#inactive_class);
      elem.find('label').text(t.#selected_text);
      return;
    } 

    btn.removeClass('focus');
    status.removeClass(t.#active_class).addClass(t.#inactive_class);
    elem.find('label').text(t.#not_select_text);
  }

  render() {
    if (!Food.template)
      return;

    const html = Food.template({
      name: this.name,
      status_class: this.#inactive_class,
      button_class: `${this.#class_name} ${this.color.css}`,
      status: this.#not_select_text
    });

    this.#element = $(html);
    this.#button = this.#element.find('.btn');
    this.#bind_click();
    if (this.#parent.length > 0)
      this.#parent.append(this.#element);
  }


  // private methods

  #register_style() {
    const style = $(`<style type="text/css" id="food-style-${this.id}"></style>`);
    const class_name = '.' + this.#class_name;
    const arr_style = [];
    /*
    arr_style.push(
      `${class_name} { background-color: ${this.bg_color}; border-color: ${this.bg_color}; }`
    );
    arr_style.push(
      `${class_name}:hover { background-color: ${this.#hover_color}; border-color: ${this.#hover_color}; }`
    );
    */
    arr_style.push(
      `${class_name}.focus { box-shadow: 0 0 0 0.2rem ${Helper.hexToRgba(
        this.color.bg, '.25'
      )} !important; }`
    );
    style.text(arr_style.join("\r\n")).appendTo($('head'));
  }

  #bind_click() {
    const t = this;
    const btn = t.#button;
    if (!btn)
      return;

    btn.click(function(e) {
      e.preventDefault();
      const nextState = !btn.hasClass('focus');
      t.set_state(nextState);
      if (t.#on_toggle) t.#on_toggle(t, nextState);
    });
  }

  #get_color() {
    let color = Helper.randomColor();
    let bgColor = Helper.colorShade(color.bg, 40);
    let hoverColor = Helper.colorShade(color.bg, 80);
    while (
      hoverColor.toLowerCase() === '#fff' ||
      hoverColor.toLowerCase() === '#ffffff' ||
      bgColor.toLowerCase() === '#fff' ||
      bgColor.toLowerCase() === '#ffffff'
    ) {
      color = Helper.randomColor();
      bgColor = Helper.colorShade(color.bg, 40);
      hoverColor = Helper.colorShade(color.bg, 80);
    }

    this.color = color;
    this.#bg_color = bgColor;
    this.#hover_color = hoverColor;
  }

  // private methods

}
