-- ============================================================
-- HỆ THỐNG QUẢN LÝ QUÁN BIDA (BILLIARD CLUB MANAGEMENT)
-- KỊCH BẢN TẠO CƠ SỞ DỮ LIỆU POSTGRESQL & DỮ LIỆU MẪU SẠCH CHO SUPABASE
-- ============================================================

-- 1. TẠO CỘT USERNAME / PASSWORD NẾU BẢNG BỊ THIẾU
ALTER TABLE IF EXISTS public.staffs ADD COLUMN IF NOT EXISTS username VARCHAR(50);
ALTER TABLE IF EXISTS public.staffs ADD COLUMN IF NOT EXISTS password VARCHAR(100);

-- ============================================================
-- KHỞI TẠO CƠ SỞ DỮ LIỆU (MỚI TỪ ĐẦU - SẠCH SẼ)
-- ============================================================

DROP TABLE IF EXISTS public.invoice_details CASCADE;
DROP TABLE IF EXISTS public.stock_transactions CASCADE;
DROP TABLE IF EXISTS public.invoices CASCADE;
DROP TABLE IF EXISTS public.bookings CASCADE;
DROP TABLE IF EXISTS public.products CASCADE;
DROP TABLE IF EXISTS public.customers CASCADE;
DROP TABLE IF EXISTS public.billiard_tables CASCADE;
DROP TABLE IF EXISTS public.staffs CASCADE;
DROP TABLE IF EXISTS public.vouchers CASCADE;

-- ------------------------------------------------------------
-- 1. BẢNG NHÂN VIÊN & QUẢN LÝ (STAFFS)
-- ------------------------------------------------------------
CREATE TABLE public.staffs (
    staffid SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(100) NOT NULL,
    fullname VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'Staff', -- Manager | Cashier | Staff | Technician
    phone VARCHAR(20),
    status VARCHAR(20) DEFAULT 'Active'
);

-- ------------------------------------------------------------
-- 2. BẢNG BÀN BIDA (BILLIARD TABLES)
-- ------------------------------------------------------------
CREATE TABLE public.billiard_tables (
    tableid SERIAL PRIMARY KEY,
    tablename VARCHAR(100) NOT NULL,
    tabletype VARCHAR(50) NOT NULL,
    hourlyprice NUMERIC(12, 2) NOT NULL DEFAULT 0,
    status INT NOT NULL DEFAULT 0, -- 0: EMPTY (TẮT BÀN), 1: PLAYING, 2: BOOKED
    zone VARCHAR(50) DEFAULT 'Khu A',
    current_invoice_id INT
);

-- ------------------------------------------------------------
-- 3. BẢNG KHÁCH HÀNG & HẠNG THÀNH VIÊN (CUSTOMERS)
-- ------------------------------------------------------------
CREATE TABLE public.customers (
    customerid SERIAL PRIMARY KEY,
    fullname VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL UNIQUE,
    email VARCHAR(100),
    point INT DEFAULT 0,
    membershiptier VARCHAR(20) DEFAULT 'Bronze', -- Bronze | Silver | Gold | Platinum | Diamond
    totalspent NUMERIC(12, 2) DEFAULT 0,
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 4. BẢNG SẢN PHẨM / THỰC ĐƠN / DỊCH VỤ (PRODUCTS)
-- ------------------------------------------------------------
CREATE TABLE public.products (
    productid SERIAL PRIMARY KEY,
    productname VARCHAR(100) NOT NULL,
    category VARCHAR(50) NOT NULL, -- Nước uống | Đồ ăn | Phụ kiện | Dịch vụ khác
    price NUMERIC(12, 2) NOT NULL DEFAULT 0,
    costprice NUMERIC(12, 2) DEFAULT 0,
    unit VARCHAR(20) DEFAULT 'Lon',
    stock INT DEFAULT 0,
    minstock INT DEFAULT 10,
    imageurl TEXT,
    isactive BOOLEAN DEFAULT TRUE
);

-- ------------------------------------------------------------
-- 5. BẢNG VOUCHER KHUYẾN MÃI (VOUCHERS)
-- ------------------------------------------------------------
CREATE TABLE public.vouchers (
    voucherid SERIAL PRIMARY KEY,
    vouchercode VARCHAR(50) NOT NULL UNIQUE,
    discountamount NUMERIC(12, 2) NOT NULL DEFAULT 0,
    discounttype VARCHAR(20) DEFAULT 'Fixed',
    minordervalue NUMERIC(12, 2) DEFAULT 0,
    expirydate VARCHAR(50)
);

-- ------------------------------------------------------------
-- 6. BẢNG ĐẶT BÀN TRƯỚC (BOOKINGS)
-- ------------------------------------------------------------
CREATE TABLE public.bookings (
    bookingid SERIAL PRIMARY KEY,
    customerid INT REFERENCES public.customers(customerid) ON DELETE SET NULL,
    tableid INT REFERENCES public.billiard_tables(tableid) ON DELETE SET NULL,
    expectedstarttime TIMESTAMP NOT NULL,
    expectedendtime TIMESTAMP,
    note TEXT,
    status VARCHAR(20) DEFAULT 'Pending',
    createdat TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ------------------------------------------------------------
-- 7. BẢNG HÓA ĐƠN (INVOICES)
-- ------------------------------------------------------------
CREATE TABLE public.invoices (
    invoiceid SERIAL PRIMARY KEY,
    bookingid INT,
    tableid INT NOT NULL,
    customerid INT,
    starttime TIMESTAMP NOT NULL,
    endtime TIMESTAMP,
    tablefee NUMERIC(12, 2) DEFAULT 0,
    servicefee NUMERIC(12, 2) DEFAULT 0,
    totalamount NUMERIC(12, 2) DEFAULT 0,
    discountamount NUMERIC(12, 2) DEFAULT 0,
    vipdiscountamount NUMERIC(12, 2) DEFAULT 0,
    customertier VARCHAR(20),
    status INT DEFAULT 0, -- 0: OPEN, 1: PAID, 2: CANCELLED
    staffid INT,
    voucherid INT,
    paymentmethod VARCHAR(20) DEFAULT 'Cash'
);

-- ------------------------------------------------------------
-- 8. BẢNG CHI TIẾT HÓA ĐƠN (INVOICE DETAILS)
-- ------------------------------------------------------------
CREATE TABLE public.invoice_details (
    detailid SERIAL PRIMARY KEY,
    invoiceid INT NOT NULL REFERENCES public.invoices(invoiceid) ON DELETE CASCADE,
    productid INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    unitprice NUMERIC(12, 2) NOT NULL DEFAULT 0,
    costprice NUMERIC(12, 2) DEFAULT 0,
    subtotal NUMERIC(12, 2) NOT NULL DEFAULT 0
);

-- ------------------------------------------------------------
-- 9. BẢNG NHẬP XUẤT KHO SẢN PHẨM (STOCK TRANSACTIONS)
-- ------------------------------------------------------------
CREATE TABLE public.stock_transactions (
    transactionid SERIAL PRIMARY KEY,
    productid INT NOT NULL,
    staffid INT,
    transactiontype VARCHAR(20) NOT NULL, -- Import | Export | Sale | Adjustment
    quantitychange INT NOT NULL,
    transactiondate TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    note TEXT,
    unitprice NUMERIC(12, 2) DEFAULT 0
);

-- ============================================================
-- DỮ LIỆU MẪU BAN ĐẦU (SEED DATA SẠCH)
-- ============================================================

-- 1. Chỉ khởi tạo duy nhất 01 Tài khoản Admin (Quản lý)
INSERT INTO public.staffs (username, password, fullname, role, phone, status) VALUES
('admin', '123', 'Nguyễn Văn Minh (Quản lý)', 'Manager', '0901234567', 'Active');

-- 2. Danh sách Bàn Bida (TẤT CẢ LÀ BÀN TRỐNG - STATUS = 0, KHÔNG BẬT GIỜ, KHÔNG ĐẶT TRƯỚC)
INSERT INTO public.billiard_tables (tablename, tabletype, hourlyprice, status, zone, current_invoice_id) VALUES
('Bàn 01', 'Bàn Lỗ (Pool)', 60000, 0, 'Khu A', NULL),
('Bàn 02', 'Bàn Lỗ (Pool)', 60000, 0, 'Khu A', NULL),
('Bàn 03', 'Bàn Lỗ (Pool)', 60000, 0, 'Khu A', NULL),
('Bàn 04', 'Bàn Lỗ (Pool)', 60000, 0, 'Khu A', NULL),
('Bàn VIP 01', 'Bàn Lỗ KKKing Premium', 100000, 0, 'Khu VIP', NULL),
('Bàn VIP 02', 'Bàn Lỗ KKKing Premium', 100000, 0, 'Khu VIP', NULL),
('Bàn 3B-01', 'Bàn Phăng / 3 Băng', 80000, 0, 'Khu 3 Băng', NULL),
('Bàn 3B-02', 'Bàn Phăng / 3 Băng', 80000, 0, 'Khu 3 Băng', NULL);

-- 3. Danh sách Khách hàng mẫu
INSERT INTO public.customers (fullname, phone, email, point, membershiptier, totalspent) VALUES
('Khách Lẻ', '0000000000', NULL, 0, 'Bronze', 0),
('Nguyễn Văn An', '0988111222', 'an.nguyen@gmail.com', 150, 'Gold', 1500000),
('Trần Hoàng Bách', '0977222333', 'bach.tran@gmail.com', 450, 'Platinum', 4500000),
('Lê Thị Cẩm', '0966333444', 'cam.le@gmail.com', 50, 'Silver', 500000);

-- 4. Menu Sản phẩm & Đồ ăn thức uống
INSERT INTO public.products (productname, category, price, costprice, unit, stock, minstock) VALUES
('Sting Đỏ 330ml', 'Nước uống', 15000, 8000, 'Chai', 48, 10),
('RedBull Thái (Bò Húc)', 'Nước uống', 20000, 11000, 'Lon', 36, 12),
('Coca Cola 330ml', 'Nước uống', 15000, 7500, 'Lon', 60, 15),
('Nước Suối Aquafina 500ml', 'Nước uống', 10000, 4000, 'Chai', 100, 20),
('Mì Tôm Trứng Xúc Xích', 'Đồ ăn', 35000, 15000, 'Tô', 20, 5),
('Cơm Chiên Dương Châu', 'Đồ ăn', 45000, 20000, 'Đĩa', 15, 5),
('Khăn Lạnh Cấp Cấp', 'Dịch vụ khác', 5000, 1500, 'Cái', 200, 50),
('Bao Tay Bida Chuyên Nghiệp', 'Phụ kiện', 30000, 12000, 'Cái', 25, 5);

-- 5. Mã Giảm Giá / Voucher
INSERT INTO public.vouchers (vouchercode, discountamount, discounttype, minordervalue) VALUES
('WELCOME10', 10000, 'Fixed', 50000),
('VIP20K', 20000, 'Fixed', 100000),
('SUMMER50K', 50000, 'Fixed', 200000);
