import React, { useState } from 'react';
import { BilliardTable, Product, Staff, Voucher } from '../../types';
import { api } from '../../services/api';
import { formatVND } from '../../utils/format';
import {
  Shield,
  DollarSign,
  Edit2,
  Plus,
  Trash2,
  Users,
  Package,
  Ticket,
  Save,
  CheckCircle2,
  AlertCircle,
  LayoutGrid,
  Key,
  Layers,
  Sparkles,
  Lock,
  Database,
  Copy,
  Check,
  RefreshCw
} from 'lucide-react';

interface AdminManagementProps {
  tables: BilliardTable[];
  products: Product[];
  staffs: Staff[];
  vouchers: Voucher[];
  activeStaff?: Staff;
  onRefresh: () => void;
}

export const AdminManagement: React.FC<AdminManagementProps> = ({
  tables,
  products,
  staffs,
  vouchers,
  activeStaff,
  onRefresh,
}) => {
  const [activeTab, setActiveTab] = useState<'tables' | 'products' | 'staffs' | 'vouchers' | 'vip' | 'supabase'>('tables');
  const [supabaseStatus, setSupabaseStatus] = useState<any>(null);
  const [checkingSupabase, setCheckingSupabase] = useState<boolean>(false);
  const [copiedSql, setCopiedSql] = useState<boolean>(false);

  const handleCheckSupabase = async () => {
    setCheckingSupabase(true);
    try {
      const status = await api.getSupabaseStatus();
      setSupabaseStatus(status);
    } catch (err: any) {
      setSupabaseStatus({ connected: false, message: err.message });
    } finally {
      setCheckingSupabase(false);
    }
  };

  React.useEffect(() => {
    if (activeTab === 'supabase') {
      handleCheckSupabase();
    }
  }, [activeTab]);

  const SQL_SCHEMA_CODE = `-- =========================================================
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

-- 3. Bảng Hóa đơn (invoices)
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

-- 8. Bảng Chi tiết hóa đơn (invoice_details)
CREATE TABLE IF NOT EXISTS public.invoice_details (
  detailid SERIAL PRIMARY KEY,
  invoiceid INT REFERENCES public.invoices(invoiceid) ON DELETE CASCADE,
  productid INT REFERENCES public.products(productid) ON DELETE SET NULL,
  productname TEXT NOT NULL,
  quantity INT DEFAULT 1,
  unitprice NUMERIC DEFAULT 0,
  totalprice NUMERIC DEFAULT 0
);

-- 9. Bảng Lịch sử nhập kho (stock_transactions)
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

-- TẮT BẢO MẬT RLS ĐỂ CHO PHÉP API ĐỌC GHI DỮ LIỆU
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

-- DỮ LIỆU MẪU BAN ĐẦU
INSERT INTO public.staffs (staffid, username, password, fullname, role, phone, status)
VALUES (1, 'admin', '123', 'Nguyễn Văn Minh (Quản lý)', 'Manager', '0901234567', 'Active') ON CONFLICT (username) DO NOTHING;

INSERT INTO public.customers (customerid, fullname, phone, email, point, createdat, membershiptier, totalspent)
VALUES 
  (1, 'Phạm Đức Anh', '0988111222', 'ducanh@gmail.com', 320, '2026-01-15T08:00:00Z', 'Gold', 4800000),
  (2, 'Nguyễn Thanh Tùng', '0977333444', 'thanhtung@gmail.com', 150, '2026-02-10T10:30:00Z', 'Silver', 2100000)
ON CONFLICT (phone) DO NOTHING;

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

INSERT INTO public.products (productid, productname, category, price, costprice, unit, stock, minstock, isactive)
VALUES 
  (1, 'Cà phê đá', 'Nước uống', 25000, 8000, 'Ly', 150, 20, true),
  (2, 'Cà phê sữa đá', 'Nước uống', 30000, 10000, 'Ly', 140, 20, true),
  (3, 'Sting đỏ / dâu', 'Nước uống', 20000, 9000, 'Chai', 85, 24, true),
  (4, 'RedBull Thái', 'Nước uống', 25000, 12000, 'Lon', 60, 12, true),
  (5, 'Nước suối Aquafina 500ml', 'Nước uống', 12000, 4500, 'Chai', 200, 30, true),
  (6, 'Mì xào bò đặc biệt', 'Đồ ăn', 45000, 22000, 'Đĩa', 40, 10, true),
  (7, 'Cơm chiên hải sản', 'Đồ ăn', 50000, 25000, 'Đĩa', 35, 10, true),
  (8, 'Cá viên chiên bida set', 'Đồ ăn', 35000, 15000, 'Đĩa', 50, 15, true)
ON CONFLICT (productid) DO NOTHING;

INSERT INTO public.vouchers (voucherid, vouchercode, discountamount, discounttype, minordervalue, expirydate)
VALUES 
  (1, 'BIDA50K', 50000, 'Fixed', 200000, '2026-12-31'),
  (2, 'VIP100K', 100000, 'Fixed', 400000, '2026-12-31')
ON CONFLICT (vouchercode) DO NOTHING;

INSERT INTO public.vip_discount_rates (id, bronze, silver, gold, platinum)
VALUES (1, 0, 5, 10, 15) ON CONFLICT (id) DO NOTHING;`;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SQL_SCHEMA_CODE);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 3000);
  };
  
  // VIP Rates state
  const [vipRates, setVipRates] = useState<Record<string, number>>({
    Bronze: 5,
    Silver: 10,
    Gold: 15,
    Platinum: 20,
    Diamond: 25,
  });
  const [savingVip, setSavingVip] = useState<boolean>(false);

  React.useEffect(() => {
    api.getVipRates()
      .then((data) => {
        if (data) setVipRates(data);
      })
      .catch(() => {});
  }, []);

  const handleSaveVipRates = async () => {
    if (!isAdmin) {
      alert('Lỗi: Chỉ tài khoản Quản lý (Manager) mới có quyền chỉnh sửa % giảm giá VIP!');
      return;
    }
    setSavingVip(true);
    try {
      const updated = await api.updateVipRates(vipRates);
      setVipRates(updated);
      alert('Thành công! Đã cập nhật cấu hình % giảm giá tiền giờ theo cấp VIP.');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    } finally {
      setSavingVip(false);
    }
  };
  
  // Table Batch Price state
  const [selectedZone, setSelectedZone] = useState<string>('Khu A');
  const [batchPrice, setBatchPrice] = useState<number>(75000);

  // Table Edit state
  const [editingTable, setEditingTable] = useState<BilliardTable | null>(null);
  const [showAddTableModal, setShowAddTableModal] = useState<boolean>(false);
  const [newTableName, setNewTableName] = useState<string>('');
  const [newTableType, setNewTableType] = useState<string>('Bàn Bida');
  const [newTablePrice, setNewTablePrice] = useState<number>(80000);
  const [newTableZone, setNewTableZone] = useState<string>('Khu A');

  // Product Edit state
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Staff Edit state
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [showAddStaffModal, setShowAddStaffModal] = useState<boolean>(false);
  const [newStaffName, setNewStaffName] = useState<string>('');
  const [newStaffUsername, setNewStaffUsername] = useState<string>('');
  const [newStaffPassword, setNewStaffPassword] = useState<string>('123');
  const [newStaffRole, setNewStaffRole] = useState<'Manager' | 'Cashier' | 'Staff'>('Cashier');
  const [newStaffPhone, setNewStaffPhone] = useState<string>('');

  // Voucher Edit state
  const [showAddVoucherModal, setShowAddVoucherModal] = useState<boolean>(false);
  const [newVoucherCode, setNewVoucherCode] = useState<string>('');
  const [newVoucherAmount, setNewVoucherAmount] = useState<number>(50000);
  const [newVoucherMinOrder, setNewVoucherMinOrder] = useState<number>(200000);

  const isAdmin = activeStaff?.role === 'Manager';

  // --- HANDLERS FOR TABLES ---
  const handleBatchUpdateZonePrice = async () => {
    if (!batchPrice || batchPrice <= 0) {
      alert('Vui lòng nhập đơn giá giờ chơi hợp lệ!');
      return;
    }
    try {
      const res = await api.batchUpdateZonePrice(selectedZone, batchPrice);
      alert(`Thành công! Đã cập nhật giá ${formatVND(batchPrice)}/giờ cho tất cả các bàn khu ${selectedZone}.`);
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi cập nhật giá: ${err.message}`);
    }
  };

  const handleSaveTablePrice = async (table: BilliardTable) => {
    try {
      await api.updateTable(table.tableid, {
        tablename: table.tablename,
        hourlyprice: table.hourlyprice,
        zone: table.zone,
        tabletype: table.tabletype,
      });
      setEditingTable(null);
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi cập nhật bàn: ${err.message}`);
    }
  };

  const handleAddTableSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTableName) return;
    try {
      await api.addTable({
        tablename: newTableName,
        tabletype: newTableType,
        hourlyprice: newTablePrice,
        zone: newTableZone,
      });
      setShowAddTableModal(false);
      setNewTableName('');
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi thêm bàn: ${err.message}`);
    }
  };

  const handleDeleteTable = async (tableid: number) => {
    if (window.confirm(`Xác nhận xóa bàn #${tableid}?`)) {
      try {
        await api.deleteTable(tableid);
        onRefresh();
      } catch (err: any) {
        alert(`Không thể xóa: ${err.message}`);
      }
    }
  };

  // --- HANDLERS FOR PRODUCTS ---
  const handleSaveProductPrice = async (p: Product) => {
    try {
      await api.updateProduct(p.productid, {
        productname: p.productname,
        price: p.price,
        costprice: p.costprice,
        category: p.category,
        unit: p.unit,
      });
      setEditingProduct(null);
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi cập nhật giá sản phẩm: ${err.message}`);
    }
  };

  // --- HANDLERS FOR STAFFS ---
  const handleAddStaffSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName) return;
    try {
      await api.addStaff({
        fullname: newStaffName,
        username: newStaffUsername || newStaffName.toLowerCase().replace(/\s+/g, ''),
        password: newStaffPassword || '123',
        role: newStaffRole,
        phone: newStaffPhone || '0900000000',
        status: 'Active',
      });
      setShowAddStaffModal(false);
      setNewStaffName('');
      setNewStaffUsername('');
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi thêm nhân viên: ${err.message}`);
    }
  };

  const handleSaveStaff = async (staff: Staff) => {
    try {
      await api.updateStaff(staff.staffid, staff);
      setEditingStaff(null);
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi cập nhật nhân viên: ${err.message}`);
    }
  };

  const handleDeleteStaff = async (id: number) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa nhân viên này?')) {
      try {
        await api.deleteStaff(id);
        onRefresh();
      } catch (err: any) {
        alert(`Không thể xóa: ${err.message}`);
      }
    }
  };

  const zones = Array.from(new Set(tables.map((t) => t.zone || 'Khu A')));

  return (
    <div className="space-y-6">
      {/* Top Banner & Active Admin Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-850 to-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-400 flex items-center justify-center text-slate-950 font-black shadow-lg shadow-amber-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-extrabold text-white tracking-tight">Trung Tâm Quản Trị & Bảng Giá</h2>
              <span className="bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] uppercase font-extrabold px-2.5 py-0.5 rounded-full">
                Admin Panel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Tùy chỉnh giá giờ chơi, giá menu dịch vụ, danh sách nhân viên và hệ thống
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 bg-slate-950/80 px-4 py-2.5 rounded-2xl border border-slate-800/80 text-xs">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
          <span className="text-slate-400">Đang đăng nhập:</span>
          <span className="font-bold text-emerald-300">{activeStaff?.fullname || 'Nguyễn Văn Minh (Quản lý)'}</span>
          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-md">
            {activeStaff?.role || 'Manager'}
          </span>
        </div>
      </div>

      {!isAdmin && (
        <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center space-x-3 text-amber-300 text-xs">
          <Lock className="w-5 h-5 text-amber-400 shrink-0" />
          <span>
            Lưu ý: Bạn đang đăng nhập với vai trò <strong className="text-white">{activeStaff?.role || 'Nhân viên'}</strong>. Chỉ có tài khoản <strong className="text-amber-400">Quản lý (Manager / Admin)</strong> mới có quyền chỉnh sửa giá giờ, bảng giá dịch vụ và phân quyền.
          </span>
        </div>
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('tables')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'tables'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LayoutGrid className="w-4 h-4" />
          <span>Giá Bàn & Sơ Đồ Bàn</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'products'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Bảng Giá Thực Đơn Dịch Vụ</span>
        </button>

        <button
          onClick={() => setActiveTab('staffs')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'staffs'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Quản Lý Nhân Viên & Mật Khẩu</span>
        </button>

        <button
          onClick={() => setActiveTab('vouchers')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'vouchers'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Ticket className="w-4 h-4" />
          <span>Khuyến Mãi & Voucher</span>
        </button>

        <button
          onClick={() => setActiveTab('vip')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'vip'
              ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Giảm Giá Giờ Chơi VIP</span>
        </button>

        <button
          onClick={() => setActiveTab('supabase')}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold transition ${
            activeTab === 'supabase'
              ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
              : 'bg-slate-900 text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <Database className="w-4 h-4" />
          <span>Cơ Sở Dữ Liệu Supabase</span>
        </button>
      </div>

      {/* TAB 1: TABLES PRICE & CONFIGURATION */}
      {activeTab === 'tables' && (
        <div className="space-y-6">
          {/* Batch Price Updater Box */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-sm text-white">Chỉnh Giá Nhanh Theo Khu Vực (Batch Price Edit)</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Chọn Khu Vực</label>
                <select
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-100 text-xs rounded-xl px-3 py-2.5 outline-none focus:border-amber-500"
                >
                  <option value="ALL">-- Tất cả các khu vực --</option>
                  {zones.map((z) => (
                    <option key={z} value={z}>
                      {z}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1.5">Giá Giờ Mới (VND / Giờ)</label>
                <input
                  type="number"
                  step="5000"
                  value={batchPrice}
                  onChange={(e) => setBatchPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono text-xs font-bold rounded-xl px-3 py-2.5 outline-none focus:border-amber-500"
                />
              </div>

              <button
                onClick={handleBatchUpdateZonePrice}
                disabled={!isAdmin}
                className="py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl text-xs transition flex items-center justify-center space-x-1.5 shadow-md shadow-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="w-4 h-4" />
                <span>Cập Nhật Giá Khu Này</span>
              </button>
            </div>
          </div>

          {/* Table List with individual edit */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <LayoutGrid className="w-5 h-5 text-teal-400" />
                <h3 className="font-bold text-sm text-white">Bảng Giá Chi Tiết Từng Bàn ({tables.length} Bàn)</h3>
              </div>
              <button
                onClick={() => setShowAddTableModal(true)}
                disabled={!isAdmin}
                className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 disabled:opacity-50"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Thêm Bàn Mới</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tables.map((t) => {
                const isEditing = editingTable?.tableid === t.tableid;
                const current = isEditing ? editingTable! : t;

                return (
                  <div
                    key={t.tableid}
                    className={`p-4 rounded-2xl border transition ${
                      isEditing
                        ? 'bg-slate-950 border-amber-500 shadow-lg shadow-amber-500/10'
                        : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-sm text-white">{current.tablename}</span>
                        <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-md font-semibold">
                          {current.zone || 'Khu A'}
                        </span>
                      </div>
                      <span className="text-[10px] bg-teal-500/10 text-teal-300 border border-teal-500/20 px-2 py-0.5 rounded-full font-bold">
                        {current.tabletype}
                      </span>
                    </div>

                    {isEditing ? (
                      <div className="space-y-2 mt-3 text-xs">
                        <div>
                          <label className="text-[10px] text-slate-400">Tên bàn:</label>
                          <input
                            type="text"
                            value={current.tablename}
                            onChange={(e) => setEditingTable({ ...current, tablename: e.target.value })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-semibold text-xs"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-slate-400">Giá giờ chơi (VND):</label>
                          <input
                            type="number"
                            step="1000"
                            value={current.hourlyprice}
                            onChange={(e) => setEditingTable({ ...current, hourlyprice: Number(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 text-amber-300 font-mono font-bold rounded-lg px-2.5 py-1.5 text-xs"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <label className="text-[10px] text-slate-400">Khu vực:</label>
                            <input
                              type="text"
                              value={current.zone || ''}
                              onChange={(e) => setEditingTable({ ...current, zone: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-slate-400">Loại bàn:</label>
                            <input
                              type="text"
                              value={current.tabletype}
                              onChange={(e) => setEditingTable({ ...current, tabletype: e.target.value })}
                              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white text-xs"
                            />
                          </div>
                        </div>

                        <div className="flex items-center space-x-2 pt-2">
                          <button
                            onClick={() => handleSaveTablePrice(current)}
                            className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
                          >
                            Lưu Giá Bàn
                          </button>
                          <button
                            onClick={() => setEditingTable(null)}
                            className="py-1.5 px-3 bg-slate-800 text-slate-300 rounded-xl text-xs hover:bg-slate-700"
                          >
                            Hủy
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-slate-800/80">
                        <div>
                          <div className="text-[10px] text-slate-400 uppercase tracking-wider">Đơn giá giờ</div>
                          <div className="font-mono font-black text-amber-300 text-sm">
                            {formatVND(t.hourlyprice)} / giờ
                          </div>
                        </div>

                        <div className="flex items-center space-x-1.5">
                          <button
                            onClick={() => setEditingTable(t)}
                            disabled={!isAdmin}
                            className="p-1.5 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 rounded-lg transition disabled:opacity-40"
                            title="Sửa giá bàn"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteTable(t.tableid)}
                            disabled={!isAdmin}
                            className="p-1.5 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg transition disabled:opacity-40"
                            title="Xóa bàn"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: PRODUCT MENU & PRICES */}
      {activeTab === 'products' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Chỉnh Giá Bán & Giá Vốn Thực Đơn</h3>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Món / Dịch vụ</th>
                  <th className="p-3">Danh mục</th>
                  <th className="p-3">Đơn vị</th>
                  <th className="p-3">Giá bán hiện tại</th>
                  <th className="p-3">Giá vốn (Cost)</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {products.map((p) => {
                  const isEditing = editingProduct?.productid === p.productid;
                  const current = isEditing ? editingProduct! : p;

                  return (
                    <tr key={p.productid} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={current.productname}
                            onChange={(e) => setEditingProduct({ ...current, productname: e.target.value })}
                            className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white text-xs w-full"
                          />
                        ) : (
                          p.productname
                        )}
                      </td>
                      <td className="p-3">{p.category}</td>
                      <td className="p-3">{p.unit}</td>
                      <td className="p-3 font-mono font-bold text-amber-300">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1000"
                            value={current.price}
                            onChange={(e) => setEditingProduct({ ...current, price: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-700 text-amber-300 px-2 py-1 rounded text-xs font-mono font-bold w-28"
                          />
                        ) : (
                          formatVND(p.price)
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-400">
                        {isEditing ? (
                          <input
                            type="number"
                            step="1000"
                            value={current.costprice || 0}
                            onChange={(e) => setEditingProduct({ ...current, costprice: Number(e.target.value) })}
                            className="bg-slate-950 border border-slate-700 text-slate-200 px-2 py-1 rounded text-xs font-mono w-28"
                          />
                        ) : (
                          formatVND(p.costprice || 0)
                        )}
                      </td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleSaveProductPrice(current)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingProduct(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setEditingProduct(p)}
                            disabled={!isAdmin}
                            className="px-3 py-1 bg-slate-800 hover:bg-amber-500/20 hover:text-amber-300 text-slate-300 border border-slate-700 rounded-lg text-xs font-semibold transition disabled:opacity-40"
                          >
                            Sửa giá
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: STAFF MANAGEMENT */}
      {activeTab === 'staffs' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-sm text-white">Danh Sách Nhân Viên & Mã PIN Mật Khẩu</h3>
            </div>
            <button
              onClick={() => setShowAddStaffModal(true)}
              disabled={!isAdmin}
              className="bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center space-x-1 disabled:opacity-50"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Thêm Nhân Viên</span>
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                <tr>
                  <th className="p-3">Tên nhân viên</th>
                  <th className="p-3">Tài khoản (Username)</th>
                  <th className="p-3">Chức vụ (Role)</th>
                  <th className="p-3">Mật khẩu / PIN</th>
                  <th className="p-3">Số điện thoại</th>
                  <th className="p-3 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {staffs.map((s) => {
                  const isEditing = editingStaff?.staffid === s.staffid;
                  const current = isEditing ? editingStaff! : s;

                  return (
                    <tr key={s.staffid} className="hover:bg-slate-800/40 transition">
                      <td className="p-3 font-semibold text-white">
                        {isEditing ? (
                          <input
                            type="text"
                            value={current.fullname}
                            onChange={(e) => setEditingStaff({ ...current, fullname: e.target.value })}
                            className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white text-xs w-full"
                          />
                        ) : (
                          s.fullname
                        )}
                      </td>
                      <td className="p-3 font-mono text-indigo-300">{s.username || 'N/A'}</td>
                      <td className="p-3">
                        {isEditing ? (
                          <select
                            value={current.role}
                            onChange={(e) => setEditingStaff({ ...current, role: e.target.value as any })}
                            className="bg-slate-950 border border-slate-700 px-2 py-1 rounded text-white text-xs"
                          >
                            <option value="Manager">Manager (Quản lý)</option>
                            <option value="Cashier">Cashier (Thu ngân)</option>
                            <option value="Staff">Staff (Phục vụ)</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                              s.role === 'Manager'
                                ? 'bg-amber-500/10 text-amber-300 border-amber-500/20'
                                : s.role === 'Cashier'
                                ? 'bg-indigo-500/10 text-indigo-300 border-indigo-500/20'
                                : 'bg-slate-800 text-slate-300 border-slate-700'
                            }`}
                          >
                            {s.role}
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-mono text-emerald-400">
                        {isEditing ? (
                          <input
                            type="text"
                            value={current.password || '123'}
                            onChange={(e) => setEditingStaff({ ...current, password: e.target.value })}
                            className="bg-slate-950 border border-slate-700 text-emerald-400 font-mono px-2 py-1 rounded text-xs w-24"
                          />
                        ) : (
                          s.password || '123'
                        )}
                      </td>
                      <td className="p-3 font-mono text-slate-400">{s.phone}</td>
                      <td className="p-3 text-right">
                        {isEditing ? (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => handleSaveStaff(current)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold hover:bg-emerald-500"
                            >
                              Lưu
                            </button>
                            <button
                              onClick={() => setEditingStaff(null)}
                              className="px-2 py-1 bg-slate-800 text-slate-300 rounded-lg text-xs hover:bg-slate-700"
                            >
                              Hủy
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-end space-x-1">
                            <button
                              onClick={() => setEditingStaff(s)}
                              disabled={!isAdmin}
                              className="px-2.5 py-1 bg-slate-800 hover:bg-indigo-500/20 hover:text-indigo-300 text-slate-300 border border-slate-700 rounded-lg text-xs transition disabled:opacity-40"
                            >
                              Sửa
                            </button>
                            <button
                              onClick={() => handleDeleteStaff(s.staffid)}
                              disabled={!isAdmin}
                              className="p-1 bg-slate-800 hover:bg-rose-500/20 hover:text-rose-400 text-slate-400 rounded-lg transition disabled:opacity-40"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: VOUCHERS */}
      {activeTab === 'vouchers' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-purple-400" />
              <h3 className="font-bold text-sm text-white">Danh Sách Mã Giảm Giá & Voucher</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {vouchers.map((v) => (
              <div key={v.voucherid} className="p-4 bg-slate-950 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-purple-400 text-sm bg-purple-500/10 border border-purple-500/20 px-2.5 py-1 rounded-lg">
                    {v.vouchercode}
                  </span>
                  <span className="text-[10px] text-slate-400">Hạn: {v.expirydate || 'Vô thời hạn'}</span>
                </div>
                <div className="pt-2 text-xs border-t border-slate-800/80 space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Số tiền giảm:</span>
                    <span className="font-bold text-emerald-400">{formatVND(v.discountamount)}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Áp dụng đơn từ:</span>
                    <span className="font-mono">{formatVND(v.minordervalue)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: VIP DISCOUNT RATES CONFIGURATION */}
      {activeTab === 'vip' && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6 shadow-lg">
          <div className="flex items-center justify-between border-b border-slate-800 pb-4">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Cấu Hình % Giảm Giá Giờ Chơi Theo Cấp VIP</h3>
                <p className="text-xs text-slate-400">
                  Tự động chiết khấu tiền giờ chơi khi mở bàn hoặc thanh toán cho khách hàng thành viên.
                </p>
              </div>
            </div>

            <button
              onClick={handleSaveVipRates}
              disabled={savingVip || !isAdmin}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition shadow-lg ${
                isAdmin
                  ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 shadow-amber-500/20'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{savingVip ? 'Đang lưu...' : 'Lưu Cấu Hình VIP'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { tier: 'Bronze', label: 'Hạng Đồng (Bronze)', color: 'from-amber-700/30 to-amber-900/30 border-amber-700/50 text-amber-300' },
              { tier: 'Silver', label: 'Hạng Bạc (Silver)', color: 'from-slate-700/30 to-slate-900/30 border-slate-500/50 text-slate-200' },
              { tier: 'Gold', label: 'Hạng Vàng (Gold)', color: 'from-amber-500/20 to-yellow-600/20 border-yellow-500/50 text-yellow-300' },
              { tier: 'Platinum', label: 'Bạch Kim (Platinum)', color: 'from-cyan-500/20 to-blue-600/20 border-cyan-500/50 text-cyan-300' },
              { tier: 'Diamond', label: 'Kim Cương (Diamond)', color: 'from-purple-500/20 to-pink-600/20 border-purple-500/50 text-purple-300' },
            ].map((item) => (
              <div
                key={item.tier}
                className={`p-4 rounded-2xl border bg-gradient-to-b ${item.color} space-y-3 flex flex-col justify-between`}
              >
                <div>
                  <span className="text-xs font-black uppercase tracking-wider block">{item.label}</span>
                  <span className="text-[10px] text-slate-400">Giảm giá tiền giờ bàn</span>
                </div>

                <div className="space-y-1">
                  <label className="block text-[11px] font-semibold text-slate-300">% Giảm Giá</label>
                  <div className="relative flex items-center">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      disabled={!isAdmin}
                      value={vipRates[item.tier] ?? 0}
                      onChange={(e) =>
                        setVipRates({
                          ...vipRates,
                          [item.tier]: Number(e.target.value),
                        })
                      }
                      className="w-full bg-slate-950/80 border border-slate-700/80 rounded-xl px-3 py-2 text-white font-mono font-bold text-sm focus:border-amber-400 outline-none pr-8"
                    />
                    <span className="absolute right-3 text-xs font-bold text-amber-400">%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!isAdmin && (
            <p className="text-xs text-rose-400 font-semibold bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">
              🔒 Tài khoản của bạn không có quyền Quản lý. Vui lòng đăng nhập tài khoản Manager/Admin để thay đổi tỷ lệ giảm giá VIP.
            </p>
          )}
        </div>
      )}

      {/* ADD TABLE MODAL */}
      {showAddTableModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-slate-100">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">Thêm Bàn Bida Mới</h3>
            <form onSubmit={handleAddTableSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Tên Bàn</label>
                <input
                  type="text"
                  required
                  value={newTableName}
                  onChange={(e) => setNewTableName(e.target.value)}
                  placeholder="VD: Bàn 13, Bàn VIP 2..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Khu Vực</label>
                <input
                  type="text"
                  value={newTableZone}
                  onChange={(e) => setNewTableZone(e.target.value)}
                  placeholder="Khu A, Khu B, VIP..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Đơn Giá Giờ (VND)</label>
                <input
                  type="number"
                  step="5000"
                  value={newTablePrice}
                  onChange={(e) => setNewTablePrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 text-amber-300 font-mono font-bold rounded-xl px-3 py-2"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddTableModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-emerald-600 text-white font-bold rounded-xl hover:bg-emerald-500"
                >
                  Thêm Bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADD STAFF MODAL */}
      {showAddStaffModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full space-y-4 text-slate-100">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">Thêm Nhân Viên Mới</h3>
            <form onSubmit={handleAddStaffSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Họ và Tên Nhân Viên</label>
                <input
                  type="text"
                  required
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  placeholder="Nguyễn Văn A..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Tên Đăng Nhập (Username)</label>
                <input
                  type="text"
                  value={newStaffUsername}
                  onChange={(e) => setNewStaffUsername(e.target.value)}
                  placeholder="nhanvien1..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-indigo-300 font-mono"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Mật Khẩu / Mã PIN</label>
                <input
                  type="text"
                  value={newStaffPassword}
                  onChange={(e) => setNewStaffPassword(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-emerald-400 font-mono rounded-xl px-3 py-2"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Chức Vụ (Role)</label>
                <select
                  value={newStaffRole}
                  onChange={(e) => setNewStaffRole(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
                >
                  <option value="Manager">Quản lý (Admin - Sửa giá)</option>
                  <option value="Cashier">Thu ngân (Cashier - Tính tiền)</option>
                  <option value="Staff">Phục vụ (Staff - Mở món)</option>
                </select>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Số Điện Thoại</label>
                <input
                  type="text"
                  value={newStaffPhone}
                  onChange={(e) => setNewStaffPhone(e.target.value)}
                  placeholder="09..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white font-mono"
                />
              </div>
              <div className="flex space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddStaffModal(false)}
                  className="flex-1 py-2 bg-slate-800 text-slate-300 rounded-xl font-semibold"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-500"
                >
                  Thêm Nhân Viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* TAB 6: SUPABASE DATABASE CONFIG & SQL SCHEMA */}
      {activeTab === 'supabase' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-2xl">
                  <Database className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base text-white">Kết Nối Cơ Sở Dữ Liệu Supabase</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Tất cả dữ liệu nhập vào (Bàn bida, Hóa đơn, Thực đơn, Khách hàng, Đặt bàn) được đồng bộ trực tiếp với Supabase
                  </p>
                </div>
              </div>

              <button
                onClick={handleCheckSupabase}
                disabled={checkingSupabase}
                className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-4 py-2.5 rounded-xl text-xs font-bold transition shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${checkingSupabase ? 'animate-spin' : ''}`} />
                <span>{checkingSupabase ? 'Đang kiểm tra...' : 'Kiểm tra kết nối'}</span>
              </button>
            </div>

            {/* Status Card */}
            {supabaseStatus && (
              <div
                className={`p-4 rounded-2xl border flex items-start space-x-3 text-xs ${
                  supabaseStatus.connected
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300'
                    : 'bg-amber-500/10 border-amber-500/20 text-amber-300'
                }`}
              >
                {supabaseStatus.connected ? (
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                )}
                <div className="space-y-1">
                  <p className="font-bold text-sm">{supabaseStatus.message}</p>
                  <p className="text-[11px] opacity-80">
                    URL Supabase: <span className="font-mono text-white">{supabaseStatus.url}</span>
                  </p>
                  {supabaseStatus.tablesCheck && (
                    <div className="mt-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-xl space-y-1">
                      <div>Kiểm tra bảng staffs: <span className="text-emerald-400">{supabaseStatus.tablesCheck.staffs}</span></div>
                      <div>Kiểm tra bảng tables: <span className="text-emerald-400">{supabaseStatus.tablesCheck.tables}</span></div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Step-by-step Guide */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 space-y-3">
              <h4 className="font-bold text-sm text-amber-400 flex items-center space-x-2">
                <Sparkles className="w-4 h-4" />
                <span>Hướng dẫn thiết lập bảng Database trên Supabase:</span>
              </h4>
              <ol className="list-decimal list-inside text-xs text-slate-300 space-y-2 leading-relaxed">
                <li>Truy cập vào trang quản trị Supabase Project của bạn.</li>
                <li>Mở mục <strong className="text-white font-semibold">SQL Editor</strong> ở thanh menu bên trái.</li>
                <li>Nhấn nút <strong className="text-amber-400">"Sao chép SQL Schema"</strong> bên dưới để copy toàn bộ bảng chuẩn.</li>
                <li>Dán (Paste) mã SQL vào khung soạn thảo của Supabase SQL Editor và nhấn <strong className="text-emerald-400 font-bold">RUN</strong>.</li>
                <li>Tất cả dữ liệu nhập vào từ quán Bida của bạn giờ đây sẽ được lưu trữ và đồng bộ tức thì trên Supabase!</li>
              </ol>
            </div>

            {/* SQL Code Box with Copy Button */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 flex items-center space-x-2">
                  <Layers className="w-4 h-4 text-emerald-400" />
                  <span>Mã SQL Tạo Bảng Chuẩn Supabase (supabase-schema.sql)</span>
                </span>
                <button
                  onClick={handleCopySql}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-bold transition shadow-lg ${
                    copiedSql
                      ? 'bg-emerald-500 text-slate-950'
                      : 'bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950'
                  }`}
                >
                  {copiedSql ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedSql ? 'Đã sao chép SQL!' : 'Sao chép SQL Schema'}</span>
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800/80 rounded-2xl p-4 text-[11px] font-mono text-emerald-400/90 overflow-x-auto max-h-96 leading-relaxed select-all">
                  {SQL_SCHEMA_CODE}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
