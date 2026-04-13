> 🌐 Language / Ngôn ngữ: **English** | [Tiếng Việt](How_it_work.vi.md)

Observer Pattern - Restaurant
=================

An example of applying the Observer Pattern to a simple restaurant project.

After the page loads, the restaurant creates 2 tables. You can drag a table by its name to rearrange it, and you can add more tables by clicking the `Add Table` button on the control bar in the top-left corner of the screen.

There are 2 kitchens in this demo so you can observe the cooking assignment flow.

Quick Screens
------------

The screen right after the app finishes loading:

![Initial screen](./screenshots/first-load.png)

Adding a table from the control area:

![Add table](./screenshots/add-table.png)

The popup used to choose dishes for a table:

![Choose dishes](./screenshots/add-dishes.png)

The confirmation dialog shown before removing a table:

![Confirm table removal](./screenshots/confirm-delete.png)


How It Works
------------

1. Click the `Add Dishes` button on any table to place an order. A popup screen will display the dishes available for selection.
2. Click the dish name buttons to select dishes. You can select multiple dishes.
3. Click order to create an order item for each selected dish. The order is then sent to the **Assistant** so it can distribute the dishes to the chefs.
4. When a chef finishes cooking, the chef notifies the Assistant.
5. The Assistant informs the tables about the dish that has just been completed.
6. If a table ordered that completed dish, the table will eat it and then remove it from its list.

Notes While Watching
------------

1. The Assistant distributes dishes to the chefs 3 seconds after receiving them from the tables.
2. Chefs notify the Assistant: each chef has an **Observer**, and the **Assistant** subscribes to updates from the chefs.
    1. A chef shows a pink border when a dish is finished.
    2. The Assistant shows a blue border and writes a log below when it receives a notification.
    3. The Assistant immediately notifies all tables.
3. The Assistant notifies the tables: the Assistant has an **Observer**, and the tables subscribe to updates from the assistant.
    1. Tables show a yellow border and the tooltip `Receive updates from the assistant` when they receive a notification.
    2. A table that ordered the notified dish will display an eating progress bar.

Process Screens
------------

The Assistant receives orders and assigns them to the chefs:

![Process step 1](./screenshots/process-1.png)

Completed dishes are pushed back from the Assistant to subscribed tables:

![Process step 2](./screenshots/process-2.png)

Multiple updates can move through chefs, the Assistant, and tables at the same time:

![Process step 3](./screenshots/process-3.png)

The Assistant activity log records pickup and completion events:

![Process step 4](./screenshots/process-4.png)

Tables continue receiving updates while chefs keep working through the queue:

![Process step 5](./screenshots/process-5.png)

Another completed dish is broadcast to the subscribed tables:

![Process step 6](./screenshots/process-6.png)

The final state shows completed dishes, active eating progress, and the Assistant log:

![Process step 7](./screenshots/process-7.png)

-------------------

\ ゜o゜)ノ