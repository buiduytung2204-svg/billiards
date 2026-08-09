import React, { useState, useEffect } from 'react';
import { BilliardTable, Customer, Invoice, Voucher } from '../../types';
import { calculateDuration, formatVND, formatDateTime } from '../../utils/format';
import { api } from '../../services/api';
import { X, CheckCircle2, Ticket, DollarSign, QrCode, CreditCard, Printer, UserCheck, Sparkles, AlertCircle } from 'lucide-react';
import { ReceiptPrint } from '../ReceiptPrint';

interface CheckoutModalProps {
  table: BilliardTable & { activeInvoice?: Invoice | null };
  customers: Customer[];
  onClose: () => void;
  onSuccessCheckout: () => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({ table, customers, onClose, onSuccessCheckout }) => {
  const activeInvoice = table.activeInvoice;

  const [selectedCustomerId, setSelectedCustomerId] = useState<number | undefined>(
    activeInvoice?.customerid || undefined
  );
  const [voucherCode, setVoucherCode] = useState<string>('');
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [voucherError, setVoucherError] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Transfer' | 'Card'>('Cash');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [checkoutError, setCheckoutError] = useState<string>('');
  const [completedInvoice, setCompletedInvoice] = useState<Invoice | null>(null);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // If checkout completed, show Printable Receipt
  if (completedInvoice) {
    return (
      <ReceiptPrint
        invoice={completedInvoice}
        onClose={onClose}
      />
    );
  }

  if (!activeInvoice) return null;

  const duration = calculateDuration(activeInvoice.starttime);
  const tableFee = Math.round((table.hourlyprice / 60) * duration.totalMinutes);
  const serviceFee = activeInvoice.servicefee || 0;
  const subTotal = tableFee + serviceFee;

  // Calculate VIP Tier Discount on Table Fee
  const selectedCustomer = customers.find((c) => c.customerid === selectedCustomerId);
  let vipDiscountPercent = 0;
  if (selectedCustomer?.membershiptier) {
    const tierMap: Record<string, number> = {
      Bronze: 5,
      Silver: 10,
      Gold: 15,
      Platinum: 20,
      Diamond: 25,
    };
    vipDiscountPercent = tierMap[selectedCustomer.membershiptier] || 0;
  }
  const vipDiscountAmount = Math.round((tableFee * vipDiscountPercent) / 100);

  let voucherDiscount = 0;
  if (appliedVoucher && subTotal >= appliedVoucher.minordervalue) {
    voucherDiscount = appliedVoucher.discountamount;
  }

  const totalDiscount = voucherDiscount + vipDiscountAmount;
  const finalAmount = Math.max(0, subTotal - totalDiscount);
  const pointsToEarn = Math.floor(finalAmount / 10000);

  // Check Voucher
  const handleApplyVoucher = async () => {
    if (!voucherCode.trim()) return;
    setVoucherError('');
    try {
      const v = await api.checkVoucher(voucherCode);
      if (subTotal < v.minordervalue) {
        setVoucherError(`Đơn hàng tối thiểu ${formatVND(v.minordervalue)} mới được áp dụng mã này`);
        setAppliedVoucher(null);
      } else {
        setAppliedVoucher(v);
      }
    } catch (err: any) {
      setVoucherError(err.message || 'Mã giảm giá không tồn tại');
      setAppliedVoucher(null);
    }
  };

  // Perform Checkout
  const handleConfirmCheckout = async () => {
    setIsSubmitting(true);
    setCheckoutError('');
    try {
      const resInvoice = await api.checkoutTable({
        invoiceid: activeInvoice.invoiceid,
        customerid: selectedCustomerId,
        vouchercode: appliedVoucher ? appliedVoucher.vouchercode : undefined,
        paymentmethod: paymentMethod,
      });

      setCompletedInvoice(resInvoice);
      onSuccessCheckout();
    } catch (err: any) {
      setCheckoutError(err.message || 'Lỗi xử lý thanh toán');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden cursor-default"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 font-bold flex items-center justify-center text-lg">
              💳
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Thanh toán - {table.tablename}</h2>
              <p className="text-xs text-slate-400">Hóa đơn #{activeInvoice.invoiceid}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 overflow-y-auto flex-1 text-xs">
          {/* Time & Hourly Fee Breakdown */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <div className="flex justify-between text-slate-300">
              <span>Bắt đầu chơi:</span>
              <span className="font-semibold">{formatDateTime(activeInvoice.starttime)}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Kết thúc chốt giờ:</span>
              <span className="font-semibold">{formatDateTime(new Date().toISOString())}</span>
            </div>
            <div className="flex justify-between text-slate-300">
              <span>Tổng thời gian chơi:</span>
              <span className="font-mono font-bold text-amber-300">{duration.formatted} ({duration.totalMinutes} phút)</span>
            </div>
            <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-slate-100">
              <span>TIỀN GIỜ CHƠI ({formatVND(table.hourlyprice)}/h):</span>
              <span className="text-amber-300">{formatVND(tableFee)}</span>
            </div>
          </div>

          {/* Service Details List */}
          {activeInvoice.details && activeInvoice.details.length > 0 && (
            <div className="space-y-2">
              <label className="font-bold text-slate-300">Chi tiết dịch vụ / Đồ ăn đã dùng:</label>
              <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-2 max-h-36 overflow-y-auto">
                {activeInvoice.details.map((d) => (
                  <div key={d.detailid} className="flex justify-between items-center text-slate-300 border-b border-slate-800/50 pb-1">
                    <span>
                      {d.productname} x{d.quantity} {d.unit}
                    </span>
                    <span className="font-semibold text-teal-300">{formatVND(d.subtotal)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CRM Customer Picker */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center space-x-1">
              <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>Khách hàng thành viên (Tích điểm & Ưu đãi):</span>
            </label>
            <select
              value={selectedCustomerId || ''}
              onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full bg-slate-950 border border-slate-700 text-white rounded-xl p-2.5 text-xs focus:outline-none focus:border-emerald-500"
            >
              <option value="">-- Khách vãng lai (Chưa tích điểm) --</option>
              {customers.map((c) => (
                <option key={c.customerid} value={c.customerid}>
                  {c.fullname} ({c.phone}) - Hạng: {c.membershiptier} (Điểm hiện tại: {c.point})
                </option>
              ))}
            </select>
          </div>

          {/* Voucher Code Box */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300 flex items-center space-x-1">
              <Ticket className="w-3.5 h-3.5 text-amber-400" />
              <span>Áp dụng Mã giảm giá (Voucher):</span>
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Nhập mã voucher (VD: BIDA50K, VIP100K)..."
                value={voucherCode}
                onChange={(e) => setVoucherCode(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white uppercase font-mono focus:outline-none focus:border-amber-500"
              />
              <button
                onClick={handleApplyVoucher}
                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-4 py-2 rounded-xl text-xs transition"
              >
                Áp dụng
              </button>
            </div>
            {voucherError && <p className="text-rose-400 text-[11px] font-semibold">{voucherError}</p>}
            {appliedVoucher && (
              <p className="text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Đã giảm {formatVND(appliedVoucher.discountamount)} với mã {appliedVoucher.vouchercode}!</span>
              </p>
            )}
          </div>

          {/* Payment Method Selector */}
          <div className="space-y-1.5">
            <label className="font-bold text-slate-300">Phương thức thanh toán:</label>
            <div className="grid grid-cols-3 gap-2">
              <button
                onClick={() => setPaymentMethod('Cash')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition ${
                  paymentMethod === 'Cash'
                    ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span>Tiền mặt</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Transfer')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition ${
                  paymentMethod === 'Transfer'
                    ? 'bg-teal-500/20 text-teal-400 border-teal-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <QrCode className="w-4 h-4" />
                <span>Chuyển khoản VietQR</span>
              </button>
              <button
                onClick={() => setPaymentMethod('Card')}
                className={`py-2.5 px-3 rounded-xl border flex items-center justify-center space-x-1.5 font-bold transition ${
                  paymentMethod === 'Card'
                    ? 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50'
                    : 'bg-slate-950 text-slate-400 border-slate-800'
                }`}
              >
                <CreditCard className="w-4 h-4" />
                <span>Quẹt thẻ</span>
              </button>
            </div>
          </div>

          {/* Error Notice */}
          {checkoutError && (
            <div className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-3 rounded-2xl text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{checkoutError}</span>
            </div>
          )}

          {/* Total Summary */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex justify-between text-slate-400">
              <span>Tiền giờ ({duration.formatted}):</span>
              <span>{formatVND(tableFee)}</span>
            </div>
            {serviceFee > 0 && (
              <div className="flex justify-between text-slate-400">
                <span>Tiền dịch vụ / Nước uống:</span>
                <span>{formatVND(serviceFee)}</span>
              </div>
            )}
            {vipDiscountAmount > 0 && (
              <div className="flex justify-between text-amber-400 font-semibold text-xs">
                <span>Giảm giá VIP {selectedCustomer?.membershiptier} ({vipDiscountPercent}% tiền giờ):</span>
                <span>-{formatVND(vipDiscountAmount)}</span>
              </div>
            )}
            {voucherDiscount > 0 && (
              <div className="flex justify-between text-rose-400 font-semibold text-xs">
                <span>Giảm giá Voucher ({appliedVoucher?.vouchercode}):</span>
                <span>-{formatVND(voucherDiscount)}</span>
              </div>
            )}
            <div className="flex justify-between font-extrabold text-base text-emerald-400 pt-2 border-t border-slate-800">
              <span>TỔNG CẦN THANH TOÁN:</span>
              <span className="text-xl">{formatVND(finalAmount)}</span>
            </div>
            {selectedCustomerId && (
              <div className="text-[11px] text-amber-300 font-semibold flex items-center justify-end space-x-1 pt-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Tích lũy thêm +{pointsToEarn} điểm thưởng CRM!</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-between items-center bg-slate-950">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold"
          >
            Hủy
          </button>
          <button
            onClick={handleConfirmCheckout}
            disabled={isSubmitting}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:bg-emerald-600 text-slate-950 font-extrabold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2 transition"
          >
            <Printer className="w-4 h-4" />
            <span>{isSubmitting ? 'Đang xử lý...' : 'XÁC NHẬN THANH TOÁN & IN HÓA ĐƠN'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
