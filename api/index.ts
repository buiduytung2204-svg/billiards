import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

// --- SUPABASE CLIENT SETUP ---
const SUPABASE_URL = process.env.VITE_SUPABASE_URL || 'https://vmeehkajgihyiwciotfd.supabase.co';
const SUPABASE_KEY = process.env.VITE_SUPABASE_ANON_KEY || 'sb_publishable_-Y-4HsqRHl8ib38sVFb8gg_kMdc8GzP';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// --- TYPES & INTERFACES ---
export interface Customer {
  customerid: number;
  fullname: string;
  phone: string;
  email?: string;
  point: number;
  createdat: string;
  membershiptier: 'Bronze' | 'Silver' | 'Gold' | 'Platinum';
  totalspent: number;
}

export enum TableStatus {
  EMPTY = 'EMPTY',
  PLAYING = 'PLAYING',
  RESERVED = 'RESERVED',
  MAINTENANCE = 'MAINTENANCE',
}

export interface BilliardTable {
  tableid: number;
  tablename: string;
  tabletype: string;
  hourlyprice: number;
  status: TableStatus;
  zone: string;
  current_invoice_id?: number | null;
}

export interface Product {
  productid: number;
  productname: string;
  category: 'Nước uống' | 'Đồ ăn' | 'Thuốc lá' | 'Dịch vụ khác' | 'Phụ kiện';
  price: number;
  costprice: number;
  unit: string;
  stock: number;
  minstock: number;
  isactive: boolean;
}

export interface Staff {
  staffid: number;
  username: string;
  password?: string;
  fullname: string;
  role: 'Manager' | 'Staff';
  phone: string;
  status: 'Active' | 'Inactive';
}

export interface Voucher {
  voucherid: number;
  vouchercode: string;
  discountamount: number;
  discounttype: 'Fixed' | 'Percent';
  minordervalue: number;
  expirydate: string;
}

export interface Booking {
  bookingid: number;
  customername: string;
  customerphone: string;
  tableid: number;
  bookingtime: string;
  note?: string;
  status: 'Confirmed' | 'Cancelled' | 'Completed';
}

export interface InvoiceDetail {
  detailid: number;
  invoiceid: number;
  productid: number;
  productname: string;
  quantity: number;
  unitprice: number;
  totalprice: number;
}

export interface Invoice {
  invoiceid: number;
  tableid: number;
  customerid?: number;
  staffid: number;
  starttime: string;
  endtime?: string;
  playtime_minutes: number;
  tablefee: number;
  servicefee: number;
  discountamount: number;
  totalamount: number;
  status: 'Playing' | 'Paid' | 'Cancelled';
  paymentmethod: 'Cash' | 'Transfer' | 'Card';
  createdat: string;
  details: InvoiceDetail[];
}

export interface StockTransaction {
  txid: number;
  productid: number;
  productname: string;
  type: 'IMPORT' | 'EXPORT_SALE';
  quantity: number;
  costprice: number;
  createdat: string;
  note?: string;
}

// --- INITIAL FALLBACK DATA ---
const INITIAL_STAFFS: Staff[] = [
  { staffid: 1, username: 'admin', password: '123', fullname: 'Nguyễn Văn Minh (Quản lý)', role: 'Manager', phone: '0901234567', status: 'Active' },
];

const INITIAL_CUSTOMERS: Customer[] = [
  { customerid: 1, fullname: 'Phạm Đức Anh', phone: '0988111222', email: 'ducanh@gmail.com', point: 320, createdat: '2026-01-15T08:00:00Z', membershiptier: 'Gold', totalspent: 4800000 },
  { customerid: 2, fullname: 'Nguyễn Thanh Tùng', phone: '0977333444', email: 'thanhtung@gmail.com', point: 150, createdat: '2026-02-10T10:30:00Z', membershiptier: 'Silver', totalspent: 2100000 },
  { customerid: 3, fullname: 'Vũ Quốc Bảo', phone: '0966555666', email: 'quocbao@billiard.vn', point: 650, createdat: '2025-11-20T14:15:00Z', membershiptier: 'Platinum', totalspent: 11500000 },
  { customerid: 4, fullname: 'Hoàng Trọng Nghĩa', phone: '0933888999', email: 'trongnghia@yahoo.com', point: 45, createdat: '2026-03-01T09:00:00Z', membershiptier: 'Bronze', totalspent: 650000 },
];

const INITIAL_TABLES: BilliardTable[] = [
  { tableid: 1, tablename: 'Bàn 1', tabletype: 'Bàn Bida', hourlyprice: 70000, status: TableStatus.EMPTY, zone: 'Khu A' },
  { tableid: 2, tablename: 'Bàn 2', tabletype: 'Bàn Bida', hourlyprice: 70000, status: TableStatus.EMPTY, zone: 'Khu A' },
  { tableid: 3, tablename: 'Bàn 3', tabletype: 'Bàn Bida', hourlyprice: 70000, status: TableStatus.EMPTY, zone: 'Khu A' },
  { tableid: 4, tablename: 'Bàn 4', tabletype: 'Bàn Bida', hourlyprice: 70000, status: TableStatus.EMPTY, zone: 'Khu A' },
  { tableid: 5, tablename: 'Bàn 5', tabletype: 'Bàn Bida', hourlyprice: 80000, status: TableStatus.EMPTY, zone: 'Khu B' },
  { tableid: 6, tablename: 'Bàn 6', tabletype: 'Bàn Bida', hourlyprice: 80000, status: TableStatus.EMPTY, zone: 'Khu B' },
  { tableid: 7, tablename: 'Bàn 7', tabletype: 'Bàn Bida', hourlyprice: 80000, status: TableStatus.EMPTY, zone: 'Khu B' },
  { tableid: 8, tablename: 'Bàn 8', tabletype: 'Bàn Bida', hourlyprice: 80000, status: TableStatus.EMPTY, zone: 'Khu B' },
  { tableid: 9, tablename: 'Bàn 9', tabletype: 'Bàn Bida', hourlyprice: 120000, status: TableStatus.EMPTY, zone: 'Phòng VIP' },
  { tableid: 10, tablename: 'Bàn 10', tabletype: 'Bàn Bida', hourlyprice: 120000, status: TableStatus.EMPTY, zone: 'Phòng VIP' },
  { tableid: 11, tablename: 'Bàn 11', tabletype: 'Bàn Bida', hourlyprice: 120000, status: TableStatus.EMPTY, zone: 'Phòng VIP' },
  { tableid: 12, tablename: 'Bàn 12', tabletype: 'Bàn Bida', hourlyprice: 150000, status: TableStatus.EMPTY, zone: 'Phòng VIP' },
];

const INITIAL_PRODUCTS: Product[] = [
  { productid: 1, productname: 'Cà phê đá', category: 'Nước uống', price: 25000, costprice: 8000, unit: 'Ly', stock: 150, minstock: 20, isactive: true },
  { productid: 2, productname: 'Cà phê sữa đá', category: 'Nước uống', price: 30000, costprice: 10000, unit: 'Ly', stock: 140, minstock: 20, isactive: true },
  { productid: 3, productname: 'Sting đỏ / dâu', category: 'Nước uống', price: 20000, costprice: 9000, unit: 'Chai', stock: 85, minstock: 24, isactive: true },
  { productid: 4, productname: 'RedBull Thái', category: 'Nước uống', price: 25000, costprice: 12000, unit: 'Lon', stock: 60, minstock: 12, isactive: true },
  { productid: 5, productname: 'Nước suối Aquafina 500ml', category: 'Nước uống', price: 12000, costprice: 4500, unit: 'Chai', stock: 200, minstock: 30, isactive: true },
  { productid: 6, productname: 'Mì xào bò đặc biệt', category: 'Đồ ăn', price: 45000, costprice: 22000, unit: 'Đĩa', stock: 40, minstock: 10, isactive: true },
  { productid: 7, productname: 'Cơm chiên hải sản', category: 'Đồ ăn', price: 50000, costprice: 25000, unit: 'Đĩa', stock: 35, minstock: 10, isactive: true },
  { productid: 8, productname: 'Cá viên chiên bida set', category: 'Đồ ăn', price: 35000, costprice: 15000, unit: 'Đĩa', stock: 50, minstock: 15, isactive: true },
  { productid: 9, productname: 'Thuốc lá 555 Ngoại', category: 'Thuốc lá', price: 40000, costprice: 32000, unit: 'Gói', stock: 18, minstock: 10, isactive: true },
  { productid: 10, productname: 'Khăn lạnh tiệt trùng', category: 'Dịch vụ khác', price: 5000, costprice: 1500, unit: 'Cái', stock: 300, minstock: 50, isactive: true },
  { productid: 11, productname: 'Găng tay bida Taom', category: 'Phụ kiện', price: 60000, costprice: 35000, unit: 'Cái', stock: 12, minstock: 5, isactive: true },
];

const INITIAL_VOUCHERS: Voucher[] = [
  { voucherid: 1, vouchercode: 'BIDA50K', discountamount: 50000, discounttype: 'Fixed', minordervalue: 200000, expirydate: '2026-12-31' },
  { voucherid: 2, vouchercode: 'VIP100K', discountamount: 100000, discounttype: 'Fixed', minordervalue: 400000, expirydate: '2026-12-31' },
  { voucherid: 3, vouchercode: 'CHAO2026', discountamount: 30000, discounttype: 'Fixed', minordervalue: 100000, expirydate: '2026-12-31' },
];

// --- DATABASE CLASS OPERATING ON SUPABASE WITH FALLBACK ---
class BilliardDatabase {
  private inMemoryTables = [...INITIAL_TABLES];
  private inMemoryProducts = [...INITIAL_PRODUCTS];
  private inMemoryCustomers = [...INITIAL_CUSTOMERS];
  private inMemoryVouchers = [...INITIAL_VOUCHERS];
  private inMemoryStaffs = [...INITIAL_STAFFS];
  private inMemoryBookings: Booking[] = [];
  private inMemoryInvoices: Invoice[] = [];
  private inMemoryStockTxs: StockTransaction[] = [];
  private inMemoryVipRates = { Bronze: 0, Silver: 5, Gold: 10, Platinum: 15 };

  // 1. TABLES
  public async getTables(): Promise<BilliardTable[]> {
    const { data, error } = await supabase.from('tables').select('*').order('tableid');
    if (error || !data || data.length === 0) {
      // Auto-seed tables to Supabase if empty
      try {
        await supabase.from('tables').upsert(INITIAL_TABLES, { onConflict: 'tableid' });
      } catch (e) {}
      return this.inMemoryTables;
    }
    this.inMemoryTables = data as BilliardTable[];
    return data as BilliardTable[];
  }

  public async getTableById(tableid: number): Promise<BilliardTable | undefined> {
    const { data } = await supabase.from('tables').select('*').eq('tableid', tableid).single();
    if (data) return data as BilliardTable;
    return this.inMemoryTables.find((t) => t.tableid === tableid);
  }

  public async addTable(tData: Omit<BilliardTable, 'tableid' | 'status' | 'current_invoice_id'>): Promise<BilliardTable> {
    const newRow = {
      ...tData,
      status: TableStatus.EMPTY,
      current_invoice_id: null,
    };
    const { data, error } = await supabase.from('tables').insert([newRow]).select().single();
    if (error || !data) {
      const fallbackTable: BilliardTable = {
        ...newRow,
        tableid: this.inMemoryTables.length > 0 ? Math.max(...this.inMemoryTables.map((t) => t.tableid)) + 1 : 1,
      };
      this.inMemoryTables.push(fallbackTable);
      return fallbackTable;
    }
    return data as BilliardTable;
  }

  public async updateTable(tableid: number, tData: Partial<BilliardTable>): Promise<BilliardTable> {
    const { data, error } = await supabase.from('tables').update(tData).eq('tableid', tableid).select().single();
    if (error || !data) {
      const idx = this.inMemoryTables.findIndex((t) => t.tableid === tableid);
      if (idx !== -1) {
        this.inMemoryTables[idx] = { ...this.inMemoryTables[idx], ...tData };
        return this.inMemoryTables[idx];
      }
      throw new Error('Bàn không tồn tại!');
    }
    return data as BilliardTable;
  }

  public async batchUpdateZonePrice(zone: string, hourlyprice: number): Promise<number> {
    let query = supabase.from('tables').update({ hourlyprice });
    if (zone && zone !== 'ALL') {
      query = query.eq('zone', zone);
    }
    const { data, error } = await query.select();
    if (error || !data) {
      let count = 0;
      this.inMemoryTables.forEach((t) => {
        if (!zone || zone === 'ALL' || t.zone === zone) {
          t.hourlyprice = hourlyprice;
          count++;
        }
      });
      return count;
    }
    return data.length;
  }

  public async deleteTable(tableid: number): Promise<boolean> {
    const table = await this.getTableById(tableid);
    if (table && table.status === TableStatus.PLAYING) {
      throw new Error('Không thể xóa bàn đang có khách chơi!');
    }
    const { error } = await supabase.from('tables').delete().eq('tableid', tableid);
    if (error) {
      const idx = this.inMemoryTables.findIndex((t) => t.tableid === tableid);
      if (idx !== -1) {
        this.inMemoryTables.splice(idx, 1);
        return true;
      }
      return false;
    }
    return true;
  }

  // 2. INVOICES
  public async getInvoices(): Promise<Invoice[]> {
    const { data: invs } = await supabase.from('invoices').select('*').order('invoiceid', { ascending: false });
    if (!invs || invs.length === 0) {
      return this.inMemoryInvoices;
    }
    const { data: details } = await supabase.from('invoice_details').select('*');
    const detailMap = (details || []).reduce((acc: any, d: any) => {
      acc[d.invoiceid] = acc[d.invoiceid] || [];
      acc[d.invoiceid].push(d);
      return acc;
    }, {});

    return invs.map((i) => ({
      ...i,
      details: detailMap[i.invoiceid] || [],
    })) as Invoice[];
  }

  public async getInvoiceById(invoiceid: number): Promise<Invoice | undefined> {
    const { data: inv } = await supabase.from('invoices').select('*').eq('invoiceid', invoiceid).single();
    if (!inv) {
      return this.inMemoryInvoices.find((i) => Number(i.invoiceid) === Number(invoiceid));
    }
    const { data: details } = await supabase.from('invoice_details').select('*').eq('invoiceid', invoiceid);
    return {
      ...inv,
      details: details || [],
    } as Invoice;
  }

  public async openTable(tableid: number, customerid?: number, staffid: number = 1): Promise<Invoice> {
    const table = await this.getTableById(tableid);
    if (!table) throw new Error('Bàn không tồn tại!');

    const rawStatus = (table.status || '').toUpperCase();
    const isCurrentlyPlaying = rawStatus === 'PLAYING' || table.status === TableStatus.PLAYING;

    // Check if there is an active invoice in DB for this table
    const invoices = await this.getInvoices();
    const existingActiveInvoice = invoices.find(
      (inv) => Number(inv.tableid) === Number(tableid) && (inv.status || '').toUpperCase() === 'PLAYING'
    );

    // Only throw error if table is currently playing AND actually has an active playing invoice
    if (isCurrentlyPlaying && existingActiveInvoice) {
      throw new Error('Bàn đang có người chơi!');
    }

    const now = new Date().toISOString();
    const validCustomerId = customerid && Number(customerid) > 0 ? Number(customerid) : null;
    const validStaffId = staffid && Number(staffid) > 0 ? Number(staffid) : 1;

    // Ensure table exists in Supabase table before creating invoice
    try {
      await supabase.from('tables').upsert([{
        tableid: table.tableid,
        tablename: table.tablename,
        tabletype: table.tabletype || 'Bàn Bida',
        hourlyprice: table.hourlyprice || 70000,
        status: TableStatus.PLAYING,
        zone: table.zone || 'Khu A',
      }], { onConflict: 'tableid' });
    } catch (e) {}

    const invoicePayload = {
      tableid,
      customerid: validCustomerId,
      staffid: validStaffId,
      starttime: now,
      playtime_minutes: 0,
      tablefee: 0,
      servicefee: 0,
      discountamount: 0,
      totalamount: 0,
      status: 'Playing',
      paymentmethod: 'Cash',
      createdat: now,
    };

    const { data: newInv, error: invErr } = await supabase.from('invoices').insert([invoicePayload]).select().single();

    if (invErr || !newInv) {
      // Fallback in memory
      const newInvoiceId = this.inMemoryInvoices.length > 0 ? Math.max(...this.inMemoryInvoices.map((i) => i.invoiceid)) + 1 : 1001;
      const fallbackInv: Invoice = {
        ...invoicePayload,
        invoiceid: newInvoiceId,
        customerid: validCustomerId || undefined,
        status: 'Playing',
        paymentmethod: 'Cash',
        details: [],
      };
      this.inMemoryInvoices.push(fallbackInv);
      table.status = TableStatus.PLAYING;
      table.current_invoice_id = newInvoiceId;
      return fallbackInv;
    }

    // Update table status in Supabase
    await supabase.from('tables').update({
      status: TableStatus.PLAYING,
      current_invoice_id: newInv.invoiceid,
    }).eq('tableid', tableid);

    table.status = TableStatus.PLAYING;
    table.current_invoice_id = newInv.invoiceid;

    return { ...newInv, details: [] } as Invoice;
  }

  public async cancelOpenTable(tableid: number): Promise<BilliardTable> {
    const table = await this.getTableById(tableid);
    if (!table) throw new Error('Bàn không tồn tại!');

    // Find active invoice by current_invoice_id or search invoices for active playing invoice
    let invoice: Invoice | undefined;
    if (table.current_invoice_id) {
      invoice = await this.getInvoiceById(table.current_invoice_id);
    }
    if (!invoice) {
      const invoices = await this.getInvoices();
      invoice = invoices.find(
        (i) => Number(i.tableid) === Number(tableid) && (i.status || '').toUpperCase() === 'PLAYING'
      );
    }

    if (invoice) {
      await supabase.from('invoices').update({ status: 'Cancelled' }).eq('invoiceid', invoice.invoiceid);

      const inMemInv = this.inMemoryInvoices.find((i) => Number(i.invoiceid) === Number(invoice!.invoiceid));
      if (inMemInv) inMemInv.status = 'Cancelled';

      // Restore product stock
      for (const item of invoice.details || []) {
        const prod = await this.getProductById(item.productid);
        if (prod) {
          await this.updateProduct(prod.productid, { stock: prod.stock + item.quantity });
        }
      }
    }

    await supabase.from('tables').update({
      status: TableStatus.EMPTY,
      current_invoice_id: null,
    }).eq('tableid', tableid);

    const inMemTable = this.inMemoryTables.find((t) => Number(t.tableid) === Number(tableid));
    if (inMemTable) {
      inMemTable.status = TableStatus.EMPTY;
      inMemTable.current_invoice_id = null;
    }

    return { ...table, status: TableStatus.EMPTY, current_invoice_id: null };
  }

  public async addServiceToTable(invoiceid: number, productid: number, quantity: number = 1): Promise<Invoice> {
    let invoice = await this.getInvoiceById(invoiceid);
    if (!invoice) {
      const invoices = await this.getInvoices();
      invoice = invoices.find((i) => (i.status || '').toUpperCase() === 'PLAYING');
    }

    if (!invoice || (invoice.status || '').toUpperCase() !== 'PLAYING') {
      throw new Error('Hóa đơn không hợp lệ hoặc đã thanh toán!');
    }

    const product = await this.getProductById(productid);
    if (!product) throw new Error('Sản phẩm không tồn tại!');
    if (product.stock < quantity) throw new Error(`Sản phẩm "${product.productname}" không đủ tồn kho (Còn: ${product.stock})`);

    // Deduct stock
    await this.updateProduct(productid, { stock: product.stock - quantity });

    // Record transaction
    try {
      await supabase.from('stock_transactions').insert([{
        productid: product.productid,
        productname: product.productname,
        type: 'EXPORT_SALE',
        quantity,
        costprice: product.costprice,
        createdat: new Date().toISOString(),
        note: `Bán cho Hóa đơn #${invoice.invoiceid}`,
      }]);
    } catch (e) {}

    // Check if detail exists
    const existingDetail = invoice.details.find((d) => Number(d.productid) === Number(productid));
    if (existingDetail) {
      const newQty = existingDetail.quantity + quantity;
      const newTotal = newQty * existingDetail.unitprice;
      await supabase.from('invoice_details').update({
        quantity: newQty,
        totalprice: newTotal,
      }).eq('detailid', existingDetail.detailid);
      existingDetail.quantity = newQty;
      existingDetail.totalprice = newTotal;
    } else {
      const detailPayload = {
        invoiceid: invoice.invoiceid,
        productid: product.productid,
        productname: product.productname,
        quantity,
        unitprice: product.price,
        totalprice: product.price * quantity,
      };
      const { data: newDet } = await supabase.from('invoice_details').insert([detailPayload]).select().single();
      if (newDet) {
        invoice.details.push(newDet);
      } else {
        invoice.details.push({
          ...detailPayload,
          detailid: Date.now(),
        });
      }
    }

    // Recalculate servicefee
    const updatedInvoice = await this.getInvoiceById(invoice.invoiceid);
    if (updatedInvoice) {
      const newServiceFee = updatedInvoice.details.reduce((sum, item) => sum + item.totalprice, 0);
      await supabase.from('invoices').update({ servicefee: newServiceFee }).eq('invoiceid', invoice.invoiceid);
      return { ...updatedInvoice, servicefee: newServiceFee };
    }
    const newServiceFee = invoice.details.reduce((sum, item) => sum + item.totalprice, 0);
    invoice.servicefee = newServiceFee;
    return invoice;
  }

  public async removeServiceFromTable(invoiceid: number, detailid: number, quantity: number = 1): Promise<Invoice> {
    let invoice = await this.getInvoiceById(invoiceid);
    if (!invoice) {
      const invoices = await this.getInvoices();
      invoice = invoices.find((i) => (i.status || '').toUpperCase() === 'PLAYING');
    }

    if (!invoice || (invoice.status || '').toUpperCase() !== 'PLAYING') {
      throw new Error('Hóa đơn không tồn tại hoặc đã thanh toán!');
    }

    const detail = invoice.details.find((d) => Number(d.detailid) === Number(detailid));
    if (!detail) throw new Error('Chi tiết dịch vụ không tồn tại!');

    const product = await this.getProductById(detail.productid);
    if (product) {
      await this.updateProduct(product.productid, { stock: product.stock + quantity });
    }

    if (detail.quantity <= quantity) {
      await supabase.from('invoice_details').delete().eq('detailid', detailid);
    } else {
      const newQty = detail.quantity - quantity;
      await supabase.from('invoice_details').update({
        quantity: newQty,
        totalprice: newQty * detail.unitprice,
      }).eq('detailid', detailid);
    }

    const updatedInvoice = await this.getInvoiceById(invoice.invoiceid);
    if (updatedInvoice) {
      const newServiceFee = updatedInvoice.details.reduce((sum, item) => sum + item.totalprice, 0);
      await supabase.from('invoices').update({ servicefee: newServiceFee }).eq('invoiceid', invoice.invoiceid);
      return { ...updatedInvoice, servicefee: newServiceFee };
    }
    return invoice;
  }

  public async checkoutTable(params: {
    invoiceid: number;
    customerid?: number;
    vouchercode?: string;
    paymentmethod: 'Cash' | 'Transfer' | 'Card';
    staffid?: number;
  }): Promise<Invoice> {
    let invoice = await this.getInvoiceById(params.invoiceid);
    if (!invoice) {
      const invoices = await this.getInvoices();
      invoice = invoices.find((i) => Number(i.invoiceid) === Number(params.invoiceid) || (i.status || '').toUpperCase() === 'PLAYING');
    }

    if (!invoice || (invoice.status || '').toUpperCase() !== 'PLAYING') {
      throw new Error('Hóa đơn không hợp lệ hoặc đã đóng!');
    }

    const table = await this.getTableById(invoice.tableid);
    if (!table) throw new Error('Bàn không tồn tại!');

    const now = new Date();
    const start = new Date(invoice.starttime || now.toISOString());
    const durationMs = Math.max(0, now.getTime() - start.getTime());
    const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60)));

    const hourlyRate = table.hourlyprice || 70000;
    const tableFee = Math.round((durationMinutes / 60) * hourlyRate);

    let discount = 0;
    const targetCustomerId = params.customerid || invoice.customerid;
    let customer: Customer | undefined;

    const vipRates = await this.getVipDiscountRates();

    if (targetCustomerId) {
      customer = await this.getCustomerById(targetCustomerId);
      if (customer) {
        const vipPercent = vipRates[customer.membershiptier] || 0;
        if (vipPercent > 0) {
          discount += Math.round((tableFee * vipPercent) / 100);
        }
      }
    }

    if (params.vouchercode) {
      const voucher = await this.getVoucherByCode(params.vouchercode);
      if (voucher) {
        discount += voucher.discountamount;
      }
    }

    const totalAmount = Math.max(0, tableFee + (invoice.servicefee || 0) - discount);

    await supabase.from('invoices').update({
      endtime: now.toISOString(),
      playtime_minutes: durationMinutes,
      tablefee: tableFee,
      discountamount: discount,
      totalamount: totalAmount,
      status: 'Paid',
      paymentmethod: params.paymentmethod,
      staffid: params.staffid || invoice.staffid || 1,
      customerid: targetCustomerId || null,
    }).eq('invoiceid', invoice.invoiceid);

    const inMemInv = this.inMemoryInvoices.find((i) => Number(i.invoiceid) === Number(invoice!.invoiceid));
    if (inMemInv) {
      inMemInv.status = 'Paid';
      inMemInv.totalamount = totalAmount;
      inMemInv.tablefee = tableFee;
      inMemInv.discountamount = discount;
    }

    if (customer) {
      const pointsEarned = Math.floor(totalAmount / 10000);
      const newSpent = customer.totalspent + totalAmount;
      const newPoints = customer.point + pointsEarned;
      let newTier = customer.membershiptier;

      if (newSpent >= 10000000) newTier = 'Platinum';
      else if (newSpent >= 4000000) newTier = 'Gold';
      else if (newSpent >= 1500000) newTier = 'Silver';

      await supabase.from('customers').update({
        totalspent: newSpent,
        point: newPoints,
        membershiptier: newTier,
      }).eq('customerid', customer.customerid);
    }

    await supabase.from('tables').update({
      status: TableStatus.EMPTY,
      current_invoice_id: null,
    }).eq('tableid', invoice.tableid);

    const inMemTable = this.inMemoryTables.find((t) => Number(t.tableid) === Number(invoice!.tableid));
    if (inMemTable) {
      inMemTable.status = TableStatus.EMPTY;
      inMemTable.current_invoice_id = null;
    }

    const finalInvoice = await this.getInvoiceById(invoice.invoiceid);
    return finalInvoice || {
      ...invoice,
      status: 'Paid',
      tablefee: tableFee,
      discountamount: discount,
      totalamount: totalAmount,
    };
  }

  // 3. PRODUCTS
  public async getProducts(): Promise<Product[]> {
    const { data, error } = await supabase.from('products').select('*').order('productid');
    if (error || !data || data.length === 0) return this.inMemoryProducts;
    return data as Product[];
  }

  public async getProductById(id: number): Promise<Product | undefined> {
    const { data } = await supabase.from('products').select('*').eq('productid', id).single();
    if (data) return data as Product;
    return this.inMemoryProducts.find((p) => p.productid === id);
  }

  public async addProduct(pData: Omit<Product, 'productid'>): Promise<Product> {
    const { data, error } = await supabase.from('products').insert([pData]).select().single();
    if (error || !data) {
      const newP: Product = {
        ...pData,
        productid: this.inMemoryProducts.length > 0 ? Math.max(...this.inMemoryProducts.map((p) => p.productid)) + 1 : 1,
      };
      this.inMemoryProducts.push(newP);
      return newP;
    }
    return data as Product;
  }

  public async updateProduct(productid: number, pData: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase.from('products').update(pData).eq('productid', productid).select().single();
    if (error || !data) {
      const idx = this.inMemoryProducts.findIndex((p) => p.productid === productid);
      if (idx !== -1) {
        this.inMemoryProducts[idx] = { ...this.inMemoryProducts[idx], ...pData };
        return this.inMemoryProducts[idx];
      }
      throw new Error('Sản phẩm không tồn tại!');
    }
    return data as Product;
  }

  public async importStock(productid: number, quantity: number, costprice: number, note?: string): Promise<StockTransaction> {
    const product = await this.getProductById(productid);
    if (!product) throw new Error('Sản phẩm không tồn tại!');

    await this.updateProduct(productid, {
      stock: product.stock + quantity,
      costprice,
    });

    const txRow = {
      productid,
      productname: product.productname,
      type: 'IMPORT' as const,
      quantity,
      costprice,
      createdat: new Date().toISOString(),
      note: note || 'Nhập kho thủ công',
    };

    const { data, error } = await supabase.from('stock_transactions').insert([txRow]).select().single();
    if (error || !data) {
      const fallbackTx: StockTransaction = {
        ...txRow,
        txid: this.inMemoryStockTxs.length + 1,
      };
      this.inMemoryStockTxs.push(fallbackTx);
      return fallbackTx;
    }
    return data as StockTransaction;
  }

  public async getStockTransactions(): Promise<StockTransaction[]> {
    const { data, error } = await supabase.from('stock_transactions').select('*').order('txid', { ascending: false });
    if (error || !data || data.length === 0) return this.inMemoryStockTxs;
    return data as StockTransaction[];
  }

  // 4. CUSTOMERS
  public async getCustomers(): Promise<Customer[]> {
    const { data, error } = await supabase.from('customers').select('*').order('customerid');
    if (error || !data || data.length === 0) return this.inMemoryCustomers;
    return data as Customer[];
  }

  public async getCustomerById(customerid: number): Promise<Customer | undefined> {
    const { data } = await supabase.from('customers').select('*').eq('customerid', customerid).single();
    if (data) return data as Customer;
    return this.inMemoryCustomers.find((c) => c.customerid === customerid);
  }

  public async addCustomer(cData: Omit<Customer, 'customerid' | 'point' | 'createdat' | 'membershiptier' | 'totalspent'>): Promise<Customer> {
    const newCustomerRow = {
      ...cData,
      phone: cData.phone.trim(),
      point: 0,
      createdat: new Date().toISOString(),
      membershiptier: 'Bronze',
      totalspent: 0,
    };

    const { data, error } = await supabase.from('customers').insert([newCustomerRow]).select().single();
    if (error || !data) {
      const exists = this.inMemoryCustomers.some((c) => c.phone === cData.phone.trim());
      if (exists) throw new Error('Số điện thoại đã được đăng ký!');

      const fallbackC: Customer = {
        ...newCustomerRow,
        customerid: this.inMemoryCustomers.length > 0 ? Math.max(...this.inMemoryCustomers.map((c) => c.customerid)) + 1 : 1,
        membershiptier: 'Bronze',
      };
      this.inMemoryCustomers.push(fallbackC);
      return fallbackC;
    }
    return data as Customer;
  }

  // 5. BOOKINGS
  public async getBookings(): Promise<Booking[]> {
    const { data, error } = await supabase.from('bookings').select('*').order('bookingid', { ascending: false });
    if (error || !data) return this.inMemoryBookings;
    return data as Booking[];
  }

  public async addBooking(bData: Omit<Booking, 'bookingid' | 'status'>): Promise<Booking> {
    const row = {
      ...bData,
      status: 'Confirmed',
    };
    const { data, error } = await supabase.from('bookings').insert([row]).select().single();
    if (error || !data) {
      const fallbackB: Booking = {
        ...row,
        bookingid: this.inMemoryBookings.length > 0 ? Math.max(...this.inMemoryBookings.map((b) => b.bookingid)) + 1 : 1,
        status: 'Confirmed',
      };
      this.inMemoryBookings.push(fallbackB);
      return fallbackB;
    }
    return data as Booking;
  }

  public async cancelBooking(bookingid: number): Promise<Booking> {
    const { data, error } = await supabase.from('bookings').update({ status: 'Cancelled' }).eq('bookingid', bookingid).select().single();
    if (error || !data) {
      const booking = this.inMemoryBookings.find((b) => b.bookingid === bookingid);
      if (!booking) throw new Error('Lịch đặt không tồn tại!');
      booking.status = 'Cancelled';
      return booking;
    }
    return data as Booking;
  }

  // 6. STAFFS & AUTH
  public async getStaffs(): Promise<Staff[]> {
    const { data, error } = await supabase.from('staffs').select('*').order('staffid');
    if (error || !data || data.length === 0) return this.inMemoryStaffs;
    return data as Staff[];
  }

  public async loginStaff(username: string, password?: string): Promise<Staff> {
    const staffs = await this.getStaffs();
    const staff = staffs.find(
      (s) => s.username.toLowerCase() === username.trim().toLowerCase() && s.password === password
    );
    if (!staff) {
      throw new Error('Tài khoản hoặc mật khẩu không chính xác!');
    }
    if (staff.status !== 'Active') {
      throw new Error('Tài khoản của bạn đã bị vô hiệu hóa!');
    }
    return staff;
  }

  public async addStaff(staffData: Omit<Staff, 'staffid'>): Promise<Staff> {
    const { data, error } = await supabase.from('staffs').insert([staffData]).select().single();
    if (error || !data) {
      const exists = this.inMemoryStaffs.some((s) => s.username.toLowerCase() === staffData.username.trim().toLowerCase());
      if (exists) throw new Error('Tên tài khoản đã tồn tại!');
      const newStaff: Staff = {
        ...staffData,
        staffid: this.inMemoryStaffs.length > 0 ? Math.max(...this.inMemoryStaffs.map((s) => s.staffid)) + 1 : 1,
      };
      this.inMemoryStaffs.push(newStaff);
      return newStaff;
    }
    return data as Staff;
  }

  public async updateStaff(staffid: number, staffData: Partial<Staff>): Promise<Staff> {
    const { data, error } = await supabase.from('staffs').update(staffData).eq('staffid', staffid).select().single();
    if (error || !data) {
      const idx = this.inMemoryStaffs.findIndex((s) => s.staffid === staffid);
      if (idx === -1) throw new Error('Nhân viên không tồn tại!');
      this.inMemoryStaffs[idx] = { ...this.inMemoryStaffs[idx], ...staffData };
      return this.inMemoryStaffs[idx];
    }
    return data as Staff;
  }

  public async deleteStaff(staffid: number): Promise<boolean> {
    const staffs = await this.getStaffs();
    const staff = staffs.find((s) => s.staffid === staffid);
    if (!staff) throw new Error('Nhân viên không tồn tại!');
    if (staff.role === 'Manager') {
      const managerCount = staffs.filter((s) => s.role === 'Manager').length;
      if (managerCount <= 1) {
        throw new Error('Không thể xóa tài khoản Quản lý duy nhất trong hệ thống!');
      }
    }
    const { error } = await supabase.from('staffs').delete().eq('staffid', staffid);
    if (error) {
      const idx = this.inMemoryStaffs.findIndex((s) => s.staffid === staffid);
      if (idx !== -1) this.inMemoryStaffs.splice(idx, 1);
    }
    return true;
  }

  // 7. VOUCHERS & VIP RATES
  public async getVouchers(): Promise<Voucher[]> {
    const { data, error } = await supabase.from('vouchers').select('*').order('voucherid');
    if (error || !data || data.length === 0) return this.inMemoryVouchers;
    return data as Voucher[];
  }

  public async getVoucherByCode(code: string): Promise<Voucher | undefined> {
    const vouchers = await this.getVouchers();
    return vouchers.find((v) => v.vouchercode.toUpperCase() === code.trim().toUpperCase());
  }

  public async getVipDiscountRates(): Promise<{ Bronze: number; Silver: number; Gold: number; Platinum: number }> {
    const { data } = await supabase.from('vip_discount_rates').select('*').single();
    if (data) {
      return {
        Bronze: data.bronze ?? 0,
        Silver: data.silver ?? 5,
        Gold: data.gold ?? 10,
        Platinum: data.platinum ?? 15,
      };
    }
    return this.inMemoryVipRates;
  }

  public async updateVipDiscountRates(rates: { Bronze: number; Silver: number; Gold: number; Platinum: number }) {
    await supabase.from('vip_discount_rates').upsert({
      id: 1,
      bronze: rates.Bronze,
      silver: rates.Silver,
      gold: rates.Gold,
      platinum: rates.Platinum,
    });
    this.inMemoryVipRates = { ...rates };
    return rates;
  }

  // 8. DASHBOARD STATS
  public async getDashboardStats() {
    const invoices = await this.getInvoices();
    const tables = await this.getTables();
    const products = await this.getProducts();

    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = invoices.filter((i) => i.status === 'Paid' && i.createdat && i.createdat.startsWith(today));

    const totalRevenueToday = todayInvoices.reduce((sum, i) => sum + i.totalamount, 0);
    const tableRevenueToday = todayInvoices.reduce((sum, i) => sum + i.tablefee, 0);
    const serviceRevenueToday = todayInvoices.reduce((sum, i) => sum + i.servicefee, 0);

    const playingTablesCount = tables.filter((t) => t.status === TableStatus.PLAYING).length;
    const emptyTablesCount = tables.filter((t) => t.status === TableStatus.EMPTY).length;

    return {
      totalRevenueToday,
      tableRevenueToday,
      serviceRevenueToday,
      playingTablesCount,
      emptyTablesCount,
      totalInvoicesToday: todayInvoices.length,
      lowStockProducts: products.filter((p) => p.stock <= p.minstock),
    };
  }

  public resetData() {
    this.inMemoryTables = [...INITIAL_TABLES];
    this.inMemoryProducts = [...INITIAL_PRODUCTS];
    this.inMemoryCustomers = [...INITIAL_CUSTOMERS];
    this.inMemoryVouchers = [...INITIAL_VOUCHERS];
    this.inMemoryStaffs = [...INITIAL_STAFFS];
    this.inMemoryBookings = [];
    this.inMemoryInvoices = [];
    this.inMemoryStockTxs = [];
  }
}

export const db = new BilliardDatabase();

// --- EXPRESS APP SETUP ---
export const app = express();

app.use(cors());
app.use(express.json());

const apiRouter = express.Router();

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
  if (role === 'None' || role === 'null') {
    return res.status(401).json({
      success: false,
      error: 'Vui lòng đăng nhập tài khoản Nhân viên / Quản lý để mở bàn hoặc thực hiện giao dịch!',
    });
  }
  next();
};

// --- RESTful API ENDPOINTS ---

// 1. TABLES & POS
apiRouter.get('/tables', async (req, res) => {
  try {
    const tables = await db.getTables();
    const invoices = await db.getInvoices();
    const result = tables.map((t) => {
      // Find active playing invoice by current_invoice_id OR by tableid with status 'Playing'/'PLAYING'
      let activeInvoice = t.current_invoice_id ? invoices.find((i) => Number(i.invoiceid) === Number(t.current_invoice_id)) : undefined;
      if (!activeInvoice) {
        activeInvoice = invoices.find((i) => Number(i.tableid) === Number(t.tableid) && (i.status || '').toUpperCase() === 'PLAYING');
      }

      const rawStatus = (t.status || '').toUpperCase();
      const isPlaying = rawStatus === 'PLAYING' || !!activeInvoice;

      if (isPlaying && !activeInvoice) {
        const now = new Date().toISOString();
        activeInvoice = {
          invoiceid: t.current_invoice_id || (1000 + t.tableid),
          tableid: t.tableid,
          staffid: 1,
          starttime: now,
          createdat: now,
          playtime_minutes: 0,
          tablefee: 0,
          servicefee: 0,
          discountamount: 0,
          totalamount: 0,
          status: 'Playing',
          paymentmethod: 'Cash',
          details: [],
        };
      }

      return {
        ...t,
        status: isPlaying ? TableStatus.PLAYING : (rawStatus === 'RESERVED' || rawStatus === 'BOOKED' ? TableStatus.RESERVED : TableStatus.EMPTY),
        activeInvoice: activeInvoice || null,
      };
    });
    res.json({ success: true, data: result });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Mở bàn (Start time)
apiRouter.post('/tables/:id/open', requireStaffAuth, async (req, res) => {
  try {
    const tableId = parseInt(req.params.id, 10);
    const { customerid, staffid } = req.body;
    const invoice = await db.openTable(tableId, customerid, staffid || 1);
    res.json({ success: true, message: 'Mở bàn thành công!', data: invoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Hủy mở bàn (Cancel open table)
apiRouter.post('/tables/:id/cancel', requireStaffAuth, async (req, res) => {
  try {
    const tableId = parseInt(req.params.id, 10);
    const updatedTable = await db.cancelOpenTable(tableId);
    res.json({ success: true, message: 'Hủy mở bàn thành công!', data: updatedTable });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Thêm dịch vụ / đồ ăn vào bàn
apiRouter.post('/tables/add-service', requireStaffAuth, async (req, res) => {
  try {
    const { invoiceid, productid, quantity } = req.body;
    const updatedInvoice = await db.addServiceToTable(invoiceid, productid, quantity || 1);
    res.json({ success: true, message: 'Thêm dịch vụ thành công!', data: updatedInvoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Giảm dịch vụ
apiRouter.post('/tables/remove-service', requireStaffAuth, async (req, res) => {
  try {
    const { invoiceid, detailid, quantity } = req.body;
    const updatedInvoice = await db.removeServiceFromTable(invoiceid, detailid, quantity || 1);
    res.json({ success: true, message: 'Cập nhật dịch vụ thành công!', data: updatedInvoice });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// Thanh toán đóng bàn (Checkout)
apiRouter.post('/tables/:id/checkout', requireStaffAuth, async (req, res) => {
  try {
    const { invoiceid, customerid, vouchercode, paymentmethod, staffid } = req.body;
    const completedInvoice = await db.checkoutTable({
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

// 2. PRODUCTS & INVENTORY
apiRouter.get('/products', async (req, res) => {
  try {
    const products = await db.getProducts();
    res.json({ success: true, data: products });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/products', requireManager, async (req, res) => {
  try {
    const newProduct = await db.addProduct(req.body);
    res.json({ success: true, message: 'Thêm sản phẩm thành công!', data: newProduct });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/products/:id', requireManager, async (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = await db.updateProduct(id, req.body);
    res.json({ success: true, message: 'Cập nhật sản phẩm thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/stock/import', async (req, res) => {
  try {
    const { productid, quantity, costprice, note } = req.body;
    const tx = await db.importStock(productid, quantity, costprice, note);
    res.json({ success: true, message: 'Nhập kho thành công!', data: tx });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/stock/transactions', async (req, res) => {
  try {
    const txs = await db.getStockTransactions();
    res.json({ success: true, data: txs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 3. CUSTOMERS (CRM)
apiRouter.get('/customers', async (req, res) => {
  try {
    const customers = await db.getCustomers();
    res.json({ success: true, data: customers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/customers', async (req, res) => {
  try {
    const customer = await db.addCustomer(req.body);
    res.json({ success: true, message: 'Thêm khách hàng mới thành công!', data: customer });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 4. BOOKINGS
apiRouter.get('/bookings', async (req, res) => {
  try {
    const bookings = await db.getBookings();
    res.json({ success: true, data: bookings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/bookings', async (req, res) => {
  try {
    const booking = await db.addBooking(req.body);
    res.json({ success: true, message: 'Đặt bàn thành công!', data: booking });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/bookings/:id/cancel', async (req, res) => {
  try {
    const booking = await db.cancelBooking(Number(req.params.id));
    res.json({ success: true, message: 'Hủy đặt bàn thành công!', data: booking });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// VIP DISCOUNT RATES CONFIG
apiRouter.get('/vip-rates', async (req, res) => {
  try {
    const rates = await db.getVipDiscountRates();
    res.json({ success: true, data: rates });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/vip-rates', requireManager, async (req, res) => {
  try {
    const updated = await db.updateVipDiscountRates(req.body);
    res.json({ success: true, message: 'Cập nhật cấu hình % giảm giá VIP thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// 0. AUTHENTICATION & STAFFS
apiRouter.post('/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = await db.loginStaff(username, password);
    res.json({ success: true, message: 'Đăng nhập thành công!', data: staff });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/staffs', async (req, res) => {
  try {
    const staffs = await db.getStaffs();
    res.json({ success: true, data: staffs });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/staffs', requireManager, async (req, res) => {
  try {
    const newStaff = await db.addStaff(req.body);
    res.json({ success: true, message: 'Thêm nhân viên thành công!', data: newStaff });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.put('/staffs/:id', requireManager, async (req, res) => {
  try {
    const updated = await db.updateStaff(Number(req.params.id), req.body);
    res.json({ success: true, message: 'Cập nhật nhân viên thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/staffs/:id', requireManager, async (req, res) => {
  try {
    const success = await db.deleteStaff(Number(req.params.id));
    res.json({ success: true, message: 'Xóa nhân viên thành công!', data: { deleted: success } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

// TABLE EDITING & ADMIN CONTROLS
apiRouter.put('/tables/:id', requireManager, async (req, res) => {
  try {
    const updated = await db.updateTable(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: 'Bàn không tồn tại' });
    res.json({ success: true, message: 'Cập nhật bàn thành công!', data: updated });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/tables/batch-zone-price', requireManager, async (req, res) => {
  try {
    const { zone, hourlyprice } = req.body;
    const count = await db.batchUpdateZonePrice(zone, Number(hourlyprice));
    res.json({ success: true, message: `Đã cập nhật giá cho ${count} bàn thuộc ${zone || 'tất cả các khu'}!`, data: { updatedCount: count } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.post('/tables', requireManager, async (req, res) => {
  try {
    const newTable = await db.addTable(req.body);
    res.json({ success: true, message: 'Thêm bàn mới thành công!', data: newTable });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.delete('/tables/:id', requireManager, async (req, res) => {
  try {
    const deleted = await db.deleteTable(Number(req.params.id));
    res.json({ success: true, message: 'Đã xóa bàn thành công!', data: { deleted } });
  } catch (err: any) {
    res.status(400).json({ success: false, error: err.message });
  }
});

apiRouter.get('/vouchers', async (req, res) => {
  try {
    const vouchers = await db.getVouchers();
    res.json({ success: true, data: vouchers });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.get('/vouchers/check/:code', async (req, res) => {
  try {
    const voucher = await db.getVoucherByCode(req.params.code);
    if (!voucher) {
      return res.status(404).json({ success: false, error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn' });
    }
    res.json({ success: true, data: voucher });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 6. INVOICES
apiRouter.get('/invoices', async (req, res) => {
  try {
    const invoices = await db.getInvoices();
    res.json({ success: true, data: invoices });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 7. STATS & RESET
apiRouter.get('/stats', async (req, res) => {
  try {
    const stats = await db.getDashboardStats();
    res.json({ success: true, data: stats });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

apiRouter.post('/db/reset', (req, res) => {
  try {
    db.resetData();
    res.json({ success: true, message: 'Khôi phục dữ liệu mẫu thành công!' });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// 8. SUPABASE CONNECTION CHECK
apiRouter.get('/supabase/status', async (req, res) => {
  try {
    const { data: staffs, error: staffErr } = await supabase.from('staffs').select('*').limit(1);
    const { data: tables, error: tableErr } = await supabase.from('tables').select('*').limit(1);

    const isConnected = !staffErr && !tableErr;

    res.json({
      success: isConnected,
      url: SUPABASE_URL,
      connected: isConnected,
      tablesCheck: {
        staffs: staffErr ? staffErr.message : 'OK',
        tables: tableErr ? tableErr.message : 'OK',
      },
      message: isConnected
        ? 'Kết nối Supabase và bảng dữ liệu thành công!'
        : `Lỗi kết nối bảng Supabase: ${staffErr?.message || tableErr?.message || 'Vui lòng chạy file supabase-schema.sql trong SQL Editor của Supabase'}`,
    });
  } catch (err: any) {
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message,
      message: `Lỗi kết nối Supabase: ${err.message}`,
    });
  }
});

// Mount router at both '/api' and '/' so Vercel rewrites work seamlessly
app.use('/api', apiRouter);
app.use('/', apiRouter);

export default app;
