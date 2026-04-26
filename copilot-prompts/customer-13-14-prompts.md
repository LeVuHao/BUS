# Copilot Prompts - Customer Features (13 + 14)

## 13) Menu + Routes customer

Muc tieu: cap nhat MainLayout de hoan tat dieu huong customer.

Yeu cau:

- Import 2 page moi:
  - CustomerTicketsPage
  - CustomerProfilePage
- Trong menu CUSTOMER co 3 item:
  - Dat ve -> /customer/booking
  - Ve cua toi -> /customer/tickets
  - Ho so -> /customer/profile
- Them 3 Route tuong ung trong khoi Routes.
- Giu nguyen menu va route cua ADMIN/STAFF.
- Khong long sai the Route.

File can sua:

- src/components/layout/MainLayout.tsx

Dau ra mong muon:

- Code cap nhat day du cua MainLayout.tsx.

---

## 14) All-in-one prompt (toan bo customer flow)

Muc tieu: trien khai full customer flow cho he thong XeKhach Pro (Spring Boot 3 + React + TypeScript + Zustand), dong bo BE/FE, tranh xung dot logic.

### Backend

1. SecurityConfig

- Permit public:
  - GET /api/public/trips/search
  - GET /api/public/trips/{tripId}/seats
- Chi CUSTOMER:
  - POST /api/private/tickets
  - GET /api/private/tickets/my
  - PUT /api/private/tickets/{id}/cancel
- PUT /api/auth/profile: authenticated.

2. Repositories

- TripRepository: searchTripsByRoute(origin, destination, fromDate, toDate) voi LIKE khong phan biet hoa thuong, loc SCHEDULED, sort departureTime ASC.
- TicketRepository:
  - findByPassengerUserId(userId) sort bookedAt DESC
  - findBookedSeatIdsByTripId(tripId) exclude CANCELLED, REFUNDED.

3. DTOs

- TripSearchResponse
- SeatStatusResponse
- BookTicketRequest (passengerPhone @NotBlank)
- TicketResponse
- UpdateProfileRequest (@NotBlank fullName, phone)

4. ProfileController

- Them PUT /api/auth/profile de cap nhat fullName + phone mac dinh cho passenger.
- Tra ve UserDto moi nhat.

5. TicketController

- GET /api/public/trips/search
- GET /api/public/trips/{tripId}/seats
- POST /api/private/tickets (luu passengerPhone)
- GET /api/private/tickets/my
- PUT /api/private/tickets/{id}/cancel
- Co helper map response ro rang.

6. TicketService conflict logic

- Neu ticket cu theo (trip, seat) co status CANCELLED/REFUNDED thi cho phep dat lai (reuse ticket),
  khong chan sai do unique constraint.
- Van chan neu status dang con hieu luc (BOOKED/HOLD/PAID...).
- Van ap dung rule cutoff 15 phut truoc gio khoi hanh.

### Frontend

1. API client src/api/customer.ts

- Interfaces: TripSearchResult, SeatStatus, BookTicketPayload, TicketRecord, UpdateProfilePayload
- Functions:
  - searchTrips
  - getTripSeats
  - bookTicket
  - getMyTickets
  - cancelTicket
  - updateProfile
- (Co the giu getProfile neu can cho profile page).

2. CustomerBookingPage - 4 buoc

- Step 1 Tim chuyen:
  - form origin/destination/date
  - validate origin != destination
  - card ket qua
  - badge "Sap het!" khi <= 3 ghe
- Step 2 Chon ghe:
  - grid ghe
  - mau: xanh la (trong), do (da dat), xanh dam (dang chon)
  - hien dong "Da chon: B3 · Con X/Y ghe"
- Step 3 Xac nhan:
  - card tom tat
  - input SĐT bat buoc
  - note "Admin se goi xac nhan"
  - nut Xac nhan dat ve
- Step 4 Hoan tat:
  - ticket card vien dashed
  - note vang nhac admin goi SĐT
  - nut "Xem ve cua toi" va "Dat ve khac"

3. CustomerTicketsPage

- Lay danh sach ve moi nhat truoc
- Badge 3 mau theo trang thai
- Nut Huy chi hien khi BOOKED
- Empty state + link sang /customer/booking

4. CustomerProfilePage

- Username/email disabled
- fullName/phone editable
- Save -> updateProfile
- Sync lai authStore de prefill lan dat ve sau

5. MainLayout

- Menu CUSTOMER: Dat ve, Ve cua toi, Ho so
- Routes:
  - /customer/booking
  - /customer/tickets
  - /customer/profile

### Validation sau khi code

- Frontend: npm run build phai pass.
- Backend: mvn -DskipTests clean package phai pass.
- Kiem tra logic:
  - book -> cancel -> rebook cung seat phai dat lai duoc
  - seat dang booked thi khong dat duoc
  - phone profile prefill cho booking

### Rang buoc

- Khong doi API/public contract hien co neu khong can thiet.
- Khong sua nhung module khong lien quan.
- Uu tien thay doi nho gon, giu style code hien tai.
- Tra ve patch theo tung file da sua + tom tat ly do.
