import { Customer, BilliardTable, Product, Staff, Voucher, Booking, TableStatus } from '../types';

export const INITIAL_STAFFS: Staff[] = [
  { staffid: 1, fullname: 'Nguyễn Văn Minh', role: 'Manager', phone: '0901234567', status: 'Active' },
  { staffid: 2, fullname: 'Trần Thị Thu', role: 'Cashier', phone: '0912345678', status: 'Active' },
  { staffid: 3, fullname: 'Lê Hoàng Nam', role: 'Staff', phone: '0923456789', status: 'Active' },
];

export const INITIAL_CUSTOMERS: Customer[] = [
  {
    customerid: 1,
    fullname: 'Phạm Đức Anh',
    phone: '0988111222',
    email: 'ducanh@gmail.com',
    point: 320,
    createdat: '2026-01-15T08:00:00Z',
    membershiptier: 'Gold',
    totalspent: 4800000,
  },
  {
    customerid: 2,
    fullname: 'Nguyễn Thanh Tùng',
    phone: '0977333444',
    email: 'thanhtung@gmail.com',
    point: 150,
    createdat: '2026-02-10T10:30:00Z',
    membershiptier: 'Silver',
    totalspent: 2100000,
  },
  {
    customerid: 3,
    fullname: 'Vũ Quốc Bảo',
    phone: '0966555666',
    email: 'quocbao@billiard.vn',
    point: 650,
    createdat: '2025-11-20T14:15:00Z',
    membershiptier: 'Platinum',
    totalspent: 11500000,
  },
  {
    customerid: 4,
    fullname: 'Hoàng Trọng Nghĩa',
    phone: '0933888999',
    email: 'trongnghia@yahoo.com',
    point: 45,
    createdat: '2026-03-01T09:00:00Z',
    membershiptier: 'Bronze',
    totalspent: 650000,
  },
];

export const INITIAL_TABLES: BilliardTable[] = [
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

export const INITIAL_PRODUCTS: Product[] = [
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

export const INITIAL_VOUCHERS: Voucher[] = [
  { voucherid: 1, vouchercode: 'BIDA50K', discountamount: 50000, discounttype: 'Fixed', minordervalue: 200000, expirydate: '2026-12-31' },
  { voucherid: 2, vouchercode: 'VIP100K', discountamount: 100000, discounttype: 'Fixed', minordervalue: 400000, expirydate: '2026-12-31' },
  { voucherid: 3, vouchercode: 'CHAO2026', discountamount: 30000, discounttype: 'Fixed', minordervalue: 100000, expirydate: '2026-12-31' },
];

export const INITIAL_BOOKINGS: Booking[] = [
  {
    bookingid: 1,
    customerid: 1,
    tableid: 8,
    expectedstarttime: new Date(Date.now() + 3600000 * 3).toISOString(),
    expectedendtime: new Date(Date.now() + 3600000 * 5).toISOString(),
    note: 'Đặt bàn VIP thi đấu giao hữu',
    status: 'Pending',
    createdat: new Date().toISOString(),
    customername: 'Phạm Đức Anh',
    customerphone: '0988111222',
    tablename: 'Bàn 8',
  },
];
