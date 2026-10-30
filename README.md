# ĐI CHÙA ONLINE 3D – một phòng chung

## Tính năng
- Bản đồ 3D khám phá tự do.
- Một phòng toàn cầu: mọi người kết nối cùng địa chỉ máy chủ sẽ gặp nhau.
- Đồng bộ vị trí người chơi theo thời gian thực.
- Chọn nhân vật nam/nữ, tên hiển thị và trang phục.
- Lễ Phật, dâng hoa, vái 100 lần, ngồi xổm, nhặt hoa sen.

## Chạy trên máy tính
1. Cài Node.js LTS.
2. Giải nén dự án, mở Terminal trong thư mục.
3. Chạy `npm install`.
4. Chạy `npm start`.
5. Mở `http://localhost:3000`.

## Đưa lên Internet
Deploy toàn bộ thư mục này lên host hỗ trợ Node.js và WebSocket (ví dụ VPS hoặc nền tảng Node hosting), đặt lệnh chạy `npm start`, rồi chia sẻ URL HTTPS cho mọi người. Mọi người truy cập cùng URL sẽ vào cùng một phòng.

## Giới hạn thực tế
Không đặt giới hạn người chơi cố định trong mã nguồn, nhưng số kết nối thực tế phụ thuộc CPU/RAM/băng thông của máy chủ. Phiên bản này đồng bộ vị trí cơ bản; chưa có hệ thống tài khoản, lưu nhân vật, chat hoặc phân vùng bản đồ. Không có máy chủ nào bảo đảm số người chơi vô hạn.
