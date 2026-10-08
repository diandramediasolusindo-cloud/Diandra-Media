import React, { useState } from 'react';
import { Customer, Invoice, NetworkTicket } from '../types/isp';
import { formatIDR, getRxPowerQuality } from '../utils/formatters';
import {
  Wifi,
  Search,
  CreditCard,
  QrCode,
  Printer,
  Radio,
  LifeBuoy,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ShieldCheck,
  Send,
} from 'lucide-react';

interface CustomerPortalViewProps {
  customers: Customer[];
  invoices: Invoice[];
  onOpenPaymentModal: (invoice: Invoice) => void;
  onOpenReceiptModal: (invoice: Invoice) => void;
  onCreateCustomerTicket: (ticket: Partial<NetworkTicket>) => void;
}

export const CustomerPortalView: React.FC<CustomerPortalViewProps> = ({
  customers,
  invoices,
  onOpenPaymentModal,
  onOpenReceiptModal,
  onCreateCustomerTicket,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(customers[0]?.id || '');
  const [complaintText, setComplaintText] = useState('');
  const [complaintCategory, setComplaintCategory] = useState<NetworkTicket['category']>('LOS Red');
  const [ticketSent, setTicketSent] = useState(false);

  const currentCustomer =
    customers.find((c) => c.id === selectedCustomerId) || customers[0];

  const customerInvoices = invoices.filter(
    (inv) => inv.customerId === currentCustomer.id
  );

  const unpaidInvoice = customerInvoices.find((i) => i.status !== 'paid');

  const opticalQuality = getRxPowerQuality(currentCustomer.onuRxPower);

  const handleSendTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintText) return;

    onCreateCustomerTicket({
      id: `TCK-2026-${Math.floor(Math.random() * 800 + 100)}`,
      customerId: currentCustomer.id,
      customerName: currentCustomer.name,
      customerPhone: currentCustomer.phone,
      category: complaintCategory,
      priority: complaintCategory === 'LOS Red' ? 'high' : 'medium',
      status: 'open',
      description: complaintText,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    setTicketSent(true);
    setComplaintText('');
    setTimeout(() => setTicketSent(false), 4000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Customer Switcher / Search for demo convenience */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold text-sm">
            <Wifi className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs font-bold text-slate-900">Portal Layanan Mandiri Pelanggan</h2>
            <p className="text-[11px] text-slate-500">PT Diandra Media Solusindo (DiandraNet)</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 whitespace-nowrap">Pilih Akun Pelanggan:</span>
          <select
            value={selectedCustomerId}
            onChange={(e) => setSelectedCustomerId(e.target.value)}
            className="py-1.5 px-3 border border-slate-300 rounded-lg text-xs font-medium text-slate-900 bg-slate-50"
          >
            {customers.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.id} - {c.status.toUpperCase()})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Customer Profile & Connection Health Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{currentCustomer.name}</h1>
              <span
                className={`text-[11px] font-bold px-2 py-0.5 rounded uppercase ${
                  currentCustomer.status === 'aktif'
                    ? 'bg-emerald-100 text-emerald-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {currentCustomer.status === 'aktif' ? 'Koneksi Aktif' : 'Terisolir (Belum Lunas)'}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              ID Pelanggan: <strong className="font-mono text-slate-700">{currentCustomer.id}</strong> · No. WA: {currentCustomer.phone}
            </p>
            <p className="text-xs text-slate-500">{currentCustomer.address}</p>
          </div>

          <div className="sm:text-right">
            <span className="text-[11px] text-slate-500 block">Paket Berlangganan:</span>
            <span className="text-base font-bold text-slate-900">
              {currentCustomer.package.name}
            </span>
            <span className="text-xs text-slate-600 block font-mono">
              Kecepatan: {currentCustomer.package.speedDownload} Mbps / {currentCustomer.package.speedUpload} Mbps
            </span>
          </div>
        </div>

        {/* Optical & Network Signal Status */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Sinyal Fiber Optik (Redaman)</span>
            <div className="flex items-baseline gap-2 mt-0.5">
              <span className={`text-base font-bold font-mono ${opticalQuality.color}`}>
                {currentCustomer.onuRxPower} dBm
              </span>
              <span className="text-[10px] text-slate-500">({opticalQuality.label})</span>
            </div>
            <span className="text-[10px] text-slate-400">Modem SN: {currentCustomer.onuSerialNumber}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Akun PPPoE Router</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              {currentCustomer.pppoeUsername}
            </div>
            <span className="text-[10px] text-slate-400">IP: {currentCustomer.ipAddress}</span>
          </div>

          <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
            <span className="text-[11px] text-slate-500 block">Jatuh Tempo Pembayaran</span>
            <div className="text-base font-bold text-slate-900 font-mono mt-0.5">
              Tanggal {currentCustomer.billingDueDate} Tiap Bulan
            </div>
            <span className="text-[10px] text-slate-400">Isolir otomatis jika belum terlunasi</span>
          </div>
        </div>
      </div>

      {/* Bill & Payment Section */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Tagihan & Riwayat Pembayaran</h2>

        {unpaidInvoice ? (
          <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-amber-800 font-semibold text-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span>Tagihan Periode {unpaidInvoice.periodMonth} Perlu Dibayar</span>
              </div>
              <div className="text-2xl font-bold text-slate-900 font-mono tabular-nums mt-1">
                {formatIDR(unpaidInvoice.totalAmount)}
              </div>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Jatuh Tempo: <strong>{unpaidInvoice.dueDate}</strong> · Nomor Invoice: {unpaidInvoice.id}
              </p>
            </div>

            <button
              onClick={() => onOpenPaymentModal(unpaidInvoice)}
              className="flex items-center justify-center gap-2 px-5 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-lg transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4" />
              <span>Bayar Sekarang (QRIS / VA)</span>
            </button>
          </div>
        ) : (
          <div className="p-4 rounded-xl border border-emerald-200 bg-emerald-50/60 flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-emerald-900">Semua Tagihan Sudah Lunas!</p>
              <p className="text-emerald-700 text-[11px]">
                Terima kasih telah membayar tepat waktu. Koneksi internet Anda aktif lancar.
              </p>
            </div>
          </div>
        )}

        {/* Invoice Table for Customer */}
        <div className="overflow-x-auto pt-2">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 text-slate-500 font-medium">
                <th className="py-2.5 px-3">No. Invoice</th>
                <th className="py-2.5 px-3">Periode</th>
                <th className="py-2.5 px-3 text-right">Total</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Bukti / Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {customerInvoices.map((inv, idx) => (
                <tr key={`${inv.id}-${idx}`} className="hover:bg-slate-50/80">
                  <td className="py-3 px-3 font-mono font-semibold text-slate-900">{inv.id}</td>
                  <td className="py-3 px-3 text-slate-700">{inv.periodMonth}</td>
                  <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 tabular-nums">
                    {formatIDR(inv.totalAmount)}
                  </td>
                  <td className="py-3 px-3">
                    {inv.status === 'paid' ? (
                      <span className="text-emerald-700 font-bold text-[11px]">LUNAS</span>
                    ) : inv.status === 'overdue' ? (
                      <span className="text-rose-700 font-bold text-[11px]">TERLAMBAT</span>
                    ) : (
                      <span className="text-amber-700 font-bold text-[11px]">BELUM BAYAR</span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    {inv.status === 'paid' ? (
                      <button
                        onClick={() => onOpenReceiptModal(inv)}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Kuitansi</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenPaymentModal(inv)}
                        className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                      >
                        Bayar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Customer Ticket & Trouble Desk */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Lapor Gangguan atau Kendala WiFi</h2>
            <p className="text-[11px] text-slate-500">
              Tiket langsung terhubung ke tim Network Operation Center (NOC) & teknisi lapangan
            </p>
          </div>
          <LifeBuoy className="w-5 h-5 text-slate-400" />
        </div>

        {ticketSent ? (
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Laporan gangguan Anda berhasil dibuat. Tim teknisi DiandraNet akan segera menghubungi!</span>
          </div>
        ) : (
          <form onSubmit={handleSendTicket} className="space-y-3 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Gejala Gangguan</label>
                <select
                  value={complaintCategory}
                  onChange={(e) => setComplaintCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="LOS Red">Lampu Modem Kedip Merah (LOS)</option>
                  <option value="Lambat / RTO">Internet Sangat Lambat / Sering Terputus</option>
                  <option value="Router Error">Lupa Password WiFi / Perangkat Tidak Terhubung</option>
                  <option value="Kabel Putus">Kabel Fiber di Luar Rumah Menjuntai / Putus</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nomor WhatsApp untuk Update</label>
                <input
                  type="text"
                  readOnly
                  value={currentCustomer.phone}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Keterangan Tambahan</label>
              <textarea
                rows={3}
                required
                value={complaintText}
                onChange={(e) => setComplaintText(e.target.value)}
                placeholder="Jelaskan kondisi lampu modem atau sejak kapan kendala terjadi..."
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <div className="flex justify-end">
              <button
                type="submit"
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg text-xs transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Laporan Gangguan</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
