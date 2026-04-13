
> 🌐 Language / Ngôn ngữ: [English](How_it_work.md) | **Tiếng Việt**

Observer Pattern - Restaurant
=================

Ví dụ về ứng dụng Observer Pattern vào dự án nhà hàng đơn giản

Sau khi trang tải xong, nhà hàng tạo ra 2 bàn ăn, bàn ăn có thể kéo ở tên bàn để sắp xếp, bạn có thể thêm bàn bằng cách click vào nút `Add Table` ở thanh điều khiển bên trên góc trái màn hình.

Có 2 bếp trong bản demo này để xem quy trình phân công chế biến

Ảnh minh họa nhanh
------------

Màn hình khi mới tải xong:

![Màn hình ban đầu](./screenshots/first-load.png)

Thêm bàn từ khu vực điều khiển:

![Thêm bàn](./screenshots/add-table.png)

Popup chọn món cho bàn:

![Chọn món](./screenshots/add-dishes.png)

Xác nhận trước khi xóa bàn:

![Xác nhận xóa bàn](./screenshots/confirm-delete.png)


Quy trình hoạt động
------------

1. Click vào nút `Add Dishes` ở bàn bất kì để đặt món, một màn hình popup hiển thị các món để chọn
2. Click vào nút tên món để chọn, có thể chọn nhiều món
3. Click đặt hàng sẽ tạo đơn hàng với mỗi món, đơn hàng sẽ chuyển qua cho **Assistant** để phân phối món cho các đầu bếp
4. Bếp nấu xong sẽ thông báo cho Assistant
5. Assistant sẽ báo lại với các bàn về món vừa nấu xong
6. Nếu bàn nào gọi món vừa nấu, bàn đó sẽ ăn, sau đó xóa món

Chú ý khi xem
------------
1. Assistant sẽ phân phối món cho các đầu bếp sau 3 giây nhận món từ các bàn
2. Bếp thông báo cho Assistant: mỗi bếp có một **Observer**, và **Assistant** đăng ký nhận tin tức từ bếp
    1. Bếp sẽ hiển thị viền màu hồng khi làm xong món
    2. Assistant sẽ hiển thị viền màu xanh và ghi nhật ký bên dưới khi nhận được thông báo
    3. Assistant sẽ báo lại ngay cho tất cả bàn
3. Assistant thông báo cho bàn: Assistant có **Observer**, và các bàn đăng ký nhận tin tức từ thư ký
    1. Các bàn sẽ hiển thị viền màu vàng và tooltip `Receive updates from the assistant` khi nhận được thông báo
    2. Bàn nào đặt đúng món khi nhận thì bàn đó sẽ có thanh tiến trình ăn.

Chuỗi ảnh theo quy trình
------------

Assistant nhận đơn và phân công cho đầu bếp:

![Quy trình 1](./screenshots/process-1.png)

Assistant nhận thông báo món hoàn tất và báo lại cho bàn đang đăng ký:

![Quy trình 2](./screenshots/process-2.png)

Nhiều cập nhật có thể diễn ra song song giữa bếp, Assistant và các bàn:

![Quy trình 3](./screenshots/process-3.png)

Nhật ký hoạt động của Assistant lưu lại các lần nhận và hoàn tất món:

![Quy trình 4](./screenshots/process-4.png)

Bàn tiếp tục nhận món mới trong khi các bếp xử lý hàng đợi:

![Quy trình 5](./screenshots/process-5.png)

Một món hoàn tất khác được broadcast tới các bàn đang theo dõi:

![Quy trình 6](./screenshots/process-6.png)

Trạng thái cuối phản ánh món đã nấu xong, món đang ăn và log bên phía Assistant:

![Quy trình 7](./screenshots/process-7.png)
     
-------------------

\ ゜o゜)ノ
