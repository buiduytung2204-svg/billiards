import {
  Customer,
  BilliardTable,
  Product,
  Booking,
  Invoice,
  InvoiceDetail,
  Staff,
  Voucher,
  StockTransaction,
  TableStatus,
  InvoiceStatus,
  MembershipTier,
} from '../types';
import {
  INITIAL_CUSTOMERS,
  INITIAL_TABLES,
  INITIAL_PRODUCTS,
  INITIAL_VOUCHERS,
  INITIAL_STAFFS,
  INITIAL_BOOKINGS,
} from '../db/initialData';

class BilliardDatabase {
  private customers: Customer[] = [];
  private tables: BilliardTable[] = [];
  private products: Product[] = [];
  private bookings: Booking[] = [];
  private invoices: Invoice[] = [];
  private invoiceDetails: InvoiceDetail[] = [];
  private staffs: Staff[] = [];
  private vouchers: Voucher[] = [];
  private stockTransactions: StockTransaction[] = [];

  private nextCustomerId = 10;
  private nextTableId = 20;
  private nextProductId = 30;
  private nextBookingId = 10;
  private nextInvoiceId = 100;
  private nextDetailId = 500;
  private nextTransactionId = 1000;

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
    this.invoiceDetails = [];
    this.stockTransactions = [];

    // Pre-populate an active demo playing table (e.g., Table 2) so user sees live timer immediately
    const now = new Date();
    const startTime2 = new Date(now.getTime() - 45 * 60 * 1000); // Played 45 mins ago
    const activeInvId = 101;

    const demoInvoice: Invoice = {
      invoiceid: activeInvId,
      tableid: 2,
      customerid: 1,
      starttime: startTime2.toISOString(),
      endtime: null,
      tablefee: 0,
      servicefee: 70000, // 2 sting + 1 mi xao bo
      totalamount: 70000,
      status: InvoiceStatus.OPEN,
      staffid: 2,
      paymentmethod: 'Cash',
      tablename: 'Bàn 2',
      hourlyprice: 70000,
      customername: 'Phạm Đức Anh',
      customerphone: '0988111222',
      staffname: 'Trần Thị Thu (Thu ngân)',
      details: [
        { detailid: 501, invoiceid: activeInvId, productid: 3, quantity: 2, unitprice: 20000, subtotal: 40000, productname: 'Sting đỏ / dâu', unit: 'Chai' },
        { detailid: 502, invoiceid: activeInvId, productid: 6, quantity: 1, unitprice: 30000, subtotal: 30000, productname: 'Mì xào bò đặc biệt', unit: 'Đĩa' },
      ],
    };

    this.invoices.push(demoInvoice);
    this.invoiceDetails.push(...demoInvoice.details!);
    
    // Set table 2 to PLAYING
    const table2 = this.tables.find((t) => t.tableid === 2);
    if (table2) {
      table2.status = TableStatus.PLAYING;
      table2.current_invoice_id = activeInvId;
    }

    // Set table 8 to BOOKED
    const table8 = this.tables.find((t) => t.tableid === 8);
    if (table8) {
      table8.status = TableStatus.BOOKED;
    }
  }

  // --- TABLES ---
  public getTables(): BilliardTable[] {
    return this.tables;
  }

  public getTableById(id: number): BilliardTable | undefined {
    return this.tables.find((t) => t.tableid === id);
  }

  public addTable(tableData: Omit<BilliardTable, 'tableid' | 'status'>): BilliardTable {
    const newTable: BilliardTable = {
      ...tableData,
      tableid: this.nextTableId++,
      status: TableStatus.EMPTY,
    };
    this.tables.push(newTable);
    return newTable;
  }

  public updateTable(id: number, data: Partial<BilliardTable>): BilliardTable | undefined {
    const idx = this.tables.findIndex((t) => t.tableid === id);
    if (idx !== -1) {
      this.tables[idx] = { ...this.tables[idx], ...data };
      return this.tables[idx];
    }
    return undefined;
  }

  // --- CORE OPERATION (a): MỞ BÀN ---
  public openTable(tableid: number, customerid?: number, staffid: number = 2): Invoice {
    const table = this.getTableById(tableid);
    if (!table) throw new Error('Bàn không tồn tại');
    if (table.status === TableStatus.PLAYING) {
      throw new Error('Bàn hiện đang có người chơi');
    }

    const nowIso = new Date().toISOString();
    const invoiceId = this.nextInvoiceId++;

    let customername = '';
    let customerphone = '';
    if (customerid) {
      const customer = this.getCustomerById(customerid);
      if (customer) {
        customername = customer.fullname;
        customerphone = customer.phone;
      }
    }

    const staff = this.getStaffById(staffid);

    const newInvoice: Invoice = {
      invoiceid: invoiceId,
      tableid: tableid,
      customerid: customerid || null,
      starttime: nowIso,
      endtime: null,
      tablefee: 0,
      servicefee: 0,
      totalamount: 0,
      status: InvoiceStatus.OPEN,
      staffid: staffid,
      paymentmethod: 'Cash',
      tablename: table.tablename,
      hourlyprice: table.hourlyprice,
      customername: customername,
      customerphone: customerphone,
      staffname: staff ? staff.fullname : 'Thu ngân',
      details: [],
    };

    this.invoices.push(newInvoice);

    // Cập nhật trạng thái bàn sang 1 (Đang chơi) và liên kết current_invoice_id
    table.status = TableStatus.PLAYING;
    table.current_invoice_id = invoiceId;

    return newInvoice;
  }

  // --- THÊM SẢN PHẨM / DỊCH VỤ VÀO BÀN ---
  public addServiceToTable(invoiceid: number, productid: number, quantity: number): Invoice {
    const invoice = this.invoices.find((i) => i.invoiceid === invoiceid && i.status === InvoiceStatus.OPEN);
    if (!invoice) throw new Error('Hóa đơn không tồn tại hoặc đã đóng');

    const product = this.getProductById(productid);
    if (!product) throw new Error('Sản phẩm không tồn tại');
    if (product.stock < quantity) {
      throw new Error(`Số lượng tồn kho không đủ (${product.stock} ${product.unit})`);
    }

    // Trừ tồn kho và ghi nhận StockTransaction (Tự động cập nhật kho KiotViet style)
    product.stock -= quantity;
    this.stockTransactions.push({
      transactionid: this.nextTransactionId++,
      productid: product.productid,
      staffid: invoice.staffid,
      transactiontype: 'Sale',
      quantitychange: -quantity,
      transactiondate: new Date().toISOString(),
      note: `Bán dịch vụ cho ${invoice.tablename} (HĐ #${invoice.invoiceid})`,
      productname: product.productname,
    });

    if (!invoice.details) invoice.details = [];

    const existingDetail = invoice.details.find((d) => d.productid === productid);
    if (existingDetail) {
      existingDetail.quantity += quantity;
      existingDetail.subtotal = existingDetail.quantity * existingDetail.unitprice;
    } else {
      const detail: InvoiceDetail = {
        detailid: this.nextDetailId++,
        invoiceid: invoice.invoiceid,
        productid: product.productid,
        quantity: quantity,
        unitprice: product.price,
        costprice: product.costprice,
        subtotal: product.price * quantity,
        productname: product.productname,
        unit: product.unit,
      };
      invoice.details.push(detail);
      this.invoiceDetails.push(detail);
    }

    // Cập nhật servicefee
    invoice.servicefee = invoice.details.reduce((sum, d) => sum + d.subtotal, 0);

    return invoice;
  }

  // --- BỚT SẢN PHẨM / DỊCH VỤ KHỎI BÀN ---
  public removeServiceFromTable(invoiceid: number, detailid: number, quantityToRemove: number = 1): Invoice {
    const invoice = this.invoices.find((i) => i.invoiceid === invoiceid && i.status === InvoiceStatus.OPEN);
    if (!invoice) throw new Error('Hóa đơn không tồn tại hoặc đã đóng');

    if (!invoice.details) return invoice;

    const detailIdx = invoice.details.findIndex((d) => d.detailid === detailid);
    if (detailIdx === -1) throw new Error('Chi tiết dịch vụ không tồn tại');

    const detail = invoice.details[detailIdx];
    const product = this.getProductById(detail.productid);

    const actualRemove = Math.min(detail.quantity, quantityToRemove);
    detail.quantity -= actualRemove;

    // Trả lại kho
    if (product) {
      product.stock += actualRemove;
      this.stockTransactions.push({
        transactionid: this.nextTransactionId++,
        productid: product.productid,
        staffid: invoice.staffid,
        transactiontype: 'Adjustment',
        quantitychange: actualRemove,
        transactiondate: new Date().toISOString(),
        note: `Hoàn trả món từ ${invoice.tablename} (HĐ #${invoice.invoiceid})`,
        productname: product.productname,
      });
    }

    if (detail.quantity <= 0) {
      invoice.details.splice(detailIdx, 1);
      const mainIdx = this.invoiceDetails.findIndex((d) => d.detailid === detailid);
      if (mainIdx !== -1) this.invoiceDetails.splice(mainIdx, 1);
    } else {
      detail.subtotal = detail.quantity * detail.unitprice;
    }

    invoice.servicefee = invoice.details.reduce((sum, d) => sum + d.subtotal, 0);
    return invoice;
  }

  // --- HỦY MỞ BÀN (NẾU MỞ NHẦM) ---
  public cancelOpenTable(tableid: number): BilliardTable {
    const table = this.getTableById(tableid);
    if (!table) throw new Error('Bàn không tồn tại');
    if (table.status !== TableStatus.PLAYING || !table.current_invoice_id) {
      throw new Error('Bàn hiện không ở trạng thái đang mở');
    }

    const invoice = this.invoices.find((i) => i.invoiceid === table.current_invoice_id);
    if (invoice && invoice.status === InvoiceStatus.OPEN) {
      // Hoàn trả tồn kho nếu đã gọi dịch vụ
      if (invoice.details && invoice.details.length > 0) {
        for (const detail of invoice.details) {
          const product = this.getProductById(detail.productid);
          if (product) {
            product.stock += detail.quantity;
            this.stockTransactions.push({
              transactionid: this.nextTransactionId++,
              productid: product.productid,
              staffid: invoice.staffid,
              transactiontype: 'Adjustment',
              quantitychange: detail.quantity,
              transactiondate: new Date().toISOString(),
              note: `Hoàn kho do hủy mở bàn ${invoice.tablename} (HĐ #${invoice.invoiceid})`,
              productname: product.productname,
            });
          }
        }
      }
      invoice.status = InvoiceStatus.CANCELLED;
      invoice.endtime = new Date().toISOString();
    }

    table.status = TableStatus.EMPTY;
    table.current_invoice_id = null;

    return table;
  }

  // --- CORE OPERATION (b): TÍNH TIỀN & ĐÓNG BÀN (THANH TOÁN) ---
  public checkoutTable(params: {
    invoiceid: number;
    customerid?: number;
    vouchercode?: string;
    paymentmethod: 'Cash' | 'Transfer' | 'Card';
    staffid?: number;
  }): Invoice {
    const invoice = this.invoices.find((i) => i.invoiceid === params.invoiceid);
    if (!invoice) throw new Error('Hóa đơn không tồn tại');
    if (invoice.status === InvoiceStatus.PAID) throw new Error('Hóa đơn đã được thanh toán');

    const table = this.getTableById(invoice.tableid);
    if (!table) throw new Error('Bàn không tồn tại');

    const endtime = new Date();
    const starttime = new Date(invoice.starttime);
    
    // Tính số phút chơi
    const durationMinutes = Math.max(1, Math.ceil((endtime.getTime() - starttime.getTime()) / (1000 * 60)));
    
    // Tính tiền giờ = (hourlyprice / 60) * durationMinutes
    const tablefee = Math.round((table.hourlyprice / 60) * durationMinutes);

    invoice.endtime = endtime.toISOString();
    invoice.tablefee = tablefee;
    invoice.servicefee = (invoice.details || []).reduce((sum, d) => sum + d.subtotal, 0);

    let subTotal = invoice.tablefee + invoice.servicefee;
    let discount = 0;

    // Áp dụng voucher
    if (params.vouchercode) {
      const voucher = this.getVoucherByCode(params.vouchercode);
      if (voucher) {
        if (subTotal >= voucher.minordervalue) {
          discount = voucher.discountamount;
          invoice.voucherid = voucher.voucherid;
          invoice.vouchercode = voucher.vouchercode;
        }
      }
    }

    invoice.discountamount = discount;
    invoice.totalamount = Math.max(0, subTotal - discount);
    invoice.paymentmethod = params.paymentmethod;
    invoice.status = InvoiceStatus.PAID;

    // Cập nhật trạng thái bàn về Trống (0)
    table.status = TableStatus.EMPTY;
    table.current_invoice_id = null;

    // Xử lý khách hàng & Tích điểm & Nâng hạng membership
    const cid = params.customerid || invoice.customerid;
    if (cid) {
      const customer = this.getCustomerById(cid);
      if (customer) {
        invoice.customerid = cid;
        invoice.customername = customer.fullname;
        invoice.customerphone = customer.phone;

        customer.totalspent += invoice.totalamount;
        
        // Tích điểm: 10,000 VND = 1 điểm (point)
        const newPoints = Math.floor(invoice.totalamount / 10000);
        customer.point += newPoints;

        // Tự động nâng hạng thành viên (CRM KiotViet style)
        if (customer.totalspent >= 10000000) {
          customer.membershiptier = 'Diamond';
        } else if (customer.totalspent >= 5000000) {
          customer.membershiptier = 'Platinum';
        } else if (customer.totalspent >= 3000000) {
          customer.membershiptier = 'Gold';
        } else if (customer.totalspent >= 1000000) {
          customer.membershiptier = 'Silver';
        } else {
          customer.membershiptier = 'Bronze';
        }
      }
    }

    return invoice;
  }

  // --- PRODUCTS / INVENTORY ---
  public getProducts(): Product[] {
    return this.products;
  }

  public getProductById(id: number): Product | undefined {
    return this.products.find((p) => p.productid === id);
  }

  public addProduct(pData: Omit<Product, 'productid'>): Product {
    const newP: Product = {
      ...pData,
      productid: this.nextProductId++,
      stock: pData.stock || 0,
      isactive: true,
    };
    this.products.push(newP);

    // Record stock transaction if initial stock > 0
    if (newP.stock > 0) {
      this.stockTransactions.push({
        transactionid: this.nextTransactionId++,
        productid: newP.productid,
        staffid: 1,
        transactiontype: 'Import',
        quantitychange: newP.stock,
        transactiondate: new Date().toISOString(),
        note: 'Tạo sản phẩm & khởi tạo kho ban đầu',
        productname: newP.productname,
      });
    }

    return newP;
  }

  public updateProduct(id: number, data: Partial<Product>): Product | undefined {
    const idx = this.products.findIndex((p) => p.productid === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...data };
      return this.products[idx];
    }
    return undefined;
  }

  public importStock(productid: number, quantity: number, costprice?: number, note?: string): StockTransaction {
    const product = this.getProductById(productid);
    if (!product) throw new Error('Sản phẩm không tồn tại');

    product.stock += quantity;
    if (costprice !== undefined) {
      product.costprice = costprice;
    }

    const transaction: StockTransaction = {
      transactionid: this.nextTransactionId++,
      productid: productid,
      staffid: 1,
      transactiontype: 'Import',
      quantitychange: quantity,
      transactiondate: new Date().toISOString(),
      note: note || 'Nhập hàng vào kho',
      unitprice: costprice || product.costprice,
      productname: product.productname,
    };

    this.stockTransactions.unshift(transaction);
    return transaction;
  }

  public getStockTransactions(): StockTransaction[] {
    return this.stockTransactions;
  }

  // --- CUSTOMERS (CRM) ---
  public getCustomers(): Customer[] {
    return this.customers;
  }

  public getCustomerById(id: number): Customer | undefined {
    return this.customers.find((c) => c.customerid === id);
  }

  public addCustomer(data: Omit<Customer, 'customerid' | 'createdat' | 'point' | 'totalspent' | 'membershiptier'>): Customer {
    const newCust: Customer = {
      ...data,
      customerid: this.nextCustomerId++,
      point: 0,
      createdat: new Date().toISOString(),
      membershiptier: 'Bronze',
      totalspent: 0,
    };
    this.customers.push(newCust);
    return newCust;
  }

  // --- VOUCHERS ---
  public getVouchers(): Voucher[] {
    return this.vouchers;
  }

  public getVoucherByCode(code: string): Voucher | undefined {
    return this.vouchers.find((v) => v.vouchercode.toUpperCase() === code.trim().toUpperCase());
  }

  // --- BOOKINGS ---
  public getBookings(): Booking[] {
    return this.bookings;
  }

  public addBooking(data: Omit<Booking, 'bookingid' | 'createdat' | 'status'>): Booking {
    const customer = this.getCustomerById(data.customerid);
    const table = data.tableid ? this.getTableById(data.tableid) : undefined;

    const newBooking: Booking = {
      ...data,
      bookingid: this.nextBookingId++,
      status: 'Pending',
      createdat: new Date().toISOString(),
      customername: customer ? customer.fullname : 'Khách lẻ',
      customerphone: customer ? customer.phone : '',
      tablename: table ? table.tablename : 'Bàn bất kỳ',
    };

    this.bookings.push(newBooking);

    // If assigned to a table, update table status to BOOKED
    if (table && table.status === TableStatus.EMPTY) {
      table.status = TableStatus.BOOKED;
    }

    return newBooking;
  }

  public cancelBooking(bookingid: number): Booking {
    const booking = this.bookings.find((b) => b.bookingid === bookingid);
    if (!booking) throw new Error('Không tìm thấy thông tin đặt bàn');

    booking.status = 'Cancelled';

    if (booking.tableid) {
      const table = this.getTableById(booking.tableid);
      if (table && table.status === TableStatus.BOOKED) {
        table.status = TableStatus.EMPTY;
      }
    }

    return booking;
  }

  // --- INVOICES HISTORY ---
  public getInvoices(): Invoice[] {
    return this.invoices.slice().sort((a, b) => new Date(b.starttime).getTime() - new Date(a.starttime).getTime());
  }

  public getInvoiceById(id: number): Invoice | undefined {
    return this.invoices.find((i) => i.invoiceid === id);
  }

  public getActiveInvoiceForTable(tableid: number): Invoice | undefined {
    return this.invoices.find((i) => i.tableid === tableid && i.status === InvoiceStatus.OPEN);
  }

  // --- STAFFS ---
  public getStaffs(): Staff[] {
    return this.staffs;
  }

  public getStaffById(id: number): Staff | undefined {
    return this.staffs.find((s) => s.staffid === id);
  }

  // --- STATS ---
  public getDashboardStats() {
    const openInvoices = this.invoices.filter((i) => i.status === InvoiceStatus.OPEN);
    const todayStr = new Date().toISOString().split('T')[0];
    const paidInvoicesToday = this.invoices.filter(
      (i) => i.status === InvoiceStatus.PAID && i.endtime && i.endtime.startsWith(todayStr)
    );

    const totalRevenueToday = paidInvoicesToday.reduce((sum, i) => sum + i.totalamount, 0);

    return {
      totalRevenueToday,
      activeTablesCount: this.tables.filter((t) => t.status === TableStatus.PLAYING).length,
      emptyTablesCount: this.tables.filter((t) => t.status === TableStatus.EMPTY).length,
      totalInvoicesToday: paidInvoicesToday.length,
      lowStockCount: this.products.filter((p) => p.stock <= (p.minstock || 10)).length,
      totalCustomers: this.customers.length,
    };
  }
}

export const db = new BilliardDatabase();
