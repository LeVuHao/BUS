"""Toàn bộ nội dung báo cáo CNPM - nâng cấp chuẩn hơn."""

# =========================
# TRANG BÌA
# =========================
COVER = {
    "truong": "TRƯỜNG ĐẠI HỌC CÔNG NGHIỆP TP. HỒ CHÍ MINH",
    "khoa": "KHOA CÔNG NGHỆ THÔNG TIN",
    "de_tai": (
        "XÂY DỰNG WEBSITE ĐẶT VÉ XE KHÁCH TRỰC TUYẾN "
        "METBUS – METBUSTRIP"
    ),
    "mon": "Công nghệ phần mềm (CNPM)",
    "gvhd": "GVHD. ..........",
    "sv_thuc_hien": [
        ("Nguyễn Văn A", ".........", "Nhóm trưởng"),
        ("Trần Thị B", ".........", "Thành viên"),
        ("Lê Văn C", ".........", "Thành viên"),
    ],
    "nam": "TP. Hồ Chí Minh, 2026",
}

# =========================
# LỜI NÓI ĐẦU
# =========================
LOI_NOI_DAU = [
    "Trong bối cảnh chuyển đổi số mạnh mẽ của ngành vận tải hành khách, "
    "việc đặt vé xe khách trực tuyến đã trở thành nhu cầu tất yếu. "
    "Khách hàng mong muốn tra cứu chuyến, chọn ghế, thanh toán và nhận vé "
    "một cách nhanh chóng mà không cần đến quầy. Các nhà xe cũng cần một "
    "hệ thống để quản lý chuyến – xe – tuyến – nhân viên – doanh thu một "
    "cách khoa học, giảm chi phí vận hành và nâng cao trải nghiệm khách hàng.",

    "Đồ án này xây dựng hệ thống MetBusTrip – website đặt vé xe khách "
    "trực tuyến với đầy đủ chức năng cho cả khách hàng và quản trị viên: "
    "tìm kiếm chuyến theo tuyến và ngày, xem sơ đồ ghế trực quan, đặt vé "
    "với cơ chế giữ ghế tạm thời, thanh toán qua cổng VNPay, quản lý "
    "chuyến – xe – tuyến – nhân viên – phân công lái xe phụ xe – thống "
    "kê doanh thu, kèm hệ thống phản hồi khách hàng thời gian thực qua "
    "Server-Sent Events.",

    "Về mặt kỹ thuật, đồ án áp dụng mô hình Client – Server với backend "
    "Spring Boot 3 (Java 17), frontend React 18 + TypeScript, cơ sở dữ "
    "liệu MySQL, bảo mật JWT, thanh toán VNPay – là những công nghệ phổ "
    "biến trong ngành phần mềm hiện nay. Quy trình phát triển bám sát "
    "môn học Công nghệ phần mềm: phân tích yêu cầu, thiết kế kiến trúc, "
    "thiết kế cơ sở dữ liệu, lập trình, kiểm thử.",

    "Chúng em xin gửi lời cảm ơn chân thành đến giảng viên hướng dẫn đã "
    "tận tình chỉ bảo, cùng các bạn trong lớp đã góp ý để chúng em hoàn "
    "thiện đồ án. Do thời gian và kinh nghiệm còn hạn chế, đồ án không "
    "tránh khỏi những thiếu sót, kính mong nhận được sự góp ý của thầy "
    "cô và các bạn để nhóm tiếp tục cải thiện.",
]

# =========================
# CHƯƠNG 1: GIỚI THIỆU
# =========================
CHUONG_1 = {
    "tieu_de": "CHƯƠNG 1. GIỚI THIỆU ĐỀ TÀI",
    "cac_muc": [
        {
            "ten": "1.1. Lý do chọn đề tài",
            "noi_dung": [
                "Ngành vận tải hành khách đường dài tại Việt Nam đang phát triển "
                "mạnh mẽ, nhu cầu đi lại giữa các tỉnh thành ngày càng lớn. "
                "Tuy nhiên, phần lớn các nhà xe vẫn duy trì cách bán vé truyền "
                "thống: khách hàng phải đến trực tiếp quầy, xếp hàng, chọn chỗ "
                "thủ công và thanh toán bằng tiền mặt. Cách làm này tồn tại "
                "nhiều hạn chế:",
                "Mất thời gian của khách hàng, đặc biệt vào các dịp lễ Tết.",
                "Khó kiểm soát tình trạng ghế trống/ghế đã đặt, dễ dẫn đến "
                "nhầm lẫn, tranh chấp.",
                "Hạn chế khả năng tiếp cận của khách ở xa, không có điều "
                "kiện đến quầy.",
                "Khó thống kê doanh thu, phân tích hành vi khách hàng.",
                "Cùng với sự phát triển của thương mại điện tử và các cổng "
                "thanh toán trực tuyến (VNPay, Momo, ZaloPay…), nhiều hãng "
                "xe lớn đã chuyển sang bán vé qua website hoặc ứng dụng di "
                "động. Tuy nhiên các giải pháp hiện có thường có chi phí cao, "
                "khó tùy biến, hoặc không phù hợp với quy mô các nhà xe vừa "
                "và nhỏ.",
                "Xuất phát từ thực tế đó, nhóm chọn đề tài “Xây dựng website "
                "đặt vé xe khách trực tuyến MetBus – MetBusTrip” nhằm xây "
                "dựng một hệ thống hoàn chỉnh, dễ mở rộng, chi phí thấp, có "
                "thể áp dụng cho các nhà xe thực tế. Đề tài cũng giúp nhóm "
                "vận dụng tổng hợp các kiến thức đã học vào một sản phẩm phần "
                "mềm hoàn chỉnh.",
            ],
        },
        {
            "ten": "1.2. Mục tiêu của đề tài",
            "noi_dung": [
                "Mục tiêu tổng quát: Xây dựng hoàn chỉnh một website đặt vé "
                "xe khách trực tuyến, áp dụng quy trình Công nghệ phần mềm "
                "từ phân tích yêu cầu, thiết kế, lập trình đến kiểm thử.",
                "Mục tiêu cụ thể:",
                "Xây dựng backend bằng Spring Boot 3 với đầy đủ REST API: "
                "xác thực, quản lý người dùng, tìm kiếm chuyến, đặt vé, "
                "thanh toán, quản lý chuyến – xe – tuyến – nhân viên – "
                "doanh thu.",
                "Xây dựng frontend bằng React 18 + TypeScript, giao diện "
                "responsive, có sơ đồ ghế trực quan, có trang quản trị với "
                "dashboard thống kê.",
                "Tích hợp cổng thanh toán VNPay (môi trường sandbox) để xử "
                "lý luồng thanh toán trực tuyến hoàn chỉnh: tạo URL, ký số, "
                "verify callback, cập nhật trạng thái vé.",
                "Áp dụng JWT cho xác thực, phân quyền rõ ràng theo vai trò "
                "(Customer, Admin), bảo vệ các endpoint nhạy cảm.",
                "Sử dụng Server-Sent Events để đẩy thông báo phản hồi mới "
                "về admin theo thời gian thực, không cần refresh trang.",
                "Thiết kế cơ sở dữ liệu quan hệ chuẩn hóa (3NF), tối ưu "
                "truy vấn và đảm bảo toàn vẹn dữ liệu thông qua khóa ngoại, "
                "index và ràng buộc.",
                "Vận dụng quy trình kiểm thử: unit test, integration test, "
                "end-to-end test cho các luồng nghiệp vụ chính.",
            ],
        },
        {
            "ten": "1.3. Phạm vi đề tài",
            "noi_dung": [
                "Phạm vi chức năng:",
                "Phía khách hàng: đăng ký, đăng nhập, tìm kiếm chuyến, xem "
                "sơ đồ ghế, đặt vé, thanh toán VNPay, xem lịch sử vé, quản "
                "lý thông tin cá nhân, gửi phản hồi/đánh giá.",
                "Phía quản trị: quản lý người dùng (khóa/mở), quản lý xe, "
                "quản lý tuyến, quản lý chuyến, phân công lái xe – phụ xe, "
                "quản lý nhân viên, theo dõi doanh thu, xử lý phản hồi.",
                "Phạm vi công nghệ: backend Java 17 + Spring Boot 3, "
                "frontend React 18 + TypeScript + Vite, cơ sở dữ liệu MySQL "
                "8.0, JWT cho xác thực, VNPay Sandbox cho thanh toán, SSE "
                "cho realtime.",
                "Phạm vi người dùng: khách hàng cá nhân có nhu cầu đi xe "
                "khách, quản trị viên hệ thống (nhân viên nhà xe).",
                "Ngoài phạm vi: ứng dụng di động native (chỉ phát triển "
                "web), tích hợp Momo/ZaloPay, đặt vé theo nhóm, chương "
                "trình khách hàng thân thiết, đa ngôn ngữ, đa tiền tệ.",
            ],
        },
        {
            "ten": "1.4. Công cụ và công nghệ sử dụng",
            "bang": {
                "tieu_de": "Bảng 1.1. Công cụ và công nghệ sử dụng",
                "header": ["STT", "Thành phần", "Công nghệ / Công cụ"],
                "rows": [
                    ["1", "Ngôn ngữ backend", "Java 17 (LTS)"],
                    ["2", "Framework backend", "Spring Boot 3.2.x"],
                    ["3", "ORM", "Spring Data JPA / Hibernate"],
                    ["4", "Bảo mật", "Spring Security, JWT (jjwt 0.12.x)"],
                    ["5", "Cơ sở dữ liệu", "MySQL 8.0"],
                    ["6", "Ngôn ngữ frontend", "TypeScript 5.x"],
                    ["7", "Framework frontend", "React 18.3.x"],
                    ["8", "Build tool", "Vite 5.x"],
                    ["9", "UI framework", "TailwindCSS 3.x, shadcn/ui"],
                    ["10", "State management", "Zustand"],
                    ["11", "HTTP client", "Axios"],
                    ["12", "Routing", "React Router 6.x"],
                    ["13", "Biểu đồ", "Chart.js + react-chartjs-2"],
                    ["14", "Thanh toán", "VNPay Sandbox API"],
                    ["15", "Realtime", "Server-Sent Events (SSE)"],
                    ["16", "IDE", "Visual Studio Code, IntelliJ IDEA"],
                    ["17", "Quản lý phiên bản", "Git + GitHub"],
                    ["18", "Công cụ kiểm thử API", "Postman, PowerShell"],
                ],
            },
        },
        {
            "ten": "1.5. Bố cục đồ án",
            "noi_dung": [
                "Báo cáo gồm 6 chương, được bố cục như sau:",
                "Chương 1: Giới thiệu đề tài – trình bày lý do chọn đề tài, "
                "mục tiêu, phạm vi, công cụ – công nghệ sử dụng, bố cục đồ án.",
                "Chương 2: Cơ sở lý thuyết và công nghệ – tổng quan về mô "
                "hình Client – Server, Spring Boot, React, TypeScript, JWT, "
                "VNPay, SSE, RESTful API.",
                "Chương 3: Phân tích yêu cầu hệ thống – khảo sát hiện trạng, "
                "xác định Actor, xây dựng sơ đồ Use Case, mô tả chi tiết các "
                "Use Case chính, xác định yêu cầu phi chức năng.",
                "Chương 4: Thiết kế hệ thống – kiến trúc tổng quan, sơ đồ "
                "ERD, thiết kế cơ sở dữ liệu chi tiết, thiết kế giao diện.",
                "Chương 5: Cài đặt và kiểm thử – môi trường phát triển, cấu "
                "trúc thư mục, kết quả cài đặt một số chức năng chính, kết "
                "quả kiểm thử.",
                "Chương 6: Kết luận và hướng phát triển – tổng kết kết quả "
                "đạt được, hạn chế, định hướng phát triển trong tương lai.",
                "Phần cuối cùng là tài liệu tham khảo và phụ lục (hướng dẫn "
                "cài đặt, danh sách API endpoint, source code quan trọng).",
            ],
        },
    ],
}

# =========================
# CHƯƠNG 2: CƠ SỞ LÝ THUYẾT
# =========================
CHUONG_2 = {
    "tieu_de": "CHƯƠNG 2. CƠ SỞ LÝ THUYẾT VÀ CÔNG NGHỆ",
    "cac_muc": [
        {
            "ten": "2.1. Mô hình Client – Server",
            "noi_dung": [
                "Hệ thống MetBusTrip được xây dựng theo mô hình Client – "
                "Server 3 tầng:",
                "Tầng Presentation (Client): frontend React, hiển thị giao "
                "diện, gửi yêu cầu HTTP đến server thông qua Axios.",
                "Tầng Application (Server): backend Spring Boot, xử lý "
                "nghiệp vụ, xác thực, validate dữ liệu.",
                "Tầng Data: MySQL, lưu trữ dữ liệu, trả về kết quả cho tầng "
                "Application.",
                "Mô hình này giúp tách biệt rõ ràng giữa giao diện và xử "
                "lý, dễ bảo trì, dễ mở rộng theo chiều ngang (scale out), "
                "và có thể triển khai độc lập từng tầng trên các server "
                "khác nhau.",
            ],
        },
        {
            "ten": "2.2. Spring Boot",
            "noi_dung": [
                "Spring Boot là framework thuộc hệ sinh thái Spring, giúp "
                "đơn giản hóa việc tạo ứng dụng Spring độc lập, có thể chạy "
                "trực tiếp bằng java -jar. Spring Boot cung cấp các tính "
                "năng nổi bật:",
                "Auto-configuration: tự động cấu hình bean dựa trên các "
                "thư viện có trong classpath, giúp giảm thiểu code cấu hình.",
                "Embedded server: Tomcat/Jetty/Undertow nhúng sẵn, không cần "
                "đóng gói WAR.",
                "Spring Boot Starter: gom nhóm các dependency phổ biến thành "
                "một gói duy nhất (spring-boot-starter-web, starter-data-jpa…).",
                "Spring Data JPA: trừu tượng hóa truy vấn, làm việc với DB "
                "qua Entity và Repository interface.",
                "Spring Security: hỗ trợ xác thực, phân quyền, bảo vệ "
                "endpoint, tích hợp JWT.",
                "Trong đồ án, Spring Boot 3.2.x được sử dụng với Java 17, "
                "kết hợp Maven để quản lý dependency và build ứng dụng.",
            ],
        },
        {
            "ten": "2.3. React và TypeScript",
            "noi_dung": [
                "React là thư viện JavaScript do Facebook phát triển, dùng "
                "để xây dựng giao diện người dùng theo mô hình component. "
                "Mỗi component quản lý state riêng, khi state thay đổi React "
                "sẽ tự động re-render phần giao diện bị ảnh hưởng (Virtual "
                "DOM giúp tối ưu hiệu năng).",
                "TypeScript là superset của JavaScript, bổ sung kiểu tĩnh "
                "(static typing) giúp phát hiện lỗi sớm ngay trong quá trình "
                "phát triển và cải thiện trải nghiệm IDE (autocomplete, "
                "refactor an toàn). Trong đồ án, toàn bộ frontend được viết "
                "bằng TypeScript để tăng độ an toàn và dễ bảo trì.",
                "Vite được dùng làm build tool thay cho Create React App vì "
                "tốc độ dev-server nhanh, HMR (Hot Module Replacement) mượt, "
                "build production gọn nhẹ. Hệ thống dùng các thư viện bổ "
                "trợ: TailwindCSS (utility-first CSS), shadcn/ui (component "
                "có sẵn), Zustand (state management nhẹ), React Router "
                "(điều hướng), Axios (HTTP client), Chart.js (biểu đồ).",
            ],
        },
        {
            "ten": "2.4. JSON Web Token (JWT)",
            "noi_dung": [
                "JWT (JSON Web Token) là chuẩn mở RFC 7519 dùng để truyền "
                "thông tin xác thực giữa client và server dưới dạng chuỗi "
                "JSON đã được ký số. Một JWT gồm 3 phần ngăn cách bởi dấu "
                "chấm: Header (thuật toán ký), Payload (claims – thông tin "
                "user), Signature (chữ ký số).",
                "Trong hệ thống, khi đăng nhập thành công, server sinh một "
                "JWT có chứa thông tin user (id, username, role, expires) "
                "và trả về cho client. Client lưu token trong localStorage "
                "và đính kèm trong header Authorization: Bearer <token> cho "
                "mỗi request sau. Filter JwtAuthenticationFilter ở backend "
                "sẽ xác thực token trước khi cho request đi tiếp vào "
                "controller.",
                "JWT giúp server hoàn toàn stateless – không cần lưu session "
                "trên RAM, phù hợp với kiến trúc RESTful và dễ scale ngang.",
            ],
        },
        {
            "ten": "2.5. Cổng thanh toán VNPay",
            "noi_dung": [
                "VNPay là cổng thanh toán trực tuyến phổ biến tại Việt Nam, "
                "hỗ trợ nhiều phương thức: thẻ nội địa (ATM), thẻ quốc tế "
                "(Visa, Master), QR code, Internet Banking. Trong đồ án, "
                "nhóm sử dụng môi trường sandbox do VNPay cung cấp để mô "
                "phỏng luồng thanh toán thực tế.",
                "Luồng thanh toán theo chuẩn VNPay:",
                "1. Frontend sau khi tạo vé PENDING gọi POST "
                "/api/vnpay/create-payment với thông tin đơn hàng.",
                "2. Backend sinh URL VNPay có kèm chữ ký HMAC-SHA512, "
                "redirect khách sang cổng VNPay.",
                "3. Khách nhập thông tin thẻ/QR trên VNPay để thanh toán.",
                "4. VNPay redirect khách về URL /payment-return của frontend "
                "kèm các tham số (vnp_ResponseCode, vnp_TxnRef…).",
                "5. Frontend gọi GET /api/vnpay/verify để backend xác minh "
                "chữ ký, kiểm tra mã phản hồi, cập nhật trạng thái vé từ "
                "PENDING → PAID và đánh dấu ghế BOOKED.",
            ],
        },
        {
            "ten": "2.6. Server-Sent Events (SSE)",
            "noi_dung": [
                "Server-Sent Events (SSE) là chuẩn W3C cho phép server chủ "
                "động đẩy dữ liệu về client theo thời gian thực thông qua "
                "một kết nối HTTP duy trì (text/event-stream). So với "
                "WebSocket, SSE đơn giản hơn, một chiều (server → client), "
                "tự động reconnect khi mất kết nối.",
                "Trong đồ án, SSE được dùng để admin nhận thông báo phản "
                "hồi mới từ khách hàng ngay khi khách gửi, mà không cần "
                "refresh trang. Khi khách submit feedback, backend đẩy sự "
                "kiện qua kênh SSE, frontend admin lắng nghe và hiển thị "
                "badge thông báo.",
            ],
        },
        {
            "ten": "2.7. RESTful API",
            "noi_dung": [
                "REST (Representational State Transfer) là kiến trúc dựa trên "
                "HTTP, sử dụng các phương thức chuẩn GET, POST, PUT, "
                "DELETE và định danh tài nguyên qua URL. API của hệ thống "
                "tuân theo các nguyên tắc REST:",
                "Stateless: mỗi request đều chứa đủ thông tin để server xử "
                "lý, không phụ thuộc session.",
                "Phân tách resource: mỗi tài nguyên (user, trip, ticket…) "
                "có endpoint riêng.",
                "Response chuẩn JSON, status code HTTP rõ ràng (200, 201, "
                "400, 401, 403, 404, 409, 500).",
                "Versioning: hệ thống dùng tiền tố /api/v1/ để dễ nâng cấp "
                "trong tương lai.",
                "Một số endpoint chính của hệ thống:",
                "POST /api/auth/register – đăng ký.",
                "POST /api/auth/login – đăng nhập.",
                "GET /api/trips/search – tìm kiếm chuyến.",
                "POST /api/tickets – tạo vé.",
                "POST /api/vnpay/create-payment – tạo URL thanh toán.",
                "GET /api/vnpay/verify – xác minh callback.",
                "GET /api/admin/revenue – thống kê doanh thu.",
            ],
        },
        {
            "ten": "2.8. Mô hình MVC và phân lớp",
            "noi_dung": [
                "Backend tổ chức theo mô hình phân lớp (Layered Architecture) "
                "gần với MVC:",
                "Controller: nhận request HTTP, validate input, gọi Service, "
                "trả response.",
                "Service: chứa logic nghiệp vụ, giao tiếp với Repository và "
                "các Service khác.",
                "Repository: giao tiếp với cơ sở dữ liệu thông qua Spring "
                "Data JPA.",
                "Model (Entity): ánh xạ bảng trong DB.",
                "DTO (Data Transfer Object): đối tượng truyền dữ liệu giữa "
                "client và server, giúp tách biệt entity và dữ liệu expose "
                "ra ngoài.",
                "Frontend tổ chức theo cấu trúc: pages (màn hình), "
                "components (thành phần UI tái sử dụng), services (gọi API), "
                "stores (state toàn cục), types (interface TypeScript).",
            ],
        },
    ],
}