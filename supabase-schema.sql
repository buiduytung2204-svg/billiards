-- =========================================================
-- BẢNG DỮ LIỆU CHUẨN CHO HỆ THỐNG QUẢN LÝ QUÁN BIDA (SUPABASE)
-- Copy và dán toàn bộ đoạn mã này vào Supabase -> SQL Editor -> Run
-- =========================================================

-- 1. Bảng Nhân viên / Tài khoản (staffs)
CREATE TABLE IF NOT EXISTS public.staffs (
  staffid SERIAL PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  fullname TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'Staff',
  phone TEXT,
  status TEXT NOT NULL DEFAULT 'Active'
);

-- 2. Bảng Khách hàng (customers)
CREATE TABLE IF NOT EXISTS public.customers (
  customerid SERIAL PRIMARY KEY,
  fullname TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  email TEXT,
  point INT DEFAULT 0,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  membershiptier TEXT DEFAULT 'Bronze',
  totalspent NUMERIC DEFAULT 0
);

-- 3. Bảng Hóa đơn (invoices) - tạo trước để bảng bàn liên kết foreign key
CREATE TABLE IF NOT EXISTS public.invoices (
  invoiceid SERIAL PRIMARY KEY,
  tableid INT NOT NULL,
  customerid INT REFERENCES public.customers(customerid) ON DELETE SET NULL,
  staffid INT DEFAULT 1,
  starttime TIMESTAMPTZ DEFAULT NOW(),
  endtime TIMESTAMPTZ,
  playtime_minutes INT DEFAULT 0,
  tablefee NUMERIC DEFAULT 0,
  servicefee NUMERIC DEFAULT 0,
  discountamount NUMERIC DEFAULT 0,
  totalamount NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'Playing',
  paymentmethod TEXT DEFAULT 'Cash',
  createdat TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Bảng Bàn bida (tables)
CREATE TABLE IF NOT EXISTS public.tables (
  tableid SERIAL PRIMARY KEY,
  tablename TEXT NOT NULL,
  tabletype TEXT DEFAULT 'Bàn Bida',
  hourlyprice NUMERIC NOT NULL DEFAULT 70000,
  status TEXT NOT NULL DEFAULT 'EMPTY',
  zone TEXT DEFAULT 'Khu A',
  current_invoice_id INT REFERENCES public.invoices(invoiceid) ON DELETE SET NULL
);

-- Thêm khóa ngoại cho invoices.tableid
ALTER TABLE public.invoices DROP CONSTRAINT IF EXISTS fk_invoices_table;
ALTER TABLE public.invoices ADD CONSTRAINT fk_invoices_table FOREIGN KEY (tableid) REFERENCES public.tables(tableid) ON DELETE CASCADE;

-- 5. Bảng Sản phẩm / Dịch vụ (products)
CREATE TABLE IF NOT EXISTS public.products (
  productid SERIAL PRIMARY KEY,
  productname TEXT NOT NULL,
  category TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  costprice NUMERIC NOT NULL DEFAULT 0,
  unit TEXT DEFAULT 'Cái',
  stock INT DEFAULT 0,
  minstock INT DEFAULT 10,
  isactive BOOLEAN DEFAULT TRUE
);

-- 6. Bảng Khuyến mãi / Voucher (vouchers)
CREATE TABLE IF NOT EXISTS public.vouchers (
  voucherid SERIAL PRIMARY KEY,
  vouchercode TEXT UNIQUE NOT NULL,
  discountamount NUMERIC NOT NULL DEFAULT 0,
  discounttype TEXT DEFAULT 'Fixed',
  minordervalue NUMERIC DEFAULT 0,
  expirydate DATE DEFAULT '2026-12-31'
);

-- 7. Bảng Đặt bàn (bookings)
CREATE TABLE IF NOT EXISTS public.bookings (
  bookingid SERIAL PRIMARY KEY,
  customername TEXT NOT NULL,
  customerphone TEXT NOT NULL,
  tableid INT REFERENCES public.tables(tableid) ON DELETE CASCADE,
  bookingtime TIMESTAMPTZ NOT NULL,
  note TEXT,
  status TEXT DEFAULT 'Confirmed'
);

-- 8. Bảng Chi tiết hóa đơn / Đồ ăn đồ uống gọi thêm (invoice_details)
CREATE TABLE IF NOT EXISTS public.invoice_details (
  detailid SERIAL PRIMARY KEY,
  invoiceid INT REFERENCES public.invoices(invoiceid) ON DELETE CASCADE,
  productid INT REFERENCES public.products(productid) ON DELETE SET NULL,
  productname TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unitprice NUMERIC DEFAULT 0,
  totalprice NUMERIC DEFAULT 0
);

-- 9. Bảng Lịch sử nhập / xuất kho (stock_transactions)
CREATE TABLE IF NOT EXISTS public.stock_transactions (
  txid SERIAL PRIMARY KEY,
  productid INT REFERENCES public.products(productid) ON DELETE SET NULL,
  productname TEXT NOT NULL,
  type TEXT NOT NULL,
  quantity INT NOT NULL,
  costprice NUMERIC NOT NULL,
  createdat TIMESTAMPTZ DEFAULT NOW(),
  note TEXT
);

-- 10. Bảng Cấu hình giảm giá VIP (vip_discount_rates)
CREATE TABLE IF NOT EXISTS public.vip_discount_rates (
  id INT PRIMARY KEY DEFAULT 1,
  bronze INT DEFAULT 0,
  silver INT DEFAULT 5,
  gold INT DEFAULT 10,
  platinum INT DEFAULT 15
);

-- =========================================================
-- BẮT TẮT PHÂN QUYỀN RLS ĐỂ CHO PHÉP ĐỌC / GHI TỰ DO QUA API
-- =========================================================
ALTER TABLE public.staffs DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.tables DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.products DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vouchers DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_details DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.stock_transactions DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.vip_discount_rates DISABLE ROW LEVEL SECURITY;

-- =========================================================
-- CHÈN DỮ LIỆU MẪU BAN ĐẦU (SEED DATA)
-- =========================================================

-- Tài khoản nhân viên
INSERT INTO public.staffs (staffid, username, password, fullname, role, phone, status)
VALUES (1, 'admin', '123', 'Nguyễn Văn Minh (Quản lý)', 'Manager', '0901234567', 'Active')
ON CONFLICT (staffid) DO NOTHING;

-- Khách hàng mẫu
INSERT INTO public.customers (customerid, fullname, phone, email, point, createdat, membershiptier, totalspent)
VALUES 
  (1, 'Phạm Đức Anh', '0988111222', 'ducanh@gmail.com', 320, '2026-01-15T08:00:00Z', 'Gold', 4800000),
  (2, 'Nguyễn Thanh Tùng', '0977333444', 'thanhtung@gmail.com', 150, '2026-02-10T10:30:00Z', 'Silver', 2100000),
  (3, 'Vũ Quốc Bảo', '0966555666', 'quocbao@billiard.vn', 650, '2025-11-20T14:15:00Z', 'Platinum', 11500000),
  (4, 'Hoàng Trọng Nghĩa', '0933888999', 'trongnghia@yahoo.com', 45, '2026-03-01T09:00:00Z', 'Bronze', 650000)
ON CONFLICT (customerid) DO NOTHING;

-- Danh sách Bàn Bida
INSERT INTO public.tables (tableid, tablename, tabletype, hourlyprice, status, zone)
VALUES 
  (1, 'Bàn 1', 'Bàn Bida', 70000, 'EMPTY', 'Khu A'),
  (2, 'Bàn 2', 'Bàn Bida', 70000, 'EMPTY', 'Khu A'),
  (3, 'Bàn 3', 'Bàn Bida', 70000, 'EMPTY', 'Khu A'),
  (4, 'Bàn 4', 'Bàn Bida', 70000, 'EMPTY', 'Khu A'),
  (5, 'Bàn 5', 'Bàn Bida', 80000, 'EMPTY', 'Khu B'),
  (6, 'Bàn 6', 'Bàn Bida', 80000, 'EMPTY', 'Khu B'),
  (7, 'Bàn 7', 'Bàn Bida', 80000, 'EMPTY', 'Khu B'),
  (8, 'Bàn 8', 'Bàn Bida', 80000, 'EMPTY', 'Khu B'),
  (9, 'Bàn 9', 'Bàn Bida', 120000, 'EMPTY', 'Phòng VIP'),
  (10, 'Bàn 10', 'Bàn Bida', 120000, 'EMPTY', 'Phòng VIP'),
  (11, 'Bàn 11', 'Bàn Bida', 120000, 'EMPTY', 'Phòng VIP'),
  (12, 'Bàn 12', 'Bàn Bida', 150000, 'EMPTY', 'Phòng VIP')
ON CONFLICT (tableid) DO NOTHING;

-- Danh sách Sản phẩm
INSERT INTO public.products (productid, productname, category, price, costprice, unit, stock, minstock, isactive)
VALUES 
  (1, 'Cà phê đá', 'Nước uống', 25000, 8000, 'Ly', 150, 20, true),
  (2, 'Cà phê sữa đá', 'Nước uống', 30000, 10000, 'Ly', 140, 20, true),
  (3, 'Sting đỏ / dâu', 'Nước uống', 20000, 9000, 'Chai', 85, 24, true),
  (4, 'RedBull Thái', 'Nước uống', 25000, 12000, 'Lon', 60, 12, true),
  (5, 'Nước suối Aquafina 500ml', 'Nước uống', 12000, 4500, 'Chai', 200, 30, true),
  (6, 'Mì xào bò đặc biệt', 'Đồ ăn', 45000, 22000, 'Đĩa', 40, 10, true),
  (7, 'Cơm chiên hải sản', 'Đồ ăn', 50000, 25000, 'Đĩa', 35, 10, true),
  (8, 'Cá viên chiên bida set', 'Đồ ăn', 35000, 15000, 'Đĩa', 50, 15, true),
  (9, 'Thuốc lá 555 Ngoại', 'Thuốc lá', 40000, 32000, 'Gói', 18, 10, true),
  (10, 'Khăn lạnh tiệt trùng', 'Dịch vụ khác', 5000, 1500, 'Cái', 300, 50, true),
  (11, 'Găng tay bida Taom', 'Phụ kiện', 60000, 35000, 'Cái', 12, 5, true)
ON CONFLICT (productid) DO NOTHING;

-- Voucher Khuyến mãi
INSERT INTO public.vouchers (voucherid, vouchercode, discountamount, discounttype, minordervalue, expirydate)
VALUES 
  (1, 'BIDA50K', 50000, 'Fixed', 200000, '2026-12-31'),
  (2, 'VIP100K', 100000, 'Fixed', 400000, '2026-12-31'),
  (3, 'CHAO2026', 30000, 'Fixed', 100000, '2026-12-31')
ON CONFLICT (voucherid) DO NOTHING;

-- Tỷ lệ giảm giá VIP
INSERT INTO public.vip_discount_rates (id, bronze, silver, gold, platinum)
VALUES (1, 0, 5, 10, 15)
ON CONFLICT (id) DO NOTHING;

-- Đồng bộ Sequence tự tăng ID trong Supabase
SELECT setval('staffs_staffid_seq', (SELECT COALESCE(MAX(staffid), 1) FROM staffs));
SELECT setval('customers_customerid_seq', (SELECT COALESCE(MAX(customerid), 1) FROM customers));
SELECT setval('tables_tableid_seq', (SELECT COALESCE(MAX(tableid), 1) FROM tables));
SELECT setval('products_productid_seq', (SELECT COALESCE(MAX(productid), 1) FROM products));
SELECT setval('vouchers_voucherid_seq', (SELECT COALESCE(MAX(voucherid), 1) FROM vouchers));
