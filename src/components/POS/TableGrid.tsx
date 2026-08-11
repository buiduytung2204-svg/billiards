import React, { useState } from 'react';
import { BilliardTable, TableStatus, Invoice } from '../../types';
import { TableCard } from './TableCard';
import { Search, Filter, Sparkles, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

interface TableGridProps {
  tables: (BilliardTable & { activeInvoice?: Invoice | null })[];
  onOpenTable: (table: BilliardTable) => void;
  onAddService: (table: BilliardTable) => void;
  onCheckout: (table: BilliardTable) => void;
}

export const TableGrid: React.FC<TableGridProps> = ({ tables, onOpenTable, onAddService, onCheckout }) => {
  const [selectedZone, setSelectedZone] = useState<string>('ALL');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL'); // ALL, EMPTY, PLAYING, BOOKED
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique zones
  const zones = Array.from(new Set(tables.map((t) => t.zone || 'Khu Chung'))).filter(Boolean);
  const types = Array.from(new Set(tables.map((t) => t.tabletype)));

  const isPlaying = (t: BilliardTable & { activeInvoice?: Invoice | null }) => {
    const s = String(t.status ?? '').toUpperCase();
    return s === 'PLAYING' || s === '1' || !!t.activeInvoice;
  };

  const isBooked = (t: BilliardTable & { activeInvoice?: Invoice | null }) => {
    const s = String(t.status ?? '').toUpperCase();
    return s === 'BOOKED' || s === 'RESERVED' || s === '2';
  };

  const isEmpty = (t: BilliardTable & { activeInvoice?: Invoice | null }) => {
    return !isPlaying(t) && !isBooked(t);
  };

  const emptyCount = tables.filter(isEmpty).length;
  const playingCount = tables.filter(isPlaying).length;
  const bookedCount = tables.filter(isBooked).length;

  const filteredTables = tables.filter((t) => {
    if (selectedZone !== 'ALL' && t.zone !== selectedZone) return false;
    if (selectedType !== 'ALL' && t.tabletype !== selectedType) return false;
    if (statusFilter === 'EMPTY' && !isEmpty(t)) return false;
    if (statusFilter === 'PLAYING' && !isPlaying(t)) return false;
    if (statusFilter === 'BOOKED' && !isBooked(t)) return false;
    if (searchTerm && !t.tablename.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div className="space-y-5">
      {/* Filters Header Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 sm:p-4 shadow-md space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          {/* Status Quick Toggle */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              onClick={() => setStatusFilter('ALL')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition shrink-0 ${
                statusFilter === 'ALL'
                  ? 'bg-slate-700 text-white border border-slate-600 shadow'
                  : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700/50'
              }`}
            >
              Tất cả ({tables.length})
            </button>
            <button
              onClick={() => setStatusFilter('EMPTY')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition shrink-0 ${
                statusFilter === 'EMPTY'
                  ? 'bg-emerald-500 text-slate-950 font-bold shadow'
                  : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              <span>Bàn trống ({emptyCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('PLAYING')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition shrink-0 ${
                statusFilter === 'PLAYING'
                  ? 'bg-rose-500 text-white font-bold shadow'
                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              <span>Đang chơi ({playingCount})</span>
            </button>
            <button
              onClick={() => setStatusFilter('BOOKED')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center space-x-1.5 whitespace-nowrap transition shrink-0 ${
                statusFilter === 'BOOKED'
                  ? 'bg-purple-600 text-white font-bold shadow'
                  : 'bg-purple-500/10 text-purple-300 border border-purple-500/30 hover:bg-purple-500/20'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-purple-400"></span>
              <span>Đã đặt ({bookedCount})</span>
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full lg:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Tìm theo tên bàn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition"
            />
          </div>
        </div>

        {/* Secondary Zone & Type Dropdown Filters */}
        <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center space-x-2 flex-1 sm:flex-none">
            <span className="text-slate-400 font-medium shrink-0">Khu vực:</span>
            <select
              value={selectedZone}
              onChange={(e) => setSelectedZone(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả khu vực</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center space-x-2 flex-1 sm:flex-none">
            <span className="text-slate-400 font-medium shrink-0">Loại Bida:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full sm:w-auto bg-slate-950 border border-slate-700 text-slate-200 rounded-lg px-2.5 py-1 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="ALL">Tất cả thể loại</option>
              {types.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Grid Display */}
      {filteredTables.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 sm:p-12 text-center text-slate-400">
          <p className="text-sm sm:text-base font-semibold">Không tìm thấy bàn nào phù hợp với bộ lọc</p>
          <p className="text-xs text-slate-500 mt-1">Thử thay đổi từ khóa tìm kiếm hoặc bỏ chọn các khu vực</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {filteredTables.map((table) => (
            <TableCard
              key={table.tableid}
              table={table}
              onOpenTable={onOpenTable}
              onAddService={onAddService}
              onCheckout={onCheckout}
            />
          ))}
        </div>
      )}
    </div>
  );
};
