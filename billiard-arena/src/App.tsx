import React, { useState, useEffect, useCallback } from 'react';
import { BilliardTable, Product, Customer, Booking, Invoice, StockTransaction, DashboardStats } from './types';
import { api } from './services/api';
import { Header } from './components/Header';
import { Navbar, ActiveTab } from './components/Navbar';
import { TableGrid } from './components/POS/TableGrid';
import { TableDetailModal } from './components/POS/TableDetailModal';
import { CheckoutModal } from './components/POS/CheckoutModal';
import { ProductManagement } from './components/Inventory/ProductManagement';
import { CustomerManagement } from './components/Customers/CustomerManagement';
import { BookingManagement } from './components/Bookings/BookingManagement';
import { InvoiceHistory } from './components/Invoices/InvoiceHistory';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('pos');

  // Core Data
  const [tables, setTables] = useState<(BilliardTable & { activeInvoice?: Invoice | null })[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [stockTxs, setStockTxs] = useState<StockTransaction[]>([]);
  const [stats, setStats] = useState<DashboardStats | undefined>(undefined);

  // Active Modals State
  const [selectedTableForDetail, setSelectedTableForDetail] = useState<
    (BilliardTable & { activeInvoice?: Invoice | null }) | null
  >(null);
  const [selectedTableForCheckout, setSelectedTableForCheckout] = useState<
    (BilliardTable & { activeInvoice?: Invoice | null }) | null
  >(null);

  // Fetch all data
  const refreshAllData = useCallback(async () => {
    try {
      const [tData, pData, cData, bData, iData, stData, sData] = await Promise.all([
        api.getTables(),
        api.getProducts(),
        api.getCustomers(),
        api.getBookings(),
        api.getInvoices(),
        api.getStockTransactions(),
        api.getStats(),
      ]);

      setTables(tData);
      setProducts(pData);
      setCustomers(cData);
      setBookings(bData);
      setInvoices(iData);
      setStockTxs(stData);
      setStats(sData);

      // Keep active table detail modal in sync ONLY if currently open
      setSelectedTableForDetail((current) => {
        if (!current) return null;
        const updatedTable = tData.find((t) => t.tableid === current.tableid);
        return updatedTable || current;
      });

      setSelectedTableForCheckout((current) => {
        if (!current) return null;
        const updatedTable = tData.find((t) => t.tableid === current.tableid);
        return updatedTable || current;
      });
    } catch (err) {
      console.error('Failed to load API data:', err);
    }
  }, []);

  useEffect(() => {
    refreshAllData();
    const interval = setInterval(refreshAllData, 10000);
    return () => clearInterval(interval);
  }, [refreshAllData]);

  // Handlers
  const handleOpenTableSubmit = async (tableid: number, customerid?: number) => {
    try {
      await api.openTable(tableid, customerid);
      await refreshAllData();
    } catch (err: any) {
      alert(`Không thể mở bàn: ${err.message}`);
    }
  };

  const handleCancelTableSubmit = async (tableid: number) => {
    try {
      await api.cancelOpenTable(tableid);
      setSelectedTableForDetail(null);
      await refreshAllData();
    } catch (err: any) {
      alert(`Không thể hủy mở bàn: ${err.message}`);
    }
  };

  const handleAddServiceSubmit = async (invoiceid: number, productid: number, quantity: number) => {
    try {
      await api.addServiceToTable(invoiceid, productid, quantity);
      await refreshAllData();
    } catch (err: any) {
      alert(`Không thể thêm món: ${err.message}`);
    }
  };

  const handleRemoveServiceSubmit = async (invoiceid: number, detailid: number, quantity: number) => {
    try {
      await api.removeServiceFromTable(invoiceid, detailid, quantity);
      await refreshAllData();
    } catch (err: any) {
      alert(`Không thể bớt món: ${err.message}`);
    }
  };

  const handleResetDemoData = async () => {
    if (window.confirm('Khôi phục toàn bộ dữ liệu mẫu ban đầu?')) {
      try {
        await api.resetDb();
        await refreshAllData();
        alert('Đã khôi phục dữ liệu mẫu thành công!');
      } catch (err: any) {
        alert(`Lỗi: ${err.message}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <Header stats={stats} onResetDb={handleResetDemoData} />

      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onChangeTab={setActiveTab}
        lowStockCount={stats?.lowStockCount}
        pendingBookingsCount={bookings.filter((b) => b.status === 'Pending').length}
      />

      {/* Main View Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6">
        {activeTab === 'pos' && (
          <TableGrid
            tables={tables}
            onOpenTable={(table) => setSelectedTableForDetail(table)}
            onAddService={(table) => setSelectedTableForDetail(table)}
            onCheckout={(table) => setSelectedTableForCheckout(table)}
          />
        )}

        {activeTab === 'inventory' && (
          <ProductManagement products={products} stockTransactions={stockTxs} onRefresh={refreshAllData} />
        )}

        {activeTab === 'customers' && <CustomerManagement customers={customers} onRefresh={refreshAllData} />}

        {activeTab === 'bookings' && (
          <BookingManagement
            bookings={bookings}
            tables={tables}
            customers={customers}
            onRefresh={refreshAllData}
            onOpenTableFromBooking={async (tableid, customerid) => {
              try {
                await api.openTable(tableid, customerid);
                await refreshAllData();
                setActiveTab('pos');
              } catch (err: any) {
                alert(`Lỗi: ${err.message}`);
              }
            }}
          />
        )}

        {activeTab === 'invoices' && <InvoiceHistory invoices={invoices} />}
      </main>

      {/* Modals */}
      {selectedTableForDetail && (
        <TableDetailModal
          table={selectedTableForDetail}
          products={products}
          customers={customers}
          onClose={() => setSelectedTableForDetail(null)}
          onOpenTableSubmit={handleOpenTableSubmit}
          onCancelTableSubmit={handleCancelTableSubmit}
          onAddServiceSubmit={handleAddServiceSubmit}
          onRemoveServiceSubmit={handleRemoveServiceSubmit}
          onProceedToCheckout={(table) => {
            setSelectedTableForDetail(null);
            setSelectedTableForCheckout(table);
          }}
        />
      )}

      {selectedTableForCheckout && (
        <CheckoutModal
          table={selectedTableForCheckout}
          customers={customers}
          onClose={() => setSelectedTableForCheckout(null)}
          onSuccessCheckout={() => {
            refreshAllData();
          }}
        />
      )}
    </div>
  );
}
