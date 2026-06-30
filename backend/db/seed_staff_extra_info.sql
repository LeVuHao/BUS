-- ============================================================================
-- Seed hometown + experience_years cho 20 nhân viên hiện có trong DB
-- Tất cả dữ liệu dưới đây là giả lập để demo, không phải dữ liệu thực.
-- Update theo id chính xác (rà soát từ DB).
-- ============================================================================

UPDATE employees SET hometown = N'Hà Nội',     experience_years = 12 WHERE id = 1  ;  -- Nguyễn Văn An      (DRIVER)
UPDATE employees SET hometown = N'Hải Phòng',  experience_years = 10 WHERE id = 2  ;  -- Trần Văn Bình      (DRIVER)
UPDATE employees SET hometown = N'Đà Nẵng',    experience_years = 14 WHERE id = 3  ;  -- Lê Đình Cường      (DRIVER)
UPDATE employees SET hometown = N'Hà Nội',     experience_years = 8  WHERE id = 4  ;  -- Phạm Văn Dũng      (DRIVER)
UPDATE employees SET hometown = N'Cần Thơ',    experience_years = 6  WHERE id = 5  ;  -- Hoàng Văn Em       (DRIVER)
UPDATE employees SET hometown = N'TP.HCM',     experience_years = 15 WHERE id = 6  ;  -- Đặng Văn Phong     (DRIVER)
UPDATE employees SET hometown = N'Nghệ An',    experience_years = 9  WHERE id = 7  ;  -- Bùi Văn Quang      (DRIVER)
UPDATE employees SET hometown = N'Hà Nội',     experience_years = 11 WHERE id = 8  ;  -- Đỗ Văn Sơn         (DRIVER)
UPDATE employees SET hometown = N'Đà Nẵng',    experience_years = 5  WHERE id = 9  ;  -- Ngô Văn Tài        (DRIVER)
UPDATE employees SET hometown = N'Huế',        experience_years = 7  WHERE id = 10 ;  -- Vũ Văn Thành       (DRIVER)

UPDATE employees SET hometown = N'Hà Nội',     experience_years = 9  WHERE id = 11 ;  -- Lý Thị Hương       (ASSISTANT)
UPDATE employees SET hometown = N'Nam Định',   experience_years = 6  WHERE id = 12 ;  -- Trương Thị Lan     (ASSISTANT)
UPDATE employees SET hometown = N'Thanh Hóa',  experience_years = 4  WHERE id = 13 ;  -- Phan Thị Mai       (ASSISTANT)
UPDATE employees SET hometown = N'Quảng Ninh', experience_years = 7  WHERE id = 14 ;  -- Cao Thị Ngọc       (ASSISTANT)
UPDATE employees SET hometown = N'Bắc Giang',  experience_years = 3  WHERE id = 15 ;  -- Đinh Thị Oanh      (ASSISTANT)
UPDATE employees SET hometown = N'TP.HCM',     experience_years = 8  WHERE id = 16 ;  -- Hứa Thị Phương     (ASSISTANT)
UPDATE employees SET hometown = N'Bình Dương', experience_years = 5  WHERE id = 17 ;  -- Châu Thị Quỳnh     (ASSISTANT)
UPDATE employees SET hometown = N'Hải Phòng',  experience_years = 4  WHERE id = 18 ;  -- Thái Thị Thu       (ASSISTANT)
UPDATE employees SET hometown = N'Vĩnh Phúc',  experience_years = 2  WHERE id = 19 ;  -- Phùng Thị Vy       (ASSISTANT)
UPDATE employees SET hometown = N'Đồng Nai',   experience_years = 6  WHERE id = 20 ;  -- Đoàn Thị Xinh      (ASSISTANT)
