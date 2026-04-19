# Hướng Dẫn Đối Chiếu Giữa Hai Dự Án

> 🌐 Language / Ngôn ngữ: [English](./PARITY_GUIDE.md) | **Tiếng Việt**
>
> Kho mã liên quan:
> - [Observer-Pattern-Restaurant](https://github.com/dangkhoa2016/Observer-Pattern-Restaurant)
> - [Observer-Pattern-Restaurant-VueJs](https://github.com/dangkhoa2016/Observer-Pattern-Restaurant-VueJs)

Tài liệu này đối chiếu cách triển khai plain JavaScript với cách triển khai Vue 2 để lập trình viên có thể di chuyển giữa hai codebase mà không phải học lại mô hình nghiệp vụ.

## Ánh Xạ Module

| Plain JavaScript | Vue 2 | Trách nhiệm |
| --- | --- | --- |
| `assets/js/models/restaurant.js` | `vue/restaurant.vue` + `vue/stores/restaurantStore.js` | Khởi động ứng dụng và nối chefs, tables, assistant, cùng luồng xử lý order. |
| `assets/js/models/panel-action.js` | `vue/panel-action.vue` + `vue/panel-action.js` | Bảng điều khiển để thêm bàn và bật/tắt action card. |
| `assets/js/models/food-list.js` + `assets/js/views/food-list-view.js` | `vue/modal-foods.vue` + `vue/modal-foods.js` + `vue/food-item.vue` + `vue/food-item.js` | Modal menu, chọn món, và gửi order. |
| `assets/js/models/table.js` + `assets/js/views/table-view.js` | `vue/table-item.vue` + `vue/table-item.js` + `vue/order-food.vue` + `vue/order-food.js` | Card bàn, trạng thái subscribe, các món đã gọi, và tiến trình ăn món. |
| `assets/js/models/assistant.js` | `vue/assistant.vue` + `vue/assistant.js` + `vue/assistant-log.vue` + `vue/assistant-log.js` | Xếp hàng order đầu vào, phân phối cho chefs, và phát thông báo món đã hoàn tất. |
| `assets/js/models/chef.js` + `assets/js/views/chef-view.js` | `vue/chef.vue` + `vue/chef.js` | Trạng thái chef, giao diện progress, và thông báo món hoàn tất. |
| `assets/js/models/progress.js` + `assets/js/views/progress-view.js` | `vue/processing.vue` + `vue/processing.js` + `vue/progress-bar.vue` + `vue/progress-bar.js` | Thanh tiến trình động và nút hoàn tất thủ công. |
| `assets/js/models/*-state.js` | `vue/stores/restaurantStore.js` state + local component state | State miền nghiệp vụ được tách theo class ở plain JS và theo store ở Vue. |

## Từ Vựng Dùng Chung

| Thao tác miền nghiệp vụ | Plain JavaScript | Vue 2 |
| --- | --- | --- |
| Thêm một bàn | `Restaurant.addTable()` và `add_table()` | `restaurantStore/addTable` qua `panel-action.vue` |
| Mở hộp chọn món cho một bàn | `FoodList.showMenuFor()` và `show_menu_for()` | `table-item.js -> showMenuForTable() -> restaurantStore/setCurrentTableId` |
| Đưa order đã gửi vào hàng đợi | `Assistant.addOrders()` và `add_orders()` | `assistant.js` theo dõi `selectedFoods` và đưa vào hàng đợi cục bộ |
| Giao một order cho chef | `Assistant.#send_to_chef()` -> `Chef.processOrder()` | `assistant.js -> dispatchToChef()` -> `restaurantStore/assignOrderToChef` |
| Cập nhật trạng thái chef/order | `Chef.processOrder()` và các private state transition | `restaurantStore/updateChefOrderStatus` |
| Lưu các món đã hoàn tất theo từng bàn | assistant completion event + `Table.receiveFood()` | `restaurantStore/storeCompletedOrdersForTable` + watcher trong `table-item.js` |
| Đăng ký nhận cập nhật từ assistant | `Table.subscribeToAssistant()` và `subscribe_to_assistant()` | `table-item.js -> subscribeToAssistant()` |
| Hủy đăng ký nhận cập nhật | `Table.unsubscribeFromAssistant()` và `unsubscribe_from_assistant()` | `table-item.js -> unsubscribeFromAssistant()` |

## Mẹo Đọc Mã

- Repo plain JavaScript hiện vẫn giữ các method `snake_case` gốc dưới dạng alias tương thích, nhưng khi đối chiếu với Vue thì các method `camelCase` là tên nên đọc trước.
- Vue store hiện có các tên miền nghiệp vụ rõ hơn như `setCurrentTableId`, `assignOrderToChef`, `updateChefOrderStatus`, và `storeCompletedOrdersForTable`. Các alias cũ vẫn được giữ để tránh làm gãy code trước đó.
- Nếu bạn muốn so sánh vòng lặp Observer cốt lõi, hãy bắt đầu từ `Restaurant` và `Assistant` ở [dự án plain JavaScript](https://github.com/dangkhoa2016/Observer-Pattern-Restaurant), sau đó đọc `restaurant.vue`, `restaurantStore.js`, và `assistant.js` ở Vue.
