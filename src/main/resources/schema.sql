-- Dành cho cơ sở dữ liệu SQL Server (Phân hệ Người B - Điều phối chuyến xe)

-- 1. Bảng Roles (Quyền)
CREATE TABLE roles (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description NVARCHAR(MAX)
);

-- 2. Bảng Users (Người dùng)
CREATE TABLE users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE,
    phone VARCHAR(20),
    role_id INT,
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE', 'LOCKED')),
    created_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_user_role FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- 3. Bảng Employees (Nhân viên)
CREATE TABLE employees (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT UNIQUE,
    full_name NVARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    employee_type VARCHAR(50) NOT NULL CHECK (employee_type IN ('DRIVER', 'ASSISTANT', 'TECHNICIAN', 'DISPATCHER', 'MANAGER')),
    status VARCHAR(20) DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'INACTIVE')),
    CONSTRAINT fk_employee_user FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 4. Bảng Routes (Tuyến đường)
CREATE TABLE routes (
    id INT IDENTITY(1,1) PRIMARY KEY,
    origin NVARCHAR(100) NOT NULL,
    destination NVARCHAR(100) NOT NULL,
    distance_km DECIMAL(10,2) NOT NULL CHECK (distance_km > 0),
    estimated_duration_min INT NOT NULL CHECK (estimated_duration_min > 0),
    base_price DECIMAL(10,2) NOT NULL,
    is_active BIT DEFAULT 1
);

-- 5. Bảng Buses (Xe khách)
CREATE TABLE buses (
    id INT IDENTITY(1,1) PRIMARY KEY,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    bus_type VARCHAR(50) CHECK (bus_type IN ('LIMOUSINE', 'SLEEPER', 'SEAT')),
    total_seats INT NOT NULL,
    status VARCHAR(20) DEFAULT 'AVAILABLE' CHECK (status IN ('AVAILABLE', 'RUNNING', 'MAINTENANCE')),
    last_maintenance_date DATE,
    insurance_expiry DATE
);

-- 6. Bảng Trips (Chuyến xe)
CREATE TABLE trips (
    id INT IDENTITY(1,1) PRIMARY KEY,
    route_id INT,
    bus_id INT,
    departure_time DATETIME NOT NULL,
    arrival_time DATETIME,
    status VARCHAR(20) DEFAULT 'SCHEDULED' CHECK (status IN ('SCHEDULED', 'RUNNING', 'COMPLETED', 'CANCELLED', 'DELAYED')),
    actual_departure DATETIME,
    actual_arrival DATETIME,
    CONSTRAINT fk_trip_route FOREIGN KEY (route_id) REFERENCES routes(id),
    CONSTRAINT fk_trip_bus FOREIGN KEY (bus_id) REFERENCES buses(id)
);

-- 7. Bảng Trip_assignments (Phân công nhân viên vào chuyến xe)
CREATE TABLE trip_assignments (
    id INT IDENTITY(1,1) PRIMARY KEY,
    trip_id INT,
    employee_id INT,
    assignment_role VARCHAR(50) CHECK (assignment_role IN ('DRIVER', 'ASSISTANT')),
    assigned_at DATETIME DEFAULT GETDATE(),
    CONSTRAINT fk_assign_trip FOREIGN KEY (trip_id) REFERENCES trips(id) ON DELETE CASCADE,
    CONSTRAINT fk_assign_emp FOREIGN KEY (employee_id) REFERENCES employees(id),
    UNIQUE(trip_id, employee_id) -- Đã sửa: Cho phép 1 chuyến có nhiều tài xế
);