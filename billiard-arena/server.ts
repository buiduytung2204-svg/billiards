import express from 'express';
import cors from 'cors';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { db } from './src/backend/db';

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

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
  app.post('/api/tables/:id/open', (req, res) => {
    try {
      const tableId = parseInt(req.params.id, 10);
      const { customerid, staffid } = req.body;
      const invoice = db.openTable(tableId, customerid, staffid || 2);
      res.json({ success: true, message: 'Mở bàn thành công!', data: invoice });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Hủy mở bàn (Cancel open table)
  app.post('/api/tables/:id/cancel', (req, res) => {
    try {
      const tableId = parseInt(req.params.id, 10);
      const updatedTable = db.cancelOpenTable(tableId);
      res.json({ success: true, message: 'Hủy mở bàn thành công!', data: updatedTable });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Thêm dịch vụ / đồ ăn vào bàn
  app.post('/api/tables/add-service', (req, res) => {
    try {
      const { invoiceid, productid, quantity } = req.body;
      const updatedInvoice = db.addServiceToTable(invoiceid, productid, quantity || 1);
      res.json({ success: true, message: 'Thêm dịch vụ thành công!', data: updatedInvoice });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Giảm dịch vụ
  app.post('/api/tables/remove-service', (req, res) => {
    try {
      const { invoiceid, detailid, quantity } = req.body;
      const updatedInvoice = db.removeServiceFromTable(invoiceid, detailid, quantity || 1);
      res.json({ success: true, message: 'Cập nhật dịch vụ thành công!', data: updatedInvoice });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  // Thanh toán đóng bàn (Checkout)
  app.post('/api/tables/:id/checkout', (req, res) => {
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

  app.post('/api/products', (req, res) => {
    try {
      const newProduct = db.addProduct(req.body);
      res.json({ success: true, message: 'Thêm sản phẩm thành công!', data: newProduct });
    } catch (err: any) {
      res.status(400).json({ success: false, error: err.message });
    }
  });

  app.put('/api/products/:id', (req, res) => {
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

  // 5. VOUCHERS
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

  // Vite Integration (Dev Mode vs Prod Mode)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🎱 Billiard Club POS Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
