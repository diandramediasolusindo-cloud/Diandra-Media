import React, { useState } from 'react';
import { Invoice, Customer } from '../types/isp';
import { formatIDR } from '../utils/formatters';
import { exportBillingReportToCsv } from '../utils/exportUtils';
import {
  Receipt,
  Search,
  Plus,
  Printer,
  CreditCard,
  MessageSquare,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Calendar,
  FileSpreadsheet,
  Download,
} from 'lucide-react';

interface BillingViewProps {
  invoices: Invoice[];
  customers: Customer[];
  onGenerateBulkInvoices: (periodMonth: string) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
  onOpenReceiptModal: (invoice: Invoice) => void;
  onManualMarkPaid: (invoiceId: string) => void;
  onSendInvoiceWa: (invoice: Invoice) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({
  invoices,
  customers,
  onGenerateBulkInvoices,
  onOpenPaymentModal,
  onOpenReceiptModal,
  onManualMarkPaid,
  onSendInvoiceWa,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unpaid' | 'paid' | 'overdue'>('all');
  const [selectedMonth, setSelectedMonth] = useState('Oktober 2026');
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [newPeriod, setNewPeriod] = useState('November 2026');
  const [exportedFeedback, setExportedFeedback] = useState(false);

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      inv.customerName.toLowerCase().includes(search.toLowerCase()) ||
      inv.id.toLowerCase().includes(search.toLowerCase()) ||
      inv.customerPhone.includes(search);

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAmount = invoices.reduce((acc, i) => acc + i.totalAmount, 0);
  const paidAmount = invoices
    .filter((i) => i.status === 'paid')
    .reduce((acc, i) => acc + i.totalAmount, 0);
  const unpaidAmount = invoices
    .filter((i) => i.status === 'unpaid' || i.status === 'overdue')
    .reduce((acc, i) => acc + i.totalAmount, 0);

  const handleExportFiltered = () => {
    exportBillingReportToCsv(filteredInvoices, customers, `Laporan_Billing_Keuangan_${statusFilter.toUpperCase()}`);
    setExportedFeedback(true);
    setShowExportModal(false);
    setTimeout(() => setExportedFeedback(false), 2500);
  };

  const handleExportAll = () => {
    exportBillingReportToCsv(invoices, customers, 'Laporan_Billing_Keuangan_Lengkap');
    setExportedFeedback(true);
    setShowExportModal(false);
    setTimeout(() => setExportedFeedback(false), 2500);
  };

  const handleGenerateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGenerateBulkInvoices(newPeriod);
    setShowGenerateModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Sistem Billing & Invoice Tagihan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Daftar tagihan bulanan pelanggan, mutasi pembayaran payment gateway, dan cetak struk kasir
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExportModal(true)}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Download laporan akuntansi dan rekonsiliasi kas dalam format CSV / Excel"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{exportedFeedback ? 'Terekspor!' : 'Ekspor Laporan CSV'}</span>
          </button>
          <button
            onClick={() => setShowGenerateModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Generate Tagihan Massal</span>
          </button>
        </div>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Total Tagihan Terbit</span>
          <div className="text-xl font-bold text-slate-900 font-mono tabular-nums mt-0.5">
            {formatIDR(totalAmount)}
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">{invoices.length} Faktur Invoice</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Telah Dibayar (Lunas)</span>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {formatIDR(paidAmount)}
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">
            {invoices.filter((i) => i.status === 'paid').length} transaksi berhasil
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Piutang Belum Lunas</span>
          <div className="text-xl font-bold text-rose-700 font-mono tabular-nums mt-0.5">
            {formatIDR(unpaidAmount)}
          </div>
          <span className="text-[11px] text-rose-600 mt-1 block">
            {invoices.filter((i) => i.status === 'overdue').length} melewati jatuh tempo
          </span>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nomor invoice, nama pelanggan, atau no WA..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({invoices.length})
            </button>
            <button
              onClick={() => setStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'unpaid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Belum Bayar ({invoices.filter((i) => i.status === 'unpaid').length})
            </button>
            <button
              onClick={() => setStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'paid'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Lunas ({invoices.filter((i) => i.status === 'paid').length})
            </button>
            <button
              onClick={() => setStatusFilter('overdue')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'overdue'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terlambat ({invoices.filter((i) => i.status === 'overdue').length})
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-3 px-4">No. Invoice & Periode</th>
                <th className="py-3 px-4">Pelanggan</th>
                <th className="py-3 px-4">Paket Langganan</th>
                <th className="py-3 px-4 text-right">Total Tagihan</th>
                <th className="py-3 px-4">Jatuh Tempo</th>
                <th className="py-3 px-4">Status & Pembayaran</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Tidak ada tagihan yang sesuai dengan filter.
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv, idx) => (
                  <tr key={`${inv.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                    {/* Invoice ID */}
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-slate-900">{inv.id}</div>
                      <div className="text-[11px] text-slate-500">{inv.periodMonth}</div>
                    </td>

                    {/* Pelanggan */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {inv.customerId} · {inv.customerPhone}
                      </div>
                    </td>

                    {/* Paket */}
                    <td className="py-3 px-4">
                      <div className="font-medium text-slate-800">{inv.packageName}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{inv.packageSpeed}</div>
                    </td>

                    {/* Total */}
                    <td className="py-3 px-4 text-right">
                      <div className="font-mono font-bold text-slate-900 text-sm tabular-nums">
                        {formatIDR(inv.totalAmount)}
                      </div>
                      <div className="text-[10px] text-slate-400">
                        Pokok: {formatIDR(inv.amount)} + Fee: {formatIDR(inv.adminFee)}
                      </div>
                    </td>

                    {/* Due Date */}
                    <td className="py-3 px-4">
                      <span className="font-mono text-slate-700">{inv.dueDate}</span>
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {inv.status === 'paid' ? (
                        <div>
                          <span className="text-emerald-700 font-bold text-[11px] block">LUNAS</span>
                          <span className="text-[10px] text-slate-500">
                            {inv.paidAt?.slice(0, 16)} · <span className="uppercase">{inv.paymentMethod}</span>
                          </span>
                        </div>
                      ) : inv.status === 'overdue' ? (
                        <div>
                          <span className="text-rose-700 font-bold text-[11px] block">TERLAMBAT / ISOLIR</span>
                          <span className="text-[10px] text-rose-500">Melewati jatuh tempo</span>
                        </div>
                      ) : (
                        <div>
                          <span className="text-amber-700 font-bold text-[11px] block">BELUM DIBAYAR</span>
                          <span className="text-[10px] text-slate-400">Menunggu pembayaran</span>
                        </div>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                      {inv.status !== 'paid' ? (
                        <>
                          <button
                            onClick={() => onOpenPaymentModal(inv)}
                            className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                            title="Buka simulator pembayaran QRIS / Virtual Account"
                          >
                            Bayar Online
                          </button>
                          <button
                            onClick={() => onManualMarkPaid(inv.id)}
                            className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                            title="Tandai lunas manual (kasir loket kantor)"
                          >
                            Verifikasi Kasir
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => onOpenReceiptModal(inv)}
                          className="flex items-center gap-1 inline-flex px-2.5 py-1 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                          title="Cetak struk kasir thermal 58mm/80mm atau invoice A4"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Cetak Struk</span>
                        </button>
                      )}

                      <button
                        onClick={() => onSendInvoiceWa(inv)}
                        className="p-1 text-slate-500 hover:text-emerald-700 hover:bg-slate-50 rounded transition-colors"
                        title="Kirim pesan tagihan via WhatsApp Gateway"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Generate Bulk Modal */}
      {showGenerateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Generate Tagihan Bulanan Massal</h3>
              <button
                onClick={() => setShowGenerateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleGenerateSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Periode Bulan Tagihan</label>
                <input
                  type="text"
                  required
                  value={newPeriod}
                  onChange={(e) => setNewPeriod(e.target.value)}
                  placeholder="Contoh: November 2026"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-slate-600 text-[11px] leading-relaxed">
                Sistem akan membuat faktur invoice tagihan untuk <strong>{customers.length}</strong> pelanggan aktif secara otomatis dengan nominal sesuai paket langganan masing-masing.
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowGenerateModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold"
                >
                  Generate Sekarang
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Accounting Report Modal */}
      {showExportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <h3 className="font-semibold text-slate-900 text-sm">
                  Ekspor Laporan Keuangan &amp; Akuntansi
                </h3>
              </div>
              <button
                onClick={() => setShowExportModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-[11px] leading-relaxed">
                File CSV yang diekspor dilengkapi dengan <strong>UTF-8 BOM</strong> agar dapat langsung dibuka di <strong>Microsoft Excel, Google Sheets, atau Software Akuntansi (Accurate, Jurnal, SAP)</strong> tanpa karakter berantakan.
              </p>

              <div className="space-y-2">
                <div
                  onClick={handleExportFiltered}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Ekspor Data Berdasarkan Filter Aktif ({filteredInvoices.length} Faktur)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Sesuai status: <strong>{statusFilter.toUpperCase()}</strong> dan kata kunci pencarian
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>

                <div
                  onClick={handleExportAll}
                  className="p-3.5 rounded-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 cursor-pointer transition-all flex items-center justify-between group"
                >
                  <div>
                    <span className="font-semibold text-slate-900 block">
                      Ekspor Seluruh Faktur Tagihan ({invoices.length} Faktur)
                    </span>
                    <span className="text-[10px] text-slate-500">
                      Termasuk tagihan lunas, belum bayar, dan denda terlambat
                    </span>
                  </div>
                  <Download className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 text-[10px] text-slate-500 space-y-1">
                <p className="font-semibold text-slate-700">Kolom Laporan Akuntansi ISP:</p>
                <p>No Inv · ID Pel · Nama · Paket · Periode · Pokok · Admin · Total · Jatuh Tempo · Status · Tgl Bayar · Metode · Ref Reff</p>
              </div>

              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={() => setShowExportModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
