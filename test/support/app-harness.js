const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const { JSDOM } = require('jsdom');
const createJQuery = require('jquery');

const SCRIPT_FILES = [
  'assets/js/utilities/helper.js',
  'assets/js/models/order.js',
  'assets/js/models/progress.js',
  'assets/js/models/chef.js',
  'assets/js/models/assistant.js',
  'assets/js/models/table.js',
  'assets/js/models/food-list.js',
  'assets/js/models/panel-action.js',
  'assets/js/models/restaurant.js',
  'assets/js/models/food.js',
  'assets/js/utilities/template.js'
];

function createTimerController() {
  let nextId = 1;
  const tasks = new Map();

  return {
    setTimeout(fn, delay = 0) {
      const id = nextId;
      nextId += 1;
      tasks.set(id, { fn, delay, order: id });
      return id;
    },

    clearTimeout(id) {
      tasks.delete(id);
    },

    runNext() {
      if (tasks.size === 0)
        return false;

      const [id, task] = [...tasks.entries()].sort((left, right) => {
        if (left[1].delay !== right[1].delay)
          return left[1].delay - right[1].delay;

        return left[1].order - right[1].order;
      })[0];

      tasks.delete(id);
      task.fn();
      return true;
    },

    runAll(limit = 100) {
      let count = 0;
      while (tasks.size > 0) {
        count += 1;
        if (count > limit)
          throw new Error(`Too many scheduled tasks: ${tasks.size}`);

        this.runNext();
      }
    },

    pendingCount() {
      return tasks.size;
    }
  };
}

function createBaseHtml() {
  return [
    '<!DOCTYPE html>',
    '<html>',
    '<head></head>',
    '<body>',
    "<div id='modal-holder'></div>",
    "<div id='assistant'></div>",
    "<div id='table-holder'></div>",
    "<div id='chef-holder'></div>",
    "<div id='panel-action'></div>",
    '</body>',
    '</html>'
  ].join('');
}

function installJQueryStubs($) {
  $.fn.tooltip = function() { return this; };
  $.fn.modal = function() { return this; };
  $.fn.slideUp = function(callback) {
    if (typeof callback === 'function')
      callback.call(this);

    return this;
  };
  $.fn.animate = function(properties, callback) {
    if (properties)
      this.css(properties);

    if (typeof callback === 'function')
      callback.call(this);

    return this;
  };
}

function installTemplates(app) {
  app.Assistant.template = function() {
    return [
      "<div class='card assistant' data-bs-placement='left'>",
      "<div class='card-body'></div>",
      "<div class='card-footer'></div>",
      '</div>'
    ].join('');
  };

  app.Assistant.template_info = function({ chef_id, order, bg, action }) {
    return `<div class='info ${bg}' data-chef='${chef_id}' data-order='${order.id}' data-action='${action}'></div>`;
  };

  app.Table.template = function({ id, slogan }) {
    return [
      "<div class='card w-20 draggable float-start'>",
      `<h5 class='card-header'>Table: ${id}</h5>`,
      "<div class='card-body'>",
      `<h6 class='card-title'>${slogan}</h6>`,
      "<div class='food-list'></div>",
      "<div class='action mt-2'>",
      "<a href='#' class='btn btn-sm btn-add-foods float-start btn-primary'>Add foods</a>",
      "<div class='float-end'>",
      "<a href='#' data-bs-toggle='tooltip' class='btn btn-sm btn-remove btn-dark'></a>",
      "<a href='#' data-bs-toggle='tooltip' class='btn btn-sm btn-subscribe d-none btn-success'></a>",
      "<a href='#' data-bs-toggle='tooltip' class='btn btn-sm btn-unsubscribe btn-danger'></a>",
      '</div>',
      "<div class='clearfix'></div>",
      '</div>',
      '</div>',
      '</div>'
    ].join('');
  };

  app.Table.template_foods = function({ orders }) {
    return orders.map(order => {
      return [
        `<div class='order${order.id}'>`,
        `<button type='button' class='btn btn-sm w-100 ${order.food.color?.css || ''}'>${order.food.name}</button>`,
        "<div class='eat-progress'></div>",
        '</div>'
      ].join('');
    }).join('');
  };

  app.Chef.template = function({ name, slogan }) {
    return [
      "<div class='card w-25 chef float-start'>",
      `<h5 class='card-title p-2'>Chef: ${name}</h5>`,
      "<div class='card-body px-2 py-0'><div class='cook-progress'></div></div>",
      `<div class='card-footer bg-info text-white'>Slogan: \"${slogan}\"</div>`,
      '</div>'
    ].join('');
  };

  app.Progress.template_pg = function({ icon, html }) {
    return [
      "<div class='pg-test mb-2'>",
      "<div class='input-group'>",
      "<div class='form-control p-1'><div class='progress'></div></div>",
      `<button class='btn btn-info btn-complete' type='button' title='Complete'><span class='${icon}'></span></button>`,
      '</div>',
      `<p class='text-muted mb-0'>${html}</p>`,
      '</div>'
    ].join('');
  };

  app.Progress.template_pg_bar = function({ color, percent }) {
    return `<div class='progress-bar' style='width: ${percent}%; background-color: ${color}'></div>`;
  };

  app.Food.template = function({ name, status_class, button_class, status }) {
    return [
      "<div class='list-group-item'>",
      "<div class='d-flex w-100 justify-content-between'>",
      `<span><span class='food-status ${status_class}'></span><label>${status}</label></span>`,
      `<a class='btn btn-sm ${button_class}'>${name}</a>`,
      '</div>',
      '</div>'
    ].join('');
  };
}

function loadApp() {
  const timers = createTimerController();
  const dom = new JSDOM(createBaseHtml(), { url: 'http://localhost/' });
  const { window } = dom;
  const $ = createJQuery(window);

  installJQueryStubs($);

  const context = vm.createContext({
    window,
    document: window.document,
    navigator: window.navigator,
    location: window.location,
    console,
    jQuery: $,
    $,
    setTimeout: timers.setTimeout.bind(timers),
    clearTimeout: timers.clearTimeout.bind(timers),
    bootstrap: {
      Modal: class {
        show() {}
        hide() {}
      }
    },
    Draggabilly: class {
      constructor() {}
    }
  });

  context.global = context;
  context.globalThis = context;
  context.self = context;

  for (const relativeFile of SCRIPT_FILES) {
    const absoluteFile = path.join('/workspaces/devex/Observer-Pattern-Restaurant', relativeFile);
    const source = fs.readFileSync(absoluteFile, 'utf8');
    vm.runInContext(source, context, { filename: absoluteFile });
  }

  vm.runInContext(
    'globalThis.__app = { Assistant, Chef, Food, FoodList, Helper, Order, PanelAction, Progress, Restaurant, Table, Template };',
    context
  );

  installTemplates(context.__app);

  return {
    app: context.__app,
    context,
    dom,
    timers,
    $
  };
}

function createFakeChef(app, id) {
  const listeners = new Set();

  return {
    id,
    status: app.Chef.STATUS.IDLE,
    assignments: [],
    currentOrder: null,

    subscribe(listener) {
      listeners.add(listener);
    },

    unsubscribe(listener) {
      listeners.delete(listener);
    },

    process_order(order) {
      this.status = app.Chef.STATUS.BUSY;
      order.status = app.Order.STATUS.PROCESSING;
      this.currentOrder = order;
      this.assignments.push(order.id);
      return true;
    },

    completeCurrent() {
      if (!this.currentOrder)
        return;

      const completedOrder = this.currentOrder;
      completedOrder.status = app.Order.STATUS.DONE;
      this.currentOrder = null;
      this.status = app.Chef.STATUS.IDLE;
      listeners.forEach(listener => listener(this.id, completedOrder));
    },

    listenerCount() {
      return listeners.size;
    }
  };
}

module.exports = {
  createFakeChef,
  loadApp
};