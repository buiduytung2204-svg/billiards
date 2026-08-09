import express from 'express';
import cors from 'cors';

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

// --- INITIAL DATA ---
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

const INITIAL_BOOKINGS: Booking[] = [];

// --- DATABASE CLASS ---
class BilliardDatabase {
  private customers: Customer[] = [];
  private tables: BilliardTable[] = [];
  private products: Product[] = [];
  private vouchers: Voucher[] = [];
  private staffs: Staff[] = [];
  private bookings: Booking[] = [];
  private invoices: Invoice[] = [];
  private stockTransactions: StockTransaction[] = [];
  private vipDiscountRates: { Bronze: number; Silver: number; Gold: number; Platinum: number } = {
    Bronze: 0,
    Silver: 5,
    Gold: 10,
    Platinum: 15,
  };

  constructor() {
    this.resetData();
  }

  public resetData() {
    this.customers = [...INITIAL_CUSTOMERS];
    this.tables = [...INITIAL_TABLES];
    this.products = [...INITIAL_PRODUCTS];
    this.vouchers = [...INITIAL_VOUCHERS];
    this.staffs = [...INITIAL_STAFFS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.invoices = [];
    this.stockTransactions = [
      { txid: 1, productid: 1, productname: 'Cà phê đá', type: 'IMPORT', quantity: 150, costprice: 8000, createdat: '2026-03-01T08:00:00Z', note: 'Nhập kho đầu tháng' },
      { txid: 2, productid: 3, productname: 'Sting đỏ / dâu', type: 'IMPORT', quantity: 100, costprice: 9000, createdat: '2026-03-01T08:30:00Z', note: 'Nhập Sting đợt 1' },
    ];
  }

  public getTables(): BilliardTable[] {
    return this.tables;
  }

  public getProducts(): Product[] {
    return this.products;
  }

  public getCustomers(): Customer[] {
    return this.customers;
  }

  public getVouchers(): Voucher[] {
    return this.vouchers;
  }

  public getStaffs(): Staff[] {
    return this.staffs;
  }

  public getBookings(): Booking[] {
    return this.bookings;
  }

  public getInvoices(): Invoice[] {
    return this.invoices;
  }

  public getStockTransactions(): StockTransaction[] {
    return this.stockTransactions;
  }

  public getVipDiscountRates() {
    return this.vipDiscountRates;
  }

  public updateVipDiscountRates(rates: { Bronze: number; Silver: number; Gold: number; Platinum: number }) {
    this.vipDiscountRates = { ...rates };
    return this.vipDiscountRates;
  }

  public loginStaff(username: string, password?: string): Staff {
    const staff = this.staffs.find(
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

  public addStaff(staffData: Omit<Staff, 'staffid'>): Staff {
    const exists = this.staffs.some((s) => s.username.toLowerCase() === staffData.username.trim().toLowerCase());
    if (exists) throw new Error('Tên tài khoản đã tồn tại!');
    const newStaff: Staff = {
      ...staffData,
      staffid: this.staffs.length > 0 ? Math.max(...this.staffs.map((s) => s.staffid)) + 1 : 1,
    };
    this.staffs.push(newStaff);
    return newStaff;
  }

  public updateStaff(staffid: number, staffData: Partial<Staff>): Staff {
    const idx = this.staffs.findIndex((s) => s.staffid === staffid);
    if (idx === -1) throw new Error('Nhân viên không tồn tại!');
    this.staffs[idx] = { ...this.staffs[idx], ...staffData };
    return this.staffs[idx];
  }

  public deleteStaff(staffid: number): boolean {
    const idx = this.staffs.findIndex((s) => s.staffid === staffid);
    if (idx === -1) throw new Error('Nhân viên không tồn tại!');
    if (this.staffs[idx].role === 'Manager') {
      const managerCount = this.staffs.filter((s) => s.role === 'Manager').length;
      if (managerCount <= 1) {
        throw new Error('Không thể xóa tài khoản Quản lý duy nhất trong hệ thống!');
      }
    }
    this.staffs.splice(idx, 1);
    return true;
  }

  public getInvoiceById(invoiceid: number): Invoice | undefined {
    return this.invoices.find((inv) => inv.invoiceid === invoiceid);
  }

  public openTable(tableid: number, customerid?: number, staffid: number = 1): Invoice {
    const table = this.tables.find((t) => t.tableid === tableid);
    if (!table) throw new Error('Bàn không tồn tại!');
    if (table.status === TableStatus.PLAYING) throw new Error('Bàn đang có người chơi!');

    const newInvoiceId = this.invoices.length > 0 ? Math.max(...this.invoices.map((i) => i.invoiceid)) + 1 : 1001;
    const now = new Date().toISOString();

    const newInvoice: Invoice = {
      invoiceid: newInvoiceId,
      tableid,
      customerid,
      staffid,
      starttime: now,
      playtime_minutes: 0,
      tablefee: 0,
      servicefee: 0,
      discountamount: 0,
      totalamount: 0,
      status: 'Playing',
      paymentmethod: 'Cash',
      createdat: now,
      details: [],
    };

    this.invoices.push(newInvoice);
    table.status = TableStatus.PLAYING;
    table.current_invoice_id = newInvoiceId;

    return newInvoice;
  }

  public cancelOpenTable(tableid: number): BilliardTable {
    const table = this.tables.find((t) => t.tableid === tableid);
    if (!table) throw new Error('Bàn không tồn tại!');
    if (!table.current_invoice_id) throw new Error('Bàn đang trống!');

    const invoice = this.getInvoiceById(table.current_invoice_id);
    if (invoice) {
      invoice.status = 'Cancelled';
      for (const item of invoice.details) {
        const prod = this.products.find((p) => p.productid === item.productid);
        if (prod) prod.stock += item.quantity;
      }
    }

    table.status = TableStatus.EMPTY;
    table.current_invoice_id = null;
    return table;
  }

  public addServiceToTable(invoiceid: number, productid: number, quantity: number = 1): Invoice {
    const invoice = this.getInvoiceById(invoiceid);
    if (!invoice || invoice.status !== 'Playing') throw new Error('Hóa đơn không hợp lệ hoặc đã thanh toán!');

    const product = this.products.find((p) => p.productid === productid);
    if (!product) throw new Error('Sản phẩm không tồn tại!');
    if (product.stock < quantity) throw new Error(`Sản phẩm "${product.productname}" không đủ tồn kho (Còn: ${product.stock})`);

    product.stock -= quantity;
    this.stockTransactions.push({
      txid: this.stockTransactions.length + 1,
      productid: product.productid,
      productname: product.productname,
      type: 'EXPORT_SALE',
      quantity,
      costprice: product.costprice,
      createdat: new Date().toISOString(),
      note: `Bán cho Hóa đơn #${invoiceid}`,
    });

    const existingDetail = invoice.details.find((d) => d.productid === productid);
    if (existingDetail) {
      existingDetail.quantity += quantity;
      existingDetail.totalprice = existingDetail.quantity * existingDetail.unitprice;
    } else {
      const detailid = invoice.details.length > 0 ? Math.max(...invoice.details.map((d) => d.detailid)) + 1 : 1;
      invoice.details.push({
        detailid,
        invoiceid,
        productid,
        productname: product.productname,
        quantity,
        unitprice: product.price,
        totalprice: product.price * quantity,
      });
    }

    invoice.servicefee = invoice.details.reduce((sum, item) => sum + item.totalprice, 0);
    return invoice;
  }

  public removeServiceFromTable(invoiceid: number, detailid: number, quantity: number = 1): Invoice {
    const invoice = this.getInvoiceById(invoiceid);
    if (!invoice || invoice.status !== 'Playing') throw new Error('Hóa đơn không tồn tại!');

    const detailIdx = invoice.details.findIndex((d) => d.detailid === detailid);
    if (detailIdx === -1) throw new Error('Chi tiết dịch vụ không tồn tại!');

    const detail = invoice.details[detailIdx];
    const product = this.products.find((p) => p.productid === detail.productid);

    if (product) {
      product.stock += quantity;
    }

    if (detail.quantity <= quantity) {
      invoice.details.splice(detailIdx, 1);
    } else {
      detail.quantity -= quantity;
      detail.totalprice = detail.quantity * detail.unitprice;
    }

    invoice.servicefee = invoice.details.reduce((sum, item) => sum + item.totalprice, 0);
    return invoice;
  }

  public checkoutTable(params: {
    invoiceid: number;
    customerid?: number;
    vouchercode?: string;
    paymentmethod: 'Cash' | 'Transfer' | 'Card';
    staffid?: number;
  }): Invoice {
    const invoice = this.getInvoiceById(params.invoiceid);
    if (!invoice || invoice.status !== 'Playing') throw new Error('Hóa đơn không hợp lệ hoặc đã đóng!');

    const table = this.tables.find((t) => t.tableid === invoice.tableid);
    if (!table) throw new Error('Bàn không tồn tại!');

    const now = new Date();
    invoice.endtime = now.toISOString();

    const start = new Date(invoice.starttime);
    const durationMs = now.getTime() - start.getTime();
    const durationMinutes = Math.max(1, Math.ceil(durationMs / (1000 * 60)));
    invoice.playtime_minutes = durationMinutes;

    const hourlyRate = table.hourlyprice;
    const tableFee = Math.round((durationMinutes / 60) * hourlyRate);
    invoice.tablefee = tableFee;

    let discount = 0;
    const targetCustomerId = params.customerid || invoice.customerid;
    let customer: Customer | undefined;
    if (targetCustomerId) {
      customer = this.customers.find((c) => c.customerid === targetCustomerId);
      if (customer) {
        const vipPercent = this.vipDiscountRates[customer.membershiptier] || 0;
        if (vipPercent > 0) {
          discount += Math.round((tableFee * vipPercent) / 100);
        }
      }
    }

    if (params.vouchercode) {
      const voucher = this.getVoucherByCode(params.vouchercode);
      if (voucher) {
        discount += voucher.discountamount;
      }
    }

    invoice.discountamount = discount;
    const total = Math.max(0, tableFee + invoice.servicefee - discount);
    invoice.totalamount = total;
    invoice.status = 'Paid';
    invoice.paymentmethod = params.paymentmethod;
    if (params.staffid) invoice.staffid = params.staffid;

    if (customer) {
      const pointsEarned = Math.floor(total / 10000);
      customer.point += pointsEarned;
      customer.totalspent += total;
      this.updateCustomerTier(customer);
    }

    table.status = TableStatus.EMPTY;
    table.current_invoice_id = null;

    return invoice;
  }

  private updateCustomerTier(customer: Customer) {
    if (customer.totalspent >= 10000000) customer.membershiptier = 'Platinum';
    else if (customer.totalspent >= 4000000) customer.membershiptier = 'Gold';
    else if (customer.totalspent >= 1500000) customer.membershiptier = 'Silver';
    else customer.membershiptier = 'Bronze';
  }

  public getVoucherByCode(code: string): Voucher | undefined {
    return this.vouchers.find((v) => v.vouchercode.toUpperCase() === code.trim().toUpperCase());
  }

  public addProduct(pData: Omit<Product, 'productid'>): Product {
    const newProduct: Product = {
      ...pData,
      productid: this.products.length > 0 ? Math.max(...this.products.map((p) => p.productid)) + 1 : 1,
    };
    this.products.push(newProduct);
    return newProduct;
  }

  public updateProduct(productid: number, pData: Partial<Product>): Product {
    const idx = this.products.findIndex((p) => p.productid === productid);
    if (idx === -1) throw new Error('Sản phẩm không tồn tại!');
    this.products[idx] = { ...this.products[idx], ...pData };
    return this.products[idx];
  }

  public importStock(productid: number, quantity: number, costprice: number, note?: string): StockTransaction {
    const product = this.products.find((p) => p.productid === productid);
    if (!product) throw new Error('Sản phẩm không tồn tại!');

    product.stock += quantity;
    product.costprice = costprice;

    const tx: StockTransaction = {
      txid: this.stockTransactions.length + 1,
      productid,
      productname: product.productname,
      type: 'IMPORT',
      quantity,
      costprice,
      createdat: new Date().toISOString(),
      note: note || 'Nhập kho thủ công',
    };
    this.stockTransactions.push(tx);
    return tx;
  }

  public addCustomer(cData: Omit<Customer, 'customerid' | 'point' | 'createdat' | 'membershiptier' | 'totalspent'>): Customer {
    const exists = this.customers.some((c) => c.phone === cData.phone.trim());
    if (exists) throw new Error('Số điện thoại đã được đăng ký!');

    const newCustomer: Customer = {
      ...cData,
      customerid: this.customers.length > 0 ? Math.max(...this.customers.map((c) => c.customerid)) + 1 : 1,
      point: 0,
      createdat: new Date().toISOString(),
      membershiptier: 'Bronze',
      totalspent: 0,
    };
    this.customers.push(newCustomer);
    return newCustomer;
  }

  public addBooking(bData: Omit<Booking, 'bookingid' | 'status'>): Booking {
    const newBooking: Booking = {
      ...bData,
      bookingid: this.bookings.length > 0 ? Math.max(...this.bookings.map((b) => b.bookingid)) + 1 : 1,
      status: 'Confirmed',
    };
    this.bookings.push(newBooking);
    return newBooking;
  }

  public cancelBooking(bookingid: number): Booking {
    const booking = this.bookings.find((b) => b.bookingid === bookingid);
    if (!booking) throw new Error('Lịch đặt không tồn tại!');
    booking.status = 'Cancelled';
    return booking;
  }

  public addTable(tData: Omit<BilliardTable, 'tableid' | 'status' | 'current_invoice_id'>): BilliardTable {
    const newTable: BilliardTable = {
      ...tData,
      tableid: this.tables.length > 0 ? Math.max(...this.tables.map((t) => t.tableid)) + 1 : 1,
      status: TableStatus.EMPTY,
      current_invoice_id: null,
    };
    this.tables.push(newTable);
    return newTable;
  }

  public updateTable(tableid: number, tData: Partial<BilliardTable>): BilliardTable {
    const idx = this.tables.findIndex((t) => t.tableid === tableid);
    if (idx === -1) throw new Error('Bàn không tồn tại!');
    this.tables[idx] = { ...this.tables[idx], ...tData };
    return this.tables[idx];
  }

  public batchUpdateZonePrice(zone: string, hourlyprice: number): number {
    let count = 0;
    this.tables.forEach((t) => {
      if (!zone || zone === 'ALL' || t.zone === zone) {
        t.hourlyprice = hourlyprice;
        count++;
      }
    });
    return count;
  }

  public deleteTable(tableid: number): boolean {
    const idx = this.tables.findIndex((t) => t.tableid === tableid);
    if (idx === -1) throw new Error('Bàn không tồn tại!');
    if (this.tables[idx].status === TableStatus.PLAYING) {
      throw new Error('Không thể xóa bàn đang có khách chơi!');
    }
    this.tables.splice(idx, 1);
    return true;
  }

  public getDashboardStats() {
    const today = new Date().toISOString().split('T')[0];
    const todayInvoices = this.invoices.filter((i) => i.status === 'Paid' && i.createdat.startsWith(today));

    const totalRevenueToday = todayInvoices.reduce((sum, i) => sum + i.totalamount, 0);
    const tableRevenueToday = todayInvoices.reduce((sum, i) => sum + i.tablefee, 0);
    const serviceRevenueToday = todayInvoices.reduce((sum, i) => sum + i.servicefee, 0);

    const playingTablesCount = this.tables.filter((t) => t.status === TableStatus.PLAYING).length;
    const emptyTablesCount = this.tables.filter((t) => t.status === TableStatus.EMPTY).length;

    return {
      totalRevenueToday,
      tableRevenueToday,
      serviceRevenueToday,
      playingTablesCount,
      emptyTablesCount,
      totalInvoicesToday: todayInvoices.length,
      lowStockProducts: this.products.filter((p) => p.stock <= p.minstock),
    };
  }
}

export const db = new BilliardDatabase();

// --- EXPRESS APP SETUP ---
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

// 2. PRODUCTS & INVENTORY
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

    const { data, error } = await client.from('todos').select('*').limit(1);

    res.json({
      success: !error,
      url: supabaseUrl,
      connected: !error,
      data: data || [],
      error: error ? error.message : null,
      message: !error ? 'Kết nối tới Supabase thành công!' : `Supabase phản hồi nhưng có lỗi: ${error.message}`,
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

export default app;
