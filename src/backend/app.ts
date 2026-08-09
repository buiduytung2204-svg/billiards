import express from 'express';
import cors from 'cors';
import { db } from './db.js';

export const app = express();

app.use(cors());
app.use(express.json());

// Helper Middleware: Require Manager / Admin role
const requireManager = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const role = req.headers['x-staff-role'];
  if (role !== 'Manager') {
    return res.status(403).json({
      success: false,
      error: 'Quyền truy cập bị từ chối! Chỉ tài khoản Quản lý (Admin / Manager) mới có quyền chỉnh sửa giá, sản phẩm hoặc nhân viên.',
    });
  }
  next();
};

// Helper Middleware: Require Staff or Manager logged in
const requireStaffAuth = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const role = req.headers['x-staff-role'];
  if (!role || role === 'None' || role === 'Guest' || role === 'undefined' || role === 'null') {
    return res.status(401).json({
      success: false,
      error: 'Vui lòng đăng nhập tài khoản Nhân viên / Quản lý để mở bàn hoặc thực hiện giao dịch!',
    });
  }
  next();
};

// --- RESTful API ENDPOINTS ---

// 1. TABLES & POS
app.get('/api/tables', (req, res) => {
  try {
    const tables = db.getTables();
    // Attach active invoice info for playing tables
    const result = tables.map((t) => {
      const activeInvoice = t.current_invoice_id ? db.getInvoiceById(t.current_invoice_id) : undefined;
      return {
        ...t,
        activeInvoice: activeInvoice || null,
      };
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mở bàn (Start time)
app.post('/api/tables/:id/open', requireStaffAuth, (req, res) => {
  try {
    const tableId = parseInt(req.params.id, 10);
    const { customerid, staffid } = req.body;
    const invoice = db.openTable(tableId, customerid, staffid || 1);
    res.json({ success: true, message: 'Mở bàn thành công!', data: invoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Hủy mở bàn (Cancel open table)
app.post('/api/tables/:id/cancel', requireStaffAuth, (req, res) => {
  try {
    const tableId = parseInt(req.params.id, 10);
    const updatedTable = db.cancelOpenTable(tableId);
    res.json({ success: true, message: 'Hủy mở bàn thành công!', data: updatedTable });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Thêm dịch vụ / đồ ăn vào bàn
app.post('/api/tables/add-service', requireStaffAuth, (req, res) => {
  try {
    const { invoiceid, productid, quantity } = req.body;
    const updatedInvoice = db.addServiceToTable(invoiceid, productid, quantity || 1);
    res.json({ success: true, message: 'Thêm dịch vụ thành công!', data: updatedInvoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Giảm dịch vụ
app.post('/api/tables/remove-service', requireStaffAuth, (req, res) => {
  try {
    const { invoiceid, detailid, quantity } = req.body;
    const updatedInvoice = db.removeServiceFromTable(invoiceid, detailid, quantity || 1);
    res.json({ success: true, message: 'Cập nhật dịch vụ thành công!', data: updatedInvoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Thanh toán đóng bàn (Checkout)
app.post('/api/tables/:id/checkout', requireStaffAuth, (req, res) => {
  try {
    const { invoiceid, customerid, vouchercode, paymentmethod, staffid } = req.body;
    const completedInvoice = db.checkoutTable({
      invoiceid,
      customerid,
      vouchercode,
      paymentmethod: paymentmethod || 'Cash',
      staffid,
    });
    res.json({ success: true, message: 'Thanh toán thành công!', data: completedInvoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 2. PRODUCTS & INVENTORY (KIOTVIET STYLE)
app.get('/api/products', (req, res) => {
  try {
    const products = db.getProducts();
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/products', requireManager, (req, res) => {
  try {
    const newProduct = db.addProduct(req.body);
    res.json({ success: true, message: 'Thêm sản phẩm thành công!', data: newProduct });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/products/:id', requireManager, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = db.updateProduct(id, req.body);
    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/stock/import', (req, res) => {
  try {
    const { productid, quantity, costprice, note } = req.body;
    const tx = db.importStock(productid, quantity, costprice, note);
    res.json({ success: true, message: 'Nhập kho thành công!', data: tx });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/stock/transactions', (req, res) => {
  try {
    const txs = db.getStockTransactions();
    res.json({ success: true, data: txs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CUSTOMERS (CRM)
app.get('/api/customers', (req, res) => {
  try {
    const customers = db.getCustomers();
    res.json({ success: true, data: customers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/customers', (req, res) => {
  try {
    const customer = db.addCustomer(req.body);
    res.json({ success: true, message: 'Thêm khách hàng mới thành công!', data: customer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. BOOKINGS
app.get('/api/bookings', (req, res) => {
  try {
    const bookings = db.getBookings();
    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/bookings', (req, res) => {
  try {
    const booking = db.addBooking(req.body);
    res.json({ success: true, message: 'Đặt bàn thành công!', data: booking });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/bookings/:id/cancel', (req, res) => {
  try {
    const booking = db.cancelBooking(Number(req.params.id));
    res.json({ success: true, message: 'Hủy đặt bàn thành công!', data: booking });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// VIP DISCOUNT RATES CONFIG
app.get('/api/vip-rates', (req, res) => {
  try {
    res.json({ success: true, data: db.getVipDiscountRates() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/vip-rates', requireManager, (req, res) => {
  try {
    const updated = db.updateVipDiscountRates(req.body);
    res.json({ success: true, message: 'Cập nhật cấu hình % giảm giá VIP thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 0. AUTHENTICATION & STAFFS
app.post('/api/auth/login', (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = db.loginStaff(username, password);
    res.json({ success: true, message: 'Đăng nhập thành công!', data: staff });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/staffs', (req, res) => {
  try {
    res.json({ success: true, data: db.getStaffs() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/staffs', requireManager, (req, res) => {
  try {
    const newStaff = db.addStaff(req.body);
    res.json({ success: true, message: 'Thêm nhân viên thành công!', data: newStaff });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.put('/api/staffs/:id', requireManager, (req, res) => {
  try {
    const updated = db.updateStaff(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Cập nhật nhân viên thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/staffs/:id', requireManager, (req, res) => {
  try {
    const success = db.deleteStaff(Number(req.params.id));
    res.json({ success: true, message: 'Xóa nhân viên thành công!', data: { deleted: success } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// TABLE EDITING & ADMIN CONTROLS
app.put('/api/tables/:id', requireManager, (req, res) => {
  try {
    const updated = db.updateTable(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Bàn không tồn tại' });
    res.json({ success: true, message: 'Cập nhật bàn thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/tables/batch-zone-price', requireManager, (req, res) => {
  try {
    const { zone, hourlyprice } = req.body;
    const count = db.batchUpdateZonePrice(zone, Number(hourlyprice));
    res.json({ success: true, message: `Đã cập nhật giá cho ${count} bàn thuộc ${zone || 'tất cả các khu'}!`, data: { updatedCount: count } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.post('/api/tables', requireManager, (req, res) => {
  try {
    const newTable = db.addTable(req.body);
    res.json({ success: true, message: 'Thêm bàn mới thành công!', data: newTable });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.delete('/api/tables/:id', requireManager, (req, res) => {
  try {
    const deleted = db.deleteTable(Number(req.params.id));
    res.json({ success: true, message: 'Đã xóa bàn thành công!', data: { deleted } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

app.get('/api/vouchers', (req, res) => {
  try {
    res.json({ success: true, data: db.getVouchers() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.get('/api/vouchers/check/:code', (req, res) => {
  try {
    const voucher = db.getVoucherByCode(req.params.code);
    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }
    res.json({ success: true, data: voucher });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. INVOICES
app.get('/api/invoices', (req, res) => {
  try {
    res.json({ success: true, data: db.getInvoices() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. STATS & RESET
app.get('/api/stats', (req, res) => {
  try {
    res.json({ success: true, data: db.getDashboardStats() });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

app.post('/api/db/reset', (req, res) => {
  try {
    db.resetData();
    res.json({ success: true, message: 'Khôi phục dữ liệu mẫu thành công!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. SUPABASE CONNECTION CHECK
app.get('/api/supabase/status', async (req, res) => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://vmeehkajgihyiwciotfd.supabase.co';
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-Y-4HsqRHl8ib38sVFb8gg_kMdc8GzP';
    
    const { createClient } = await import('@supabase/supabase-js');
    const client = createClient(supabaseUrl, supabaseKey);

    // Attempt a simple ping request to Supabase API
    const { data, error } = await client.from('todos').select('*').limit(1);

    res.json({
      success: !error,
      url: supabaseUrl,
      connected: !error,
      data: data || [],
      error: error ? error.message : null,
      message: !error ? 'Kết nối tới Supabase thành công!' : `Supabase phản hồi nhưng có lỗi: ${error.message}`
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message,
      message: `Lỗi kết nối Supabase: ${err.message}`
    });
  }
});
