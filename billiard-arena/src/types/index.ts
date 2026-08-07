export enum TableStatus {
  EMPTY = 0,     // Trống (Màu xanh)
  PLAYING = 1,   // Đang chơi (Màu đỏ / vàng)
  BOOKED = 2     // Đã đặt trước (Màu tím / cam)
}

export enum InvoiceStatus {
  OPEN = 0,      // Đang phục vụ / Chưa thanh toán
  PAID = 1,      // Đã thanh toán
  CANCELLED = 2  // Hủy hóa đơn
}

export type MembershipTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum' | 'Diamond';

export interface Customer {
  customerid: number;
  fullname: string;
  phone: string;
  email?: string;
  passwordhash?: string;
  point: number;
  createdat: string;
  membershiptier: MembershipTier;
  totalspent: number;
}

export interface BilliardTable {
  tableid: number;
  tablename: string;
  tabletype: string;
  hourlyprice: number;
  status: TableStatus;
  zone?: string; // Khu A, VIP 1, Tầng 1
  current_invoice_id?: number | null;
}

export interface Product {
  productid: number;
  productname: string;
  category: string; // Nước uống, Đồ ăn, Thuốc lá, Phụ kiện, Dịch vụ khác
  price: number;
  costprice?: number; // Giá vốn hàng bán (KiotViet style)
  unit: string; // Chai, Lon, Đĩa, Gói, Cái
  stock: number;
  minstock?: number;
  imageurl?: string;
  isactive?: boolean;
}

export interface Booking {
  bookingid: number;
  customerid: number;
  tableid?: number | null;
  expectedstarttime: string;
  expectedendtime?: string | null;
  note?: string;
  status: 'Pending' | 'Confirmed' | 'Completed' | 'Cancelled';
  createdat: string;
  // Join fields
  customername?: string;
  customerphone?: string;
  tablename?: string;
}

export interface InvoiceDetail {
  detailid: number;
  invoiceid: number;
  productid: number;
  quantity: number;
  unitprice: number;
  costprice?: number;
  subtotal: number;
  // Join field
  productname?: string;
  unit?: string;
}

export interface Invoice {
  invoiceid: number;
  bookingid?: number | null;
  tableid: number;
  customerid?: number | null;
  starttime: string;
  endtime?: string | null;
  tablefee: number;
  servicefee: number;
  totalamount: number;
  discountamount?: number;
  status: InvoiceStatus;
  staffid?: number | null;
  voucherid?: number | null;
  paymentmethod: 'Cash' | 'Transfer' | 'Card';

  // Populated fields
  tablename?: string;
  hourlyprice?: number;
  customername?: string;
  customerphone?: string;
  staffname?: string;
  vouchercode?: string;
  details?: InvoiceDetail[];
}

export interface Staff {
  staffid: number;
  fullname: string;
  role: 'Manager' | 'Cashier' | 'Staff' | 'Technician';
  phone: string;
  status?: 'Active' | 'Inactive';
}

export interface Voucher {
  voucherid: number;
  vouchercode: string;
  discountamount: number; // Hoặc số tiền giảm cố định
  discounttype?: 'Fixed' | 'Percent'; // Số tiền hoặc %
  minordervalue: number;
  expirydate?: string;
  maxdiscount?: number;
}

export interface StockTransaction {
  transactionid: number;
  productid: number;
  staffid?: number | null;
  transactiontype: 'Import' | 'Export' | 'Sale' | 'Adjustment';
  quantitychange: number; // Dương khi nhập, Âm khi bán/xuất
  transactiondate: string;
  note?: string;
  unitprice?: number; // Giá nhập nếu có
  
  // Join fields
  productname?: string;
  staffname?: string;
}

export interface DashboardStats {
  totalRevenueToday: number;
  activeTablesCount: number;
  emptyTablesCount: number;
  totalInvoicesToday: number;
  lowStockCount: number;
  totalCustomers: number;
}
