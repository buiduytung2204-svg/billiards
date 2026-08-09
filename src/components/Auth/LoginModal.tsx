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

        
