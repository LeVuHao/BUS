"""
Tạo 4 sơ đồ PNG cho báo cáo MetBusTrip - VẼ LẠI TO, RÕ, GỌN, ĐÚNG LOGIC.
- ERD: 16 entity, phân 4 vùng, chữ to, không bị cắt
- Architecture: mũi tên thẳng hàng, gọn gàng
- Activity: 1 trang, gọn, đủ luồng book+pay, có decision
- Sequence: 4 đối tượng, to rõ, ít bước (chỉ flow chính)
"""
import os
import sys
import subprocess

# matplotlib
try:
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch
except ImportError:
    subprocess.run([sys.executable, "-m", "pip", "install", "matplotlib", "-q"], check=True)
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt
    import matplotlib.patches as mpatches
    from matplotlib.patches import FancyBboxPatch, Circle, FancyArrowPatch

BASE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(BASE, "diagrams")
os.makedirs(OUT, exist_ok=True)

plt.rcParams["font.family"] = "DejaVu Sans"
plt.rcParams["axes.unicode_minus"] = False

NAVY = "#1F3864"
BLUE = "#2E75B6"
LBLUE = "#B4C7E7"
GREEN = "#548235"
LGREEN = "#C5E0B4"
ORANGE = "#C65911"
LORANGE = "#F8CBAD"
GREY = "#7F7F7F"
LGREY = "#E7E6E6"
WHITE = "#FFFFFF"
YELLOW = "#FFD966"
PURPLE = "#7030A0"
RED = "#C00000"
LIGHT_RED = "#F4B084"


# ============================================================
# 1) ERD - To, rõ, phân 4 vùng
# ============================================================
def draw_erd():
    fig, ax = plt.subplots(figsize=(20, 13))
    ax.set_xlim(0, 20)
    ax.set_ylim(0, 13)
    ax.axis("off")
    ax.set_title("So do ERD - MetBusTrip (16 thuc the theo code that)",
                 fontsize=18, fontweight="bold", color=NAVY, pad=15)

    def entity(cx, cy, w, h, name, fields, header_color, body_color="white"):
        # Header
        ax.add_patch(mpatches.Rectangle(
            (cx - w/2, cy + h/2 - 0.45), w, 0.45,
            facecolor=header_color, edgecolor=NAVY, linewidth=1.2))
        ax.text(cx, cy + h/2 - 0.22, name, ha="center", va="center",
                fontsize=12, fontweight="bold",
                color=WHITE if header_color in (NAVY, BLUE, GREEN, ORANGE, PURPLE) else NAVY)
        # Body
        body_h = h - 0.45
        ax.add_patch(mpatches.Rectangle(
            (cx - w/2, cy - h/2), w, body_h,
            facecolor=body_color, edgecolor=NAVY, linewidth=1.2))
        for i, f in enumerate(fields):
            ax.text(cx - w/2 + 0.1, cy + h/2 - 0.7 - i*0.27, f,
                    ha="left", va="center", fontsize=9, color=NAVY,
                    fontweight="bold" if "PK" in f or "FK" in f else "normal")

    # Phân 4 vùng - background nhạt
    zones = [
        (0.3, 9.0, 9.5, 3.8, "1. Nguoi dung & Phan quyen", LGREEN),
        (10.0, 9.0, 9.5, 3.8, "2. Xe - Ghe - Tuyen - Chuyen", LBLUE),
        (0.3, 4.5, 13.0, 4.3, "3. Ve thanh toan & Nhan su", LORANGE),
        (13.5, 4.5, 6.0, 4.3, "4. Phan hoi & Phu tro", LGREY),
        (0.3, 0.3, 19.2, 4.0, "5. Van chuyen hang hoa & He thong", YELLOW),
    ]
    for x, y, w, h, label, color in zones:
        ax.add_patch(mpatches.Rectangle(
            (x, y), w, h, facecolor=color, alpha=0.25,
            edgecolor=NAVY, linewidth=1.2))
        ax.text(x + 0.2, y + h - 0.3, label,
                ha="left", va="top", fontsize=12, fontweight="bold", color=NAVY)

    # === Vùng 1: User & Role ===
    entity(2.7, 10.5, 4.0, 2.0, "USERS",
           ["id PK", "username UNIQUE", "password_hash", "email UNIQUE",
            "phone", "role_id FK", "status (ENUM)"], BLUE)
    entity(7.0, 10.5, 3.5, 1.5, "ROLES",
           ["id PK", "name UNIQUE", "description"], BLUE)

    # === Vùng 2: Route - Bus - Seat - Trip ===
    entity(12.5, 10.5, 3.5, 1.7, "ROUTES",
           ["id PK", "origin", "destination", "distance_km",
            "estimated_duration_min", "base_price"], BLUE)
    entity(16.7, 10.5, 3.0, 1.7, "TRIPS",
           ["id PK", "route_id FK", "bus_id FK", "departure_time",
            "arrival_time", "status", "actual_departure"], BLUE)
    entity(11.0, 9.5, 3.0, 1.6, "BUSES",
           ["id PK", "license_plate UNQ", "bus_type", "total_seats",
            "status", "last_maintenance_date"], BLUE)
    entity(14.5, 9.5, 3.0, 1.5, "SEATS",
           ["id PK", "bus_id FK", "seat_number", "position_x/y"], BLUE)
    entity(18.0, 9.5, 2.5, 1.5, "TRIP_ASSIGN",
           ["id PK", "trip_id (Long)", "employee_id (Long)",
            "assignment_role"], PURPLE)

    # === Vùng 3: Ticket - Payment - Passenger - Employee ===
    entity(3.0, 6.5, 3.2, 1.7, "PASSENGERS",
           ["id PK", "user_id FK", "full_name", "phone",
            "email", "id_card"], GREEN)
    entity(7.5, 6.5, 4.0, 2.5, "TICKETS",
           ["id PK", "trip_id FK", "seat_id FK", "passenger_id FK",
            "booked_by FK (User)", "price", "status (ENUM)",
            "booked_at", "paid_at", "pickup_point", "dropoff_point"], ORANGE)
    entity(11.5, 6.5, 3.5, 1.9, "PAYMENTS",
           ["id PK", "ticket_id FK UNIQUE", "amount", "payment_method",
            "status", "transaction_code", "vnp_txn_ref",
            "vnp_response_code"], GREEN)
    entity(3.0, 5.0, 3.2, 1.4, "CARGO",
           ["id PK", "trip_id FK", "sender_name", "receiver_name",
            "weight", "fee", "status"], LORANGE)

    # === Vùng 4: Feedback & Reply ===
    entity(15.5, 6.5, 3.5, 2.0, "FEEDBACKS",
           ["id PK", "user_id FK (NOT NULL)", "category", "subject",
            "content", "rating", "status (ENUM)", "priority",
            "related_trip_id"], NAVY)
    entity(15.5, 5.0, 3.5, 1.4, "FEEDBACK_REPLIES",
           ["id PK", "feedback_id FK", "admin_user_id",
            "content", "created_at"], PURPLE)

    # === Vùng 5: Maintenance + Audit ===
    entity(7.0, 2.5, 4.0, 1.7, "MAINTENANCE",
           ["id PK", "bus_id FK", "description", "cost",
            "maintenance_date", "status (ENUM)"], ORANGE)
    entity(13.0, 2.5, 3.5, 1.5, "AUDIT_LOGS",
           ["id PK", "user_id", "action", "details",
            "timestamp"], GREY)

    # === RELATIONS (đúng theo code) ===
    # Mỗi line: (x1,y1, x2,y2, label) - dashed
    def rel(x1, y1, x2, y2, label=""):
        ax.plot([x1, x2], [y1, y2], color=NAVY, linewidth=1.0, linestyle="--", zorder=1)
        if label:
            mx, my = (x1+x2)/2, (y1+y2)/2
            ax.text(mx, my, label, ha="center", va="center",
                    fontsize=10, color=RED, fontweight="bold",
                    bbox=dict(boxstyle="circle,pad=0.2", facecolor="white",
                              edgecolor=RED, linewidth=1.0))

    # USERS - ROLES
    rel(4.7, 10.5, 5.25, 10.5, "N:1")
    # USERS - PASSENGERS
    rel(2.7, 9.5, 2.7, 7.35, "1:N")
    # PASSENGERS - TICKETS
    rel(4.6, 6.5, 5.5, 6.5, "1:N")
    # USERS - TICKETS (booked_by)
    rel(3.6, 9.5, 5.5, 7.7, "1:N")
    # TRIPS - TICKETS
    rel(15.2, 10.5, 9.5, 6.5, "1:N")
    # SEATS - TICKETS
    rel(14.5, 8.75, 8.5, 6.5, "1:N")
    # TICKETS - PAYMENTS (1-1)
    rel(9.5, 6.5, 9.75, 6.5, "1:1")
    # ROUTES - TRIPS
    rel(14.25, 10.5, 15.2, 10.5, "1:N")
    # BUSES - TRIPS
    rel(12.5, 9.5, 15.2, 9.85, "1:N")
    # BUSES - SEATS
    rel(12.5, 9.5, 14.5, 9.5, "1:N")
    # BUSES - MAINTENANCE
    rel(9.5, 9.5, 9.0, 3.35, "1:N")
    # TRIPS - CARGO
    rel(13.6, 9.85, 5.0, 5.7, "1:N")
    # TRIPS - TRIP_ASSIGN
    rel(17.5, 9.85, 18.0, 9.5, "1:N")
    # TRIP_ASSIGN - EMPLOYEES (giả định)
    # USERS - EMPLOYEES (qua userId Long)
    rel(2.7, 9.5, 2.7, 8.0, "1:1")
    # USERS - FEEDBACKS
    rel(2.7, 9.5, 15.5, 7.5, "1:N")
    # FEEDBACKS - FEEDBACK_REPLIES
    rel(15.5, 5.7, 15.5, 5.7, "1:N")

    fig.tight_layout()
    out = os.path.join(OUT, "erd.png")
    fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"OK: {out}")


# ============================================================
# 2) ARCHITECTURE - Mũi tên gọn, thẳng hàng
# ============================================================
def draw_architecture():
    fig, ax = plt.subplots(figsize=(14, 10))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 10)
    ax.axis("off")
    ax.set_title("Kien truc tong quan - MetBusTrip",
                 fontsize=18, fontweight="bold", color=NAVY, pad=15)

    def box(cx, cy, w, h, text, color, fc="white", fs=11, bold=True):
        ax.add_patch(FancyBboxPatch(
            (cx - w/2, cy - h/2), w, h,
            boxstyle="round,pad=0.05,rounding_size=0.12",
            facecolor=color, edgecolor=NAVY, linewidth=1.4))
        ax.text(cx, cy, text, ha="center", va="center",
                fontsize=fs, fontweight="bold" if bold else "normal",
                color=WHITE if color in (NAVY, BLUE, GREEN, ORANGE, PURPLE) else NAVY)

    # Vertical arrow helper (đặt ở giữa)
    def v_arrow(x, y1, y2, color=NAVY, lw=1.5):
        ax.annotate("",
                    xy=(x, y2), xytext=(x, y1),
                    arrowprops=dict(arrowstyle="->", color=color, lw=lw))

    def h_arrow(x1, x2, y, color=NAVY, lw=1.5):
        ax.annotate("",
                    xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=color, lw=lw))

    # ── Tier 1: Client (Browser) ──
    box(7.0, 9.4, 12.5, 0.65,
        "BROWSER (Chrome / Edge / Firefox)",
        LBLUE, fs=12)

    # ── Tier 2: Frontend ──
    box(7.0, 8.3, 12.5, 0.65,
        "FRONTEND (React 18 + TypeScript + Vite)  |  Port 5173",
        BLUE, fs=12)
    # Sub-modules trong Frontend
    subs_fe = [(2.0, 7.3, "Pages"),
               (4.5, 7.3, "Components"),
               (7.0, 7.3, "Stores\n(Zustand)"),
               (9.5, 7.3, "Services\n(Axios)"),
               (12.0, 7.3, "Types")]
    for x, y, label in subs_fe:
        box(x, y, 2.0, 0.7, label, "white", fs=9, bold=False)

    # ── Tier 3: API Gateway (HTTP/JWT/CORS) ──
    box(7.0, 6.0, 12.5, 0.6,
        "REST API    /api/*    |    JWT Bearer Token    |    CORS: 5173 -> 8080",
        LGREY, fs=10, bold=False)

    # ── Tier 4: Backend ──
    box(7.0, 4.85, 12.5, 0.7,
        "BACKEND (Spring Boot 3.2 + Java 17)  |  Port 8080",
        NAVY, fs=12)
    # Sub-modules backend
    subs_be = [(2.0, 3.7, "Controller\n(12 REST)"),
               (4.5, 3.7, "Service\n(9 business)"),
               (7.0, 3.7, "Repository\n(16 JPA)"),
               (9.5, 3.7, "Security\n(JWT Filter)"),
               (12.0, 3.7, "Exception\n(Global)")]
    for x, y, label in subs_be:
        box(x, y, 2.0, 0.85, label, BLUE, fs=9)

    # ── Tier 5: Data + External ──
    box(4.5, 2.0, 5.0, 0.9,
        "MySQL 8.0\n16 tables + indexes",
        GREEN, fs=11)
    box(11.5, 2.0, 3.5, 0.9,
        "VNPay Sandbox",
        YELLOW, fs=11)

    # ── Tier 6: Realtime SSE ──
    box(7.0, 0.6, 12.5, 0.55,
        "Realtime: Server-Sent Events (SSE) - Thong bao phan hoi moi tu Customer -> Admin",
        LIGHT_RED, fs=10)

    # ── ARROWS - thẳng hàng, không chéo ──
    v_arrow(7.0, 8.95, 8.65)        # Browser -> Frontend
    v_arrow(7.0, 7.95, 7.3, lw=0.8) # Frontend -> FE sub
    v_arrow(7.0, 6.95, 6.35)        # Frontend -> API
    v_arrow(7.0, 5.7, 5.2)          # API -> Backend
    v_arrow(7.0, 4.5, 3.7, lw=0.8)  # Backend -> BE sub

    # Backend -> DB (thẳng đứng, lệch trái)
    v_arrow(4.5, 3.27, 2.5)
    # Backend -> VNPay (lệch phải)
    v_arrow(11.5, 3.27, 2.5)
    # Backend -> SSE
    v_arrow(7.0, 2.85, 0.92)
    # SSE -> Admin (ngang qua phải)
    # (Bỏ qua để khỏi rối)

    fig.tight_layout()
    out = os.path.join(OUT, "architecture.png")
    fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"OK: {out}")


# ============================================================
# 3) ACTIVITY - Gọn, 1 trang, đủ luồng
# ============================================================
def draw_activity():
    fig, ax = plt.subplots(figsize=(14, 13))
    ax.set_xlim(0, 14)
    ax.set_ylim(0, 13)
    ax.axis("off")
    ax.set_title("Activity Diagram: Dat ve + Thanh toan VNPay",
                 fontsize=18, fontweight="bold", color=NAVY, pad=15)

    # 4 lanes
    lanes = [
        (2.0, "Customer"),
        (5.5, "Frontend"),
        (9.0, "Backend"),
        (12.5, "VNPay"),
    ]
    for x, label in lanes:
        ax.add_patch(mpatches.Rectangle(
            (x - 1.4, 0.5), 2.8, 11.5,
            facecolor="white", edgecolor=NAVY, linewidth=1.0))
        # lane header
        ax.add_patch(mpatches.Rectangle(
            (x - 1.4, 11.4), 2.8, 0.7,
            facecolor=NAVY, edgecolor=NAVY))
        ax.text(x, 11.75, label, ha="center", va="center",
                fontsize=12, fontweight="bold", color=WHITE)
        # lifeline
        ax.plot([x, x], [0.7, 11.3], color=GREY, linewidth=1.2, linestyle="--")

    def act(x, y, w, h, text, color=BLUE, fc=WHITE, fs=9, bold=True):
        ax.add_patch(FancyBboxPatch(
            (x - w/2, y - h/2), w, h,
            boxstyle="round,pad=0.04,rounding_size=0.1",
            facecolor=color, edgecolor=NAVY, linewidth=1.2))
        ax.text(x, y, text, ha="center", va="center",
                fontsize=fs, color=fc,
                fontweight="bold" if bold else "normal")

    def decision(x, y, w, h, text):
        ax.add_patch(mpatches.RegularPolygon(
            (x, y), 4, radius=h/2,
            orientation=0,
            facecolor=YELLOW, edgecolor=NAVY, linewidth=1.2))
        ax.text(x, y, text, ha="center", va="center",
                fontsize=9, color=NAVY, fontweight="bold")

    def arrow(x1, y1, x2, y2, color=NAVY):
        ax.annotate("",
                    xy=(x2, y2), xytext=(x1, y1),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.3))

    def down_arrow(x, y_start, y_end, color=NAVY):
        arrow(x, y_start, x, y_end, color)

    # ── FLOW ──
    # Start node
    ax.add_patch(Circle((lanes[0][0], 11.0), 0.15,
                        facecolor=GREEN, edgecolor=NAVY))
    arrow(lanes[0][0], 11.0, lanes[0][0], 10.6)

    y = 10.4
    step = 0.65  # spacing
    gap = 0.55   # arrow length

    # Step 1
    act(lanes[0][0], y, 2.5, 0.5, "1. Chon tuyen + ngay di", BLUE); y -= 0.55
    arrow(lanes[0][0], y + 0.1, lanes[1][0], y - 0.1)
    # Step 2
    act(lanes[1][0], y - 0.05, 2.5, 0.5, "2. GET /api/trips/search", BLUE); y -= 0.7
    arrow(lanes[1][0], y + 0.15, lanes[2][0], y - 0.05)
    # Step 3
    act(lanes[2][0], y - 0.1, 2.5, 0.5, "3. Tim chuyen (JPA)", BLUE); y -= 0.7
    arrow(lanes[2][0], y + 0.15, lanes[1][0], y - 0.05)
    # Step 4 (return data)
    act(lanes[1][0], y - 0.1, 2.5, 0.5, "4. Hien thi danh sach", BLUE); y -= 0.7

    # Step 5: customer chon chuyen
    arrow(lanes[1][0], y + 0.15, lanes[0][0], y - 0.05)
    act(lanes[0][0], y - 0.1, 2.5, 0.5, "5. Click chuyen cu the", BLUE); y -= 0.7
    arrow(lanes[0][0], y + 0.15, lanes[1][0], y - 0.05)

    # Step 6: get seats
    act(lanes[1][0], y - 0.1, 2.5, 0.5, "6. GET /api/trips/{id}/seats", BLUE); y -= 0.7
    arrow(lanes[1][0], y + 0.15, lanes[2][0], y - 0.05)
    act(lanes[2][0], y - 0.1, 2.5, 0.5, "7. Tra sodo ghe", BLUE); y -= 0.7

    # Step 8: chon ghe
    arrow(lanes[2][0], y + 0.15, lanes[0][0], y - 0.05)
    act(lanes[0][0], y - 0.1, 2.5, 0.5, "8. Chon ghe + thong tin", BLUE); y -= 0.7
    arrow(lanes[0][0], y + 0.15, lanes[1][0], y - 0.05)

    # Step 9: post ticket
    act(lanes[1][0], y - 0.1, 2.5, 0.5, "9. POST /api/tickets", BLUE); y -= 0.7
    arrow(lanes[1][0], y + 0.15, lanes[2][0], y - 0.05)
    act(lanes[2][0], y - 0.1, 2.5, 0.5, "10. Tao Ticket + Payment", BLUE); y -= 0.75

    # Decision: ghe con trong?
    decision(lanes[2][0], y - 0.2, 2.5, 1.0, "Ghe con\ntrong?")
    y -= 1.0

    # NO branch
    arrow(lanes[2][0] - 1.25, y + 0.5, lanes[2][0] - 0.0, y + 0.0)
    ax.text(lanes[2][0] + 1.5, y + 0.25, "[Khong]", fontsize=9, color=RED, fontweight="bold")
    # Continue down (NO path - simple error)
    act(lanes[2][0], y - 0.1, 2.5, 0.5, "11a. Tra 409 Conflict", RED); y -= 0.7

    # YES branch (continue main flow)
    arrow(lanes[2][0], y + 1.2, lanes[2][0], y + 0.65)
    ax.text(lanes[2][0] + 0.4, y + 0.9, "[Co]", fontsize=9, color=GREEN, fontweight="bold")
    y -= 0.05

    # Step 12: tra ve ticket
    act(lanes[2][0], y, 2.5, 0.5, "12. 201 Created + Ticket", GREEN); y -= 0.7

    # Step 13: customer bam thanh toan
    arrow(lanes[2][0], y + 0.2, lanes[1][0], y - 0.1)
    arrow(lanes[1][0], y - 0.05, lanes[0][0], y - 0.35)
    act(lanes[0][0], y - 0.2, 2.5, 0.5, "13. Bam nut Thanh toan", BLUE); y -= 0.7

    # Step 14: create-payment
    arrow(lanes[0][0], y + 0.15, lanes[1][0], y - 0.05)
    act(lanes[1][0], y - 0.1, 2.5, 0.5, "14. POST /api/vnpay/...", BLUE); y -= 0.7

    # Step 15: backend build url
    arrow(lanes[1][0], y + 0.15, lanes[2][0], y - 0.05)
    act(lanes[2][0], y - 0.1, 2.5, 0.5, "15. Build URL + HMAC", BLUE); y -= 0.7

    # Step 16: redirect to VNPay
    arrow(lanes[2][0], y + 0.15, lanes[3][0], y - 0.05)
    act(lanes[3][0], y - 0.1, 2.5, 0.5, "16. Hien thi trang thanh toan", BLUE); y -= 0.7

    # Step 17: nhap thong tin
    act(lanes[3][0], y - 0.1, 2.5, 0.5, "17. Nhap thong tin + xac nhan", BLUE); y -= 0.7

    # Step 18: VNPay xu ly
    act(lanes[3][0], y - 0.1, 2.5, 0.5, "18. Xu ly thanh toan", BLUE); y -= 0.7

    # Step 19: redirect return
    arrow(lanes[3][0], y + 0.15, lanes[1][0], y - 0.05)
    act(lanes[1][0], y - 0.1, 2.5, 0.5, "19. GET /api/vnpay/verify", BLUE); y -= 0.7

    # Step 20: backend verify
    arrow(lanes[1][0], y + 0.15, lanes[2][0], y - 0.05)
    act(lanes[2][0], y - 0.1, 2.5, 0.5, "20. Verify + Update PAID", GREEN); y -= 0.7

    # Step 21: hien thi ket qua
    arrow(lanes[2][0], y + 0.15, lanes[1][0], y - 0.05)
    arrow(lanes[1][0], y - 0.05, lanes[0][0], y - 0.35)
    act(lanes[0][0], y - 0.2, 2.5, 0.5, "21. Thanh toan thanh cong!", GREEN); y -= 0.7

    # End
    ax.add_patch(Circle((lanes[0][0], y - 0.1), 0.15,
                        facecolor=RED, edgecolor=NAVY))
    ax.text(lanes[0][0], y - 0.1, "■", ha="center", va="center",
            color=WHITE, fontsize=11, fontweight="bold")

    fig.tight_layout()
    out = os.path.join(OUT, "activity_booking.png")
    fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"OK: {out}")


# ============================================================
# 4) SEQUENCE - Đơn giản, to rõ, đúng logic
# ============================================================
def draw_sequence():
    fig, ax = plt.subplots(figsize=(15, 14))
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 16)
    ax.axis("off")
    ax.set_title("Sequence Diagram: Dat ve -> Thanh toan VNPay",
                 fontsize=18, fontweight="bold", color=NAVY, pad=15)

    objs = [
        (1.5, "Customer"),
        (5.0, "Frontend"),
        (9.0, "Backend"),
        (13.0, "VNPay"),
    ]
    for x, label in objs:
        # header box
        ax.add_patch(FancyBboxPatch(
            (x - 1.3, 15.0), 2.6, 0.65,
            boxstyle="round,pad=0.04,rounding_size=0.1",
            facecolor=NAVY, edgecolor=NAVY, linewidth=1.2))
        ax.text(x, 15.32, label, ha="center", va="center",
                fontsize=12, fontweight="bold", color=WHITE)
        # lifeline
        ax.plot([x, x], [0.5, 15.0], color=GREY, linewidth=1.3, linestyle="--")

    def msg(x1, x2, y, text, color=NAVY, dashed=False):
        ls = "--" if dashed else "-"
        ax.annotate("",
                    xy=(x2, y), xytext=(x1, y),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.4, linestyle=ls))
        ax.text((x1 + x2) / 2, y + 0.18, text,
                ha="center", va="bottom", fontsize=10,
                color=color, fontweight="bold")

    def self_msg(x, y, text, color=NAVY):
        # self-call
        ax.annotate("", xy=(x + 0.7, y), xytext=(x, y),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.4))
        ax.plot([x + 0.7, x + 0.7], [y, y - 0.35], color=color, linewidth=1.4)
        ax.annotate("", xy=(x, y - 0.35), xytext=(x + 0.7, y - 0.35),
                    arrowprops=dict(arrowstyle="->", color=color, lw=1.4))
        ax.text(x + 0.35, y - 0.18, text, ha="center", va="center",
                fontsize=9, color=color)

    # Spacing
    y = 14.3
    dy = 0.5

    # 1. Search
    msg(objs[0][0], objs[1][0], y, "1. Chon tuyen + ngay di"); y -= dy
    # 2. GET search
    msg(objs[1][0], objs[2][0], y, "2. GET /api/trips/search"); y -= dy
    # 3. Return data
    msg(objs[2][0], objs[1][0], y, "3. 200 OK + danh sach", dashed=True); y -= dy
    # 4. Hien thi
    msg(objs[1][0], objs[0][0], y, "4. Hien thi the chuyen", dashed=True); y -= dy

    # 5. Chon chuyen
    msg(objs[0][0], objs[1][0], y, "5. Click chuyen"); y -= dy
    # 6. GET seats
    msg(objs[1][0], objs[2][0], y, "6. GET /api/trips/{id}/seats"); y -= dy
    # 7. Return
    msg(objs[2][0], objs[1][0], y, "7. Sodo ghe (trang thai)", dashed=True); y -= dy

    # 8. Chon ghe
    msg(objs[0][0], objs[1][0], y, "8. Chon ghe + thong tin"); y -= dy
    # 9. POST tickets
    msg(objs[1][0], objs[2][0], y, "9. POST /api/tickets"); y -= dy
    # 10. Self: create ticket + payment PENDING
    self_msg(objs[2][0], y, "10. Tao Ticket + Payment"); y -= dy * 1.6
    # 11. Return ticket
    msg(objs[2][0], objs[1][0], y, "11. 201 Created", dashed=True); y -= dy
    # 12. Hien thi nut
    msg(objs[1][0], objs[0][0], y, "12. Hien nut Thanh toan", dashed=True); y -= dy * 1.4

    # 13. Bam thanh toan
    msg(objs[0][0], objs[1][0], y, "13. Bam nut Thanh toan"); y -= dy
    # 14. POST create-payment
    msg(objs[1][0], objs[2][0], y, "14. POST /api/vnpay/create-payment"); y -= dy
    # 15. Self: build URL + HMAC
    self_msg(objs[2][0], y, "15. Build URL + HMAC-SHA512"); y -= dy * 1.6
    # 16. Return payment URL
    msg(objs[2][0], objs[1][0], y, "16. paymentUrl", dashed=True); y -= dy
    # 17. Redirect VNPay
    msg(objs[1][0], objs[3][0], y, "17. Redirect -> VNPay"); y -= dy

    # 18. VNPay xu ly (self)
    self_msg(objs[3][0], y, "18. Khach nhap thong tin + xac nhan"); y -= dy * 1.6
    self_msg(objs[3][0], y, "19. VNPay xu ly thanh toan"); y -= dy * 1.6

    # 20. Return URL
    msg(objs[3][0], objs[1][0], y, "20. Redirect /payment-return?vnp_*", dashed=True); y -= dy
    # 21. Verify
    msg(objs[1][0], objs[2][0], y, "21. GET /api/vnpay/verify"); y -= dy
    # 22. Self verify + update
    self_msg(objs[2][0], y, "22. Verify HMAC + Update PAID"); y -= dy * 1.6
    # 23. Return
    msg(objs[2][0], objs[1][0], y, "23. 200 OK", dashed=True); y -= dy
    # 24. Hien thi
    msg(objs[1][0], objs[0][0], y, "24. Thanh toan thanh cong", dashed=True); y -= dy * 1.4

    # End
    ax.add_patch(Circle((objs[0][0], y), 0.18,
                        facecolor=GREEN, edgecolor=NAVY))
    ax.text(objs[0][0], y, "●", ha="center", va="center",
            color=WHITE, fontsize=10, fontweight="bold")

    fig.tight_layout()
    out = os.path.join(OUT, "sequence_booking.png")
    fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"OK: {out}")


if __name__ == "__main__":
    draw_erd()
    draw_architecture()
    draw_activity()
    draw_sequence()
    print("\nDone! 4 diagrams saved in:", OUT)