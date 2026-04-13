# About
This is a sample restaurant workflow demo built with the Observer Pattern, jQuery, and JavaScript classes.

# Test
Install dependencies and run the minimal regression suite:

```bash
npm install
npm test
```

The tests cover three core flows:
- assistant order queue dispatch
- table subscription lifecycle
- chef assignment when multiple orders are pending

The suite now also covers:
- confirmed table removal in the Restaurant model
- pure order scheduling logic without the DOM harness
- progress completion and timer cleanup
- startup failures for template loading and menu loading

# Architecture Notes
- Shared observer behavior now lives in `assets/js/utilities/observable.js` and is reused by Assistant, Chef, and FoodList.
- Shared statuses, messages, timeouts, and log levels now live in `assets/js/utilities/constants.js`.
- Shared event creation now lives in `assets/js/utilities/event-factory.js`, so models emit standardized event objects instead of hand-building payloads.
- Logging is standardized through `assets/js/utilities/logger.js`, which supports log levels and can be silenced in tests.
- Order dispatch rules stay in `assets/js/models/order-scheduler.js`, keeping assignment logic testable without DOM setup.
- `assets/js/models/table-state.js` and `assets/js/models/chef-state.js` now own domain state for table orders/subscription and chef order/status transitions, while `Table` and `Chef` focus on UI binding and rendering.
- `assets/js/models/food-list-state.js` now owns menu selection state, and cross-model communication now uses structured events defined in `assets/js/utilities/constants.js` via `APP_EVENTS`.
- DOM-specific rendering/binding now lives in `assets/js/views/food-list-view.js`, `assets/js/views/table-view.js`, and `assets/js/views/chef-view.js`, which keeps the corresponding models focused on state and flow control.
- `assets/js/models/progress-state.js` and `assets/js/views/progress-view.js` now split timer/progress state from DOM rendering for progress bars.
- The test suite includes a full event-flow integration check from food selection through restaurant wiring, assistant dispatch, and table completion handling.
