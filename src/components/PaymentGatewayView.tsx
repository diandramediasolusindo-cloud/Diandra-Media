import React, { useState } from 'react';
import { PaymentGatewayConfig, Invoice, Customer } from '../types/isp';
import {
  CreditCard,
  QrCode,
  ShieldCheck,
  Zap,
  Globe,
  CheckCircle2,
  Lock,
  Copy,
  Check,
  Play,
  Code,
} from 'lucide-react';

interface PaymentGatewayViewProps {
  config: PaymentGatewayConfig;
  invoices: Invoice[];
  customers: Customer[];
  onUpdateConfig: (config: Partial<PaymentGatewayConfig>) => void;
  onSimulateWebhook: (invoiceId: string, method: string) => void;
}

export const PaymentGatewayView: React.FC<PaymentGatewayViewProps> = ({
  config,
  invoices,
  customers,
  onUpdateConfig,
  onSimulateWebhook,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(
    invoices.find((i) => i.status !== 'paid')?.id || invoices[0]?.id || ''
  );
  const [webhookMethod, setWebhookMethod] = useState<'qris' | 'va_bca' | 'va_mandiri'>('qris');
  const [isFiring, setIsFiring] = useState(false);

  const handleCopyWebhook = () => {
    navigator.clipboard.writeText(config.webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFireWebhook = () => {
    if (!selectedInvoiceId) return;
    setIsFiring(true);
    setTimeout(() => {
      onSimulateWebhook(selectedInvoiceId, webhookMethod);
      setIsFiring(false);
    }, 1000);
  };

  const samplePayload = {
    transaction_time: new Date().toISOString().replace('T', ' ').slice(0, 19),
    transaction_status: 'settlement',
    transaction_id: 'MID-TX-' + Math.floor(Math.random() * 90000000 + 10000000),
    status_message: 'Midtrans payment notification',
    status_code: '200',
    signature_key: '98e29a1b8d234a4190c4ba9828e1049219',
    order_id: selectedInvoiceId,
    gross_amount: '252500.00',
    payment_type: webhookMethod === 'qris' ? 'qris' : 'bank_transfer',
    merchant_id: config.merchantId,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Integrasi Payment Gateway Otomatis
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Mendukung QRIS Dinamis (Semua E-Wallet), Virtual Account BCA, Mandiri, BRI, BNI dengan aktivasi instan
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Mode: {config.isSandbox ? 'Sandbox Uji Coba' : 'Production Live'}
          </span>
        </div>
      </div>

      {/* Gateway Providers Selection */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(['Midtrans', 'Xendit', 'Tripay', 'QRIS_Dinamis'] as const).map((prov) => (
          <div
            key={prov}
            onClick={() => onUpdateConfig({ provider: prov })}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              config.provider === prov
                ? 'border-slate-900 bg-white shadow-2xs ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1">
              <span className="font-bold text-slate-900 text-xs">{prov}</span>
              {config.provider === prov && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              {prov === 'Midtrans'
                ? 'Snap & Core API, QRIS Gopay, BCA VA'
                : prov === 'Xendit'
                ? 'Invoice Link, VA Multi Bank, QRIS'
                : prov === 'Tripay'
                ? 'Payment Gateway favorit RT-RW Net'
                : 'Standar QRIS Nasional ASPI & Bank Indonesia'}
            </p>
          </div>
        ))}
      </div>

      {/* Configuration & Webhook URL */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Form Config */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100 flex justify-between items-center">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Kredensial API Merchant</h2>
              <p className="text-[11px] text-slate-500">
                Diperoleh dari dashboard pengembang {config.provider}
              </p>
            </div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={config.isSandbox}
                onChange={(e) => onUpdateConfig({ isSandbox: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300"
              />
              <span>Gunakan Lingkungan Sandbox</span>
            </label>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Merchant ID</label>
              <input
                type="text"
                value={config.merchantId}
                onChange={(e) => onUpdateConfig({ merchantId: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Client Key</label>
              <input
                type="text"
                value={config.clientKey}
                onChange={(e) => onUpdateConfig({ clientKey: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Server Key (Private Secret)</label>
              <input
                type="password"
                value={config.serverKey}
                onChange={(e) => onUpdateConfig({ serverKey: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Webhook Secret Key</label>
              <input
                type="password"
                value={config.webhookSecret}
                onChange={(e) => onUpdateConfig({ webhookSecret: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>

          {/* Webhook Endpoint Box */}
          <div className="pt-2">
            <label className="block text-slate-700 font-medium mb-1 text-xs">
              URL Webhook Callback / Notification URL (Pasang di Dashboard Gateway):
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={config.webhookUrl}
                className="flex-1 px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono text-slate-800"
              />
              <button
                onClick={handleCopyWebhook}
                className="flex items-center gap-1.5 px-3 py-2 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors whitespace-nowrap"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Tersalin' : 'Salin URL'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Automation Flow Diagram */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Mekanisme Re-aktivasi Instan</h2>
            <p className="text-[11px] text-slate-500">Zero human touch / otomatis 24 jam</p>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-800 block">Langkah 1: Pembayaran Masuk</span>
              <p className="text-slate-600 text-[11px]">
                Pelanggan scan QRIS atau transfer via Virtual Account. Payment Gateway memvalidasi dana seketika.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-800 block">Langkah 2: Webhook Trigger</span>
              <p className="text-slate-600 text-[11px]">
                Gateway mengirim notifikasi HTTP POST ke server billing ini. Invoice otomatis diubah jadi <strong className="text-emerald-700">LUNAS</strong>.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-800 block">Langkah 3: Buka Isolir MikroTik</span>
              <p className="text-slate-600 text-[11px]">
                Billing memanggil RouterOS API: mengembalikan profile ke paket semula & kick sesi agar internet langsung lancar.
              </p>
            </div>

            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1.5">
              <span className="font-semibold text-slate-800 block">Langkah 4: Kirim Kuitansi WA</span>
              <p className="text-slate-600 text-[11px]">
                WhatsApp Gateway otomatis mengirim pesan terima kasih dan rincian kuitansi ke HP pelanggan.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Webhook Simulator Console */}
      <div className="bg-slate-950 text-slate-100 rounded-xl p-5 font-mono text-xs space-y-4 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Code className="w-4 h-4 text-emerald-400" />
            <span className="text-white font-semibold">Simulator Webhook Payment Gateway</span>
          </div>
          <span className="text-[11px] text-slate-400">Endpoint: POST /api/webhook/payment</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div>
              <label className="block text-slate-400 text-[11px] mb-1">
                Pilih Invoice Tagihan Target:
              </label>
              <select
                value={selectedInvoiceId}
                onChange={(e) => setSelectedInvoiceId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-white rounded p-2 text-xs font-mono"
              >
                {invoices.map((inv) => (
                  <option key={inv.id} value={inv.id}>
                    {inv.id} — {inv.customerName} ({inv.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-400 text-[11px] mb-1">Metode Pembayaran:</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setWebhookMethod('qris')}
                  className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                    webhookMethod === 'qris' ? 'bg-emerald-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  QRIS Dinamis
                </button>
                <button
                  type="button"
                  onClick={() => setWebhookMethod('va_bca')}
                  className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                    webhookMethod === 'va_bca' ? 'bg-blue-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  VA BCA
                </button>
                <button
                  type="button"
                  onClick={() => setWebhookMethod('va_mandiri')}
                  className={`flex-1 py-1.5 rounded text-xs transition-colors ${
                    webhookMethod === 'va_mandiri' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300'
                  }`}
                >
                  VA Mandiri
                </button>
              </div>
            </div>

            <button
              onClick={handleFireWebhook}
              disabled={isFiring}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-700 text-white font-bold rounded flex items-center justify-center gap-2 transition-colors mt-2"
            >
              {isFiring ? (
                <span>Memproses Webhook, Buka Isolir MikroTik & Kirim WA...</span>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>Kirim Simulasi Webhook (Trigger Pelunasan + Auto Unlock)</span>
                </>
              )}
            </button>
          </div>

          <div>
            <span className="block text-slate-400 text-[11px] mb-1">Simulated JSON Webhook Payload:</span>
            <pre className="p-3 bg-slate-900 border border-slate-800 rounded text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
              {JSON.stringify(samplePayload, null, 2)}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
