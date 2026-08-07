import React, { useEffect } from 'react';
import { Invoice } from '../types';
import { formatVND, formatDateTime } from '../utils/format';
import { Printer, X, CheckCircle } from 'lucide-react';

interface ReceiptPrintProps {
  invoice: Invoice;
  onClose: () => void;
}

export const ReceiptPrint: React.FC<ReceiptPrintProps> = ({ invoice, onClose }) => {
  const handlePrint = () => {
    window.print();
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md animate-fadeIn cursor-pointer"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-md p-6 shadow-2xl flex flex-col items-center space-y-4 cursor-default"
      >
        {/* Success Banner */}
        <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
          <CheckCircle className="w-4 h-4" />
          <span>Thanh toán bàn thành công!</span>
        </div>

        {/* Thermal Receipt Box (Designed to look like standard K80 receipt) */}
        <div id="printable-receipt" className="w-full bg-white text-slate-950 p-6 rounded-xl font-mono text-xs shadow-inner space-y-3">
          <div className="text-center space-y-0.5 border-b border-slate-300 pb-3">
            <h2 className="font-extrabold text-base tracking-tight">🎱 BILLIARD ARENA</h2>
            <p className="text-[10px] text-slate-600">Đ/c: 123 Đường Bida, Q.1, TP. Hồ Chí Minh</p>
            <p className="text-[10px] text-slate-600">Hotline: 0909 888 999</p>
            <p className="font-bold text-sm pt-1 uppercase">HÓA ĐƠN THANH TOÁN</p>
            <p className="text-[10px] text-slate-500">Mã HĐ: #{invoice.invoiceid}</p>
          </div>

          <div className="space-y-1 text-[11px] border-b border-slate-200 pb-2">
            <div className="flex justify-between">
              <span>Bàn:</span>
              <span className="font-bold">{invoice.tablename}</span>
            </div>
            {invoice.customername && (
              <div className="flex justify-between">
                <span>Khách hàng:</span>
                <span>{invoice.customername} ({invoice.customerphone})</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Bắt đầu:</span>
              <span>{formatDateTime(invoice.starttime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Kết thúc:</span>
              <span>{formatDateTime(invoice.endtime)}</span>
            </div>
            <div className="flex justify-between">
              <span>Thu ngân:</span>
              <span>{invoice.staffname || 'Trần Thị Thu'}</span>
            </div>
          </div>

          {/* Details Table */}
          <div className="space-y-1.5 border-b border-slate-300 pb-2 text-[11px]">
            <div className="flex justify-between font-bold text-slate-700">
              <span>Mục / Dịch vụ</span>
              <span>Thành tiền</span>
            </div>
            <div className="flex justify-between text-slate-900">
              <span>Tiền giờ chơi</span>
              <span className="font-bold">{formatVND(invoice.tablefee)}</span>
            </div>

            {invoice.details && invoice.details.map((d) => (
              <div key={d.detailid} className="flex justify-between text-slate-800">
                <span>
                  {d.productname} (x{d.quantity})
                </span>
                <span>{formatVND(d.subtotal)}</span>
              </div>
            ))}
          </div>

          {/* Summary Totals */}
          <div className="space-y-1 text-[11px] pt-1">
            <div className="flex justify-between text-slate-700">
              <span>Tổng tiền hàng & giờ:</span>
              <span>{formatVND(invoice.tablefee + invoice.servicefee)}</span>
            </div>
            {invoice.vipdiscountamount && invoice.vipdiscountamount > 0 ? (
              <div className="flex justify-between text-amber-700 font-semibold">
                <span>Ưu đãi VIP ({invoice.customertier}):</span>
                <span>-{formatVND(invoice.vipdiscountamount)}</span>
              </div>
            ) : null}
            {invoice.vouchercode ? (
              <div className="flex justify-between text-purple-700 font-semibold">
                <span>Voucher ({invoice.vouchercode}):</span>
                <span>-{formatVND((invoice.discountamount || 0) - (invoice.vipdiscountamount || 0))}</span>
              </div>
            ) : null}
            {invoice.discountamount && !invoice.vipdiscountamount && !invoice.vouchercode ? (
              <div className="flex justify-between text-rose-600 font-semibold">
                <span>Tổng giảm giá:</span>
                <span>-{formatVND(invoice.discountamount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between font-extrabold text-sm text-slate-950 pt-1 border-t border-slate-300">
              <span>TỔNG CỘNG:</span>
              <span className="text-base">{formatVND(invoice.totalamount)}</span>
            </div>
            <div className="flex justify-between text-[10px] text-slate-600 pt-1">
              <span>P.Thức T.Toán:</span>
              <span className="font-bold">{invoice.paymentmethod === 'Cash' ? 'Tiền mặt' : invoice.paymentmethod === 'Transfer' ? 'Chuyển khoản QR' : 'Thẻ'}</span>
            </div>
          </div>

          {/* VietQR Payment Code Section */}
          <div className="text-center pt-3 pb-1 border-t border-dashed border-slate-300 space-y-1.5">
            <p className="font-extrabold text-[11px] text-slate-900 tracking-wider uppercase">
              📲 QUÉT MÃ VIETQR THANH TOÁN
            </p>
            <div className="flex flex-col items-center justify-center p-2 bg-slate-50 rounded-xl border border-slate-200 w-48 mx-auto shadow-sm">
              <img
                src={`https://img.vietqr.io/image/MB-0909888999-compact2.png?amount=${invoice.totalamount}&addInfo=THANH%20TOAN%20HD${invoice.invoiceid}&accountName=BILLIARD%20ARENA`}
                alt="Mã VietQR Thanh Toán"
                className="w-40 h-40 object-contain rounded-md"
                loading="eager"
              />
              <div className="text-[9px] text-slate-700 font-sans space-y-0.5 pt-1 w-full text-center">
                <p className="font-bold text-slate-900">MB Bank: <span className="font-mono text-purple-700">0909 888 999</span></p>
                <p className="text-[8px] text-slate-600 uppercase font-semibold">BILLIARD ARENA</p>
                <p className="font-bold text-emerald-700 text-[10px] font-mono">
                  {formatVND(invoice.totalamount)}
                </p>
              </div>
            </div>
          </div>

          <div className="text-center pt-3 border-t border-dashed border-slate-300 text-[10px] text-slate-500 space-y-0.5">
            <p className="font-bold text-slate-700">CẢM ƠN QUÝ KHÁCH VÀ HẸN GẶP LẠI!</p>
            <p>Billiard Arena Management System</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex justify-between w-full pt-2">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 font-semibold text-xs"
          >
            Đóng lại
          </button>
          <button
            onClick={handlePrint}
            className="px-6 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 flex items-center space-x-2"
          >
            <Printer className="w-4 h-4" />
            <span>In Hóa Đơn (K80)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
