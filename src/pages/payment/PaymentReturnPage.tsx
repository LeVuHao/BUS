import { useEffect, useRef, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Check, X, Loader2, Ticket as TicketIcon, Home } from "lucide-react";
import toast from "react-hot-toast";
import { getMyTickets, getVnpayReturnInfo, VnpayReturnInfo } from "../../api/customer";

/**
 * Trang nhận kết quả trả về từ VNPay sau khi user thanh toán.
 *
 * Flow:
 * 1. VNPay redirect user về /payment/vnpay-return kèm query params (vnp_ResponseCode, vnp_TxnRef...)
 * 2. Trang này gọi backend /api/public/payment/vnpay/return để xác thực và parse dữ liệu
 * 3. Đồng thời poll getMyTickets() để đợi IPN callback từ VNPay cập nhật trạng thái vé
 */
export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [returnInfo, setReturnInfo] = useState<VnpayReturnInfo | null>(null);
  const [loadingInfo, setLoadingInfo] = useState(true);
  const [polling, setPolling] = useState(false);
  const [ticketUpdated, setTicketUpdated] = useState(false);
  const pollingTimer = useRef<number | null>(null);

  // Bước 1: lấy thông tin return từ VNPay
  useEffect(() => {
    const fetchReturnInfo = async () => {
      try {
        const queryString = searchParams.toString();
        const info = await getVnpayReturnInfo(queryString ? `?${queryString}` : "");
        setReturnInfo(info);
      } catch (err) {
        toast.error("Không đọc được kết quả thanh toán từ VNPay");
      } finally {
        setLoadingInfo(false);
      }
    };
    fetchReturnInfo();
  }, [searchParams]);

  // Bước 2: nếu thanh toán thành công, poll getMyTickets để đợi IPN cập nhật DB
  useEffect(() => {
    if (!returnInfo?.success) return;

    setPolling(true);
    let attempts = 0;
    const maxAttempts = 15; // 15 lần × 1.5s = ~22 giây

    const poll = async () => {
      attempts++;
      try {
        const tickets = await getMyTickets();
        // Tìm vé theo txnRef — vì IPN đã cập nhật status PAID
        const matchingTicket = tickets.find(
          (t) => t.transactionCode && (
            t.transactionCode.includes(returnInfo.transactionNo ?? "") ||
            t.transactionCode.includes(returnInfo.txnRef ?? "")
          ),
        );
        if (matchingTicket && matchingTicket.status === "PAID") {
          setTicketUpdated(true);
          setPolling(false);
          toast.success("Thanh toán thành công! Vé đã được cập nhật.");
          return;
        }
      } catch {
        // ignore poll error, tiếp tục thử
      }

      if (attempts < maxAttempts) {
        pollingTimer.current = window.setTimeout(poll, 1500);
      } else {
        setPolling(false);
      }
    };

    // Bắt đầu poll sau 800ms
    pollingTimer.current = window.setTimeout(poll, 800);

    return () => {
      if (pollingTimer.current) {
        clearTimeout(pollingTimer.current);
      }
    };
  }, [returnInfo]);

  // ─── Render ─────────────────────────────────────────────────────────

  if (loadingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-sm w-full mx-4">
          <Loader2 className="h-12 w-12 animate-spin text-pink-500 mx-auto mb-3" />
          <p className="text-pink-700 font-medium">Đang xác nhận kết quả thanh toán...</p>
        </div>
      </div>
    );
  }

  if (!returnInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 to-rose-50 p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <X className="h-12 w-12 text-red-500 mx-auto mb-3" />
          <h1 className="text-xl font-bold text-pink-900 mb-2">Không có thông tin thanh toán</h1>
          <p className="text-sm text-pink-500 mb-5">
            Không thể trích xuất kết quả từ VNPay. Vui lòng kiểm tra lại trong mục "Vé của tôi".
          </p>
          <button
            onClick={() => navigate("/customer/tickets")}
            className="w-full rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-700"
          >
            Về trang Vé của tôi
          </button>
        </div>
      </div>
    );
  }

  if (!returnInfo.success) {
    return (
      <ResultScreen
        success={false}
        title="Thanh toán chưa hoàn tất"
        subtitle={`Mã phản hồi VNPay: ${returnInfo.responseCode || "—"}`}
        description={
          <>
            Giao dịch không thành công hoặc đã bị hủy. Vé của bạn vẫn ở trạng thái{" "}
            <span className="font-semibold text-pink-700">chờ thanh toán</span>, bạn có thể thử lại.
          </>
        }
        info={returnInfo}
        polling={polling}
        ticketUpdated={ticketUpdated}
      />
    );
  }

  return (
    <ResultScreen
      success={true}
      title="Thanh toán thành công!"
      subtitle="Cảm ơn quý khách đã thanh toán qua VNPay"
      description={
        polling && !ticketUpdated ? (
          <span className="inline-flex items-center gap-2 text-blue-600">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang đồng bộ trạng thái vé với hệ thống...
          </span>
        ) : ticketUpdated ? (
          <span className="text-emerald-600 font-medium">✓ Vé đã được cập nhật thành công</span>
        ) : (
          <span className="text-pink-500">
            Hệ thống đang xử lý, vui lòng kiểm tra lại trong vài giây.
          </span>
        )
      }
      info={returnInfo}
      polling={polling}
      ticketUpdated={ticketUpdated}
    />
  );
}

interface ResultScreenProps {
  success: boolean;
  title: string;
  subtitle: string;
  description: React.ReactNode;
  info: VnpayReturnInfo;
  polling: boolean;
  ticketUpdated: boolean;
}

function ResultScreen({ success, title, subtitle, description, info, polling, ticketUpdated }: ResultScreenProps) {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-pink-50 via-white to-rose-50 p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full overflow-hidden">
        {/* Header */}
        <div
          className={`px-6 py-6 text-white text-center ${
            success ? "bg-gradient-to-r from-emerald-500 to-green-600" : "bg-gradient-to-r from-amber-500 to-rose-500"
          }`}
        >
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
            {success ? <Check className="h-9 w-9" /> : <X className="h-9 w-9" />}
          </div>
          <h1 className="text-xl font-bold">{title}</h1>
          <p className="mt-1 text-sm opacity-90">{subtitle}</p>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <div className="text-center text-sm">{description}</div>

          {/* Info chi tiết */}
          <div className="rounded-xl bg-slate-50 p-4 space-y-2 text-sm">
            <InfoRow label="Số tiền" value={formatPrice(info.amount)} highlight />
            <InfoRow label="Mã tham chiếu" value={info.txnRef} mono />
            {info.transactionNo && (
              <InfoRow label="Mã giao dịch VNPay" value={info.transactionNo} mono />
            )}
            {info.bankCode && <InfoRow label="Ngân hàng" value={info.bankCode} />}
            {info.cardType && <InfoRow label="Loại thẻ" value={info.cardType} />}
            {info.payDate && (
              <InfoRow label="Thời gian" value={formatVNPayDate(info.payDate)} />
            )}
            <InfoRow label="Mã phản hồi" value={info.responseCode || "—"} />
          </div>

          {/* Action buttons */}
          <div className="space-y-2 pt-2">
            <Link
              to="/customer/tickets"
              className="w-full flex items-center justify-center gap-2 rounded-xl bg-pink-600 px-4 py-3 text-sm font-semibold text-white hover:bg-pink-700 transition"
            >
              <TicketIcon className="h-4 w-4" />
              {polling && success && !ticketUpdated ? "Đang đồng bộ..." : "Xem vé của tôi"}
            </Link>
            <button
              onClick={() => navigate("/customer/booking")}
              className="w-full flex items-center justify-center gap-2 rounded-xl border border-pink-200 bg-white px-4 py-3 text-sm font-semibold text-pink-700 hover:bg-pink-50 transition"
            >
              <Home className="h-4 w-4" />
              Về trang chủ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-slate-400 text-xs">{label}</span>
      <span
        className={`${highlight ? "font-bold text-pink-600 text-base" : "font-medium text-slate-700"} ${mono ? "font-mono text-xs" : ""} text-right`}
      >
        {value}
      </span>
    </div>
  );
}

function formatPrice(amount: number): string {
  return amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" });
}

/** Parse chuỗi ngày VNPay (yyyyMMddHHmmss) sang Date */
function formatVNPayDate(raw: string): string {
  if (!raw || raw.length < 14) return raw;
  const y = raw.slice(0, 4);
  const m = raw.slice(4, 6);
  const d = raw.slice(6, 8);
  const hh = raw.slice(8, 10);
  const mm = raw.slice(10, 12);
  const ss = raw.slice(12, 14);
  return `${d}/${m}/${y} ${hh}:${mm}:${ss}`;
}