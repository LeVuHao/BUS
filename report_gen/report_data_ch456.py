"""Chương 4, 5, 6 - nâng cấp chi tiết."""

# =========================
# CHƯƠNG 4: THIẾT KẾ
# =========================
CHUONG_4 = {
    "tieu_de": "CHƯƠNG 4. THIẾT KẾ HỆ THỐNG",
    "cac_muc": [
        {
            "ten": "4.1. Kiến trúc tổng quan",
            "noi_dung": [
                "Hệ thống MetBusTrip sử dụng kiến trúc phân lớp (Layered "
                "Architecture) kết hợp nguyên tắc RESTful, cụ thể:",
                "Tầng Client (Frontend): React 18 + TypeScript + Vite, giao "
                "diện web responsive, giao tiếp với backend qua Axios HTTP.",
                "Tầng Business Logic (Backend): Spring Boot 3, xử lý nghiệp "
                "vụ chính, validation dữ liệu, phân quyền.",
                "Tầng Data Access (DAO): Spring Data JPA + Hibernate, tương "
                "tác với MySQL qua Repository pattern.",
                "Tầng Infrastructure: Spring Security + JWT (xác thực), VNPay "
                "SDK (thanh toán), Server-Sent Events (realtime).",
                "Frontend và Backend triển khai độc lập trên 2 port khác "
                "nhau (frontend: 5173, backend: 8080), giao tiếp qua "
                "REST API + CORS.",
                "Kiến trúc này giúp dễ bảo trì, dễ kiểm thử từng tầng, "
                "và dễ mở rộng khi lượng người dùng tăng lên.",
            ],
            "hinh": "architecture.png",
        },
        {
            "ten": "4.2. Sơ đồ ERD (Entity-Relationship Diagram)",
            "noi_dung": [
                "Hệ thống có 16 thực thể chính, được chuẩn hóa đến dạng "
                "3NF. Dưới đây liệt kê các mối quan hệ:",
                "users (1,N) – tickets: một User có thể đặt nhiều Ticket.",
                "users (1,N) – feedbacks: một User có thể gửi nhiều Feedback.",
                "trips (1,N) – tickets: một Trip có nhiều Ticket.",
                "trips (1,N) – trip_assignments: một Trip có nhiều Assignment.",
                "trips (1,1) – buses: mỗi chuyến gán đúng một xe.",
                "trips (1,1) – routes: mỗi chuyến chạy trên một tuyến.",
                "buses (1,N) – seats: mỗi xe có nhiều ghế (1 ghế chỉ thuộc 1 xe).",
                "buses (1,N) – maintenance: một xe có nhiều lần bảo trì.",
                "routes (1,N) – trips: một tuyến có nhiều chuyến.",
                "employees (1,N) – trip_assignments: một nhân viên phục vụ nhiều chuyến.",
                "roles (1,N) – employees: mỗi nhân viên có một role (ADMIN/DRIVER/STAFF).",
                "tickets (1,1) – payments: mỗi vé có một Payment.",
                "tickets (1,N) – passengers: mỗi vé chở nhiều hành khách.",
                "feedbacks (1,N) – feedback_replies: mỗi feedback có nhiều reply từ admin.",
                "users (1,N) – employees: nhân viên là user hệ thống.",
            ],
            "hinh": "erd.png",
        },
        {
            "ten": "4.3. Thiết kế cơ sở dữ liệu",
            "noi_dung": [
                "Cơ sở dữ liệu gồm 16 bảng, được thiết kế theo nguyên tắc "
                "chuẩn hóa 3NF, có đầy đủ khóa chính, khóa ngoại, ràng buộc "
                "toàn vẹn và index cho các truy vấn thường dùng. Chi tiết "
                "các bảng chính như sau:",
            ],
            "bang": {
                "tieu_de": "Bảng 4.1. Bảng users",
                "header": ["Tên cột", "Kiểu dữ liệu", "Ràng buộc", "Mô tả"],
                "rows": [
                    ["id", "BIGINT", "PK, AUTO_INCREMENT", "Mã người dùng"],
                    ["username", "VARCHAR(50)", "UNIQUE, NOT NULL", "Tên đăng nhập"],
                    ["email", "VARCHAR(100)", "UNIQUE, NOT NULL", "Email"],
                    ["password_hash", "VARCHAR(255)", "NOT NULL", "BCrypt hash"],
                    ["full_name", "VARCHAR(100)", "NOT NULL", "Họ và tên"],
                    ["phone", "VARCHAR(20)", "", "Số điện thoại"],
                    ["address", "VARCHAR(255)", "", "Địa chỉ"],
                    ["avatar_url", "VARCHAR(500)", "", "Link avatar"],
                    ["is_active", "BOOLEAN", "DEFAULT TRUE", "Trạng thái hoạt động"],
                    ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Ngày tạo"],
                    ["updated_at", "TIMESTAMP", "", "Ngày cập nhật"],
                ],
            },
        },
        {
            "ten": "Bảng 4.2. Bảng trips",
            "bang": {
                "tieu_de": "",
                "header": ["Tên cột", "Kiểu dữ liệu", "Ràng buộc", "Mô tả"],
                "rows": [
                    ["id", "BIGINT", "PK", "Mã chuyến"],
                    ["route_id", "BIGINT", "FK → routes", "Mã tuyến"],
                    ["bus_id", "BIGINT", "FK → buses", "Mã xe"],
                    ["departure_time", "DATETIME", "NOT NULL", "Giờ khởi hành"],
                    ["arrival_time", "DATETIME", "NOT NULL", "Giờ đến dự kiến"],
                    ["price", "DECIMAL(10,2)", "NOT NULL", "Giá vé (VNĐ)"],
                    ["status", "VARCHAR(20)", "NOT NULL", "SCHEDULED/IN_PROGRESS/COMPLETED/CANCELLED"],
                    ["created_at", "TIMESTAMP", "DEFAULT NOW()", "Ngày tạo"],
                ],
            },
        },
        {
            "ten": "Bảng 4.3. Bảng tickets",
            "bang": {
                "tieu_de": "",
                "header": ["Tên cột", "Kiểu dữ liệu", "Ràng buộc", "Mô tả"],
                "rows": [
                    ["id", "BIGINT", "PK", "Mã vé"],
                    ["user_id", "BIGINT", "FK → users", "Mã khách hàng"],
                    ["trip_id", "BIGINT", "FK → trips", "Mã chuyến"],
                    ["seat_id", "BIGINT", "FK → seats", "Mã ghế"],
                    ["passenger_name", "VARCHAR(100)", "NOT NULL", "Tên hành khách"],
                    ["passenger_phone", "VARCHAR(20)", "", "SĐT hành khách"],
                    ["booking_time", "TIMESTAMP", "NOT NULL", "Thời điểm đặt"],
                    ["total_amount", "DECIMAL(10,2)", "NOT NULL", "Tổng tiền (VNĐ)"],
                    ["status", "VARCHAR(20)", "NOT NULL", "PENDING/PAID/CANCELLED/REFUNDED"],
                    ["payment_id", "BIGINT", "FK → payments", "Mã thanh toán"],
                ],
            },
        },
        {
            "ten": "Bảng 4.4. Bảng payments",
            "bang": {
                "tieu_de": "",
                "header": ["Tên cột", "Kiểu dữ liệu", "Ràng buộc", "Mô tả"],
                "rows": [
                    ["id", "BIGINT", "PK", "Mã thanh toán"],
                    ["ticket_id", "BIGINT", "FK → tickets", "Mã vé"],
                    ["vnp_transaction_no", "VARCHAR(50)", "", "Mã giao dịch VNPay"],
                    ["amount", "DECIMAL(10,2)", "NOT NULL", "Số tiền (VNĐ)"],
                    ["payment_method", "VARCHAR(50)", "", "Phương thức (ATM/Card/QR)"],
                    ["payment_status", "VARCHAR(20)", "NOT NULL", "PENDING/SUCCESS/FAILED"],
                    ["payment_time", "TIMESTAMP", "", "Thời gian thanh toán"],
                    ["vnp_response_code", "VARCHAR(10)", "", "Mã phản hồi VNPay"],
                ],
            },
        },
        {
            "ten": "Bảng 4.5. Các bảng còn lại",
            "bang": {
                "tieu_de": "Bảng 4.5. Tổng hợp các bảng còn lại",
                "header": ["Tên bảng", "Khóa chính", "Khóa ngoại", "Mô tả chức năng"],
                "rows": [
                    ["roles", "id", "–", "Danh sách vai trò (ADMIN, DRIVER, STAFF)"],
                    ["employees", "id", "role_id", "Thông tin nhân viên (link users)"],
                    ["buses", "id", "–", "Thông tin xe: biển số, loại, số ghế"],
                    ["seats", "id", "bus_id", "Danh sách ghế theo từng xe"],
                    ["routes", "id", "–", "Tuyến: điểm đi, điểm đến, km, giá cơ bản"],
                    ["trip_assignments", "id", "trip_id, employee_id", "Phân công lái/phụ xe cho chuyến"],
                    ["passengers", "id", "ticket_id", "Thông tin hành khách đi cùng vé"],
                    ["feedbacks", "id", "user_id", "Phản hồi/đánh giá từ khách"],
                    ["feedback_replies", "id", "feedback_id", "Phản hồi từ admin"],
                    ["maintenance", "id", "bus_id", "Lịch sử bảo trì xe"],
                    ["audit_logs", "id", "–", "Nhật ký hành động người dùng"],
                    ["cargo", "id", "–", "Quản lý vận chuyển hàng hóa (mở rộng)"],
                ],
            },
        },
        {
            "ten": "4.4. Sơ đồ Sequence cho UC Đặt vé – Thanh toán",
            "noi_dung": [
                "Sơ đồ Sequence dưới đây mô tả chi tiết tương tác giữa "
                "các đối tượng trong UC05 (Đặt vé) và UC06 (Thanh toán VNPay), "
                "từ góc nhìn backend:",
            ],
            "hinh": "sequence_booking.png",
        },
        {
            "ten": "4.5. Thiết kế giao diện người dùng",
            "noi_dung": [
                "Giao diện được thiết kế theo phong cách hiện đại, sạch sẽ, "
                "dễ sử dụng, tuân theo nguyên tắc UI/UX cơ bản:",
                "Frontend sử dụng TailwindCSS cho styling, shadcn/ui cho "
                "các component có sẵn (button, card, table, dialog, "
                "select, badge…).",
                "Trang chủ (Home): hero section với hình ảnh bến xe, form "
                "tìm kiếm chuyến nổi bật ở giữa (điểm đi, điểm đến, ngày).",
                "Trang kết quả tìm kiếm: hiển thị danh sách thẻ chuyến, "
                "mỗi thẻ gồm tuyến, giờ khởi hành – giờ đến, loại xe, "
                "giá vé, số ghế trống.",
                "Trang đặt vé (Seat Selection): sơ đồ ghế trực quan, 4 "
                "trạng thái: trống (xanh lá), đã chọn (xanh dương), đã "
                "đặt (xám), đang giữ (vàng).",
                "Trang thanh toán: countdown 10 phút, nút chuyển sang "
                "VNPay, màn hình kết quả rõ ràng.",
                "Trang Admin: sidebar navigation, dashboard tổng quan với "
                "biểu đồ Chart.js, các trang CRUD: Users, Buses, Routes, "
                "Trips, Assignments, Revenue.",
                "Trang quản lý phản hồi: hiển thị danh sách feedback, "
                "badge thông báo realtime qua SSE.",
            ],
        },
        {
            "ten": "4.6. Thiết kế bảo mật",
            "noi_dung": [
                "Mật khẩu: hash bằng BCrypt với strength = 10.",
                "Xác thực: JWT (jjwt 0.12.x), thời hạn 24 giờ, lưu trong "
                "localStorage (frontend) và Redis (backend optional).",
                "Phân quyền: Spring Security + method-level security (@PreAuthorize), "
                "mỗi endpoint được bảo vệ theo vai trò (ROLE_CUSTOMER, "
                "ROLE_ADMIN, ROLE_DRIVER, ROLE_STAFF).",
                "Input validation: @Valid + Jakarta Bean Validation trên "
                "DTO, ngăn chặn dữ liệu đầu vào rủi ro.",
                "SQL Injection: JPA/Hibernate giúp tránh tự động.",
                "CORS: chỉ cho phép origin của frontend.",
                "Rate limiting: giới hạn số lần đăng nhập sai (5 lần → "
                "khóa 15 phút).",
                "Audit log: ghi nhật ký hành động của người dùng vào "
                "bảng audit_logs.",
            ],
        },
    ],
}

# =========================
# CHƯƠNG 5: CÀI ĐẶT
# =========================
CHUONG_5 = {
    "tieu_de": "CHƯƠNG 5. CÀI ĐẶT VÀ KẾT QUẢ",
    "cac_muc": [
        {
            "ten": "5.1. Môi trường phát triển",
            "bang": {
                "tieu_de": "Bảng 5.1. Thông số môi trường phát triển",
                "header": ["Thành phần", "Phiên bản", "Mục đích sử dụng"],
                "rows": [
                    ["Java", "17 LTS", "Ngôn ngữ backend"],
                    ["Maven", "3.9.x", "Build tool backend"],
                    ["Spring Boot", "3.2.x", "Framework backend"],
                    ["Spring Data JPA", "3.x", "ORM, truy vấn DB"],
                    ["Spring Security", "6.x", "Bảo mật, JWT"],
                    ["Node.js", "20 LTS", "Runtime frontend"],
                    ["npm", "10.x", "Quản lý package frontend"],
                    ["TypeScript", "5.x", "Ngôn ngữ frontend"],
                    ["React", "18.3.x", "Framework frontend"],
                    ["Vite", "5.x", "Build tool frontend"],
                    ["TailwindCSS", "3.x", "CSS framework"],
                    ["MySQL", "8.0", "Cơ sở dữ liệu"],
                    ["VS Code", "1.88+", "IDE frontend"],
                    ["IntelliJ IDEA", "2024.x", "IDE backend"],
                    ["Postman", "10.x", "Kiểm thử API"],
                ],
            },
        },
        {
            "ten": "5.2. Cấu trúc thư mục dự án",
            "noi_dung": [
                "Dự án được tổ chức thành 2 phần riêng biệt: backend và "
                "frontend, nằm trong cùng thư mục gốc BUS:",
                "Backend (Spring Boot – thư mục backend/):",
                "├── pom.xml                      # Maven config",
                "├── src/main/java/com/business/busmanagement/",
                "│   ├── BusApplication.java      # Main class",
                "│   ├── config/                  # Security, JWT, CORS, DataInitializer",
                "│   ├── controller/              # 12 Controller (Auth, User, Trip...)",
                "│   ├── dto/                     # Request/Response DTO theo module",
                "│   ├── model/                   # 16 Entity JPA (@Entity)",
                "│   ├── repository/              # 16 Repository (JpaRepository)",
                "│   ├── service/                 # 9 Service + Impl",
                "│   ├── util/                    # VnpayUtil, JwtUtil, RoleNormalizer",
                "│   └── exception/               # GlobalExceptionHandler, custom exceptions",
                "└── src/main/resources/",
                "    ├── application.properties  # DB config, JWT secret, VNPay config",
                "    └── data.sql               # Dữ liệu khởi tạo ban đầu",
                "Frontend (React + TypeScript – thư mục src/):",
                "├── src/",
                "│   ├── pages/                  # 16 page component",
                "│   │   └── admin/              # AdminDashboard, AdminUsers, ...",
                "│   ├── components/             # Header, Footer, SeatMap, TicketCard...",
                "│   ├── stores/                 # Zustand stores: auth, ticket, trip",
                "│   ├── services/               # API calls (axios instance)",
                "│   ├── hooks/                  # Custom hooks (useAuth, useSSE...)",
                "│   └── types/                  # TypeScript interfaces",
                "├── package.json",
                "├── vite.config.ts              # Proxy config → backend:8080",
                "└── tailwind.config.js",
            ],
        },
        {
            "ten": "5.3. Danh sách API endpoint chính",
            "bang": {
                "tieu_de": "Bảng 5.2. Danh sách API Endpoint",
                "header": ["Method", "Endpoint", "Mô tả", "Quyền"],
                "rows": [
                    ["POST", "/api/auth/register", "Đăng ký tài khoản", "Công khai"],
                    ["POST", "/api/auth/login", "Đăng nhập, trả JWT", "Công khai"],
                    ["GET", "/api/auth/profile", "Lấy thông tin user hiện tại", "CUSTOMER"],
                    ["PUT", "/api/auth/profile", "Cập nhật thông tin cá nhân", "CUSTOMER"],
                    ["PUT", "/api/auth/password", "Đổi mật khẩu", "CUSTOMER"],
                    ["GET", "/api/trips/search", "Tìm kiếm chuyến theo tuyến/ngày", "Công khai"],
                    ["GET", "/api/trips/{id}", "Chi tiết chuyến", "Công khai"],
                    ["GET", "/api/trips/{id}/seats", "Lấy sơ đồ ghế chuyến", "CUSTOMER"],
                    ["POST", "/api/tickets", "Tạo vé PENDING", "CUSTOMER"],
                    ["GET", "/api/tickets/my", "Danh sách vé của tôi", "CUSTOMER"],
                    ["DELETE", "/api/tickets/{id}", "Hủy vé", "CUSTOMER"],
                    ["POST", "/api/vnpay/create-payment", "Tạo URL thanh toán VNPay", "CUSTOMER"],
                    ["GET", "/api/vnpay/verify", "Verify kết quả thanh toán", "CUSTOMER"],
                    ["POST", "/api/feedbacks", "Gửi phản hồi", "CUSTOMER"],
                    ["GET", "/api/admin/users", "Danh sách người dùng", "ADMIN"],
                    ["PUT", "/api/admin/users/{id}/lock", "Khóa/mở tài khoản", "ADMIN"],
                    ["GET", "/api/admin/buses", "Danh sách xe", "ADMIN"],
                    ["POST", "/api/admin/buses", "Thêm xe", "ADMIN"],
                    ["PUT", "/api/admin/buses/{id}", "Sửa xe", "ADMIN"],
                    ["DELETE", "/api/admin/buses/{id}", "Xóa xe", "ADMIN"],
                    ["GET", "/api/admin/routes", "Danh sách tuyến", "ADMIN"],
                    ["POST", "/api/admin/routes", "Thêm tuyến", "ADMIN"],
                    ["GET", "/api/admin/trips", "Danh sách chuyến", "ADMIN"],
                    ["POST", "/api/admin/trips", "Tạo chuyến", "ADMIN"],
                    ["PUT", "/api/admin/trips/{id}", "Sửa chuyến", "ADMIN"],
                    ["GET", "/api/admin/assignments", "Danh sách phân công", "ADMIN"],
                    ["POST", "/api/admin/assignments", "Phân công nhân viên", "ADMIN"],
                    ["GET", "/api/admin/revenue", "Thống kê doanh thu", "ADMIN"],
                    ["GET", "/api/admin/employees", "Danh sách nhân viên", "ADMIN"],
                    ["GET", "/api/admin/feedbacks", "Danh sách phản hồi", "ADMIN"],
                    ["POST", "/api/admin/feedbacks/{id}/reply", "Reply phản hồi", "ADMIN"],
                    ["GET", "/api/sse/feedback", "SSE stream phản hồi mới", "ADMIN"],
                ],
            },
        },
        {
            "ten": "5.4. Kết quả cài đặt một số chức năng chính",
            "noi_dung": [
                "5.4.1. Đăng nhập / Đăng ký",
                "Form đăng nhập: nhập email + mật khẩu → gọi POST "
                "/api/auth/login → backend verify BCrypt, sinh JWT → trả "
                "về token + user info → frontend lưu localStorage, chuyển "
                "hướng theo role (Customer → home, Admin → /admin). "
                "Form đăng ký: POST /api/auth/register → tạo user mới "
                "(role CUSTOMER) → auto-login. Thiết kế: form responsive, "
                "validation client-side (Zod), hiệu ứng loading, thông báo "
                "lỗi chi tiết.",
                "5.4.2. Tìm kiếm chuyến",
                "Nhập điểm đi, điểm đến, ngày → gọi GET /api/trips/search?"
                "origin=...&destination=...&date=... → backend JOIN trips, "
                "routes, buses → trả về danh sách kết quả. Mỗi thẻ chuyến "
                "hiển thị: tuyến, giờ khởi hành/đến, loại xe, giá vé, "
                "số ghế trống. Nút “Chọn” dẫn sang trang chi tiết chuyến.",
                "5.4.3. Sơ đồ ghế + Đặt vé",
                "Sơ đồ ghế được vẽ bằng CSS Grid + Tailwind. Mỗi ghế có "
                "4 trạng thái thể hiện bằng màu sắc: available (xanh lá, "
                "clickable), selected (xanh dương, outline đậm), booked "
                "(xám, pointer-events: none), held (vàng, có countdown). "
                "Khi click ghế trống → gọi POST /api/tickets. Backend dùng "
                "optimistic lock kiểm tra concurrency, trả về mã vé PENDING "
                "kèm deadline. Frontend bắt đầu countdown 10 phút.",
                "5.4.4. Thanh toán VNPay",
                "Nhấn “Thanh toán” → POST /api/vnpay/create-payment → backend "
                "sinh URL VNPay (sandbox) kèm HMAC-SHA512 signature → "
                "frontend window.location.redirect. Sau khi thanh toán, "
                "VNPay redirect về /payment-return với query params → "
                "frontend gọi GET /api/vnpay/verify → backend verify chữ "
                "ký + mã phản hồi → cập nhật ticket.PAID, seat.BOOKED. "
                "Kết quả hiển thị: thành công (mã vé, thông tin chuyến) "
                "hoặc thất bại (lý do).",
                "5.4.5. Dashboard Admin",
                "AdminDashboard: hiển thị tổng quan số liệu (tổng user, "
                "tổng vé hôm nay, doanh thu tháng, tổng chuyến) bằng "
                "biểu đồ cột Chart.js. Các trang quản lý: Users (CRUD "
                "+ lock/unlock), Buses (CRUD), Routes (CRUD), Trips (CRUD "
                "+ gán xe), Assignments (phân công lái/phụ xe), Revenue "
                "(lọc theo ngày/tháng/tuyến, export Excel).",
            ],
        },
        {
            "ten": "5.5. Kết quả kiểm thử",
            "bang": {
                "tieu_de": "Bảng 5.3. Kết quả kiểm thử các chức năng chính",
                "header": ["STT", "Chức năng", "Kiểu test", "Kết quả", "Ghi chú"],
                "rows": [
                    ["1", "Đăng ký tài khoản mới", "Unit + Integration", "Qua", "Email trùng → báo lỗi đúng"],
                    ["2", "Đăng nhập đúng/sai mật khẩu", "Unit", "Qua", "Sai 5 lần → khóa tạm 15 phút"],
                    ["3", "JWT token hết hạn → reject", "Unit", "Qua", "401 Unauthorized"],
                    ["4", "Tìm kiếm chuyến", "Integration", "Qua", "Đúng ngày → trả kết quả"],
                    ["5", "Tìm kiếm – không có chuyến", "Integration", "Qua", "Trả danh sách rỗng"],
                    ["6", "Chọn ghế trống", "Integration", "Qua", "Ghế đã đặt → 409 Conflict"],
                    ["7", "Tạo vé PENDING", "Integration", "Qua", "Tự hủy sau 10 phút"],
                    ["8", "Thanh toán VNPay (sandbox)", "E2E", "Qua", "Tạo URL, redirect OK"],
                    ["9", "Verify VNPay response", "Unit", "Qua", "Sai chữ ký → reject"],
                    ["10", "Xem vé của tôi", "Integration", "Qua", "Lọc theo userId đúng"],
                    ["11", "Hủy vé PENDING", "Integration", "Qua", "Ghế giải phóng OK"],
                    ["12", "Admin: CRUD Users", "Integration", "Qua", "Lock/unlock hoạt động"],
                    ["13", "Admin: CRUD Trips", "Integration", "Qua", "Trùng xe giờ → reject 409"],
                    ["14", "Admin: Phân công NV", "Integration", "Qua", "Xung đột lịch → reject 409"],
                    ["15", "Admin: Dashboard revenue", "Integration", "Qua", "Chart.js render đúng"],
                    ["16", "Gửi phản hồi", "Integration", "Qua", "SSE notify admin OK"],
                    ["17", "Reply phản hồi", "Integration", "Qua", "Cập nhật DB + SSE"],
                    ["18", "Phân quyền – customer vào admin", "Unit", "Qua", "403 Forbidden"],
                ],
            },
        },
        {
            "ten": "5.6. Hướng dẫn cài đặt",
            "noi_dung": [
                "Yêu cầu: JDK 17+, Node.js 20+, MySQL 8.0, Maven 3.9+.",
                "Backend:",
                "1. Tạo database MySQL: CREATE DATABASE metbus CHARACTER SET utf8mb4;",
                "2. Cập nhật src/main/resources/application.properties: url, "
                "username, password, JWT secret, VNPay vnp_TmnCode + vnp_HashSecret.",
                "3. Chạy: cd backend && mvn spring-boot:run → backend chạy "
                "trên http://localhost:8080. Spring Boot sẽ tự động tạo "
                "bảng (Hibernate ddl-auto: update).",
                "Frontend:",
                "1. cd frontend && npm install && npm run dev → frontend "
                "chạy trên http://localhost:5173 (Vite proxy tự động chuyển "
                "/api → localhost:8080).",
                "2. Tài khoản admin mặc định: admin@metbus.com / admin123.",
                "Dữ liệu mẫu được khởi tạo tự động bởi DataInitializer khi "
                "backend start lần đầu (2 tuyến, 2 xe, 3 chuyến, 1 admin).",
            ],
        },
    ],
}

# =========================
# CHƯƠNG 6: KẾT LUẬN
# =========================
CHUONG_6 = {
    "tieu_de": "CHƯƠNG 6. KẾT LUẬN VÀ HƯỚNG PHÁT TRIỂN",
    "cac_muc": [
        {
            "ten": "6.1. Kết luận",
            "noi_dung": [
                "Đồ án đã hoàn thành mục tiêu đề ra: xây dựng thành công "
                "website đặt vé xe khách trực tuyến MetBusTrip. Các kết "
                "quả đạt được:",
                "Xây dựng backend Spring Boot 3 hoàn chỉnh với 16 Entity "
                "(JPA), 12 Controller, 9 Service, 16 Repository, 18+ REST "
                "API endpoint đầy đủ, có exception handling và validation.",
                "Xây dựng frontend React 18 + TypeScript với 16 trang, "
                "giao diện hiện đại (TailwindCSS + shadcn/ui), responsive, "
                "thân thiện người dùng.",
                "Tích hợp thanh toán VNPay sandbox đầy đủ: tạo URL, ký "
                "số HMAC-SHA512, verify callback, cập nhật trạng thái tự "
                "động.",
                "Hệ thống phản hồi khách hàng thời gian thực bằng "
                "Server-Sent Events (SSE).",
                "Dashboard quản trị với biểu đồ Chart.js, CRUD đầy đủ "
                "cho 7 module (Users, Buses, Routes, Trips, Assignments, "
                "Employees, Revenue).",
                "Áp dụng JWT + Spring Security phân quyền theo vai trò, "
                "bảo mật endpoint, chống brute-force, audit log.",
                "Cơ sở dữ liệu MySQL 16 bảng, chuẩn hóa 3NF, có khóa "
                "ngoại, index, ràng buộc toàn vẹn.",
                "Đồ án đã vận dụng tổng hợp các kiến thức nền tảng của "
                "môn Công nghệ phần mềm: phân tích yêu cầu, thiết kế "
                "cơ sở dữ liệu, lập trình hướng đối tượng, kiểm thử "
                "phần mềm – đây là những kỹ năng thiết yếu của một kỹ "
                "sư phần mềm.",
            ],
        },
        {
            "ten": "6.2. Hạn chế",
            "noi_dung": [
                "Chưa triển khai ứng dụng di động native, chỉ dừng ở web.",
                "Chưa tích hợp thêm cổng thanh toán khác (Momo, ZaloPay).",
                "Chưa có chương trình khách hàng thân thiết (tích điểm, "
                "voucher khuyến mãi).",
                "Chưa hỗ trợ đa ngôn ngữ (i18n).",
                "Chưa có tính năng đặt vé nhóm / ghép khách đi cùng tuyến.",
                "Chưa có kiểm thử tự động đầy đủ (JUnit, Mockito, "
                "Playwright) cho cả backend lẫn frontend.",
                "Chưa triển khai CI/CD, container hóa (Docker).",
            ],
        },
        {
            "ten": "6.3. Hướng phát triển",
            "noi_dung": [
                "Phát triển ứng dụng di động React Native cho iOS/Android "
                "để tăng trải nghiệm trên thiết bị di động.",
                "Tích hợp thêm Momo, ZaloPay để đa dạng phương thức thanh "
                "toán, tăng tỷ lệ chuyển đổi.",
                "Thêm tính năng đặt vé nhóm (nhiều ghế cùng lúc), ghép "
                "khách đi cùng tuyến.",
                "Xây dựng chương trình tích điểm, voucher khuyến mãi để "
                "tăng giữ chân khách hàng.",
                "Triển khai CI/CD: GitHub Actions → build → Docker image → "
                "deploy lên AWS/Heroku/Vercel.",
                "Bổ sung kiểm thử tự động: JUnit 5 + Mockito (backend), "
                "Vitest + Playwright (frontend), đạt coverage > 70%.",
                "Thêm tính năng thông báo push qua Firebase Cloud Messaging "
                "(FCM) cho mobile.",
                "Mở rộng module vận chuyển hàng hóa (bảng Cargo đã có "
                "trong DB, cần triển khai giao diện và API).",
                "Thêm tính năng đặt vé khứ hồi, đặt trước nhiều ngày.",
            ],
        },
    ],
}

TAI_LIEU_THAM_KHAO = [
    "Spring Boot 3 Documentation. https://docs.spring.io/spring-boot/docs/current/reference/html/",
    "React Documentation. https://react.dev/learn",
    "TypeScript Handbook. https://www.typescriptlang.org/docs/",
    "JWT - JSON Web Tokens. RFC 7519. https://datatracker.ietf.org/rfc/rfc7519/",
    "VNPay Payment Gateway Documentation. https://sandbox.vnpayment.vn/apis/",
    "Spring Security Reference. https://docs.spring.io/spring-security/reference/",
    "TailwindCSS Documentation. https://tailwindcss.com/docs",
    "Shadcn/ui Components. https://ui.shadcn.com/docs",
    "Server-Sent Events - W3C Recommendation. https://html.spec.whatwg.org/multipage/server-sent-events.html",
    "MySQL 8.0 Reference Manual. https://dev.mysql.com/doc/refman/8.0/en/",
]
