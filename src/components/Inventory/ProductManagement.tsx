import React, { useState } from 'react';
import { Product, Staff, StockTransaction } from '../../types';
import { formatVND, formatDateTime } from '../../utils/format';
import { api } from '../../services/api';
import { Package, Plus, ArrowDownRight, ArrowUpRight, Search, AlertTriangle, History, RefreshCw, Lock } from 'lucide-react';

interface ProductManagementProps {
  products: Product[];
  stockTransactions: StockTransaction[];
  activeStaff?: Staff | null;
  onRefresh: () => void;
}

export const ProductManagement: React.FC<ProductManagementProps> = ({ products, stockTransactions, activeStaff, onRefresh }) => {
  const isManager = activeStaff?.role === 'Manager';
  const [activeSubTab, setActiveSubTab] = useState<'products' | 'transactions'>('products');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // New Product Modal
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [newProdName, setNewProdName] = useState<string>('');
  const [newCategory, setNewCategory] = useState<string>('Nước uống');
  const [newPrice, setNewPrice] = useState<number>(20000);
  const [newCostPrice, setNewCostPrice] = useState<number>(8000);
  const [newUnit, setNewUnit] = useState<string>('Chai');
  const [newStock, setNewStock] = useState<number>(50);
  const [newMinStock, setNewMinStock] = useState<number>(10);

  // Import Stock Modal
  const [importProd, setImportProd] = useState<Product | null>(null);
  const [importQty, setImportQty] = useState<number>(20);
  const [importCostPrice, setImportCostPrice] = useState<number>(0);
  const [importNote, setImportNote] = useState<string>('Nhập bổ sung kho');

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const filteredProducts = products.filter((p) => {
    if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
    if (searchTerm && !p.productname.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim()) return;
    try {
      await api.addProduct({
        productname: newProdName,
        category: newCategory,
        price: newPrice,
        costprice: newCostPrice,
        unit: newUnit,
        stock: newStock,
        minstock: newMinStock,
        isactive: true,
      });
      setShowAddModal(false);
      onRefresh();
      alert('Thêm sản phẩm thành công!');
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  const handleConfirmImport = async () => {
    if (!importProd) return;
    try {
      await api.importStock({
        productid: importProd.productid,
        quantity: importQty,
        costprice: importCostPrice || importProd.costprice,
        note: importNote,
      });
      setImportProd(null);
      onRefresh();
      alert(`Nhập kho thành công +${importQty} ${importProd.unit}!`);
    } catch (err: any) {
      alert(`Lỗi: ${err.message}`);
    }
  };

  return (
    <div className="space-y-5">
      {/* Top Header Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row items-center justify-between gap-3 shadow-md">
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setActiveSubTab('products')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'products'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Danh mục Sản phẩm ({products.length})</span>
          </button>
          <button
            onClick={() => setActiveSubTab('transactions')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center space-x-2 ${
              activeSubTab === 'transactions'
                ? 'bg-emerald-500 text-slate-950 shadow'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <History className="w-4 h-4" />
            <span>Lịch sử Nhập / Xuất Kho ({stockTransactions.length})</span>
          </button>
        </div>

        {activeSubTab === 'products' && (
          isManager ? (
            <button
              onClick={() => setShowAddModal(true)}
              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold px-4 py-2 rounded-xl text-xs flex items-center space-x-1.5 shadow-md shadow-emerald-500/20"
            >
              <Plus className="w-4 h-4" />
              <span>Thêm sản phẩm mới</span>
            </button>
          ) : (
            <div className="flex items-center space-x-1.5 text-[11px] font-bold text-amber-300 bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Chỉ Quản Lý mới có quyền thêm/sửa giá món</span>
            </div>
          )
        )}
      </div>

      {activeSubTab === 'products' ? (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-900 p-3 rounded-2xl border border-slate-800 text-xs">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Tìm sản phẩm theo tên..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-9 pr-3 py-1.5 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-slate-400">Danh mục:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-950 border border-slate-700 text-white rounded-xl px-3 py-1.5 focus:outline-none focus:border-emerald-500"
              >
                <option value="ALL">Tất cả nhóm hàng</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">ID</th>
                    <th className="p-3.5">Tên sản phẩm</th>
                    <th className="p-3.5">Danh mục</th>
                    <th className="p-3.5">Đơn vị</th>
                    <th className="p-3.5">Giá vốn (COGS)</th>
                    <th className="p-3.5">Giá bán</th>
                    <th className="p-3.5">Tồn kho hiện tại</th>
                    <th className="p-3.5 text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredProducts.map((p) => {
                    const isLowStock = p.stock <= (p.minstock || 10);
                    return (
                      <tr key={p.productid} className="hover:bg-slate-800/40 transition">
                        <td className="p-3.5 font-mono text-slate-500">#{p.productid}</td>
                        <td className="p-3.5 font-bold text-white">{p.productname}</td>
                        <td className="p-3.5 text-slate-400">{p.category}</td>
                        <td className="p-3.5 text-slate-400">{p.unit}</td>
                        <td className="p-3.5 font-mono text-slate-400">{formatVND(p.costprice || 0)}</td>
                        <td className="p-3.5 font-mono font-bold text-amber-300">{formatVND(p.price)}</td>
                        <td className="p-3.5">
                          <span
                            className={`font-mono font-bold px-2.5 py-1 rounded-full text-[11px] inline-flex items-center space-x-1 ${
                              isLowStock
                                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                                : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            }`}
                          >
                            {isLowStock && <AlertTriangle className="w-3 h-3 text-rose-400" />}
                            <span>
                              {p.stock} {p.unit}
                            </span>
                          </span>
                        </td>
                        <td className="p-3.5 text-right">
                          <button
                            onClick={() => {
                              setImportProd(p);
                              setImportCostPrice(p.costprice || 0);
                            }}
                            className="bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 px-3 py-1.5 rounded-xl font-bold transition"
                          >
                            + Nhập Kho
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        /* STOCK TRANSACTIONS HISTORY */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-lg">
          <div className="p-4 border-b border-slate-800 bg-slate-950/60 font-bold text-xs text-slate-200">
            Lịch sử giao dịch Xuất / Nhập tồn kho (stocktransactions)
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-950 text-slate-400 font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-3.5">Mã GD</th>
                  <th className="p-3.5">Thời gian</th>
                  <th className="p-3.5">Sản phẩm</th>
                  <th className="p-3.5">Loại giao dịch</th>
                  <th className="p-3.5">Số lượng thay đổi</th>
                  <th className="p-3.5">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {stockTransactions.map((tx, idx) => {
                  const txId = tx.txid || tx.transactionid || (idx + 1);
                  const txDate = tx.createdat || tx.transactiondate;
                  const rawType = (tx.type || tx.transactiontype || '').toUpperCase();
                  const isImport = rawType.includes('IMPORT') || rawType === 'IMPORT' || (tx.quantitychange && tx.quantitychange > 0);
                  const qty = tx.quantity !== undefined ? Math.abs(tx.quantity) : (tx.quantitychange !== undefined ? Math.abs(tx.quantitychange) : 0);
                  const displayQty = isImport ? `+${qty}` : `-${qty}`;

                  return (
                    <tr key={txId} className="hover:bg-slate-800/40 transition">
                      <td className="p-3.5 font-mono text-slate-500">#{txId}</td>
                      <td className="p-3.5 text-slate-400">{formatDateTime(txDate)}</td>
                      <td className="p-3.5 font-bold text-white">{tx.productname}</td>
                      <td className="p-3.5">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isImport
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}
                        >
                          {isImport ? 'Nhập kho' : 'Bán hàng (Xuất kho)'}
                        </span>
                      </td>
                      <td className="p-3.5 font-mono font-bold">
                        <span className={isImport ? 'text-emerald-400' : 'text-rose-400'}>
                          {displayQty}
                        </span>
                      </td>
                      <td className="p-3.5 text-slate-400">{tx.note || '--'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD PRODUCT */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-3">Thêm sản phẩm mới</h3>
            <form onSubmit={handleCreateProduct} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Tên sản phẩm:</label>
                <input
                  type="text"
                  required
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  placeholder="Ví dụ: Nước suối Dasani, Cánh gà chiên..."
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Danh mục:</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  >
                    <option value="Nước uống">Nước uống</option>
                    <option value="Đồ ăn">Đồ ăn</option>
                    <option value="Thuốc lá">Thuốc lá</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Dịch vụ khác">Dịch vụ khác</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Đơn vị tính:</label>
                  <input
                    type="text"
                    required
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                    placeholder="Lon, Chai, Đĩa, Cái..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Giá vốn (COGS):</label>
                  <input
                    type="number"
                    value={newCostPrice}
                    onChange={(e) => setNewCostPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Giá bán niêm yết:</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Tồn kho ban đầu:</label>
                  <input
                    type="number"
                    value={newStock}
                    onChange={(e) => setNewStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Mức cảnh báo tồn thấp:</label>
                  <input
                    type="number"
                    value={newMinStock}
                    onChange={(e) => setNewMinStock(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                  />
                </div>
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
                  Lưu sản phẩm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: IMPORT STOCK */}
      {importProd && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl space-y-4">
            <h3 className="font-bold text-base text-white border-b border-slate-800 pb-2">
              Nhập hàng bổ sung - {importProd.productname}
            </h3>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Số lượng nhập thêm ({importProd.unit}):</label>
                <input
                  type="number"
                  value={importQty}
                  onChange={(e) => setImportQty(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-bold text-sm"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Giá nhập đơn vị (VND):</label>
                <input
                  type="number"
                  value={importCostPrice}
                  onChange={(e) => setImportCostPrice(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Ghi chú phiếu nhập:</label>
                <input
                  type="text"
                  value={importNote}
                  onChange={(e) => setImportNote(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => setImportProd(null)}
                  className="px-4 py-2 rounded-xl border border-slate-700 text-slate-300"
                >
                  Hủy
                </button>
                <button
                  onClick={handleConfirmImport}
                  className="px-5 py-2 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold"
                >
                  Xác nhận Nhập Kho
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
