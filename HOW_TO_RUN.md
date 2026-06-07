# Hướng Dẫn Khởi Động Dự Án English Fantasy

Tài liệu này hướng dẫn bạn cách khởi chạy đồng thời cả **Backend Server (PostgreSQL)** và **Frontend (Giao diện Game)** để vận hành toàn bộ ứng dụng.

---

## 🛠️ Yêu Cầu Hệ Thống
Trước khi bắt đầu, hãy đảm bảo máy tính của bạn đã cài đặt:
1. **Node.js** (Phiên bản mới nhất)
2. **PostgreSQL 18** (Đã bật và đang chạy trên cổng mặc định `5432`)
3. **pgAdmin 4** (Dùng để xem và quản lý database trực quan)

---

## 🚀 Bước 1: Khởi Động Backend Server (Kết Nối PostgreSQL)

Backend chịu trách nhiệm giao tiếp với PostgreSQL, cung cấp các API xử lý Đăng nhập/Đăng ký, tiến trình phó bản, XP và cấp độ.

1. Mở thư mục chứa backend trên cmd hoặc PowerShell:
   ```powershell
   cd "E:\Antigravity\English Fantasy\server"
   ```
2. Cấu hình mật khẩu Database (Chỉ thực hiện lần đầu):
   - Mở file `.env` nằm trong thư mục `server/` bằng Notepad hoặc VS Code.
   - Sửa dòng `DB_PASSWORD=123456` thành mật khẩu PostgreSQL trên máy của bạn.
   - Lưu file lại (`Ctrl + S`).
3. Cài đặt các thư viện phụ thuộc (Chỉ thực hiện lần đầu):
   ```powershell
   npm install
   ```
4. Khởi chạy Backend Server:
   ```powershell
   npm start
   ```
   *Khi thấy dòng thông báo `Server is running on port 3000` và `Connected to the PostgreSQL database successfully!`, có nghĩa là Backend đã kết nối cơ sở dữ liệu thành công.*

---

## 💻 Bước 2: Khởi Động Frontend (Giao Diện Game)

Frontend cung cấp giao diện tương tác, bản đồ phó bản và các trận chiến từ vựng.

> [!IMPORTANT]
> **Lưu ý Quan Trọng:** Bạn **KHÔNG NÊN** mở trực tiếp file `index.html` bằng cách click đúp. Trình duyệt sẽ chặn tính năng Nhận dạng giọng nói (Micro) trên giao thức `file:///`. **Bắt buộc** phải khởi chạy game thông qua một web server cục bộ (`http://localhost:8000`).

### Cách khởi động bằng Terminal:

cd "E:\Antigravity\English Fantasy"

1. Mở terminal (CMD hoặc PowerShell) tại thư mục gốc của dự án (`English Fantasy`).
2. Chạy lệnh sau để khởi động server:
   ```powershell
   npm run serve
   ```
3. Truy cập game tại địa chỉ:

http://localhost:8000/html/index.html

---

## 🎮 Sử Dụng Game
- Khi màn hình Đăng nhập hiện ra, bạn có thể Đăng nhập ngay bằng tài khoản mặc định có sẵn trong database:
  - **Gmail:** `phat78789@gmail.com`
  - **Mật khẩu:** `123456`
- Bạn cũng có thể đăng ký tài khoản mới trực tiếp trên giao diện web bằng cách chọn tab **Register Character**. Tài khoản mới sẽ tự động lưu vào PostgreSQL.
