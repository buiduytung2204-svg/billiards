import React, { useState, useEffect } from 'react';
import { BilliardTable, Product, Customer, Invoice, TableStatus, Staff } from '../../types';
import { formatVND } from '../../utils/format';
import { X, Plus, Minus, Search, Utensils, Play, UserPlus, Check, Trash2, RotateCcw, Lock } from 'lucide-react';

interface TableDetailModalProps {
  table: BilliardTable & { activeInvoice?: Invoice | null };
  products: Product[];
  customers: Customer[];
  activeStaff?: Staff | null;
  onOpenLoginModal?: () => void;
  onClose: () => void;
  onOpenTableSubmit: (tableid: number, customerid?: number) => void;
  onCancelTableSubmit: (tableid: number) => void;
  onAddServiceSubmit: (invoiceid: number, productid: number, quantity: number) => void;
  onRemoveServiceSubmit: (invoiceid: number, detailid: number, quantity: number) => void;
  onProceedToCheckout: (table: BilliardTable) => void;
}

export const TableDetailModal: React.FC<TableDetailModalProps> = ({
  table,
  products,
  customers,
  activeStaff,
  onOpenLoginModal,
  onClose,
  onOpenTableSubmit,
  onCancelTableSubmit,
  onAddServiceSubmit,
  onRemoveServiceSubmit,
  onProceedToCheckout,
}) => {
  const rawStatus = (table.status || '').toUpperCase();
  const isPlaying = rawStatus === 'PLAYING' || !!table.activeInvoice;

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

  // Open Table State
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(undefined);
  const [showCancelConfirm, setShowCancelConfirm] = useState<boolean>(false);

  // Add Item State
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [mobileTab, setMobileTab] = useState<'menu' | 'cart'>('menu');

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (selectedCategory !== 'ALL' && p.category !== selectedCategory) return false;
    if (searchTerm && !p.productname.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
      >
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold flex items-center justify-center text-lg">
              🎱
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">{table.tablename}</h2>
              <p className="text-xs text-slate-400">
                {table.tabletype} • Giá giờ: <span className="text-amber-400 font-semibold">{formatVND(table.hourlyprice)}/h</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        {!isPlaying ? (
          /* SCENARIO 1: MỞ BÀN MỚI */
          <div className="p-6 space-y-6 overflow-y-auto">
            {!activeStaff ? (
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-amber-200 text-xs shadow-md">
                <div className="flex items-center space-x-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
                    <Lock className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-amber-300 text-sm">Chưa đăng nhập tài khoản</p>
                    <p className="text-slate-300">Vui lòng đăng nhập tài khoản Nhân viên hoặc Quản lý để bắt đầu mở bàn tính giờ.</p>
                  </div>
                </div>
                <button
                  onClick={onOpenLoginModal}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs whitespace-nowrap shadow-md transition shrink-0"
                >
                  Đăng Nhập Ngay
                </button>
              </div>
            ) : (
              <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4 text-slate-300 text-xs space-y-2">
                <p className="font-bold text-emerald-400 text-sm">Xác nhận mở bàn tính giờ</p>
                <p>Hệ thống sẽ ghi nhận thời gian bắt đầu chính xác từng giây để tự động tính tiền giờ chơi.</p>
              </div>
            )}

            {/* Choose Customer optional */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-300">
                Gắn Khách hàng thành viên (Không bắt buộc):
              </label>
              <select
                value={selectedCustomerId || ''}
                onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-3 text-xs focus:outline-none focus:border-emerald-500"
              >
                <option value="">-- Khách vãng lai (Chưa tích điểm) --</option>
                {customers.map((c) => (
                  <option key={c.customerid} value={c.customerid}>
                    {c.fullname} ({c.phone}) - Hạng: {c.membershiptier} (Đang có {c.point} pt)
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-4 flex justify-end space-x-3">
              <button
                onClick={onClose}
                className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-xs font-semibold"
              >
                Hủy bỏ
              </button>
              <button
                onClick={() => {
                  if (!activeStaff) {
                    if (onOpenLoginModal) onOpenLoginModal();
                    alert('🔒 Bạn chưa đăng nhập! Vui lòng đăng nhập tài khoản Nhân viên hoặc Quản lý trước khi mở bàn.');
                    return;
                  }
                  onOpenTableSubmit(table.tableid, selectedCustomerId);
                  onClose();
                }}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg flex items-center space-x-2 transition ${
                  activeStaff
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-400 hover:bg-slate-700 cursor-pointer'
                }`}
              >
                {activeStaff ? <Play className="w-4 h-4 fill-slate-950" /> : <Lock className="w-4 h-4 text-amber-400" />}
                <span>{activeStaff ? 'Bắt đầu chơi ngay' : 'Đăng nhập để mở bàn'}</span>
              </button>
            </div>
          </div>
        ) : (
          /* SCENARIO 2: BÀN ĐANG CHƠI - GỌI MÓN / XEM HÓA ĐƠN DỊCH VỤ */
          <div className="flex flex-col flex-1 overflow-hidden">
            {/* Mobile Tab Switcher */}
            <div className="flex md:hidden border-b border-slate-800 bg-slate-950 px-4 py-2 gap-2 text-xs">
              <button
                onClick={() => setMobileTab('menu')}
                className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                  mobileTab === 'menu'
                    ? 'bg-emerald-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <span>🍔 Menu Gọi Món</span>
              </button>
              <button
                onClick={() => setMobileTab('cart')}
                className={`flex-1 py-2 rounded-xl font-bold transition flex items-center justify-center space-x-1.5 ${
                  mobileTab === 'cart'
                    ? 'bg-amber-500 text-slate-950 shadow'
                    : 'bg-slate-900 text-slate-400 border border-slate-800'
                }`}
              >
                <span>🛒 Đã Gọi ({activeInvoice?.details?.length || 0})</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 flex-1 overflow-hidden">
              {/* Left Column: Menu Đồ ăn / Nước uống (KiotViet Product Picker) */}
              <div
                className={`md:col-span-7 p-3 sm:p-4 border-r border-slate-800 flex-col overflow-hidden bg-slate-950/30 ${
                  mobileTab === 'menu' ? 'flex flex-1' : 'hidden md:flex'
                }`}
              >
                <div className="space-y-3 mb-3">
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      placeholder="Tìm tên nước uống, đồ ăn, bao thuốc..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  {/* Categories Pills */}
                  <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                        selectedCategory === 'ALL'
                          ? 'bg-emerald-500 text-slate-950 font-bold'
                          : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      Tất cả
                    </button>
                    {categories.map((cat) => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-3 py-1 rounded-lg font-semibold whitespace-nowrap transition ${
                          selectedCategory === cat
                            ? 'bg-emerald-500 text-slate-950 font-bold'
                            : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Product List Grid */}
                <div className="flex-1 overflow-y-auto grid grid-cols-2 gap-2 sm:gap-2.5 pr-1">
                  {filteredProducts.map((p) => {
                    const outOfStock = p.stock <= 0;
                    return (
                      <button
                        key={p.productid}
                        disabled={outOfStock}
                        onClick={() => {
                          if (!activeStaff) {
                            if (onOpenLoginModal) onOpenLoginModal();
                            alert('🔒 Bạn chưa đăng nhập! Vui lòng đăng nhập tài khoản Nhân viên hoặc Quản lý.');
                            return;
                          }
                          if (activeInvoice) {
                            onAddServiceSubmit(activeInvoice.invoiceid, p.productid, 1);
                          }
                        }}
                        className={`p-2.5 sm:p-3 rounded-2xl border text-left transition relative flex flex-col justify-between group ${
                          outOfStock
                            ? 'bg-slate-900/40 border-slate-800/50 opacity-50 cursor-not-allowed'
                            : 'bg-slate-900 border-slate-800 hover:border-emerald-500/60 hover:bg-slate-800/80'
                        }`}
                      >
                        <div>
                          <p className="font-bold text-xs text-white group-hover:text-emerald-400 transition-colors line-clamp-1">
                            {p.productname}
                          </p>
                          <p className="text-[10px] text-slate-400">{p.unit}</p>
                        </div>

                        <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80">
                          <span className="font-bold text-xs text-amber-300">{formatVND(p.price)}</span>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded ${
                              p.stock <= (p.minstock || 10)
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-slate-800 text-slate-400'
                            }`}
                          >
                            Tồn: {p.stock}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Ordered Items List for Table */}
              <div
                className={`md:col-span-5 p-3 sm:p-4 flex-col justify-between overflow-hidden bg-slate-900 ${
                  mobileTab === 'cart' ? 'flex flex-1' : 'hidden md:flex'
                }`}
              >
                <div className="space-y-3 overflow-hidden flex flex-col flex-1">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <h3 className="font-bold text-xs text-slate-200 uppercase tracking-wider flex items-center space-x-1.5">
                      <Utensils className="w-3.5 h-3.5 text-amber-400" />
                      <span>Danh sách dịch vụ đã chọn</span>
                    </h3>
                    <span className="text-xs font-semibold text-teal-300">
                      {activeInvoice?.details?.length || 0} món
                    </span>
                  </div>

                  {/* Items List */}
                  <div className="flex-1 overflow-y-auto space-y-2 pr-1">
                    {(!activeInvoice?.details || activeInvoice.details.length === 0) ? (
                      <div className="p-8 text-center text-slate-500 text-xs">
                        Chưa gọi món nào. Chọn sản phẩm ở menu để thêm vào bàn.
                      </div>
                    ) : (
                      activeInvoice.details.map((item) => (
                        <div
                          key={item.detailid}
                          className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs"
                        >
                          <div>
                            <p className="font-semibold text-slate-100">{item.productname}</p>
                            <p className="text-[11px] text-slate-400">
                              {formatVND(item.unitprice)} / {item.unit}
                            </p>
                          </div>

                          <div className="flex items-center space-x-2 sm:space-x-3">
                            <div className="flex items-center space-x-1 bg-slate-900 rounded-lg p-1 border border-slate-700">
                              <button
                                onClick={() => {
                                  if (!activeStaff) {
                                    if (onOpenLoginModal) onOpenLoginModal();
                                    alert('🔒 Bạn chưa đăng nhập!');
                                    return;
                                  }
                                  onRemoveServiceSubmit(activeInvoice.invoiceid, item.detailid, 1);
                                }}
                                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-1.5 sm:px-2 font-bold text-emerald-400">{item.quantity}</span>
                              <button
                                onClick={() => {
                                  if (!activeStaff) {
                                    if (onOpenLoginModal) onOpenLoginModal();
                                    alert('🔒 Bạn chưa đăng nhập!');
                                    return;
                                  }
                                  onAddServiceSubmit(activeInvoice.invoiceid, item.productid, 1);
                                }}
                                className="p-1 hover:bg-slate-800 text-slate-300 rounded"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <span className="font-bold text-amber-300 min-w-[65px] sm:min-w-[70px] text-right">
                              {formatVND(item.subtotal)}
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="pt-3 border-t border-slate-800 space-y-2 mt-2">
                  <div className="flex justify-between text-xs text-slate-300">
                    <span>Tiền dịch vụ:</span>
                    <span className="font-bold text-teal-300">{formatVND(activeInvoice?.servicefee || 0)}</span>
                  </div>

                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        if (!activeStaff) {
                          if (onOpenLoginModal) onOpenLoginModal();
                          alert('🔒 Bạn chưa đăng nhập! Vui lòng đăng nhập tài khoản Nhân viên hoặc Quản lý.');
                          return;
                        }
                        setShowCancelConfirm(true);
                      }}
                      className="py-3 px-3 bg-slate-800 hover:bg-rose-950 hover:text-rose-300 border border-slate-700 hover:border-rose-800/80 text-slate-300 font-semibold rounded-2xl text-xs transition flex items-center justify-center space-x-1 shrink-0"
                      title="Hủy mở bàn nếu mở nhầm"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-rose-400" />
                      <span className="hidden sm:inline">Hủy mở bàn</span>
                    </button>

                    <button
                      onClick={() => {
                        if (!activeStaff) {
                          if (onOpenLoginModal) onOpenLoginModal();
                          alert('🔒 Bạn chưa đăng nhập! Vui lòng đăng nhập tài khoản Nhân viên hoặc Quản lý.');
                          return;
                        }
                        onClose();
                        onProceedToCheckout(table);
                      }}
                      className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-2xl text-xs shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      <span>THANH TOÁN BÀN</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Confirmation Modal for Cancel Open Table */}
        {showCancelConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn">
            <div
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-700 rounded-3xl p-6 max-w-sm w-full space-y-4 text-center shadow-2xl"
            >
              <div className="w-12 h-12 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                <RotateCcw className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-white">Xác nhận Hủy Mở Bàn?</h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Bạn có chắc muốn hủy mở <span className="font-bold text-rose-400">{table.tablename}</span> không? Bàn sẽ trở về trạng thái trống và các dịch vụ đã gọi sẽ được hoàn trả về kho.
                </p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button
                  onClick={() => setShowCancelConfirm(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
                >
                  Bỏ qua
                </button>
                <button
                  onClick={() => {
                    setShowCancelConfirm(false);
                    onCancelTableSubmit(table.tableid);
                    onClose();
                  }}
                  className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs transition shadow-lg shadow-rose-950/50"
                >
                  Xác nhận hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
