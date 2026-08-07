import React, { useState } from 'react';
import { Customer } from '../../types';
import { formatVND, formatDateTime } from '../../utils/format';
import { api } from '../../services/api';
import { Users, UserPlus, Search, Award, ShieldCheck, Sparkles, Phone, Mail } from 'lucide-react';

interface CustomerManagementProps {
  customers: Customer[];
  onRefresh: () => void;
}

export const CustomerManagement: React.FC<CustomerManagementProps> = ({ customers, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [showAddModal, setShowAddModal] = useState<boolean>(false);

  const [fullname, setFullname] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [email, setEmail] = useState<string>('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.fullname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      (c.email && c.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullname.trim() || !phone.trim()) return;
    try {
      await api.addCustomer({ fullname, phone, email });
      setShowAddModal(false);
      setFullname('');
      setPhone('');
      setEmail('');
      onRefresh();
      alert('Thêm khách hàng thành công!');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'Diamond':
        return 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40';
      case 'Platinum':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/40';
      case 'Gold':
        return 'bg-amber-500/20 text-amber-300 border-amber-500/40';
      case 'Silver':
        return 'bg-slate-300/20 text-slate-200 border-slate-400/40';
      default:
        return 'bg-orange-500/20 text-orange-300 border-orange-500/40';
    }
  };

  return (
    <div className="space-y-5">
      {/* Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 font-bold flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-bold text-sm text-white">Quản lý Khách Hàng (CRM & Tích Điểm)</h2>
            <p className="text-xs text-slate-400">Tự động tích lũy 1% doanh số và nâng hạng thành viên</p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
        >
          <UserPlus className="w-4 h-4" />
          <span>Thêm Khách Hàng Mới</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Tìm theo tên, số điện thoại, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
              <tr>
                <th className="p-3.5">Mã KH</th>
                <th className="p-3.5">Họ & Tên</th>
                <th className="p-3.5">Số điện thoại</th>
                <th className="p-3.5">Hạng thành viên</th>
                <th className="p-3.5">Điểm tích lũy</th>
                <th className="p-3.5">Tổng chi tiêu tích lũy</th>
                <th className="p-3.5">Ngày tham gia</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredCustomers.map((c) => (
                <tr key={c.customerid} className="hover:bg-slate-800/40 transition">
                  <td className="p-3.5 font-mono text-slate-500">#{c.customerid}</td>
                  <td className="p-3.5 font-bold text-white flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-slate-800 flex items-center justify-center font-bold text-emerald-400 text-xs">
                      {c.fullname.charAt(0)}
                    </div>
                    <span>{c.fullname}</span>
                  </td>
                  <td className="p-3.5 font-mono text-slate-300">{c.phone}</td>
                  <td className="p-3.5">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold border ${getTierBadge(c.membershiptier)}`}>
                      ★ {c.membershiptier}
                    </span>
                  </td>
                  <td className="p-3.5 font-mono font-bold text-amber-300">{c.point} pt</td>
                  <td className="p-3.5 font-mono font-bold text-emerald-400">{formatVND(c.totalspent)}</td>
                  <td className="p-3.5 text-slate-400">{formatDateTime(c.createdat)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ADD CUSTOMER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">Đăng ký khách hàng thành viên</h3>
            <form onSubmit={handleAddCustomer} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Họ và tên khách hàng:</label>
                <input
                  type="text"
                  required
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Ví dụ: Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Số điện thoại (dùng làm Mã Tích Điểm):</label>
                <input
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                  placeholder="0912345678"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Email (Không bắt buộc):</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="email@example.com"
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
                  className="px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold"
                >
                  Tạo thành viên
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
