> 🌐 Language / Ngôn ngữ: [English](How_it_work.md) | **Tiếng Việt**

Observer Pattern - Restaurant
=================

Ví dụ áp dụng Observer Pattern vào dự án nhà hàng đơn giản với plain JavaScript.

Phiên bản plain JavaScript này đi thẳng vào màn hình chính sau khi tải xong và vẫn giữ hộp thoại chào mừng ở lần hiển thị đầu tiên. Bên dưới hộp thoại đó, bạn đã có thể thấy các bàn, các đầu bếp, bảng Assistant, và khu vực `Controls` ở góc trên bên trái màn hình.

Có 2 bếp trong bản demo này để xem quy trình phân công chế biến

Tài liệu này gộp phần mô tả chi tiết theo từng bước với phần thuyết minh ảnh chụp màn hình vốn chỉ được tóm tắt trong README.

Các trạng thái chính của giao diện
------------

Màn hình đầu tiên sau khi hiển thị xong, vẫn còn mở hộp thoại chào mừng:

![Màn hình khi app đã sẵn sàng](./screenshots/app-loaded.png)

Thêm bàn từ khu vực `Controls`:

![Thêm bàn](./screenshots/add-table.png)

Hộp thoại dùng để chọn món cho một bàn, với vài món đã được chọn sẵn trong ảnh chụp này:

![Chọn món](./screenshots/add-dishes.png)

Hộp thoại xác nhận trước khi xóa bàn:

![Xác nhận xóa bàn](./screenshots/confirm-delete-table.png)

Gợi ý nổi cho thao tác đăng ký nhận cập nhật, hủy đăng ký, và xóa bàn:

![Tooltip thao tác](./screenshots/tooltip.png)


Luồng chính
------------

1. Nhấn nút `Add Dishes` ở bàn bất kì để mở hộp thoại và xem các món đang có sẵn để chọn.
2. Nhấn vào tên món để chọn, có thể chọn nhiều món.
3. Nhấn nút `Order` để tạo một đơn gọi món cho từng món đã chọn. Bàn đang chọn sẽ đưa các món đó vào luồng xử lý của nhà hàng, và hàng đợi của **Assistant** được cập nhật cho bàn đó.
4. Assistant đưa các đơn vừa nhận vào hàng đợi, chờ 3 giây, rồi phân phối các món đang chờ cho những đầu bếp còn rảnh.
5. Khi đầu bếp đang bận, thẻ đầu bếp hiển thị món hiện tại và thanh tiến trình. Khi món đã sẵn sàng, đầu bếp sẽ thông báo cho Assistant.
6. Assistant ghi lại cả lần nhận món lẫn lần hoàn tất trong activity log và báo lại với các bàn đã đăng ký về món vừa nấu xong.
7. Nếu bàn nào đã gọi đúng món vừa hoàn tất, bàn đó sẽ bắt đầu tiến trình ăn và sau đó xóa món khỏi danh sách.

Chú ý khi xem
------------

1. Phiên bản này đi thẳng vào màn hình chính sau khi tải xong và vẫn giữ hộp thoại chào mừng ở lần hiển thị đầu tiên.
2. Assistant sẽ phân phối món cho các đầu bếp sau 3 giây nhận món từ các bàn.
3. Bếp thông báo cho Assistant: mỗi bếp có một **Observer**, và **Assistant** đăng ký nhận tin tức từ bếp
    1. Bếp sẽ hiển thị viền màu hồng khi làm xong món
    2. Assistant sẽ hiển thị viền màu xanh và ghi nhật ký bên dưới khi nhận được thông báo
    3. Assistant sẽ báo lại ngay cho tất cả bàn
4. Assistant thông báo cho bàn: Assistant có **Observer**, và các bàn đăng ký nhận tin tức từ Assistant
    1. Các bàn sẽ hiển thị viền màu vàng và tooltip `Receive updates from the assistant` khi nhận được thông báo
    2. Bàn nào đặt đúng món khi nhận thì bàn đó sẽ có thanh tiến trình ăn.
5. Ảnh gợi ý nổi ở trên hiển thị rõ cả hai trạng thái của nút đăng ký nhận cập nhật, `Subscribe to assistant updates` và `Unsubscribe from assistant updates`, cùng với nút xóa bàn.

Chuỗi quy trình Observer
------------

Hai đầu bếp có thể cùng nấu song song trong khi một bàn khác đã bắt đầu ăn món vừa hoàn tất trước đó:

![Quy trình 1](./screenshots/process-1.png)

Khi Assistant phát thông báo về món vừa hoàn tất, các bàn đã đăng ký sẽ cùng được highlight và các bàn khớp món sẽ bắt đầu ăn ngay:

![Quy trình 2](./screenshots/process-2.png)

Một đầu bếp có thể vẫn đang nấu trong khi đầu bếp còn lại đã rảnh sau khi hoàn tất món, còn bàn đã đăng ký vẫn giữ tooltip nhận cập nhật:

![Quy trình 3](./screenshots/process-3.png)

Nhật ký hoạt động của Assistant tiếp tục ghi lại các lần nhận món và hoàn tất món, trong khi các món đã giao dần tích lũy trên các bàn:

![Quy trình 4](./screenshots/process-4.png)

Các bàn đã đăng ký tiếp tục phản ứng song song trong khi các đầu bếp tiếp tục xử lý hàng đợi:

![Quy trình 5](./screenshots/process-5.png)

Một trạng thái về sau vẫn cho thấy các bàn đã đăng ký tiếp tục phản ứng trong khi Assistant ghi thêm cả pickup lẫn completed event:

![Quy trình 6](./screenshots/process-6.png)

Trạng thái cuối phản ánh đồng thời đầu bếp đang nấu, nhiều bàn đang ăn, viền highlight của subscription, và log bên phía Assistant:

![Quy trình 7](./screenshots/process-7.png)
     
-------------------

\ ゜o゜)ノ
