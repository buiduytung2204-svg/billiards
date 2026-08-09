// src/backend/app.ts
import express from "express";
import cors from "cors";

// src/db/initialData.ts
var INITIAL_STAFFS = [
  { staffid: 1, username: "admin", password: "123", fullname: "Nguy\u1EC5n V\u0103n Minh (Qu\u1EA3n l\xFD)", role: "Manager", phone: "0901234567", status: "Active" }
];
var INITIAL_CUSTOMERS = [
  {
    customerid: 1,
    fullname: "Ph\u1EA1m \u0110\u1EE9c Anh",
    phone: "0988111222",
    email: "ducanh@gmail.com",
    point: 320,
    createdat: "2026-01-15T08:00:00Z",
    membershiptier: "Gold",
    totalspent: 48e5
  },
  {
    customerid: 2,
    fullname: "Nguy\u1EC5n Thanh T\xF9ng",
    phone: "0977333444",
    email: "thanhtung@gmail.com",
    point: 150,
    createdat: "2026-02-10T10:30:00Z",
    membershiptier: "Silver",
    totalspent: 21e5
  },
  {
    customerid: 3,
    fullname: "V\u0169 Qu\u1ED1c B\u1EA3o",
    phone: "0966555666",
    email: "quocbao@billiard.vn",
    point: 650,
    createdat: "2025-11-20T14:15:00Z",
    membershiptier: "Platinum",
    totalspent: 115e5
  },
  {
    customerid: 4,
    fullname: "Ho\xE0ng Tr\u1ECDng Ngh\u0129a",
    phone: "0933888999",
    email: "trongnghia@yahoo.com",
    point: 45,
    createdat: "2026-03-01T09:00:00Z",
    membershiptier: "Bronze",
    totalspent: 65e4
  }
];
var INITIAL_TABLES = [
  { tableid: 1, tablename: "B\xE0n 1", tabletype: "B\xE0n Bida", hourlyprice: 7e4, status: 0 /* EMPTY */, zone: "Khu A" },
  { tableid: 2, tablename: "B\xE0n 2", tabletype: "B\xE0n Bida", hourlyprice: 7e4, status: 0 /* EMPTY */, zone: "Khu A" },
  { tableid: 3, tablename: "B\xE0n 3", tabletype: "B\xE0n Bida", hourlyprice: 7e4, status: 0 /* EMPTY */, zone: "Khu A" },
  { tableid: 4, tablename: "B\xE0n 4", tabletype: "B\xE0n Bida", hourlyprice: 7e4, status: 0 /* EMPTY */, zone: "Khu A" },
  { tableid: 5, tablename: "B\xE0n 5", tabletype: "B\xE0n Bida", hourlyprice: 8e4, status: 0 /* EMPTY */, zone: "Khu B" },
  { tableid: 6, tablename: "B\xE0n 6", tabletype: "B\xE0n Bida", hourlyprice: 8e4, status: 0 /* EMPTY */, zone: "Khu B" },
  { tableid: 7, tablename: "B\xE0n 7", tabletype: "B\xE0n Bida", hourlyprice: 8e4, status: 0 /* EMPTY */, zone: "Khu B" },
  { tableid: 8, tablename: "B\xE0n 8", tabletype: "B\xE0n Bida", hourlyprice: 8e4, status: 0 /* EMPTY */, zone: "Khu B" },
  { tableid: 9, tablename: "B\xE0n 9", tabletype: "B\xE0n Bida", hourlyprice: 12e4, status: 0 /* EMPTY */, zone: "Ph\xF2ng VIP" },
  { tableid: 10, tablename: "B\xE0n 10", tabletype: "B\xE0n Bida", hourlyprice: 12e4, status: 0 /* EMPTY */, zone: "Ph\xF2ng VIP" },
  { tableid: 11, tablename: "B\xE0n 11", tabletype: "B\xE0n Bida", hourlyprice: 12e4, status: 0 /* EMPTY */, zone: "Ph\xF2ng VIP" },
  { tableid: 12, tablename: "B\xE0n 12", tabletype: "B\xE0n Bida", hourlyprice: 15e4, status: 0 /* EMPTY */, zone: "Ph\xF2ng VIP" }
];
var INITIAL_PRODUCTS = [
  { productid: 1, productname: "C\xE0 ph\xEA \u0111\xE1", category: "N\u01B0\u1EDBc u\u1ED1ng", price: 25e3, costprice: 8e3, unit: "Ly", stock: 150, minstock: 20, isactive: true },
  { productid: 2, productname: "C\xE0 ph\xEA s\u1EEFa \u0111\xE1", category: "N\u01B0\u1EDBc u\u1ED1ng", price: 3e4, costprice: 1e4, unit: "Ly", stock: 140, minstock: 20, isactive: true },
  { productid: 3, productname: "Sting \u0111\u1ECF / d\xE2u", category: "N\u01B0\u1EDBc u\u1ED1ng", price: 2e4, costprice: 9e3, unit: "Chai", stock: 85, minstock: 24, isactive: true },
  { productid: 4, productname: "RedBull Th\xE1i", category: "N\u01B0\u1EDBc u\u1ED1ng", price: 25e3, costprice: 12e3, unit: "Lon", stock: 60, minstock: 12, isactive: true },
  { productid: 5, productname: "N\u01B0\u1EDBc su\u1ED1i Aquafina 500ml", category: "N\u01B0\u1EDBc u\u1ED1ng", price: 12e3, costprice: 4500, unit: "Chai", stock: 200, minstock: 30, isactive: true },
  { productid: 6, productname: "M\xEC x\xE0o b\xF2 \u0111\u1EB7c bi\u1EC7t", category: "\u0110\u1ED3 \u0103n", price: 45e3, costprice: 22e3, unit: "\u0110\u0129a", stock: 40, minstock: 10, isactive: true },
  { productid: 7, productname: "C\u01A1m chi\xEAn h\u1EA3i s\u1EA3n", category: "\u0110\u1ED3 \u0103n", price: 5e4, costprice: 25e3, unit: "\u0110\u0129a", stock: 35, minstock: 10, isactive: true },
  { productid: 8, productname: "C\xE1 vi\xEAn chi\xEAn bida set", category: "\u0110\u1ED3 \u0103n", price: 35e3, costprice: 15e3, unit: "\u0110\u0129a", stock: 50, minstock: 15, isactive: true },
  { productid: 9, productname: "Thu\u1ED1c l\xE1 555 Ngo\u1EA1i", category: "Thu\u1ED1c l\xE1", price: 4e4, costprice: 32e3, unit: "G\xF3i", stock: 18, minstock: 10, isactive: true },
  { productid: 10, productname: "Kh\u0103n l\u1EA1nh ti\u1EC7t tr\xF9ng", category: "D\u1ECBch v\u1EE5 kh\xE1c", price: 5e3, costprice: 1500, unit: "C\xE1i", stock: 300, minstock: 50, isactive: true },
  { productid: 11, productname: "G\u0103ng tay bida Taom", category: "Ph\u1EE5 ki\u1EC7n", price: 6e4, costprice: 35e3, unit: "C\xE1i", stock: 12, minstock: 5, isactive: true }
];
var INITIAL_VOUCHERS = [
  { voucherid: 1, vouchercode: "BIDA50K", discountamount: 5e4, discounttype: "Fixed", minordervalue: 2e5, expirydate: "2026-12-31" },
  { voucherid: 2, vouchercode: "VIP100K", discountamount: 1e5, discounttype: "Fixed", minordervalue: 4e5, expirydate: "2026-12-31" },
  { voucherid: 3, vouchercode: "CHAO2026", discountamount: 3e4, discounttype: "Fixed", minordervalue: 1e5, expirydate: "2026-12-31" }
];
var INITIAL_BOOKINGS = [];

// src/backend/db.ts
var BilliardDatabase = class {
  constructor() {
    this.customers = [];
    this.tables = [];
    this.products = [];
    this.bookings = [];
    this.invoices = [];
    this.invoiceDetails = [];
    this.staffs = [];
    this.vouchers = [];
    this.stockTransactions = [];
    this.nextCustomerId = 10;
    this.nextTableId = 20;
    this.nextProductId = 30;
    this.nextBookingId = 10;
    this.nextInvoiceId = 100;
    this.nextDetailId = 500;
    this.nextTransactionId = 1e3;
    // Cấu hình tỷ lệ % giảm giá giờ chơi theo cấp VIP
    this.vipDiscountRates = {
      Bronze: 5,
      Silver: 10,
      Gold: 15,
      Platinum: 20,
      Diamond: 25
    };
    this.resetData();
  }
  getVipDiscountRates() {
    return this.vipDiscountRates;
  }
  updateVipDiscountRates(rates) {
    this.vipDiscountRates = { ...this.vipDiscountRates, ...rates };
    return this.vipDiscountRates;
  }
  getVipDiscountPercent(tier) {
    if (!tier) return 0;
    return this.vipDiscountRates[tier] || 0;
  }
  resetData() {
    this.customers = [...INITIAL_CUSTOMERS];
    this.tables = INITIAL_TABLES.map((t) => ({ ...t, status: 0 /* EMPTY */, current_invoice_id: null }));
    this.products = [...INITIAL_PRODUCTS];
    this.vouchers = [...INITIAL_VOUCHERS];
    this.staffs = [...INITIAL_STAFFS];
    this.bookings = [...INITIAL_BOOKINGS];
    this.invoices = [];
    this.invoiceDetails = [];
    this.stockTransactions = [];
  }
  // --- TABLES ---
  getTables() {
    return this.tables;
  }
  getTableById(id) {
    return this.tables.find((t) => t.tableid === id);
  }
  addTable(tableData) {
    const newTable = {
      ...tableData,
      tableid: this.nextTableId++,
      status: 0 /* EMPTY */
    };
    this.tables.push(newTable);
    return newTable;
  }
  updateTable(id, data) {
    const idx = this.tables.findIndex((t) => t.tableid === id);
    if (idx !== -1) {
      this.tables[idx] = { ...this.tables[idx], ...data };
      return this.tables[idx];
    }
    return void 0;
  }
  deleteTable(id) {
    const table = this.getTableById(id);
    if (!table) return false;
    if (table.status === 1 /* PLAYING */) {
      throw new Error("Kh\xF4ng th\u1EC3 x\xF3a b\xE0n \u0111ang c\xF3 kh\xE1ch ch\u01A1i!");
    }
    this.tables = this.tables.filter((t) => t.tableid !== id);
    return true;
  }
  batchUpdateZonePrice(zone, hourlyprice) {
    let count = 0;
    this.tables.forEach((t) => {
      if (!zone || t.zone === zone || zone === "ALL") {
        t.hourlyprice = hourlyprice;
        count++;
      }
    });
    return count;
  }
  // --- CORE OPERATION (a): MỞ BÀN ---
  openTable(tableid, customerid, staffid = 2) {
    const table = this.getTableById(tableid);
    if (!table) throw new Error("B\xE0n kh\xF4ng t\u1ED3n t\u1EA1i");
    if (table.status === 1 /* PLAYING */) {
      throw new Error("B\xE0n hi\u1EC7n \u0111ang c\xF3 ng\u01B0\u1EDDi ch\u01A1i");
    }
    const nowIso = (/* @__PURE__ */ new Date()).toISOString();
    const invoiceId = this.nextInvoiceId++;
    let customername = "";
    let customerphone = "";
    if (customerid) {
      const customer = this.getCustomerById(customerid);
      if (customer) {
        customername = customer.fullname;
        customerphone = customer.phone;
      }
    }
    const staff = this.getStaffById(staffid);
    const newInvoice = {
      invoiceid: invoiceId,
      tableid,
      customerid: customerid || null,
      starttime: nowIso,
      endtime: null,
      tablefee: 0,
      servicefee: 0,
      totalamount: 0,
      status: 0 /* OPEN */,
      staffid,
      paymentmethod: "Cash",
      tablename: table.tablename,
      hourlyprice: table.hourlyprice,
      customername,
      customerphone,
      staffname: staff ? staff.fullname : "Thu ng\xE2n",
      details: []
    };
    this.invoices.push(newInvoice);
    table.status = 1 /* PLAYING */;
    table.current_invoice_id = invoiceId;
    return newInvoice;
  }
  // --- THÊM SẢN PHẨM / DỊCH VỤ VÀO BÀN ---
  addServiceToTable(invoiceid, productid, quantity) {
    const invoice = this.invoices.find((i) => i.invoiceid === invoiceid && i.status === 0 /* OPEN */);
    if (!invoice) throw new Error("H\xF3a \u0111\u01A1n kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 \u0111\xF3ng");
    const product = this.getProductById(productid);
    if (!product) throw new Error("S\u1EA3n ph\u1EA9m kh\xF4ng t\u1ED3n t\u1EA1i");
    if (product.stock < quantity) {
      throw new Error(`S\u1ED1 l\u01B0\u1EE3ng t\u1ED3n kho kh\xF4ng \u0111\u1EE7 (${product.stock} ${product.unit})`);
    }
    product.stock -= quantity;
    this.stockTransactions.push({
      transactionid: this.nextTransactionId++,
      productid: product.productid,
      staffid: invoice.staffid,
      transactiontype: "Sale",
      quantitychange: -quantity,
      transactiondate: (/* @__PURE__ */ new Date()).toISOString(),
      note: `B\xE1n d\u1ECBch v\u1EE5 cho ${invoice.tablename} (H\u0110 #${invoice.invoiceid})`,
      productname: product.productname
    });
    if (!invoice.details) invoice.details = [];
    const existingDetail = invoice.details.find((d) => d.productid === productid);
    if (existingDetail) {
      existingDetail.quantity += quantity;
      existingDetail.subtotal = existingDetail.quantity * existingDetail.unitprice;
    } else {
      const detail = {
        detailid: this.nextDetailId++,
        invoiceid: invoice.invoiceid,
        productid: product.productid,
        quantity,
        unitprice: product.price,
        costprice: product.costprice,
        subtotal: product.price * quantity,
        productname: product.productname,
        unit: product.unit
      };
      invoice.details.push(detail);
      this.invoiceDetails.push(detail);
    }
    invoice.servicefee = invoice.details.reduce((sum, d) => sum + d.subtotal, 0);
    return invoice;
  }
  // --- BỚT SẢN PHẨM / DỊCH VỤ KHỎI BÀN ---
  removeServiceFromTable(invoiceid, detailid, quantityToRemove = 1) {
    const invoice = this.invoices.find((i) => i.invoiceid === invoiceid && i.status === 0 /* OPEN */);
    if (!invoice) throw new Error("H\xF3a \u0111\u01A1n kh\xF4ng t\u1ED3n t\u1EA1i ho\u1EB7c \u0111\xE3 \u0111\xF3ng");
    if (!invoice.details) return invoice;
    const detailIdx = invoice.details.findIndex((d) => d.detailid === detailid);
    if (detailIdx === -1) throw new Error("Chi ti\u1EBFt d\u1ECBch v\u1EE5 kh\xF4ng t\u1ED3n t\u1EA1i");
    const detail = invoice.details[detailIdx];
    const product = this.getProductById(detail.productid);
    const actualRemove = Math.min(detail.quantity, quantityToRemove);
    detail.quantity -= actualRemove;
    if (product) {
      product.stock += actualRemove;
      this.stockTransactions.push({
        transactionid: this.nextTransactionId++,
        productid: product.productid,
        staffid: invoice.staffid,
        transactiontype: "Adjustment",
        quantitychange: actualRemove,
        transactiondate: (/* @__PURE__ */ new Date()).toISOString(),
        note: `Ho\xE0n tr\u1EA3 m\xF3n t\u1EEB ${invoice.tablename} (H\u0110 #${invoice.invoiceid})`,
        productname: product.productname
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
  cancelOpenTable(tableid) {
    const table = this.getTableById(tableid);
    if (!table) throw new Error("B\xE0n kh\xF4ng t\u1ED3n t\u1EA1i");
    if (table.status !== 1 /* PLAYING */ || !table.current_invoice_id) {
      throw new Error("B\xE0n hi\u1EC7n kh\xF4ng \u1EDF tr\u1EA1ng th\xE1i \u0111ang m\u1EDF");
    }
    const invoice = this.invoices.find((i) => i.invoiceid === table.current_invoice_id);
    if (invoice && invoice.status === 0 /* OPEN */) {
      if (invoice.details && invoice.details.length > 0) {
        for (const detail of invoice.details) {
          const product = this.getProductById(detail.productid);
          if (product) {
            product.stock += detail.quantity;
            this.stockTransactions.push({
              transactionid: this.nextTransactionId++,
              productid: product.productid,
              staffid: invoice.staffid,
              transactiontype: "Adjustment",
              quantitychange: detail.quantity,
              transactiondate: (/* @__PURE__ */ new Date()).toISOString(),
              note: `Ho\xE0n kho do h\u1EE7y m\u1EDF b\xE0n ${invoice.tablename} (H\u0110 #${invoice.invoiceid})`,
              productname: product.productname
            });
          }
        }
      }
      invoice.status = 2 /* CANCELLED */;
      invoice.endtime = (/* @__PURE__ */ new Date()).toISOString();
    }
    table.status = 0 /* EMPTY */;
    table.current_invoice_id = null;
    return table;
  }
  // --- CORE OPERATION (b): TÍNH TIỀN & ĐÓNG BÀN (THANH TOÁN) ---
  checkoutTable(params) {
    const invoice = this.invoices.find((i) => i.invoiceid === params.invoiceid);
    if (!invoice) throw new Error("H\xF3a \u0111\u01A1n kh\xF4ng t\u1ED3n t\u1EA1i");
    if (invoice.status === 1 /* PAID */) throw new Error("H\xF3a \u0111\u01A1n \u0111\xE3 \u0111\u01B0\u1EE3c thanh to\xE1n");
    const table = this.getTableById(invoice.tableid);
    if (!table) throw new Error("B\xE0n kh\xF4ng t\u1ED3n t\u1EA1i");
    const endtime = /* @__PURE__ */ new Date();
    const starttime = new Date(invoice.starttime);
    const durationMinutes = Math.max(1, Math.ceil((endtime.getTime() - starttime.getTime()) / (1e3 * 60)));
    const tablefee = Math.round(table.hourlyprice / 60 * durationMinutes);
    invoice.endtime = endtime.toISOString();
    invoice.tablefee = tablefee;
    invoice.servicefee = (invoice.details || []).reduce((sum, d) => sum + d.subtotal, 0);
    const cid = params.customerid || invoice.customerid;
    let vipDiscountAmount = 0;
    if (cid) {
      const customer = this.getCustomerById(cid);
      if (customer) {
        invoice.customerid = cid;
        invoice.customername = customer.fullname;
        invoice.customerphone = customer.phone;
        invoice.customertier = customer.membershiptier;
        const vipPercent = this.getVipDiscountPercent(customer.membershiptier);
        if (vipPercent > 0) {
          vipDiscountAmount = Math.round(tablefee * vipPercent / 100);
        }
      }
    }
    let subTotal = invoice.tablefee + invoice.servicefee;
    let voucherDiscount = 0;
    if (params.vouchercode) {
      const voucher = this.getVoucherByCode(params.vouchercode);
      if (voucher) {
        if (subTotal >= voucher.minordervalue) {
          voucherDiscount = voucher.discountamount;
          invoice.voucherid = voucher.voucherid;
          invoice.vouchercode = voucher.vouchercode;
        }
      }
    }
    const totalDiscount = voucherDiscount + vipDiscountAmount;
    invoice.vipdiscountamount = vipDiscountAmount;
    invoice.discountamount = totalDiscount;
    invoice.totalamount = Math.max(0, subTotal - totalDiscount);
    invoice.paymentmethod = params.paymentmethod;
    invoice.status = 1 /* PAID */;
    table.status = 0 /* EMPTY */;
    table.current_invoice_id = null;
    if (cid) {
      const customer = this.getCustomerById(cid);
      if (customer) {
        customer.totalspent += invoice.totalamount;
        const newPoints = Math.floor(invoice.totalamount / 1e4);
        customer.point += newPoints;
        if (customer.totalspent >= 1e7) {
          customer.membershiptier = "Diamond";
        } else if (customer.totalspent >= 5e6) {
          customer.membershiptier = "Platinum";
        } else if (customer.totalspent >= 3e6) {
          customer.membershiptier = "Gold";
        } else if (customer.totalspent >= 1e6) {
          customer.membershiptier = "Silver";
        } else {
          customer.membershiptier = "Bronze";
        }
      }
    }
    return invoice;
  }
  // --- PRODUCTS / INVENTORY ---
  getProducts() {
    return this.products;
  }
  getProductById(id) {
    return this.products.find((p) => p.productid === id);
  }
  addProduct(pData) {
    const newP = {
      ...pData,
      productid: this.nextProductId++,
      stock: pData.stock || 0,
      isactive: true
    };
    this.products.push(newP);
    if (newP.stock > 0) {
      this.stockTransactions.push({
        transactionid: this.nextTransactionId++,
        productid: newP.productid,
        staffid: 1,
        transactiontype: "Import",
        quantitychange: newP.stock,
        transactiondate: (/* @__PURE__ */ new Date()).toISOString(),
        note: "T\u1EA1o s\u1EA3n ph\u1EA9m & kh\u1EDFi t\u1EA1o kho ban \u0111\u1EA7u",
        productname: newP.productname
      });
    }
    return newP;
  }
  updateProduct(id, data) {
    const idx = this.products.findIndex((p) => p.productid === id);
    if (idx !== -1) {
      this.products[idx] = { ...this.products[idx], ...data };
      return this.products[idx];
    }
    return void 0;
  }
  importStock(productid, quantity, costprice, note) {
    const product = this.getProductById(productid);
    if (!product) throw new Error("S\u1EA3n ph\u1EA9m kh\xF4ng t\u1ED3n t\u1EA1i");
    product.stock += quantity;
    if (costprice !== void 0) {
      product.costprice = costprice;
    }
    const transaction = {
      transactionid: this.nextTransactionId++,
      productid,
      staffid: 1,
      transactiontype: "Import",
      quantitychange: quantity,
      transactiondate: (/* @__PURE__ */ new Date()).toISOString(),
      note: note || "Nh\u1EADp h\xE0ng v\xE0o kho",
      unitprice: costprice || product.costprice,
      productname: product.productname
    };
    this.stockTransactions.unshift(transaction);
    return transaction;
  }
  getStockTransactions() {
    return this.stockTransactions;
  }
  // --- CUSTOMERS (CRM) ---
  getCustomers() {
    return this.customers;
  }
  getCustomerById(id) {
    return this.customers.find((c) => c.customerid === id);
  }
  addCustomer(data) {
    const newCust = {
      ...data,
      customerid: this.nextCustomerId++,
      point: 0,
      createdat: (/* @__PURE__ */ new Date()).toISOString(),
      membershiptier: "Bronze",
      totalspent: 0
    };
    this.customers.push(newCust);
    return newCust;
  }
  // --- VOUCHERS ---
  getVoucherByCode(code) {
    return this.vouchers.find((v) => v.vouchercode.toUpperCase() === code.trim().toUpperCase());
  }
  // --- BOOKINGS ---
  getBookings() {
    return this.bookings;
  }
  addBooking(data) {
    const customer = this.getCustomerById(data.customerid);
    const table = data.tableid ? this.getTableById(data.tableid) : void 0;
    const newBooking = {
      ...data,
      bookingid: this.nextBookingId++,
      status: "Pending",
      createdat: (/* @__PURE__ */ new Date()).toISOString(),
      customername: customer ? customer.fullname : "Kh\xE1ch l\u1EBB",
      customerphone: customer ? customer.phone : "",
      tablename: table ? table.tablename : "B\xE0n b\u1EA5t k\u1EF3"
    };
    this.bookings.push(newBooking);
    if (table && table.status === 0 /* EMPTY */) {
      table.status = 2 /* BOOKED */;
    }
    return newBooking;
  }
  cancelBooking(bookingid) {
    const booking = this.bookings.find((b) => b.bookingid === bookingid);
    if (!booking) throw new Error("Kh\xF4ng t\xECm th\u1EA5y th\xF4ng tin \u0111\u1EB7t b\xE0n");
    booking.status = "Cancelled";
    if (booking.tableid) {
      const table = this.getTableById(booking.tableid);
      if (table && table.status === 2 /* BOOKED */) {
        table.status = 0 /* EMPTY */;
      }
    }
    return booking;
  }
  // --- INVOICES HISTORY ---
  getInvoices() {
    return this.invoices.slice().sort((a, b) => new Date(b.starttime).getTime() - new Date(a.starttime).getTime());
  }
  getInvoiceById(id) {
    return this.invoices.find((i) => i.invoiceid === id);
  }
  getActiveInvoiceForTable(tableid) {
    return this.invoices.find((i) => i.tableid === tableid && i.status === 0 /* OPEN */);
  }
  // --- STAFFS & AUTH ---
  getStaffs() {
    return this.staffs;
  }
  getStaffById(id) {
    return this.staffs.find((s) => s.staffid === id);
  }
  loginStaff(username, password) {
    if (!username) {
      throw new Error("Vui l\xF2ng nh\u1EADp t\xEAn t\xE0i kho\u1EA3n ho\u1EB7c t\xEAn nh\xE2n vi\xEAn!");
    }
    const cleanUsername = username.trim().toLowerCase();
    const staff = this.staffs.find(
      (s) => s.username && s.username.toLowerCase() === cleanUsername || s.fullname.toLowerCase() === cleanUsername || s.phone === cleanUsername
    );
    if (!staff) {
      throw new Error("T\xE0i kho\u1EA3n ho\u1EB7c t\xEAn nh\xE2n vi\xEAn kh\xF4ng t\u1ED3n t\u1EA1i trong h\u1EC7 th\u1ED1ng!");
    }
    if (password && staff.password && staff.password !== password) {
      throw new Error("M\u1EADt kh\u1EA9u/M\xE3 PIN kh\xF4ng ch\xEDnh x\xE1c!");
    }
    return staff;
  }
  addStaff(data) {
    const nextId = this.staffs.length > 0 ? Math.max(...this.staffs.map((s) => s.staffid)) + 1 : 1;
    const newStaff = {
      ...data,
      staffid: nextId,
      status: data.status || "Active"
    };
    this.staffs.push(newStaff);
    return newStaff;
  }
  updateStaff(id, data) {
    const staff = this.getStaffById(id);
    if (!staff) throw new Error("Kh\xF4ng t\xECm th\u1EA5y nh\xE2n vi\xEAn");
    Object.assign(staff, data);
    return staff;
  }
  deleteStaff(id) {
    const initialLen = this.staffs.length;
    this.staffs = this.staffs.filter((s) => s.staffid !== id);
    return this.staffs.length < initialLen;
  }
  // --- VOUCHERS ---
  getVouchers() {
    return this.vouchers;
  }
  addVoucher(data) {
    const nextId = this.vouchers.length > 0 ? Math.max(...this.vouchers.map((v) => v.voucherid)) + 1 : 1;
    const newVoucher = {
      ...data,
      voucherid: nextId,
      vouchercode: data.vouchercode.toUpperCase().trim()
    };
    this.vouchers.push(newVoucher);
    return newVoucher;
  }
  updateVoucher(id, data) {
    const voucher = this.vouchers.find((v) => v.voucherid === id);
    if (!voucher) throw new Error("Kh\xF4ng t\xECm th\u1EA5y m\xE3 gi\u1EA3m gi\xE1");
    if (data.vouchercode) data.vouchercode = data.vouchercode.toUpperCase().trim();
    Object.assign(voucher, data);
    return voucher;
  }
  deleteVoucher(id) {
    const initialLen = this.vouchers.length;
    this.vouchers = this.vouchers.filter((v) => v.voucherid !== id);
    return this.vouchers.length < initialLen;
  }
  // --- STATS ---
  getDashboardStats() {
    const openInvoices = this.invoices.filter((i) => i.status === 0 /* OPEN */);
    const todayStr = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    const paidInvoicesToday = this.invoices.filter(
      (i) => i.status === 1 /* PAID */ && i.endtime && i.endtime.startsWith(todayStr)
    );
    const totalRevenueToday = paidInvoicesToday.reduce((sum, i) => sum + i.totalamount, 0);
    return {
      totalRevenueToday,
      activeTablesCount: this.tables.filter((t) => t.status === 1 /* PLAYING */).length,
      emptyTablesCount: this.tables.filter((t) => t.status === 0 /* EMPTY */).length,
      totalInvoicesToday: paidInvoicesToday.length,
      lowStockCount: this.products.filter((p) => p.stock <= (p.minstock || 10)).length,
      totalCustomers: this.customers.length
    };
  }
};
var db = new BilliardDatabase();

// src/backend/app.ts
var app = express();
app.use(cors());
app.use(express.json());
var requireManager = (req, res, next) => {
  const role = req.headers["x-staff-role"];
  if (role !== "Manager") {
    return res.status(403).json({
      success: false,
      error: "Quy\u1EC1n truy c\u1EADp b\u1ECB t\u1EEB ch\u1ED1i! Ch\u1EC9 t\xE0i kho\u1EA3n Qu\u1EA3n l\xFD (Admin / Manager) m\u1EDBi c\xF3 quy\u1EC1n ch\u1EC9nh s\u1EEDa gi\xE1, s\u1EA3n ph\u1EA9m ho\u1EB7c nh\xE2n vi\xEAn."
    });
  }
  next();
};
var requireStaffAuth = (req, res, next) => {
  const role = req.headers["x-staff-role"];
  if (!role || role === "None" || role === "Guest" || role === "undefined" || role === "null") {
    return res.status(401).json({
      success: false,
      error: "Vui l\xF2ng \u0111\u0103ng nh\u1EADp t\xE0i kho\u1EA3n Nh\xE2n vi\xEAn / Qu\u1EA3n l\xFD \u0111\u1EC3 m\u1EDF b\xE0n ho\u1EB7c th\u1EF1c hi\u1EC7n giao d\u1ECBch!"
    });
  }
  next();
};
app.get("/api/tables", (req, res) => {
  try {
    const tables = db.getTables();
    const result = tables.map((t) => {
      const activeInvoice = t.current_invoice_id ? db.getInvoiceById(t.current_invoice_id) : void 0;
      return {
        ...t,
        activeInvoice: activeInvoice || null
      };
    });
    res.json({ success: true, data: result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/tables/:id/open", requireStaffAuth, (req, res) => {
  try {
    const tableId = parseInt(req.params.id, 10);
    const { customerid, staffid } = req.body;
    const invoice = db.openTable(tableId, customerid, staffid || 1);
    res.json({ success: true, message: "M\u1EDF b\xE0n th\xE0nh c\xF4ng!", data: invoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/tables/:id/cancel", requireStaffAuth, (req, res) => {
  try {
    const tableId = parseInt(req.params.id, 10);
    const updatedTable = db.cancelOpenTable(tableId);
    res.json({ success: true, message: "H\u1EE7y m\u1EDF b\xE0n th\xE0nh c\xF4ng!", data: updatedTable });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/tables/add-service", requireStaffAuth, (req, res) => {
  try {
    const { invoiceid, productid, quantity } = req.body;
    const updatedInvoice = db.addServiceToTable(invoiceid, productid, quantity || 1);
    res.json({ success: true, message: "Th\xEAm d\u1ECBch v\u1EE5 th\xE0nh c\xF4ng!", data: updatedInvoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/tables/remove-service", requireStaffAuth, (req, res) => {
  try {
    const { invoiceid, detailid, quantity } = req.body;
    const updatedInvoice = db.removeServiceFromTable(invoiceid, detailid, quantity || 1);
    res.json({ success: true, message: "C\u1EADp nh\u1EADt d\u1ECBch v\u1EE5 th\xE0nh c\xF4ng!", data: updatedInvoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/tables/:id/checkout", requireStaffAuth, (req, res) => {
  try {
    const { invoiceid, customerid, vouchercode, paymentmethod, staffid } = req.body;
    const completedInvoice = db.checkoutTable({
      invoiceid,
      customerid,
      vouchercode,
      paymentmethod: paymentmethod || "Cash",
      staffid
    });
    res.json({ success: true, message: "Thanh to\xE1n th\xE0nh c\xF4ng!", data: completedInvoice });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.get("/api/products", (req, res) => {
  try {
    const products = db.getProducts();
    res.json({ success: true, data: products });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/products", requireManager, (req, res) => {
  try {
    const newProduct = db.addProduct(req.body);
    res.json({ success: true, message: "Th\xEAm s\u1EA3n ph\u1EA9m th\xE0nh c\xF4ng!", data: newProduct });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.put("/api/products/:id", requireManager, (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    const updated = db.updateProduct(id, req.body);
    res.json({ success: true, message: "C\u1EADp nh\u1EADt s\u1EA3n ph\u1EA9m th\xE0nh c\xF4ng!", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/stock/import", (req, res) => {
  try {
    const { productid, quantity, costprice, note } = req.body;
    const tx = db.importStock(productid, quantity, costprice, note);
    res.json({ success: true, message: "Nh\u1EADp kho th\xE0nh c\xF4ng!", data: tx });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.get("/api/stock/transactions", (req, res) => {
  try {
    const txs = db.getStockTransactions();
    res.json({ success: true, data: txs });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/customers", (req, res) => {
  try {
    const customers = db.getCustomers();
    res.json({ success: true, data: customers });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/customers", (req, res) => {
  try {
    const customer = db.addCustomer(req.body);
    res.json({ success: true, message: "Th\xEAm kh\xE1ch h\xE0ng m\u1EDBi th\xE0nh c\xF4ng!", data: customer });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.get("/api/bookings", (req, res) => {
  try {
    const bookings = db.getBookings();
    res.json({ success: true, data: bookings });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/bookings", (req, res) => {
  try {
    const booking = db.addBooking(req.body);
    res.json({ success: true, message: "\u0110\u1EB7t b\xE0n th\xE0nh c\xF4ng!", data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/bookings/:id/cancel", (req, res) => {
  try {
    const booking = db.cancelBooking(Number(req.params.id));
    res.json({ success: true, message: "H\u1EE7y \u0111\u1EB7t b\xE0n th\xE0nh c\xF4ng!", data: booking });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.get("/api/vip-rates", (req, res) => {
  try {
    res.json({ success: true, data: db.getVipDiscountRates() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/vip-rates", requireManager, (req, res) => {
  try {
    const updated = db.updateVipDiscountRates(req.body);
    res.json({ success: true, message: "C\u1EADp nh\u1EADt c\u1EA5u h\xECnh % gi\u1EA3m gi\xE1 VIP th\xE0nh c\xF4ng!", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/auth/login", (req, res) => {
  try {
    const { username, password } = req.body;
    const staff = db.loginStaff(username, password);
    res.json({ success: true, message: "\u0110\u0103ng nh\u1EADp th\xE0nh c\xF4ng!", data: staff });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.get("/api/staffs", (req, res) => {
  try {
    res.json({ success: true, data: db.getStaffs() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/staffs", requireManager, (req, res) => {
  try {
    const newStaff = db.addStaff(req.body);
    res.json({ success: true, message: "Th\xEAm nh\xE2n vi\xEAn th\xE0nh c\xF4ng!", data: newStaff });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.put("/api/staffs/:id", requireManager, (req, res) => {
  try {
    const updated = db.updateStaff(Number(req.params.id), req.body);
    res.json({ success: true, message: "C\u1EADp nh\u1EADt nh\xE2n vi\xEAn th\xE0nh c\xF4ng!", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.delete("/api/staffs/:id", requireManager, (req, res) => {
  try {
    const success = db.deleteStaff(Number(req.params.id));
    res.json({ success: true, message: "X\xF3a nh\xE2n vi\xEAn th\xE0nh c\xF4ng!", data: { deleted: success } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.put("/api/tables/:id", requireManager, (req, res) => {
  try {
    const updated = db.updateTable(Number(req.params.id), req.body);
    if (!updated) return res.status(404).json({ success: false, error: "B\xE0n kh\xF4ng t\u1ED3n t\u1EA1i" });
    res.json({ success: true, message: "C\u1EADp nh\u1EADt b\xE0n th\xE0nh c\xF4ng!", data: updated });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/tables/batch-zone-price", requireManager, (req, res) => {
  try {
    const { zone, hourlyprice } = req.body;
    const count = db.batchUpdateZonePrice(zone, Number(hourlyprice));
    res.json({ success: true, message: `\u0110\xE3 c\u1EADp nh\u1EADt gi\xE1 cho ${count} b\xE0n thu\u1ED9c ${zone || "t\u1EA5t c\u1EA3 c\xE1c khu"}!`, data: { updatedCount: count } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.post("/api/tables", requireManager, (req, res) => {
  try {
    const newTable = db.addTable(req.body);
    res.json({ success: true, message: "Th\xEAm b\xE0n m\u1EDBi th\xE0nh c\xF4ng!", data: newTable });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.delete("/api/tables/:id", requireManager, (req, res) => {
  try {
    const deleted = db.deleteTable(Number(req.params.id));
    res.json({ success: true, message: "\u0110\xE3 x\xF3a b\xE0n th\xE0nh c\xF4ng!", data: { deleted } });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
});
app.get("/api/vouchers", (req, res) => {
  try {
    res.json({ success: true, data: db.getVouchers() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/vouchers/check/:code", (req, res) => {
  try {
    const voucher = db.getVoucherByCode(req.params.code);
    if (!voucher) {
      return res.status(404).json({ success: false, error: "M\xE3 gi\u1EA3m gi\xE1 kh\xF4ng h\u1EE3p l\u1EC7 ho\u1EB7c \u0111\xE3 h\u1EBFt h\u1EA1n" });
    }
    res.json({ success: true, data: voucher });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/invoices", (req, res) => {
  try {
    res.json({ success: true, data: db.getInvoices() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/stats", (req, res) => {
  try {
    res.json({ success: true, data: db.getDashboardStats() });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.post("/api/db/reset", (req, res) => {
  try {
    db.resetData();
    res.json({ success: true, message: "Kh\xF4i ph\u1EE5c d\u1EEF li\u1EC7u m\u1EABu th\xE0nh c\xF4ng!" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});
app.get("/api/supabase/status", async (req, res) => {
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL || "https://vmeehkajgihyiwciotfd.supabase.co";
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || "sb_publishable_-Y-4HsqRHl8ib38sVFb8gg_kMdc8GzP";
    const { createClient } = await import("@supabase/supabase-js");
    const client = createClient(supabaseUrl, supabaseKey);
    const { data, error } = await client.from("todos").select("*").limit(1);
    res.json({
      success: !error,
      url: supabaseUrl,
      connected: !error,
      data: data || [],
      error: error ? error.message : null,
      message: !error ? "K\u1EBFt n\u1ED1i t\u1EDBi Supabase th\xE0nh c\xF4ng!" : `Supabase ph\u1EA3n h\u1ED3i nh\u01B0ng c\xF3 l\u1ED7i: ${error.message}`
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      connected: false,
      error: err.message,
      message: `L\u1ED7i k\u1EBFt n\u1ED1i Supabase: ${err.message}`
    });
  }
});

// api/index.ts
var index_default = app;
export {
  index_default as default
};
