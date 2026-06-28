"""Chương 3: Phân tích yêu cầu."""

# =========================
# CHƯƠNG 3: PHÂN TÍCH YÊU CẦU
# =========================

# Danh sách Actor
ACTORS = [
    ("Khách hàng (Customer)", "Người dùng phổ thông, tra cứu và đặt vé."),
    ("Quản trị viên (Admin)", "Quản lý toàn bộ hệ thống: xe, tuyến, chuyến, "
                              "nhân viên, doanh thu, phản hồi."),
    ("Hệ thống VNPay", "Cổng thanh toán trực tuyến xử lý giao dịch."),
]

# Bảng Use Case (đã phân loại theo actor)
USE_CASES = [
    # ===== UC cho Khách hàng =====
    ("UC01", "Đăng ký tài khoản", "Khách hàng",
     "Khách truy cập trang đăng ký, nhập thông tin và tạo tài khoản.",
     "Trường hợp đặc biệt: email đã tồn tại, mật khẩu yếu."),
    ("UC02", "Đăng nhập", "Khách hàng",
     "Nhập email/username và mật khẩu để xác thực.",
     "Sai thông tin → thông báo lỗi. Sau 5 lần sai khóa tạm 15 phút."),
    ("UC03", "Tìm kiếm chuyến xe", "Khách hàng",
     "Chọn điểm đi, điểm đến, ngày đi. Hệ thống trả về danh sách chuyến.",
     "Có thể lọc theo giờ, loại xe. Không có chuyến phù hợp → thông báo."),
    ("UC04", "Xem sơ đồ ghế", "Khách hàng",
     "Chọn một chuyến cụ thể để xem sơ đồ ghế trống / đã đặt.",
     "Ghế đã đặt hiển thị màu xám và không cho chọn."),
    ("UC05", "Đặt vé", "Khách hàng",
     "Chọn ghế, nhập thông tin hành khách, xác nhận đặt vé.",
     "Hệ thống tạo vé ở trạng thái PENDING, giữ ghế trong 10 phút."),
    ("UC06", "Thanh toán vé", "Khách hàng",
     "Chọn phương thức VNPay, redirect sang VNPay, thanh toán, quay lại.",
     "Thanh toán thất bại hoặc hết hạn → hủy vé, giải phóng ghế."),
    ("UC07", "Xem vé của tôi", "Khách hàng",
     "Xem danh sách vé đã đặt, trạng thái, lịch sử thanh toán.",
     "Có thể lọc theo trạng thái, tìm theo mã vé."),
    ("UC08", "Quản lý thông tin cá nhân", "Khách hàng",
     "Cập nhật họ tên, SĐT, địa chỉ, đổi mật khẩu, upload avatar.",
     "Mật khẩu mới phải khác mật khẩu cũ, đủ độ mạnh."),
    ("UC09", "Gửi phản hồi / đánh giá", "Khách hàng",
     "Sau chuyến đi, khách gửi đánh giá sao và nhận xét.",
     "Mỗi vé chỉ gửi 1 phản hồi. Admin có thể reply."),
    # ===== UC cho Admin =====
    ("UC10", "Quản lý người dùng", "Admin",
     "Xem, thêm, sửa, khóa/mở tài khoản khách hàng.",
     "Không thể xóa tài khoản đã phát sinh vé."),
    ("UC11", "Quản lý xe", "Admin",
     "CRUD xe: biển số, loại xe, số ghế, trạng thái bảo trì.",
     "Không xóa được xe đang được phân công cho chuyến sắp khởi hành."),
    ("UC12", "Quản lý tuyến", "Admin",
     "CRUD tuyến: điểm đi, điểm đến, quãng đường, giá vé cơ bản.",
     "Tuyến đang có chuyến hoạt động không thể xóa."),
    ("UC13", "Quản lý chuyến", "Admin",
     "Tạo chuyến theo tuyến, gán xe, giờ khởi hành, giá vé.",
     "Không tạo trùng xe cùng khung giờ."),
    ("UC14", "Phân công lái xe – phụ xe", "Admin",
     "Gán nhân viên lái xe, phụ xe cho chuyến cụ thể.",
     "Một nhân viên không thể bị phân công 2 chuyến cùng giờ."),
    ("UC15", "Quản lý nhân viên", "Admin",
     "CRUD thông tin nhân viên: họ tên, SĐT, chức vụ, lương.",
     "Nhân viên đã phân công không xóa được, chỉ cập nhật."),
    ("UC16", "Quản lý bảo trì xe", "Admin",
     "Ghi nhận lịch sử bảo trì, đẩy xe vào trạng thái bảo trì.",
     "Xe đang bảo trì không được gán vào chuyến mới."),
    ("UC17", "Theo dõi doanh thu", "Admin",
     "Xem dashboard tổng quan, biểu đồ doanh thu theo ngày/tháng/tuyến.",
     "Có thể lọc theo khoảng thời gian, tuyến, loại xe."),
    ("UC18", "Quản lý phản hồi", "Admin",
     "Xem phản hồi, đánh dấu đã xử lý, reply khách hàng.",
     "Có thông báo realtime qua SSE khi có phản hồi mới."),
]

# Yêu cầu phi chức năng
NON_FUNC_REQUIREMENTS = [
    ("Hiệu năng", "Thời gian phản hồi API < 500ms cho các thao tác thông "
                  "thường, < 2s cho thống kê doanh thu."),
    ("Bảo mật", "Mật khẩu hash bằng BCrypt, JWT có thời hạn 24h, phân quyền "
                "theo role, chống SQL Injection nhờ JPA, chống XSS ở frontend."),
    ("Khả dụng", "Hệ thống hoạt động ổn định 24/7, có log đầy đủ để truy vết."),
    ("Khả năng mở rộng", "Kiến trúc tách lớp rõ ràng, dễ thêm chức năng mới, "
                        "dễ thay thế DB."),
    ("Tương thích", "Hỗ trợ các trình duyệt phổ biến: Chrome, Edge, Firefox "
                   "ở phiên bản mới nhất."),
    ("Giao diện", "Responsive, thân thiện với người dùng, tuân theo nguyên "
                 "tắc UI/UX cơ bản."),
    ("Sao lưu", "Có script backup DB định kỳ (ngoài phạm vi đồ án)."),
]

CHUONG_3 = {
    "tieu_de": "CHƯƠNG 3. PHÂN TÍCH YÊU CẦU HỆ THỐNG",
    "cac_muc": [
        {
            "ten": "3.1. Mô tả bài toán",
            "noi_dung": [
                "Các nhà xe hiện nay phần lớn quản lý vé, ghế, doanh thu bằng "
                "sổ tay hoặc phần mềm rời rạc. Điều này dẫn đến:",
                "Khó kiểm soát tình trạng ghế trống/ghế đã bán, hay xảy ra "
                "tình trạng bán trùng vé.",
                "Khách hàng ở xa không thể đặt vé trước, phải đến trực tiếp.",
                "Doanh thu phải tổng hợp thủ công, mất thời gian, dễ sai sót.",
                "Không có kênh để khách hàng phản hồi chất lượng dịch vụ.",
                "Hệ thống MetBusTrip ra đời để giải quyết các vấn đề trên: "
                "số hóa toàn bộ quy trình đặt vé, cho phép đặt online và "
                "thanh toán điện tử, đồng thời cung cấp công cụ quản trị "
                "tập trung cho nhà xe.",
            ],
        },
        {
            "ten": "3.2. Xác định Actor",
            "bang": {
                "tieu_de": "Bảng 3.1. Danh sách Actor của hệ thống",
                "header": ["Actor", "Mô tả"],
                "rows": [
                    ["Khách hàng (Customer)",
                     "Người dùng cuối, tra cứu chuyến, đặt vé, thanh toán, "
                     "gửi phản hồi."],
                    ["Quản trị viên (Admin)",
                     "Quản lý toàn bộ dữ liệu và vận hành hệ thống."],
                    ["Hệ thống VNPay",
                     "Cổng thanh toán bên thứ ba, xử lý giao dịch thanh toán."],
                ],
            },
        },
        {
            "ten": "3.3. Sơ đồ Use Case tổng quan",
            "noi_dung": [
                "Sơ đồ Use Case tổng quan thể hiện toàn bộ chức năng mà hệ thống "
                "cung cấp cho 2 nhóm người dùng chính (Khách hàng và Admin), "
                "cùng tác nhân bên ngoài VNPay.",
            ],
            "hinh": "usecase_overview.png",
        },
        {
            "ten": "3.4. Danh sách Use Case",
            "bang": {
                "tieu_de": "Bảng 3.2. Danh sách Use Case",
                "header": ["Mã UC", "Tên Use Case", "Actor chính", "Mô tả ngắn"],
                "rows": [[uc[0], uc[1], uc[2], uc[3]] for uc in USE_CASES],
            },
        },
        {
            "ten": "3.5. Mô tả chi tiết các Use Case chính",
            "noi_dung": [
                "Dưới đây là mô tả chi tiết một số Use Case tiêu biểu của hệ thống. "
                "Các Use Case còn lại có cấu trúc tương tự.",
            ],
            "ds_uc_chi_tiet": [
                {
                    "ma": "UC05",
                    "ten": "Đặt vé",
                    "actor": "Khách hàng",
                },
                {
                    "ma": "UC06",
                    "ten": "Thanh toán VNPay",
                    "actor": "Khách hàng",
                },
                {
                    "ma": "UC13",
                    "ten": "Quản lý chuyến",
                    "actor": "Admin",
                },
                {
                    "ma": "UC14",
                    "ten": "Phân công lái xe – phụ xe",
                    "actor": "Admin",
                },
            ],
        },
        {
            "ten": "3.5.1. UC05 – Đặt vé",
            "noi_dung": [
                "Mục đích: cho phép khách hàng chọn ghế và tạo đơn đặt vé.",
                "Điều kiện tiên quyết: khách đã đăng nhập, đã chọn được chuyến "
                "còn vé trống.",
                "Luồng chính:",
                "1. Khách mở trang chi tiết chuyến, hệ thống gọi "
                "GET /api/trips/{id}/seats để lấy sơ đồ ghế.",
                "2. Khách click chọn ghế trống, hệ thống gọi POST /api/tickets "
                "với tripId, seatId, thông tin hành khách.",
                "3. Backend tạo bản ghi Ticket với trạng thái PENDING, seat ở "
                "trạng thái HELD, trả về mã vé.",
                "4. Frontend hiển thị mã vé, đếm ngược 10 phút để thanh toán.",
                "Luồng thay thế:",
                "2a. Ghế vừa bị người khác đặt → backend trả 409, frontend "
                "làm mới sơ đồ ghế và báo lỗi.",
                "3a. Khách chưa đăng nhập → frontend chuyển sang trang đăng "
                "nhập, lưu intent đặt vé.",
                "Hậu điều kiện: vé ở trạng thái PENDING, ghế giữ chỗ trong "
                "10 phút. Sau 10 phút không thanh toán, job tự động giải "
                "phóng ghế và hủy vé.",
            ],
        },
        {
            "ten": "3.5.2. UC06 – Thanh toán VNPay",
            "noi_dung": [
                "Mục đích: xử lý thanh toán vé qua cổng VNPay.",
                "Điều kiện tiên quyết: vé đang PENDING.",
                "Luồng chính:",
                "1. Khách nhấn “Thanh toán ngay”, frontend gọi "
                "POST /api/vnpay/create-payment với mã vé.",
                "2. Backend sinh URL VNPay có kèm chữ ký HMAC-SHA512, trả về.",
                "3. Frontend window.location sang URL VNPay.",
                "4. Khách hoàn tất thanh toán trên VNPay.",
                "5. VNPay redirect về /payment-return với vnp_ResponseCode.",
                "6. Frontend gọi GET /api/vnpay/payment-return?… để verify.",
                "7. Backend xác thực chữ ký, nếu thành công → cập nhật vé sang "
                "PAID, ghế sang BOOKED.",
                "Luồng thay thế:",
                "6a. Sai chữ ký hoặc hết hạn → trả lỗi, frontend báo “Thanh "
                "toán thất bại”, vé giữ nguyên PENDING.",
                "6b. Khách đóng tab giữa chừng → IPN từ VNPay vẫn cập nhật "
                "trạng thái server-side.",
            ],
        },
        {
            "ten": "3.5.3. UC13 – Quản lý chuyến",
            "noi_dung": [
                "Mục đích: cho admin tạo, sửa, xóa, xem danh sách chuyến xe.",
                "Điều kiện tiên quyết: admin đã đăng nhập.",
                "Luồng chính:",
                "1. Admin mở AdminTripsPage, hệ thống gọi GET /api/admin/trips.",
                "2. Admin nhấn “Tạo chuyến”, chọn tuyến, xe, giờ khởi hành, "
                "giá vé.",
                "3. Frontend gọi POST /api/admin/trips. Backend validate: xe "
                "không trùng giờ, giờ khởi hành phải sau hiện tại.",
                "4. Lưu vào DB, trả về danh sách mới.",
                "5. Admin có thể sửa (PUT), xóa (DELETE) chuyến chưa khởi hành.",
                "Luồng thay thế:",
                "3a. Xe bị trùng giờ → backend trả 409, frontend báo lỗi.",
                "5a. Chuyến đã khởi hành → không cho sửa giờ, không cho xóa.",
            ],
        },
        {
            "ten": "3.5.4. UC14 – Phân công lái xe – phụ xe",
            "noi_dung": [
                "Mục đích: gán nhân viên vào vị trí lái xe hoặc phụ xe cho một "
                "chuyến cụ thể.",
                "Điều kiện tiên quyết: chuyến đã tồn tại, nhân viên đang rảnh.",
                "Luồng chính:",
                "1. Admin mở AdminAssignmentsPage, chọn chuyến.",
                "2. Hệ thống liệt kê nhân viên phù hợp (cùng role, chưa bận).",
                "3. Admin kéo thả hoặc click chọn nhân viên → gán vào chuyến.",
                "4. Frontend gọi POST /api/admin/assignments. Backend kiểm tra "
                "xung đột lịch, lưu TripAssignment.",
                "Luồng thay thế:",
                "4a. Nhân viên đã bận chuyến khác cùng giờ → backend trả 409.",
                "4b. Nhân viên không đủ role → báo lỗi ngay ở frontend.",
            ],
        },
        {
            "ten": "3.6. Yêu cầu phi chức năng",
            "bang": {
                "tieu_de": "Bảng 3.3. Yêu cầu phi chức năng",
                "header": ["Loại yêu cầu", "Mô tả chi tiết"],
                "rows": NON_FUNC_REQUIREMENTS,
            },
        },
        {
            "ten": "3.7. Sơ đồ hoạt động (Activity)",
            "noi_dung": [
                "Sơ đồ Activity mô tả luồng xử lý bên trong của một số quy "
                "trình nghiệp vụ chính: đặt vé + thanh toán, và phân công "
                "lái xe.",
            ],
            "hinh": "activity_booking.png",
        },
    ],
}