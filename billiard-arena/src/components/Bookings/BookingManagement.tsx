import React, { useState } from 'react';
import { Booking, BilliardTable, Customer } from '../../types';
import { formatDateTime } from '../../utils/format';
import { api } from '../../services/api';
import { CalendarCheck, Plus, Clock, UserCheck, Play, XCircle } from 'lucide-react';

interface BookingManagementProps {
  bookings: Booking[];
  tables: BilliardTable[];
  customers: Customer[];
  onRefresh: () => void;
  onOpenTableFromBooking: (tableid: number, customerid?: number) => void;
}

export const BookingManagement: React.FC<BookingManagementProps> = ({
  bookings,
  tables,
  customers,
  onRefresh,
  onOpenTableFromBooking,
}) => {
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [cancellingBookingId, setCancellingBookingId] = useState<number | null>(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number>(customers[0]?.customerid || 1);
  const [selectedTableId, setSelectedTableId] = useState<number>(tables[0]?.tableid || 1);
  const [expectedTime, setExpectedTime] = useState<string>(
    new Date(Date.now() + 3600000 * 2).toISOString().slice(0, 16)
  );
  const [note, setNote] = useState<string>('');

  const handleCreateBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.addBooking({
        customerid: selectedCustomerId,
        tableid: selectedTableId,
        expectedstarttime: new Date(expectedTime).toISOString(),
        note: note,
      });
      setShowAddModal(false);
      onRefresh();
      alert('Tạo lịch đặt bàn thành công!');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleCancelBooking = async (bookingid: number) => {
    try {
      await api.cancelBooking(bookingid);
      setCancellingBookingId(null);
      onRefresh();
    } catch (err: any) {
      alert(`Lỗi khi hủy đặt bàn: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-400 font-bold flex items-center justify-center">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Quản lý Đặt Bàn Trước (Booking)</h2>
            <p className="text-xs text-slate-400">Tránh giữ bàn trùng giờ và giữ chỗ cho khách quen</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-purple-500/20"
        >
          <Plus className="w-4 h-4" />
          <span>Thêm Lịch Đặt Bàn</span>
        </button>
      </div>

      {/* Bookings Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Mã Booking</th>
                <th className="p-3.5">Khách hàng</th>
                <th className="p-3.5">Bàn đặt trước</th>
                <th className="p-3.5">Giờ dự kiến đến</th>
                <th className="p-3.5">Ghi chú</th>
                <th className="p-3.5">Trạng thái</th>
                <th className="p-3.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {bookings.map((b) => (
                <tr key={b.bookingid} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-500">#{b.bookingid}</td>
                  <td className="p-3.5 font-bold text-white">
                    {b.customername} ({b.customerphone})
                  </td>
                  <td className="p-3.5 text-purple-300 font-semibold">{b.tablename || 'Bàn bất kỳ'}</td>
                  <td className="p-3.5 font-mono text-amber-300">{formatDateTime(b.expectedstarttime)}</td>
                  <td className="p-3.5 text-slate-400">{b.note || '--'}</td>
                  <td className="p-3.5">
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        b.status === 'Cancelled'
                          ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                          : b.status === 'Completed'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          : 'bg-purple-500/20 text-purple-300 border-purple-500/30'
                      }`}
                    >
                      {b.status === 'Cancelled' ? 'Đã hủy' : b.status === 'Completed' ? 'Đã nhận bàn' : b.status}
                    </span>
                  </td>
                  <td className="p-3.5 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      {b.status !== 'Cancelled' && b.status !== 'Completed' && (
                        <button
                          onClick={() => setCancellingBookingId(b.bookingid)}
                          className="bg-slate-800 hover:bg-rose-950 hover:text-rose-300 text-slate-400 border border-slate-700 hover:border-rose-800/80 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition flex items-center space-x-1"
                          title="Hủy lịch đặt bàn này"
                        >
                          <XCircle className="w-3.5 h-3.5 text-rose-400" />
                          <span>Hủy Đặt Bàn</span>
                        </button>
                      )}

                      {b.status !== 'Cancelled' && b.status !== 'Completed' && b.tableid && (
                        <button
                          onClick={() => onOpenTableFromBooking(b.tableid!, b.customerid)}
                          className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1.5 rounded-xl font-bold transition flex items-center space-x-1 text-xs"
                        >
                          <Play className="w-3.5 h-3.5 fill-emerald-300" />
                          <span>Mở Bàn Ngay</span>
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD BOOKING MODAL */}
      {showAddModal && (
        <div
          onClick={() => setShowAddModal(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4 cursor-default"
          >
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">Đặt giữ bàn bida</h3>
            <form onSubmit={handleCreateBooking} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Khách hàng:</label>
                <select
                  value={selectedCustomerId}
                  onChange={(e) => setSelectedCustomerId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  {customers.map((c) => (
                    <option key={c.customerid} value={c.customerid}>
                      {c.fullname} ({c.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Chọn bàn bida:</label>
                <select
                  value={selectedTableId}
                  onChange={(e) => setSelectedTableId(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                >
                  {tables.map((t) => (
                    <option key={t.tableid} value={t.tableid}>
                      {t.tablename} ({t.tabletype})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Thời gian dự kiến đến:</label>
                <input
                  type="datetime-local"
                  required
                  value={expectedTime}
                  onChange={(e) => setExpectedTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Ghi chú đặc biệt:</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Ví dụ: Đặt bàn 8 thi đấu..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold"
                >
                  Xác nhận giữ bàn
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* CANCEL BOOKING CONFIRMATION MODAL */}
      {cancellingBookingId !== null && (
        <div
          onClick={() => setCancellingBookingId(null)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl cursor-default"
          >
            <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-lg text-white">Xác nhận Hủy Đặt Bàn?</h3>
              <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                Bạn có chắc muốn hủy lịch đặt bàn <span className="font-bold text-rose-400">#{cancellingBookingId}</span> này không? Bàn bida được đặt trước sẽ tự động trở về trạng thái Trống.
              </p>
            </div>
            <div className="flex items-center space-x-3 pt-2">
              <button
                onClick={() => setCancellingBookingId(null)}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Bỏ qua
              </button>
              <button
                onClick={() => handleCancelBooking(cancellingBookingId)}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-950/50"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
