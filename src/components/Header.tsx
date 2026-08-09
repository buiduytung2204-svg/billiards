import React, { useState, useEffect } from 'react';
import { RefreshCw, UserCheck, Clock } from 'lucide-react';
import { formatVND } from '../utils/format';
import { Staff } from '../types';

interface HeaderProps {
  stats?: {
    totalRevenueToday: number;
    activeTablesCount: number;
    emptyTablesCount: number;
  };
  activeStaff?: Staff | null;
  onResetDb: () => void;
  onOpenLoginModal?: () => void;
  onLogout?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, activeStaff, onResetDb, onOpenLoginModal, onLogout }) => {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('vi-VN'));
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2.5 sm:py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 sm:gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center justify-between lg:justify-start w-full lg:w-auto">
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-lg sm:text-xl shadow-lg shadow-emerald-500/20 shrink-0">
              8
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight text-white">BILLIARD ARENA</h1>
                <span className="text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-1.5 sm:px-2 py-0.5 rounded-full">
                  POS
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-400 hidden xs:block">Hệ thống quản lý CLB Bida chuyên nghiệp</p>
            </div>
          </div>

          <div className="flex sm:hidden items-center space-x-1.5">
            <div className="flex items-center space-x-1 bg-slate-800 text-slate-300 px-2 py-1 rounded-lg border border-slate-700 font-mono text-[11px]">
              <Clock className="w-3 h-3 text-teal-400 shrink-0" />
              <span>{time ? time.split(':')[0] + ':' + time.split(':')[1] : '--:--'}</span>
            </div>
          </div>
        </div>

        {/* Realtime Stats Bar */}
        <div className="flex items-center justify-between gap-2 bg-slate-800/80 px-3 py-1.5 sm:py-2 rounded-xl border border-slate-700/60 text-[11px] sm:text-xs overflow-x-auto w-full lg:w-auto scrollbar-none">
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
            <span className="text-slate-400">Trống:</span>
            <span className="font-bold text-emerald-400">{stats?.emptyTablesCount ?? 0}</span>
          </div>
          <div className="h-3.5 w-px bg-slate-700 shrink-0"></div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-rose-500 animate-ping shrink-0"></span>
            <span className="text-slate-400">Đang chơi:</span>
            <span className="font-bold text-rose-400">{stats?.activeTablesCount ?? 0}</span>
          </div>
          <div className="h-3.5 w-px bg-slate-700 shrink-0"></div>
          <div className="flex items-center space-x-1.5 shrink-0">
            <span className="text-slate-400">Doanh thu:</span>
            <span className="font-bold text-amber-300">{formatVND(stats?.totalRevenueToday ?? 0)}</span>
          </div>
        </div>

        {/* User Info, Clock & Controls */}
        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-2 w-full lg:w-auto pt-1 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
          <div className="hidden sm:flex items-center space-x-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{time || '--:--:--'}</span>
          </div>

          {/* Staff & Login control */}
          <div className="flex items-center space-x-1.5 bg-slate-800/90 text-xs px-2.5 py-1.5 rounded-xl border border-slate-700/80 text-slate-200 shrink-0">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <div className="flex items-center space-x-1">
              <span className="font-bold text-slate-100 max-w-[90px] sm:max-w-[130px] truncate text-[11px] sm:text-xs">
                {activeStaff ? activeStaff.fullname : 'Chưa ĐN'}
              </span>
              {activeStaff && (
                <span
                  className={`text-[9px] sm:text-[10px] px-1 py-0.2 rounded font-extrabold border ${
                    activeStaff.role === 'Manager'
                      ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                  }`}
                >
                  {activeStaff.role === 'Manager' ? 'QL' : activeStaff.role}
                </span>
              )}
            </div>
            
            {activeStaff ? (
              <div className="flex items-center space-x-1 pl-1 border-l border-slate-700">
                <button
                  onClick={onOpenLoginModal}
                  className="text-[10px] sm:text-[11px] font-bold text-amber-400 hover:text-amber-300 bg-slate-900 hover:bg-slate-950 px-1.5 sm:px-2 py-0.5 rounded-lg border border-slate-700 transition"
                  title="Đổi tài khoản đăng nhập khác"
                >
                  Đổi
                </button>
                <button
                  onClick={onLogout}
                  className="text-[10px] sm:text-[11px] font-bold text-rose-400 hover:text-rose-300 bg-slate-900 hover:bg-slate-950 px-1.5 sm:px-2 py-0.5 rounded-lg border border-slate-700 transition"
                  title="Đăng xuất khỏi hệ thống"
                >
                  Thoát
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="ml-1 text-[10px] sm:text-[11px] font-bold text-emerald-400 hover:text-emerald-300 bg-emerald-950/60 hover:bg-emerald-900 px-2 py-0.5 rounded-lg border border-emerald-500/40 transition"
                title="Đăng nhập tài khoản Nhân viên hoặc Quản lý"
              >
                Đăng Nhập
              </button>
            )}
          </div>

          <button
            onClick={onResetDb}
            title="Khôi phục dữ liệu ban đầu"
            className="flex items-center space-x-1 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white px-2 py-1.5 rounded-lg border border-slate-700 text-xs transition shrink-0"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset</span>
          </button>
        </div>
      </div>
    </header>
  );
};
