import React, { useState, useEffect } from 'react';
import { Invoice, Customer } from '../types/isp';
import { formatIDR } from '../utils/formatters';
import {
  QrCode,
  CreditCard,
  Building2,
  CheckCircle2,
  X,
  Zap,
  ArrowRight,
  ShieldCheck,
  Smartphone,
  Copy,
  Check,
} from 'lucide-react';

interface PaymentSimulatorModalProps {
  invoice: Invoice;
  customer?: Customer;
  onPaymentSuccess: (invoiceId: string, method: string, ref: string) => void;
  onClose: () => void;
}

export const PaymentSimulatorModal: React.FC<PaymentSimulatorModalProps> = ({
  invoice,
  customer,
  onPaymentSuccess,
  onClose,
}) => {
  const [method, setMethod] = useState<'qris' | 'va_bca' | 'va_mandiri' | 'va_bri'>('qris');
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);
  const [countdown, setCountdown] = useState(895); // ~15 mins

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatCountdown = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const getVaNumber = () => {
    switch (method) {
      case 'va_bca':
        return `88091${customer?.phone ? customer.phone.slice(-7) : '2345678'}`;
      case 'va_mandiri':
        return `89201${customer?.phone ? customer.phone.slice(-7) : '2345678'}`;
      case 'va_bri':
        return `10488${customer?.phone ? customer.phone.slice(-7) : '2345678'}`;
      default:
        return '';
    }
  };

  const handleCopyVa = () => {
    navigator.clipboard.writeText(getVaNumber());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateWebhookSuccess = () => {
    setIsProcessing(true);
    setTimeout(() => {
      const paymentRef = `${method.toUpperCase()}-TX-${Date.now().toString().slice(-8)}`;
      onPaymentSuccess(invoice.id, method, paymentRef);
      setIsProcessing(false);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">Payment Gateway Checkout</h3>
              <p className="text-[11px] text-slate-500">Integrasi Otomatis Midtrans & Xendit</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Invoice Summary */}
        <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex justify-between items-center">
          <div>
            <span className="text-[11px] text-slate-500 uppercase tracking-wide">Total Pembayaran</span>
            <div className="text-xl font-bold text-slate-900 font-mono tabular-nums">
              {formatIDR(invoice.totalAmount)}
            </div>
            <p className="text-[11px] text-slate-500">
              {invoice.packageName} · {invoice.periodMonth}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-slate-400 block">Sisa Waktu Bayar</span>
            <span className="font-mono text-xs font-semibold text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
              {formatCountdown(countdown)}
            </span>
          </div>
        </div>

        {/* Payment Methods Tabs */}
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-2 text-xs font-medium">
            <button
              onClick={() => setMethod('qris')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${
                method === 'qris'
                  ? 'border-emerald-600 bg-emerald-50/50 text-emerald-900 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <QrCode className="w-4 h-4 text-emerald-600" />
              <span>QRIS Dinamis</span>
            </button>
            <button
              onClick={() => setMethod('va_bca')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${
                method === 'va_bca'
                  ? 'border-blue-600 bg-blue-50/50 text-blue-900 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>VA BCA</span>
            </button>
            <button
              onClick={() => setMethod('va_mandiri')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${
                method === 'va_mandiri'
                  ? 'border-indigo-600 bg-indigo-50/50 text-indigo-900 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <CreditCard className="w-4 h-4 text-indigo-600" />
              <span>VA Mandiri</span>
            </button>
            <button
              onClick={() => setMethod('va_bri')}
              className={`flex items-center justify-center gap-2 p-2.5 rounded-lg border transition-all ${
                method === 'va_bri'
                  ? 'border-cyan-600 bg-cyan-50/50 text-cyan-900 font-semibold shadow-xs'
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Building2 className="w-4 h-4 text-cyan-600" />
              <span>VA BRI (BRIVA)</span>
            </button>
          </div>

          {/* Tab Content */}
          {method === 'qris' ? (
            <div className="flex flex-col items-center justify-center p-4 border border-slate-200 rounded-xl bg-slate-50/50 text-center">
              <div className="flex items-center justify-between w-full px-2 mb-2 text-[10px] text-slate-500 font-semibold">
                <span>QRIS STANDARD ASPI</span>
                <span className="text-emerald-700">NMID: ID102008129910</span>
              </div>

              {/* QR Image Simulation */}
              <div className="bg-white p-3 rounded-lg border border-slate-300 shadow-xs mb-3">
                <svg
                  className="w-44 h-44 text-slate-900"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  {/* Outer corner markers */}
                  <rect x="10" y="10" width="25" height="25" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="16" y="16" width="13" height="13" fill="currentColor" />
                  <rect x="65" y="10" width="25" height="25" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="71" y="16" width="13" height="13" fill="currentColor" />
                  <rect x="10" y="65" width="25" height="25" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="16" y="71" width="13" height="13" fill="currentColor" />
                  {/* Simulated matrix pixels */}
                  <rect x="42" y="12" width="6" height="6" fill="currentColor" />
                  <rect x="52" y="16" width="6" height="6" fill="currentColor" />
                  <rect x="45" y="26" width="6" height="6" fill="currentColor" />
                  <rect x="14" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="28" y="48" width="6" height="6" fill="currentColor" />
                  <rect x="44" y="44" width="12" height="12" fill="currentColor" />
                  <rect x="62" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="78" y="46" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="66" width="8" height="8" fill="currentColor" />
                  <rect x="56" y="70" width="6" height="6" fill="currentColor" />
                  <rect x="70" y="66" width="8" height="8" fill="currentColor" />
                  <rect x="64" y="80" width="12" height="6" fill="currentColor" />
                  <rect x="80" y="78" width="8" height="8" fill="currentColor" />
                  <circle cx="50" cy="50" r="5" fill="#059669" />
                </svg>
              </div>

              <div className="text-[11px] text-slate-600 space-y-0.5">
                <p className="font-semibold text-slate-900">Bisa di-scan dengan semua aplikasi e-Wallet:</p>
                <p className="text-[10px] text-slate-500">GoPay · OVO · Dana · ShopeePay · BCA Mobile · Livin Mandiri · BRImo</p>
              </div>
            </div>
          ) : (
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50/50 space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-600">
                <span>Nomor Virtual Account</span>
                <span className="font-semibold text-slate-900 uppercase">
                  {method.replace('va_', '').toUpperCase()}
                </span>
              </div>
              <div className="flex items-center justify-between bg-white p-3 rounded-lg border border-slate-300">
                <span className="font-mono text-base font-bold text-slate-900 tracking-wider">
                  {getVaNumber()}
                </span>
                <button
                  onClick={handleCopyVa}
                  className="flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? 'Tersalin' : 'Salin'}</span>
                </button>
              </div>
              <div className="text-[11px] text-slate-500 space-y-1">
                <p>• Masukkan kode perusahaan jika diminta di ATM / m-Banking.</p>
                <p>• Transaksi diverifikasi otomatis dalam 10 detik tanpa upload bukti transfer.</p>
              </div>
            </div>
          )}

          {/* Automation Flow Explainer */}
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[11px] text-slate-600 space-y-1.5">
            <div className="flex items-center gap-1.5 font-semibold text-slate-800">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Alur Otomatisasi Setelah Pembayaran:</span>
            </div>
            <div className="space-y-1 pl-5 list-disc text-slate-600 text-[10px]">
              <p>1. Webhook Payment Gateway memvalidasi status pembayaran.</p>
              <p>2. API MikroTik otomatis mencabut profil isolir & mengembalikan profil kecepatan semula.</p>
              <p>3. WhatsApp Gateway langsung mengirimkan kuitansi lunas ke nomor pelanggan.</p>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 space-y-2">
          <button
            onClick={handleSimulateWebhookSuccess}
            disabled={isProcessing}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 disabled:bg-emerald-400 text-white font-semibold text-xs rounded-lg transition-all flex items-center justify-center gap-2 shadow-xs"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Memproses Webhook & Eksekusi MikroTik RouterOS...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" />
                <span>Simulasikan Pembayaran Sukses (Trigger Webhook)</span>
              </>
            )}
          </button>
          <p className="text-[10px] text-center text-slate-400">
            Digunakan untuk pengujian integrasi otomatisasi end-to-end tanpa transaksi uang riil.
          </p>
        </div>
      </div>
    </div>
  );
};
