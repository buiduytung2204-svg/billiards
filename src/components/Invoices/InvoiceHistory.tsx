import React, { useState } from 'react';
import { Invoice } from '../../types';
import { formatVND, formatDateTime } from '../../utils/format';
import { Printer, Search, DollarSign, CreditCard, Banknote, ArrowUpRight } from 'lucide-react';
import { ReceiptPrint } from '../ReceiptPrint';

interface InvoiceHistoryProps {
  invoices: Invoice[];
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [paymentFilter, setPaymentFilter] = useState<'ALL' | 'CASH' | 'TRANSFER'>('ALL');
  const [selectedReprintInvoice, setSelectedReprintInvoice] = useState<Invoice | null>(null);

  const isPaidInvoice = (inv: Invoice) => {
    if (inv.status === (1 as any) || inv.status === 1) return true;
    const st = String(inv.status || '').toUpperCase();
    return st === 'PAID' || st === '1' || st === 'COMPLETED';
  };

  const isCashMethod = (method?: string) => {
    if (!method) return true;
    const m = String(method).toLowerCase();
    return m === 'cash' || m.includes('tiền mặt') || m.includes('tien mat');
  };

  const paidInvoices = invoices.filter(isPaidInvoice);
  const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + (i.totalamount || 0), 0);

  // Cash vs Transfer breakdown
  const cashInvoices = paidInvoices.filter((i) => isCashMethod(i.paymentmethod));
  const transferInvoices = paidInvoices.filter((i) => !isCashMethod(i.paymentmethod));

  const cashRevenue = cashInvoices.reduce((sum, i) => sum + (i.totalamount || 0), 0);
  const transferRevenue = transferInvoices.reduce((sum, i) => sum + (i.totalamount || 0), 0);

  const cashPercent = totalPaidRevenue > 0 ? Math.round((cashRevenue / totalPaidRevenue) * 100) : 0;
  const transferPercent = totalPaidRevenue > 0 ? Math.round((transferRevenue / totalPaidRevenue) * 100) : 0;

  // Filter invoices by search and payment method
  const filteredInvoices = invoices.filter((i) => {
    // Payment method filter
    if (paymentFilter === 'CASH' && !isCashMethod(i.paymentmethod)) return false;
    if (paymentFilter === 'TRANSFER' && isCashMethod(i.paymentmethod)) return false;

    // Search term filter
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const tableName = i.tablename || (i.tableid ? `bàn ${i.tableid}` : '');
    return (
      i.invoiceid.toString().includes(term) ||
      tableName.toLowerCase().includes(term) ||
      (i.customername && i.customername.toLowerCase().includes(term))
    );
  });

  if (selectedReprintInvoice) {
    return <ReceiptPrint invoice={selectedReprintInvoice} onClose={() => setSelectedReprintInvoice(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Revenue Breakdown Summary Header */}
      <div>
        <h2 className="text-sm font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <span>📊 Phân Chia Doanh Thu Hệ Thống</span>
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Revenue */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Tổng doanh thu</span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-sm">
                💰
              </div>
            </div>
            <p className="text-xl font-extrabold text-amber-300 mt-2">{formatVND(totalPaidRevenue)}</p>
            <p className="text-[11px] text-slate-500 mt-1">{paidInvoices.length} hóa đơn đã thanh toán</p>
          </div>

          {/* Cash Revenue */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">💵 Tiền mặt</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                {cashPercent}%
              </span>
            </div>
            <p className="text-xl font-extrabold text-emerald-400 mt-2">{formatVND(cashRevenue)}</p>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>{cashInvoices.length} lượt thanh toán</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${cashPercent}%` }}></div>
            </div>
          </div>

          {/* Transfer Revenue */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">💳 Chuyển khoản / Thẻ</span>
              <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full">
                {transferPercent}%
              </span>
            </div>
            <p className="text-xl font-extrabold text-sky-300 mt-2">{formatVND(transferRevenue)}</p>
            <div className="flex items-center justify-between mt-1 text-[11px] text-slate-400">
              <span>{transferInvoices.length} lượt chuyển khoản</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-sky-400 h-full rounded-full transition-all duration-500" style={{ width: `${transferPercent}%` }}></div>
            </div>
          </div>

          {/* Average per Invoice */}
          <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl relative overflow-hidden shadow-md">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Trung bình / Hóa đơn</span>
              <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center text-sm">
                📈
              </div>
            </div>
            <p className="text-xl font-extrabold text-purple-300 mt-2">
              {formatVND(paidInvoices.length ? Math.round(totalPaidRevenue / paidInvoices.length) : 0)}
            </p>
            <p className="text-[11px] text-slate-500 mt-1">Đơn giá TB khách sử dụng</p>
          </div>
        </div>
      </div>

      {/* Filter Bar & Controls */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs flex flex-col sm:flex-row justify-between items-center gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Mã HĐ, Tên bàn, Tên khách..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>

        {/* Payment Method Filter Tabs */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800 w-full sm:w-auto">
          <button
            onClick={() => setPaymentFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition flex-1 sm:flex-initial ${
              paymentFilter === 'ALL'
                ? 'bg-slate-800 text-white shadow'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tất cả ({invoices.length})
          </button>
          <button
            onClick={() => setPaymentFilter('CASH')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition flex items-center justify-center space-x-1 flex-1 sm:flex-initial ${
              paymentFilter === 'CASH'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💵 Tiền mặt</span>
          </button>
          <button
            onClick={() => setPaymentFilter('TRANSFER')}
            className={`px-3 py-1.5 rounded-lg font-semibold text-xs transition flex items-center justify-center space-x-1 flex-1 sm:flex-initial ${
              paymentFilter === 'TRANSFER'
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <span>💳 Chuyển khoản</span>
          </button>
        </div>
      </div>

      {/* Invoices List Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Mã HĐ</th>
                <th className="p-3.5">Tên Bàn</th>
                <th className="p-3.5">Khách hàng</th>
                <th className="p-3.5">Thời gian bắt đầu</th>
                <th className="p-3.5">Tiền giờ</th>
                <th className="p-3.5">Tiền dịch vụ</th>
                <th className="p-3.5">Tổng thanh toán</th>
                <th className="p-3.5">P.Thức T.Toán</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={10} className="p-8 text-center text-slate-500 italic">
                    Không tìm thấy hóa đơn nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => {
                  const isPaid = isPaidInvoice(inv);
                  const isCancelled = String(inv.status || '').toUpperCase() === 'CANCELLED' || inv.status === (2 as any);
                  const isCash = isCashMethod(inv.paymentmethod);
                  const tableName = inv.tablename || (inv.tableid ? `Bàn ${inv.tableid}` : '--');

                  return (
                    <tr key={inv.invoiceid} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-slate-400">#{inv.invoiceid}</td>
                      <td className="p-3.5 font-bold text-white">{tableName}</td>
                      <td className="p-3.5 text-slate-300">{inv.customername || 'Khách vãng lai'}</td>
                      <td className="p-3.5 text-slate-400">{formatDateTime(inv.starttime)}</td>
                      <td className="p-3.5 font-mono text-amber-300">{formatVND(inv.tablefee)}</td>
                      <td className="p-3.5 font-mono text-teal-300">{formatVND(inv.servicefee)}</td>
                      <td className="p-3.5 font-mono font-bold text-emerald-400">{formatVND(inv.totalamount)}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold inline-flex items-center space-x-1 ${
                            isCash
                              ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                              : 'bg-sky-500/10 text-sky-300 border border-sky-500/20'
                          }`}
                        >
                          <span>{isCash ? '💵 Tiền mặt' : '💳 Chuyển khoản'}</span>
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isPaid
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : isCancelled
                              ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isPaid ? 'Đã thanh toán' : isCancelled ? 'Đã hủy' : 'Đang phục vụ'}
                        </span>
                      </td>
                      <td className="p-3.5 text-right">
                        <button
                          onClick={() => setSelectedReprintInvoice(inv)}
                          className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 px-3 py-1.5 rounded-xl font-semibold transition flex items-center space-x-1 ml-auto text-xs"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Xem / In</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

