import React, { useState } from 'react';
import { Staff } from '../../types';
import { api } from '../../services/api';
import { ShieldCheck, User, Lock, KeyRound, CheckCircle2, AlertCircle, Sparkles, Loader2 } from 'lucide-react';

interface LoginModalProps {
  onSuccessLogin: (staff: Staff) => void;
  onClose?: () => void;
  staffs?: Staff[];
}

export const LoginModal: React.FC<LoginModalProps> = ({ onSuccessLogin, onClose, staffs = [] }) => {
  const [username, setUsername] = useState<string>('admin');
  const [password, setPassword] = useState<string>('123');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  const handleLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!username.trim()) {
      setErrorMsg('Vui lòng nhập tên tài khoản hoặc tên nhân viên!');
      return;
    }

    setLoading(true);
    setErrorMsg('');
    try {
      const staff = await api.loginStaff(username, password);
      onSuccessLogin(staff);
    } catch (err: any) {
      setErrorMsg(err.message || 'Đăng nhập thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (userAccount: string) => {
    setLoading(true);
    setErrorMsg('');
    try {
      const staff = await api.loginStaff(userAccount, '123');
      onSuccessLogin(staff);
    } catch (err: any) {
      setErrorMsg(err.message || 'Không thể đăng nhập tài khoản mẫu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl relative text-slate-100 overflow-hidden">
        {/* Background glow effects */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="text-center space-y-2 mb-6">
          <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-2xl flex items-center justify-center mx-auto text-slate-950 shadow-xl shadow-emerald-500/20 font-black text-2xl">
            8
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">Đăng Nhập Hệ Thống</h2>
          <p className="text-xs text-slate-400">Chọn tài khoản hoặc nhập tên để xác thực quyền quản trị</p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center space-x-2 text-rose-300 text-xs animate-shake">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Tên tài khoản / Tên nhân viên</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Nhập tên đăng nhập (VD: admin, cashier)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">Mật khẩu / Mã PIN</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Nhập mật khẩu (Mặc định: 123)..."
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 text-slate-100 text-xs rounded-xl pl-10 pr-4 py-3 outline-none transition"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold rounded-2xl text-xs transition shadow-lg shadow-emerald-500/25 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
            ) : (
              <>
                <ShieldCheck className="w-4 h-4" />
                <span>Đăng Nhập</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login Buttons */}
        <div className="mt-6 pt-5 border-t border-slate-800/80">
          <div className="flex items-center space-x-1 text-[11px] font-bold text-slate-400 mb-3 uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Đăng nhập nhanh mẫu:</span>
          </div>

          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => handleQuickLogin('admin')}
              className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-emerald-500/10 hover:border-emerald-500/40 border border-slate-700/60 rounded-xl transition text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs font-bold border border-emerald-500/30">
                  👑
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-emerald-300">
                    Nguyễn Văn Minh (Quản lý / Admin)
                  </div>
                  <div className="text-[10px] text-slate-400">Quyền chỉnh giá bàn, menu, nhân viên, cài đặt</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                Chỉnh mọi thứ
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('cashier')}
              className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-indigo-500/10 hover:border-indigo-500/40 border border-slate-700/60 rounded-xl transition text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center text-xs font-bold border border-indigo-500/30">
                  💳
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-200 group-hover:text-indigo-300">
                    Trần Thị Thu (Thu Ngân)
                  </div>
                  <div className="text-[10px] text-slate-400">Mở bàn, tính tiền, nhập xuất kho</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-indigo-300 font-bold bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                Thu ngân POS
              </span>
            </button>

            <button
              onClick={() => handleQuickLogin('staff')}
              className="flex items-center justify-between p-2.5 bg-slate-800/60 hover:bg-slate-700/60 border border-slate-700/60 rounded-xl transition text-left group"
            >
              <div className="flex items-center space-x-2.5">
                <span className="w-7 h-7 rounded-lg bg-slate-700/50 text-slate-300 flex items-center justify-center text-xs font-bold border border-slate-600">
                  🧑‍💼
                </span>
                <div>
                  <div className="text-xs font-bold text-slate-300">Lê Hoàng Nam (Nhân Viên)</div>
                  <div className="text-[10px] text-slate-400">Phục vụ món, xem trạng thái bàn</div>
                </div>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-900 px-2 py-1 rounded-md border border-slate-700">
                Phục vụ
              </span>
            </button>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="mt-4 w-full text-center text-xs text-slate-500 hover:text-slate-300 transition py-1"
          >
            Đóng cửa sổ
          </button>
        )}
      </div>
    </div>
  );
};
