import React, { useState, useEffect } from 'react';
import { BilliardTable, TableStatus, Invoice } from '../../types';
import { calculateDuration, calculateRealtimeTableFee, formatVND, formatTimeOnly } from '../../utils/format';
import { Play, PlusCircle, CheckCircle2, Clock, DollarSign, Utensils, AlertCircle } from 'lucide-react';

interface TableCardProps {
  table: BilliardTable & { activeInvoice?: Invoice | null };
  onOpenTable: (table: BilliardTable) => void;
  onAddService: (table: BilliardTable) => void;
  onCheckout: (table: BilliardTable) => void;
}

export const TableCard: React.FC<TableCardProps> = ({ table, onOpenTable, onAddService, onCheckout }) => {
  const rawStatus = (table.status || '').toUpperCase();
  const isPlaying = rawStatus === 'PLAYING' || !!table.activeInvoice;
  const isBooked = rawStatus === 'BOOKED' || rawStatus === 'RESERVED';

  const activeInvoice = table.activeInvoice || (isPlaying ? {
    invoiceid: table.current_invoice_id || (1000 + table.tableid),
    tableid: table.tableid,
    starttime: new Date().toISOString(),
    playtime_minutes: 0,
    tablefee: 0,
    servicefee: 0,
    discountamount: 0,
    totalamount: 0,
    status: 'Playing',
    paymentmethod: 'Cash',
    details: [],
  } : null);

  // Realtime Live Timer Tick
  const [timerFormatted, setTimerFormatted] = useState<string>('00:00:00');
  const [realtimeTableFee, setRealtimeTableFee] = useState<number>(0);

  useEffect(() => {
    if (!isPlaying || !activeInvoice?.starttime) {
      setTimerFormatted('00:00:00');
      setRealtimeTableFee(0);
      return;
    }

    const tick = () => {
      const dur = calculateDuration(activeInvoice.starttime);
      setTimerFormatted(dur.formatted);
      setRealtimeTableFee(calculateRealtimeTableFee(activeInvoice.starttime, table.hourlyprice));
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [isPlaying, activeInvoice?.starttime, table.hourlyprice]);

  const serviceFee = activeInvoice?.servicefee || 0;
  const totalTemp = realtimeTableFee + serviceFee;

  // Status Styling
  let cardBorder = 'border-emerald-500/30 hover:border-emerald-500/60 bg-slate-900/90';
  let statusBadge = (
    <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
      <span>Bàn Trống</span>
    </span>
  );

  if (isPlaying) {
    cardBorder = 'border-rose-500/50 hover:border-rose-500 bg-slate-900/95 ring-1 ring-rose-500/20';
    statusBadge = (
      <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/20 text-rose-300 border border-rose-500/40">
        <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
        <span>Đang Chơi</span>
      </span>
    );
  } else if (isBooked) {
    cardBorder = 'border-purple-500/40 hover:border-purple-500/70 bg-slate-900/90';
    statusBadge = (
      <span className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-purple-500/10 text-purple-300 border border-purple-500/30">
        <span className="w-2 h-2 rounded-full bg-purple-400"></span>
        <span>Đã Đặt Trước</span>
      </span>
    );
  }

  return (
    <div
      onClick={() => {
        if (isPlaying) {
          onAddService(table);
        } else {
          onOpenTable(table);
        }
      }}
      className={`rounded-2xl border p-4 transition-all duration-200 flex flex-col justify-between shadow-lg relative overflow-hidden group cursor-pointer ${cardBorder}`}
    >
      {/* Table Type Badge Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div
            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
              isPlaying ? 'bg-rose-500/20 text-rose-400' : isBooked ? 'bg-purple-500/20 text-purple-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            🎱
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-100 group-hover:text-emerald-400 transition-colors">
              {table.tablename}
            </h3>
            <p className="text-[11px] text-slate-400">
              {table.tabletype} • <span className="text-amber-300 font-semibold">{formatVND(table.hourlyprice)}/h</span>
            </p>
          </div>
        </div>
        {statusBadge}
      </div>

      {/* Main Content Area */}
      {isPlaying ? (
        <div className="bg-slate-950/70 rounded-xl p-3 border border-slate-800 my-2 space-y-2">
          {/* Live Timer */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 flex items-center space-x-1">
              <Clock className="w-3.5 h-3.5 text-rose-400" />
              <span>Giờ chơi:</span>
            </span>
            <span className="font-mono text-base font-bold text-rose-400 tracking-wider">
              {timerFormatted}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Bắt đầu lúc:</span>
            <span className="font-medium text-slate-200">{formatTimeOnly(activeInvoice.starttime)}</span>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex flex-col gap-1 text-xs">
            <div className="flex justify-between text-slate-300">
              <span>Tiền giờ tạm tính:</span>
              <span className="font-semibold text-amber-300">{formatVND(realtimeTableFee)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Tiền đồ ăn / dịch vụ:</span>
              <span className="font-semibold text-teal-300">{formatVND(serviceFee)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-emerald-400 pt-1 border-t border-slate-800">
              <span>TỔNG TẠM TÍNH:</span>
              <span>{formatVND(totalTemp)}</span>
            </div>
          </div>

          {activeInvoice.customername && (
            <div className="text-[11px] bg-slate-900 px-2 py-1 rounded text-slate-300 border border-slate-800 flex justify-between">
              <span>Khách: {activeInvoice.customername}</span>
              <span className="text-amber-400 font-semibold">{activeInvoice.customerphone}</span>
            </div>
          )}
        </div>
      ) : isBooked ? (
        <div className="bg-slate-950/50 rounded-xl p-3 border border-purple-500/20 my-2 text-xs space-y-1 text-slate-300">
          <p className="font-semibold text-purple-300 flex items-center space-x-1">
            <AlertCircle className="w-3.5 h-3.5 text-purple-400" />
            <span>Đã có khách đặt trước</span>
          </p>
          <p className="text-slate-400 text-[11px]">Vui lòng kiểm tra lịch booking để phục vụ đúng giờ.</p>
        </div>
      ) : (
        <div className="bg-slate-950/40 rounded-xl p-4 border border-slate-800/80 my-2 text-center text-xs text-slate-400 flex flex-col items-center justify-center min-h-[90px] space-y-1">
          <span className="text-slate-500 font-medium">Bàn đang sẵn sàng đón khách</span>
          <span className="text-[11px] text-slate-600">Nhấn nút bên dưới để bắt đầu tính giờ</span>
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 mt-auto">
        {!isPlaying ? (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenTable(table);
            }}
            className="w-full flex items-center justify-center space-x-2 bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-bold py-2.5 px-4 rounded-xl shadow-md transition text-xs"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            <span>MỞ BÀN TÍNH GIỜ</span>
          </button>
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onAddService(table);
              }}
              className="flex items-center justify-center space-x-1.5 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 text-slate-200 font-semibold py-2 px-3 rounded-xl border border-slate-700 transition text-xs"
            >
              <Utensils className="w-3.5 h-3.5 text-amber-400" />
              <span>Gọi Món ({activeInvoice?.details?.length || 0})</span>
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onCheckout(table);
              }}
              className="flex items-center justify-center space-x-1.5 bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-white font-bold py-2 px-3 rounded-xl shadow-md transition text-xs"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>THANH TOÁN</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
