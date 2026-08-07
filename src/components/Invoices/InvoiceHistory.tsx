import React, { useState } from 'react';
import { Invoice } from '../../types';
import { formatVND, formatDateTime } from '../../utils/format';
import { Receipt, Printer, Eye, Search, DollarSign } from 'lucide-react';
import { ReceiptPrint } from '../ReceiptPrint';

interface InvoiceHistoryProps {
  invoices: Invoice[];
}

export const InvoiceHistory: React.FC<InvoiceHistoryProps> = ({ invoices }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedReprintInvoice, setSelectedReprintInvoice] = useState<Invoice | null>(null);

  const filteredInvoices = invoices.filter((i) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      i.invoiceid.toString().includes(term) ||
      (i.tablename && i.tablename.toLowerCase().includes(term)) ||
      (i.customername && i.customername.toLowerCase().includes(term))
    );
  });

  const paidInvoices = invoices.filter((i) => i.status === 1);
  const totalPaidRevenue = paidInvoices.reduce((sum, i) => sum + i.totalamount, 0);

  if (selectedReprintInvoice) {
    return <ReceiptPrint invoice={selectedReprintInvoice} onClose={() => setSelectedReprintInvoice(null)} />;
  }

  return (
    <div className="space-y-5">
      {/* Top Revenue Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center text-lg">
            💵
          </div>
          <div>
            <p className="text-xs text-slate-400">Tổng doanh thu hệ thống</p>
            <p className="text-lg font-extrabold text-amber-300">{formatVND(totalPaidRevenue)}</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg">
            🧾
          </div>
          <div>
            <p className="text-xs text-slate-400">Số lượng hóa đơn đã thanh toán</p>
            <p className="text-lg font-extrabold text-emerald-400">{paidInvoices.length} hóa đơn</p>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center space-x-3 shadow-md">
          <div className="w-10 h-10 rounded-xl bg-teal-500/20 text-teal-400 font-bold flex items-center justify-center text-lg">
            📊
          </div>
          <div>
            <p className="text-xs text-slate-400">Giá trị trung bình / Hóa đơn</p>
            <p className="text-lg font-extrabold text-teal-300">
              {formatVND(paidInvoices.length ? Math.round(totalPaidRevenue / paidInvoices.length) : 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs flex justify-between items-center">
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
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredInvoices.map((inv) => (
                <tr key={inv.invoiceid} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-400">#{inv.invoiceid}</td>
                  <td className="p-3.5 font-bold text-white">{inv.tablename}</td>
                  <td className="p-3.5 text-slate-300">{inv.customername || 'Khách vãng lai'}</td>
                  <td className="p-3.5 text-slate-400">{formatDateTime(inv.starttime)}</td>
                  <td className="p-3.5 font-mono text-amber-300">{formatVND(inv.tablefee)}</td>
                  <td className="p-3.5 font-mono text-teal-300">{formatVND(inv.servicefee)}</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">{formatVND(inv.totalamount)}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inv.status === 1
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {inv.status === 1 ? 'Đã thanh toán' : 'Đang phục vụ'}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
