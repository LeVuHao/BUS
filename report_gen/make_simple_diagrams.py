"""
Sequence + Activity siêu đơn giản - flowchart to rõ, non-tech đọc hiểu.
Mỗi bước = 1 ô lớn, font 18-20pt, mũi tên to dày.
"""
import os
import sys
import subprocess

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
GREEN = "#548235"
ORANGE = "#C65911"
YELLOW = "#FFD966"
RED = "#C00000"
GREY = "#7F7F7F"
WHITE = "#FFFFFF"


def step(ax, x, y, w, h, text, color=BLUE, fs=16):
    """Vẽ 1 ô bước to."""
    ax.add_patch(FancyBboxPatch(
        (x - w/2, y - h/2), w, h,
        boxstyle="round,pad=0.05,rounding_size=0.2",
        facecolor=color, edgecolor=NAVY, linewidth=2.0))
    ax.text(x, y, text, ha="center", va="center",
            fontsize=fs, fontweight="bold", color=WHITE)


def arrow_down(ax, x, y1, y2, color=NAVY, lw=3.0):
    """Mũi tên đứng to."""
    ax.annotate("",
                xy=(x, y2), xytext=(x, y1),
                arrowprops=dict(arrowstyle="-|>", color=color, lw=lw,
                                mutation_scale=25))


def decision(ax, x, y, w, h, text, fs=14):
    """Ô quyết định hình thoi."""
    ax.add_patch(mpatches.RegularPolygon(
        (x, y), 4, radius=h/1.4,
        facecolor=YELLOW, edgecolor=NAVY, linewidth=2.0))
    ax.text(x, y, text, ha="center", va="center",
            fontsize=fs, fontweight="bold", color=NAVY)


# ============================================================
# SEQUENCE - Luồng đặt vé + thanh toán VNPay
# Phiên bản FLOWCHART ĐỨNG đơn giản
# ============================================================
def draw_sequence():
    fig, ax = plt.subplots(figsize=(10, 18))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 18)
    ax.axis("off")
    ax.set_title("Quy trinh dat ve & thanh toan VNPay",
                 fontsize=22, fontweight="bold", color=NAVY, pad=20)

    # Start
    ax.add_patch(Circle((5.0, 17.3), 0.35, facecolor=GREEN,
                        edgecolor=NAVY, linewidth=2.0))
    ax.text(5.0, 17.3, "START", ha="center", va="center",
            fontsize=14, fontweight="bold", color=WHITE)
    arrow_down(ax, 5.0, 16.85, 16.45)

    # Step 1
    step(ax, 5.0, 16.0, 8.5, 0.85,
         "1. KHACH HANG chon tuyen xe + ngay di tren Website",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 15.55, 15.0)

    # Step 2
    step(ax, 5.0, 14.5, 8.5, 0.85,
         "2. HE THONG hien thi danh sach cac chuyen xe co the",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 14.05, 13.5)

    # Step 3
    step(ax, 5.0, 13.0, 8.5, 0.85,
         "3. KHACH chon chuyen xe + ghe trong + diem don/tra",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 12.55, 12.0)

    # Step 4
    step(ax, 5.0, 11.5, 8.5, 0.85,
         "4. HE THONG tao VE (trang thai: CHO THANH TOAN)",
         ORANGE, fs=15)
    arrow_down(ax, 5.0, 11.05, 10.5)

    # Decision: thanh toan?
    decision(ax, 5.0, 9.8, 4.5, 2.0, "KHACH bam\nThanh toan?", fs=15)
    arrow_down(ax, 5.0, 8.7, 7.65)

    # Branch right: NO -> huy
    arrow_down_right = FancyArrowPatch(
        (5.0 + 2.25, 9.8), (8.5, 9.8),
        arrowstyle="-|>", color=RED, lw=2.5,
        mutation_scale=25,
        connectionstyle="arc3,rad=0.0")
    ax.add_patch(arrow_down_right)
    ax.text(7.0, 10.05, "[Khong]", fontsize=13, color=RED, fontweight="bold")
    step(ax, 8.5, 8.5, 2.7, 1.2, "Het han 10p:\nHUY VE", RED, fs=13)

    # Step 5 YES (main flow)
    step(ax, 5.0, 7.0, 8.5, 0.85,
         "5. HE THONG sinh URL VNPay (co chu ky bao mat)",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 6.55, 6.0)

    # Step 6
    step(ax, 5.0, 5.5, 8.5, 0.85,
         "6. KHACH duoc chuyen sang trang VNPay de thanh toan",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 5.05, 4.5)

    # Step 7
    step(ax, 5.0, 4.0, 8.5, 0.85,
         "7. KHACH nhap thong tin the/QR va xac nhan thanh toan",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 3.55, 3.0)

    # Step 8
    step(ax, 5.0, 2.5, 8.5, 0.85,
         "8. VNPay xu ly & tra ve ket qua thanh toan",
         BLUE, fs=15)
    arrow_down(ax, 5.0, 2.05, 1.5)

    # Step 9
    step(ax, 5.0, 1.0, 8.5, 0.85,
         "9. HE THONG cap nhat VE thanh DA THANH TOAN",
         GREEN, fs=15)

    # End
    arrow_down(ax, 5.0, 0.55, 0.0)
    ax.add_patch(Circle((5.0, -0.2), 0.18, facecolor=RED, edgecolor=NAVY, linewidth=2.0))
    ax.text(5.0, -0.2, "END", ha="center", va="center",
            fontsize=12, fontweight="bold", color=WHITE)

    fig.tight_layout()
    out = os.path.join(OUT, "sequence_booking.png")
    fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"OK: {out}")


# ============================================================
# ACTIVITY - Luồng đặt vé (cùng flow trên, đơn giản hơn)
# ============================================================
def draw_activity():
    fig, ax = plt.subplots(figsize=(10, 16))
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 16)
    ax.axis("off")
    ax.set_title("Quy trinh dat ve xe khach",
                 fontsize=22, fontweight="bold", color=NAVY, pad=20)

    # Start
    ax.add_patch(Circle((5.0, 15.3), 0.35, facecolor=GREEN,
                        edgecolor=NAVY, linewidth=2.0))
    ax.text(5.0, 15.3, "START", ha="center", va="center",
            fontsize=14, fontweight="bold", color=WHITE)
    arrow_down(ax, 5.0, 14.85, 14.45)

    # Step 1
    step(ax, 5.0, 14.0, 8.5, 0.85,
         "1. KHACH truy cap Website MetBusTrip",
         BLUE, fs=16)
    arrow_down(ax, 5.0, 13.55, 13.0)

    # Step 2
    step(ax, 5.0, 12.5, 8.5, 0.85,
         "2. Chon diem di - diem den - ngay di",
         BLUE, fs=16)
    arrow_down(ax, 5.0, 12.05, 11.5)

    # Step 3
    step(ax, 5.0, 11.0, 8.5, 0.85,
         "3. HE THONG liet ke cac chuyen xe phu hop",
         BLUE, fs=16)
    arrow_down(ax, 5.0, 10.55, 10.0)

    # Step 4
    step(ax, 5.0, 9.5, 8.5, 0.85,
         "4. KHACH chon chuyen xe + xem so do ghe",
         BLUE, fs=16)
    arrow_down(ax, 5.0, 9.05, 8.5)

    # Step 5
    step(ax, 5.0, 8.0, 8.5, 0.85,
         "5. Chon ghe trong + nhap thong tin hanh khach",
         BLUE, fs=16)
    arrow_down(ax, 5.0, 7.55, 7.0)

    # Decision: ghe con trong?
    decision(ax, 5.0, 6.2, 4.5, 2.0, "Ghe con\ntrong khong?", fs=14)
    arrow_down(ax, 5.0, 5.1, 4.05)

    # Branch right: NO
    arrow_right = FancyArrowPatch(
        (5.0 + 2.25, 6.2), (8.5, 6.2),
        arrowstyle="-|>", color=RED, lw=2.5,
        mutation_scale=25,
        connectionstyle="arc3,rad=0.0")
    ax.add_patch(arrow_right)
    ax.text(7.0, 6.45, "[Het]", fontsize=13, color=RED, fontweight="bold")
    step(ax, 8.5, 5.0, 2.7, 1.2,
         "Thong bao:\nHET GHE", RED, fs=13)

    # Step 6 YES
    step(ax, 5.0, 3.4, 8.5, 0.85,
         "6. HE THONG tao VE (trang thai CHO THANH TOAN)",
         ORANGE, fs=15)
    arrow_down(ax, 5.0, 2.95, 2.4)

    # Step 7
    step(ax, 5.0, 1.9, 8.5, 0.85,
         "7. KHACH thanh toan (VNPay hoac tien mat)",
         BLUE, fs=16)
    arrow_down(ax, 5.0, 1.45, 0.9)

    # Step 8
    step(ax, 5.0, 0.4, 8.5, 0.85,
         "8. VE da thanh toan - Gui ma ve qua email",
         GREEN, fs=16)

    fig.tight_layout()
    out = os.path.join(OUT, "activity_booking.png")
    fig.savefig(out, dpi=160, bbox_inches="tight", facecolor="white")
    plt.close(fig)
    print(f"OK: {out}")


if __name__ == "__main__":
    draw_sequence()
    draw_activity()
    print("\nDone! 2 simple diagrams saved in:", OUT)