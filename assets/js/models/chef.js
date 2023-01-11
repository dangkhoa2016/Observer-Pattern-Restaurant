class Chef {
  static #id_increase = 0;
  static template = null;
  static #slogans = ['Bring Out The Foodie In You.', 'Find Happiness In Cooking.',
    'Awaken Your Inner Chef.', 'Bring Out The Chef In You.'];

  #holder = null;
  #element = null;
  #slogan = '';
  #current_order = null;
  #progress = [];
  #timeout_unhighlight = null;

  // each instance of the Observer class
  // starts with an empty array of things (observers)
  // that react to a state change
  #observer_assistants = [];

  constructor(name, holder) {
    Chef.#id_increase += 1;
    this.id = Chef.#id_increase;
    this.status = 1;
    this.#slogan = Chef.#random_slogan();
    if (holder) this.#holder = $(holder);

    if (!Chef.template)
      return;

    const chef = $(Chef.template({ name, slogan: this.#slogan }));
    this.#element = chef;

    chef.appendTo(this.#holder);
  }

  process_order(order) {
    const t = this;
    if (t.#current_order && t.#current_order.status === 1)
      return false;

    //this.#hight_light_test(true);

    this.#update_status(2); // cooking
    order.status = 2; // processing
    t.#current_order = order;

    const time_to_complete = Math.floor(Math.random() * 30) + 1;
    t.#progress.push(
      new Progress({
        html: `Processing <strong>${order.food.name}</strong>`,
        holder: t.#element.find('.cook-progress'),
        time_to_complete,
        call_back_complete: function(progress) {
          t.#complete_order();
          const indx_pg = t.#progress.indexOf(progress);
          if (indx_pg !== -1) t.#progress.splice(indx_pg, 1);
          progress.destroy();
        }
      })
    );
  }


  // private methods

  #complete_order() {
    this.#current_order.status = 3;
    this.#update_status(1);
    this.#hight_light_test();
    this.notify(this.id, this.#current_order);
  }

  #update_status(status) {
    this.status = status;
    this.#set_bg_process(status === 1);
  }

  #set_bg_process(complete) {
    if (complete) this.#element.removeClass('processing');
    else this.#element.addClass('processing');
  }

  #hight_light_test(unhighlight = false) {
    const t = this;
    const call_func = function() { t.#element.removeClass('hight-light'); };

    if (unhighlight) {
      call_func();
      t.#clear_timeout();
    }

    t.#clear_timeout();
    t.#element.addClass('hight-light');
    t.#timeout_unhighlight = setTimeout(call_func, 2000);
  }

  #clear_timeout() {
    if (!this.#timeout_unhighlight)
      return;

    clearTimeout(this.#timeout_unhighlight);
    this.#timeout_unhighlight = null;
  }

  static #random_slogan() {
    return this.#slogans[Math.floor(Math.random() * this.#slogans.length)]
  }

  // private methods


  // add the ability to subscribe to a new object / DOM element
  // essentially, add something to the observers array
  subscribe(fn_to_call) {
    this.#observer_assistants.push(fn_to_call);
  }

  // add the ability to unsubscribe from a particular object
  //// essentially, remove something from the observers array
  unsubscribe(fn_to_remote) {
    this.#observer_assistants = this.#observer_assistants.filter(
      subscriber => subscriber !== fn_to_remote
    );
  }

  // update all subscribed objects / DOM elements
  // and pass some data to each of them
  notify(id, data) {
    this.#observer_assistants.forEach(observer => observer(id, data));
  }
}
