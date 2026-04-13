# About
This is sample Observer Pattern about Restaurant using jQuery and Javascript Classes.

# Test
Install dependencies and run the minimal regression suite:

```bash
npm install
npm test
```

The tests cover three core flows:
- order queue dispatch in Assistant
- table subscribe/unsubscribe lifecycle
- chef assignment when multiple orders are pending

The suite now also covers:
- confirmed table removal in Restaurant
- pure order scheduling logic without DOM harness
- progress completion and timer cleanup
- startup failures for template loading and menu data loading

# Architecture Notes
- Shared observer behavior now lives in `assets/js/utilities/observable.js` and is reused by Assistant, Chef, and FoodList.
- Shared statuses, messages, timeouts, and log levels now live in `assets/js/utilities/constants.js`.
- Logging is standardized through `assets/js/utilities/logger.js`, which supports log levels and can be silenced in tests.
- Order dispatch rules stay in `assets/js/models/order-scheduler.js`, keeping assignment logic testable without DOM setup.
