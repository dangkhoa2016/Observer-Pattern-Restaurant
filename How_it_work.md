Observer Pattern - Restaurant
=================

Ví dụ về ứng dụng Observer Pattern vào dự án nhà hàng đơn giản

Sau khi trang tải xong, nhà hàng tạo ra 2 bàn ăn, bàn ăn có thể kéo ở tên bàn để sắp xếp, bạn có thể thêm bàn bằng cách click vào nút `Add table` ở thanh điều khiển bên trên góc trái màn hình.

Có 2 bếp trong bản demo này để xem quy trình phân công chế biến


Quy trình hoạt động
------------

1. Click vào nút `Add foods` ở bàn bất kì để đặt món, một màn hình popup hiển thị các món để chọn
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
    1. Các bàn sẽ hiển thị viền màu vàng và tooltip `Receive info from Assistant` khi nhận được thông báo
    2. Bàn nào đặt đúng món khi nhận thì bàn đó sẽ có thanh tiến trình ăn.
     
-------------------

\ ゜o゜)ノ
