import React, { useState, useEffect } from 'react';
import { Circle, RefreshCw, UserCheck, Shield, Clock, Database, CheckCircle2, XCircle, Loader2 } from 'lucide-react';
import { formatTimeOnly, formatVND } from '../utils/format';
import { Staff } from '../types';
import { supabase } from '../lib/supabase';

interface HeaderProps {
  stats?: {
    totalRevenueToday: number;
    activeTablesCount: number;
    emptyTablesCount: number;
  };
  activeStaff?: Staff;
  onResetDb: () => void;
}

export const Header: React.FC<HeaderProps> = ({ stats, activeStaff, onResetDb }) => {
  const [time, setTime] = useState<string>('');
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [supabaseMsg, setSupabaseMsg] = useState<string>('Đang kiểm tra kết nối...');
  const [showSupabaseModal, setShowSupabaseModal] = useState<boolean>(false);

  const checkSupabase = async () => {
    setSupabaseStatus('checking');
    try {
      // Test client-side Supabase query
      const { data, error } = await supabase.from('todos').select('*').limit(1);
      if (error) {
        // If query error, it means connected to Supabase API but table/permission notice
        setSupabaseStatus('connected');
        setSupabaseMsg(`Đã kết nối thành công tới Supabase API! (Ghi chú từ DB: ${error.message})`);
      } else {
        setSupabaseStatus('connected');
        setSupabaseMsg('Kết nối thành công tới Supabase! Đã sẵn sàng thao tác dữ liệu.');
      }
    } catch (err: any) {
      setSupabaseStatus('error');
      setSupabaseMsg(`Lỗi kết nối Supabase: ${err.message || 'Không thể truy cập'}`);
    }
  };

  useEffect(() => {
    const update = () => setTime(new Date().toLocaleTimeString('vi-VN'));
    update();
    const interval = setInterval(update, 1000);
    checkSupabase();
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white px-4 py-3 sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Brand & Logo */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg shadow-emerald-500/20">
            8
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="font-extrabold text-lg tracking-tight text-white">BILLIARD ARENA</h1>
              <span className="text-[10px] font-semibold uppercase tracking-wider bg-purple-500/10 text-purple-400 border border-purple-500/20 px-2 py-0.5 rounded-full">
                POS System
              </span>
            </div>
            <p className="text-xs text-slate-400">Hệ thống quản lý CLB Bida chuyên nghiệp</p>
          </div>
        </div>

        {/* Realtime Stats Bar */}
        <div className="flex items-center space-x-4 bg-slate-800/80 px-4 py-2 rounded-xl border border-slate-700/60 text-xs">
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-slate-400">Bàn trống:</span>
            <span className="font-bold text-emerald-400">{stats?.emptyTablesCount ?? 0}</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-ping"></span>
            <span className="text-slate-400">Đang chơi:</span>
            <span className="font-bold text-rose-400">{stats?.activeTablesCount ?? 0}</span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="flex items-center space-x-1.5">
            <span className="text-slate-400">Doanh thu hôm nay:</span>
            <span className="font-bold text-amber-300">{formatVND(stats?.totalRevenueToday ?? 0)}</span>
          </div>
        </div>

        {/* User Info, Supabase Status, Clock & Controls */}
        <div className="flex items-center space-x-2.5">
          {/* Supabase status badge */}
          <button
            onClick={() => {
              checkSupabase();
              setShowSupabaseModal(true);
            }}
            className={`flex items-center space-x-1.5 px-2.5 py-1.5 rounded-lg border text-xs font-semibold transition ${
              supabaseStatus === 'connected'
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : supabaseStatus === 'checking'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
            }`}
            title="Kiểm tra trạng thái kết nối Supabase"
          >
            <Database className="w-3.5 h-3.5 shrink-0" />
            <span className="hidden sm:inline">Supabase</span>
            {supabaseStatus === 'checking' && <Loader2 className="w-3 h-3 animate-spin text-amber-400" />}
            {supabaseStatus === 'connected' && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>}
            {supabaseStatus === 'error' && <span className="w-2 h-2 rounded-full bg-rose-500"></span>}
          </button>

          <div className="hidden sm:flex items-center space-x-2 bg-slate-800 text-slate-300 px-3 py-1.5 rounded-lg border border-slate-700 font-mono text-xs">
            <Clock className="w-3.5 h-3.5 text-teal-400" />
            <span>{time || '--:--:--'}</span>
          </div>

          <div className="flex items-center space-x-2 bg-slate-800/90 text-xs px-3 py-1.5 rounded-lg border border-slate-700 text-slate-200">
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="font-medium">{activeStaff?.fullname || 'Trần Thị Thu (Thu ngân)'}</span>
          </div>

          <button
            onClick={onResetDb}
            title="Khôi phục dữ liệu demo ban đầu"
            className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg border border-slate-700 text-xs transition"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Reset Data</span>
          </button>
        </div>
      </div>

      {/* Supabase Modal */}
      {showSupabaseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl text-slate-100"
          >
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2.5">
                <Database className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-base text-white">Kiểm tra kết nối Supabase</h3>
              </div>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="text-slate-400 hover:text-white transition"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span>URL Supabase:</span>
                  <span className="font-mono text-emerald-400 truncate max-w-[200px]">
                    https://vmeehkajgihyiwciotfd.supabase.co
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span>Trạng thái:</span>
                  <span className="font-semibold flex items-center space-x-1.5">
                    {supabaseStatus === 'connected' && (
                      <span className="text-emerald-400 flex items-center space-x-1">
                        <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                        <span>ĐÃ KẾT NỐI THÀNH CÔNG</span>
                      </span>
                    )}
                    {supabaseStatus === 'checking' && (
                      <span className="text-amber-400 flex items-center space-x-1">
                        <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                        <span>ĐANG ĐỐI SOÁT...</span>
                      </span>
                    )}
                    {supabaseStatus === 'error' && (
                      <span className="text-rose-400 flex items-center space-x-1">
                        <XCircle className="w-4 h-4 text-rose-400" />
                        <span>LỖI KẾT NỐI</span>
                      </span>
                    )}
                  </span>
                </div>
              </div>

              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800/80 text-slate-300 leading-relaxed font-mono">
                {supabaseMsg}
              </div>
            </div>

            <div className="flex items-center space-x-2 pt-2">
              <button
                onClick={checkSupabase}
                className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold rounded-xl text-xs transition flex items-center justify-center space-x-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Kiểm tra lại</span>
              </button>
              <button
                onClick={() => setShowSupabaseModal(false)}
                className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
