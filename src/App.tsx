import { Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/layout/ProtectedRoute";
import PaymentReturnPage from "./pages/payment/PaymentReturnPage";



function App() {
  return (
    <div className="min-h-screen bg-[var(--admin-bg)] text-slate-900">
      <Routes>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />

        {/* Trang nhận kết quả thanh toán từ VNPay — đặt ngoài ProtectedRoute
            để đảm bảo VNPay có thể redirect về bất kể trạng thái đăng nhập */}
        <Route path="/payment/vnpay-return" element={<PaymentReturnPage />} />

        {/* Mọi đường dẫn khác đều đi qua đây */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>

          }
        />
      </Routes>
      <Toaster position="top-right" />
    </div>
  );
}

export default App;