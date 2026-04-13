const ORDER_STATUS = Object.freeze({
  PENDING: 1,
  PROCESSING: 2,
  DONE: 3
});

const CHEF_STATUS = Object.freeze({
  IDLE: 1,
  BUSY: 2
});

const APP_LOG_LEVELS = Object.freeze({
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error',
  SILENT: 'silent'
});

const APP_TIMEOUTS = Object.freeze({
  ASSISTANT_DISPATCH_MS: 3000,
  ASSISTANT_INFO_MS: 8000,
  ASSISTANT_HIGHLIGHT_MS: 4000,
  CHEF_HIGHLIGHT_MS: 2000,
  PROGRESS_COMPLETE_DELAY_MS: 1000,
  TABLE_HIGHLIGHT_MS: 4000,
  TOOLTIP_SWEEP_MS: 30000
});

const APP_MESSAGES = Object.freeze({
  FOOD_SELECTION_REQUIRED: 'Please select at least one food !',
  MENU_LOAD_ERROR: 'Unable to load menu data.',
  TABLE_REMOVE_CONFIRM: 'Are you sure to remove this table ?'
});

if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    APP_LOG_LEVELS,
    APP_MESSAGES,
    APP_TIMEOUTS,
    CHEF_STATUS,
    ORDER_STATUS
  };
}