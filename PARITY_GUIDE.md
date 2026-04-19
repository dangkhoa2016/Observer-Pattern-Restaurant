# Cross-Project Parity Guide
> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](./PARITY_GUIDE.vi.md)
>
> Related repositories:
> - [Observer-Pattern-Restaurant](https://github.com/dangkhoa2016/Observer-Pattern-Restaurant)
> - [Observer-Pattern-Restaurant-VueJs](https://github.com/dangkhoa2016/Observer-Pattern-Restaurant-VueJs)

This guide maps the plain JavaScript implementation to the Vue 2 implementation so developers can move between the two codebases without re-learning the domain model.

## Module Map

| Plain JavaScript | Vue 2 | Responsibility |
| --- | --- | --- |
| `assets/js/models/restaurant.js` | `vue/restaurant.vue` + `vue/stores/restaurantStore.js` | Bootstraps the app and wires chefs, tables, assistant, and order flow. |
| `assets/js/models/panel-action.js` | `vue/panel-action.vue` + `vue/panel-action.js` | Control panel for adding tables and toggling the action card. |
| `assets/js/models/food-list.js` + `assets/js/views/food-list-view.js` | `vue/modal-foods.vue` + `vue/modal-foods.js` + `vue/food-item.vue` + `vue/food-item.js` | Menu modal, food selection, and order submission. |
| `assets/js/models/table.js` + `assets/js/views/table-view.js` | `vue/table-item.vue` + `vue/table-item.js` + `vue/order-food.vue` + `vue/order-food.js` | Table card, subscription state, ordered dishes, and eating progress. |
| `assets/js/models/assistant.js` | `vue/assistant.vue` + `vue/assistant.js` + `vue/assistant-log.vue` + `vue/assistant-log.js` | Queue incoming orders, dispatch them to chefs, and publish completed dishes. |
| `assets/js/models/chef.js` + `assets/js/views/chef-view.js` | `vue/chef.vue` + `vue/chef.js` | Chef status, progress UI, and completed dish notifications. |
| `assets/js/models/progress.js` + `assets/js/views/progress-view.js` | `vue/processing.vue` + `vue/processing.js` + `vue/progress-bar.vue` + `vue/progress-bar.js` | Animated progress bars and manual completion button. |
| `assets/js/models/*-state.js` | `vue/stores/restaurantStore.js` state + local component state | Domain state is class-based in plain JS and store-driven in Vue. |

## Shared Vocabulary

| Domain action | Plain JavaScript | Vue 2 |
| --- | --- | --- |
| Add a table | `Restaurant.addTable()` and `add_table()` | `restaurantStore/addTable` via `panel-action.vue` |
| Open the dish picker for a table | `FoodList.showMenuFor()` and `show_menu_for()` | `table-item.js -> showMenuForTable() -> restaurantStore/setCurrentTableId` |
| Queue submitted orders | `Assistant.addOrders()` and `add_orders()` | `assistant.js` watches `selectedFoods` and pushes into its local queue |
| Assign an order to a chef | `Assistant.#send_to_chef()` -> `Chef.processOrder()` | `assistant.js -> dispatchToChef()` -> `restaurantStore/assignOrderToChef` |
| Update chef/order status | `Chef.processOrder()` and private state transition methods | `restaurantStore/updateChefOrderStatus` |
| Store completed dishes by table | assistant completion event + `Table.receiveFood()` | `restaurantStore/storeCompletedOrdersForTable` + `table-item.js` watcher |
| Subscribe a table to assistant updates | `Table.subscribeToAssistant()` and `subscribe_to_assistant()` | `table-item.js -> subscribeToAssistant()` |
| Unsubscribe a table | `Table.unsubscribeFromAssistant()` and `unsubscribe_from_assistant()` | `table-item.js -> unsubscribeFromAssistant()` |

## Reading Tips

- The plain JavaScript repo now keeps the original snake_case methods as compatibility aliases, but the camelCase methods are the preferred names when you compare them to Vue.
- The Vue store now exposes clearer domain names such as `setCurrentTableId`, `assignOrderToChef`, `updateChefOrderStatus`, and `storeCompletedOrdersForTable`. Legacy store aliases still exist to avoid breaking older code.
- If you want to compare the core Observer loop, start with `Restaurant` and `Assistant` in the [plain JavaScript project](https://github.com/dangkhoa2016/Observer-Pattern-Restaurant), then read `restaurant.vue`, `restaurantStore.js`, and `assistant.js` in Vue.
