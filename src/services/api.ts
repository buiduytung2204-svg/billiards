import {
  BilliardTable,
  Product,
  Customer,
  Booking,
  Invoice,
  Voucher,
  Staff,
  StockTransaction,
  DashboardStats,
} from '../types';

const API_BASE = '/api';

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  let activeRole = 'None';
  try {
    const saved = localStorage.getItem('billiard_active_staff');
    if (saved) {
      const parsed = JSON.parse(saved);
      if (parsed?.role) activeRole = parsed.role;
    }
  } catch (e) {}

  const res = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'X-Staff-Role': activeRole,
      ...(options?.headers || {}),
    },
  });

  const json = await res.json();
  if (!json.success) {
    throw new Error(json.error || 'Có lỗi xảy ra khi kết nối server API');
  }
  return json.data;
}

export const api = {
  // Auth & Staff
  loginStaff: (username?: string, password?: string) =>
    fetchJson<Staff>(`${API_BASE}/auth/login`, {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),
  getStaffs: () => fetchJson<Staff[]>(`${API_BASE}/staffs`),
  addStaff: (staff: Omit<Staff, 'staffid'>) =>
    fetchJson<Staff>(`${API_BASE}/staffs`, {
      method: 'POST',
      body: JSON.stringify(staff),
    }),
  updateStaff: (id: number, staff: Partial<Staff>) =>
    fetchJson<Staff>(`${API_BASE}/staffs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(staff),
    }),
  deleteStaff: (id: number) =>
    fetchJson<{ deleted: boolean }>(`${API_BASE}/staffs/${id}`, {
      method: 'DELETE',
    }),

  // Table Admin
  updateTable: (id: number, data: Partial<BilliardTable>) =>
    fetchJson<BilliardTable>(`${API_BASE}/tables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  batchUpdateZonePrice: (zone: string, hourlyprice: number) =>
    fetchJson<{ updatedCount: number }>(`${API_BASE}/tables/batch-zone-price`, {
      method: 'POST',
      body: JSON.stringify({ zone, hourlyprice }),
    }),
  addTable: (table: Omit<BilliardTable, 'tableid' | 'status'>) =>
    fetchJson<BilliardTable>(`${API_BASE}/tables`, {
      method: 'POST',
      body: JSON.stringify(table),
    }),
  deleteTable: (id: number) =>
    fetchJson<{ deleted: boolean }>(`${API_BASE}/tables/${id}`, {
      method: 'DELETE',
    }),

  // Tables
  getTables: () => fetchJson<BilliardTable[]>(`${API_BASE}/tables`),
  openTable: (tableid: number, customerid?: number, staffid?: number) =>
    fetchJson<Invoice>(`${API_BASE}/tables/${tableid}/open`, {
      method: 'POST',
      body: JSON.stringify({ customerid, staffid }),
    }),
  cancelOpenTable: (tableid: number) =>
    fetchJson<BilliardTable>(`${API_BASE}/tables/${tableid}/cancel`, {
      method: 'POST',
    }),
  addServiceToTable: (invoiceid: number, productid: number, quantity: number = 1) =>
    fetchJson<Invoice>(`${API_BASE}/tables/add-service`, {
      method: 'POST',
      body: JSON.stringify({ invoiceid, productid, quantity }),
    }),
  removeServiceFromTable: (invoiceid: number, detailid: number, quantity: number = 1) =>
    fetchJson<Invoice>(`${API_BASE}/tables/remove-service`, {
      method: 'POST',
      body: JSON.stringify({ invoiceid, detailid, quantity }),
    }),
  checkoutTable: (payload: {
    invoiceid: number;
    customerid?: number;
    vouchercode?: string;
    paymentmethod: 'Cash' | 'Transfer' | 'Card';
    staffid?: number;
  }) =>
    fetchJson<Invoice>(`${API_BASE}/tables/${payload.invoiceid}/checkout`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Products & Inventory
  getProducts: () => fetchJson<Product[]>(`${API_BASE}/products`),
  addProduct: (product: Omit<Product, 'productid'>) =>
    fetchJson<Product>(`${API_BASE}/products`, {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  updateProduct: (id: number, product: Partial<Product>) =>
    fetchJson<Product>(`${API_BASE}/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  importStock: (payload: { productid: number; quantity: number; costprice?: number; note?: string }) =>
    fetchJson<StockTransaction>(`${API_BASE}/stock/import`, {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getStockTransactions: () => fetchJson<StockTransaction[]>(`${API_BASE}/stock/transactions`),

  // Customers
  getCustomers: () => fetchJson<Customer[]>(`${API_BASE}/customers`),
  addCustomer: (customer: Omit<Customer, 'customerid' | 'createdat' | 'point' | 'totalspent' | 'membershiptier'>) =>
    fetchJson<Customer>(`${API_BASE}/customers`, {
      method: 'POST',
      body: JSON.stringify(customer),
    }),

  // Bookings
  getBookings: () => fetchJson<Booking[]>(`${API_BASE}/bookings`),
  addBooking: (booking: Omit<Booking, 'bookingid' | 'createdat' | 'status'>) =>
    fetchJson<Booking>(`${API_BASE}/bookings`, {
      method: 'POST',
      body: JSON.stringify(booking),
    }),
  cancelBooking: (id: number) =>
    fetchJson<Booking>(`${API_BASE}/bookings/${id}/cancel`, {
      method: 'POST',
    }),

  // Vouchers & VIP Config
  getVouchers: () => fetchJson<Voucher[]>(`${API_BASE}/vouchers`),
  checkVoucher: (code: string) => fetchJson<Voucher>(`${API_BASE}/vouchers/check/${encodeURIComponent(code)}`),
  getVipRates: () => fetchJson<Record<string, number>>(`${API_BASE}/vip-rates`),
  updateVipRates: (rates: Record<string, number>) =>
    fetchJson<Record<string, number>>(`${API_BASE}/vip-rates`, {
      method: 'POST',
      body: JSON.stringify(rates),
    }),

  // Invoices
  getInvoices: () => fetchJson<Invoice[]>(`${API_BASE}/invoices`),

  // Stats & Reset
  getStats: () => fetchJson<DashboardStats>(`${API_BASE}/stats`),
  resetDb: () => fetchJson<{ message: string }>(`${API_BASE}/db/reset`, { method: 'POST' }),
};
