import React, { useState } from 'react';
import { Invoice, Customer } from '../types/isp';
import { formatIDR } from '../utils/formatters';
import { Printer, X, CheckCircle2, QrCode, FileText } from 'lucide-react';

interface ThermalReceiptModalProps {
  invoice: Invoice;
  customer?: Customer;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<ThermalReceiptModalProps> = ({
  invoice,
  customer,
  onClose,
}) => {
  const [paperFormat, setPaperFormat] = useState<'thermal' | 'a4'>('thermal');

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50 no-print">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-slate-700" />
            <span className="font-semibold text-slate-900 text-sm">
              Cetak Bukti Pembayaran / Struk Kasir
            </span>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-200/80 p-0.5 rounded-lg text-xs font-medium">
              <button
                onClick={() => setPaperFormat('thermal')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paperFormat === 'thermal'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Thermal 58/80mm
              </button>
              <button
                onClick={() => setPaperFormat('a4')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  paperFormat === 'a4'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Invoice A4
              </button>
            </div>
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body / Printable Content */}
        <div className="p-6 max-h-[75vh] overflow-y-auto flex justify-center bg-slate-100">
          {paperFormat === 'thermal' ? (
            /* Thermal Receipt 58/80mm View */
            <div
              id="printable-receipt"
              className="w-72 bg-white p-5 border border-slate-300 shadow-sm font-mono text-xs text-slate-800 leading-relaxed print:w-full print:border-none print:shadow-none"
            >
              <div className="text-center pb-3 border-b border-dashed border-slate-400">
                <p className="font-bold text-sm tracking-wide">DIANDRA MEDIA SOLUSINDO</p>
                <p className="text-[11px] text-slate-600">ISP & FIBER BROADBAND</p>
                <p className="text-[10px] text-slate-500">Izin Kominfo No. 8120/KOMINFO/2024</p>
                <p className="text-[10px] text-slate-500">NOC: 0812-8899-0011</p>
              </div>

              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">No. Inv</span>
                  <span className="font-semibold">{invoice.id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Tanggal</span>
                  <span>{invoice.paidAt || invoice.dueDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Pelanggan</span>
                  <span className="font-semibold truncate max-w-[130px]">{invoice.customerName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Pel.</span>
                  <span>{invoice.customerId}</span>
                </div>
                {customer?.odpName && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">ODP Port</span>
                    <span>{customer.odpName} P:{customer.odpPort}</span>
                  </div>
                )}
              </div>

              <div className="py-3 border-b border-dashed border-slate-400 space-y-1.5 text-[11px]">
                <div className="flex justify-between font-semibold">
                  <span>{invoice.packageName}</span>
                  <span>{formatIDR(invoice.amount)}</span>
                </div>
                <div className="text-[10px] text-slate-500 pl-1">
                  Speed: {invoice.packageSpeed} · Periode: {invoice.periodMonth}
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Biaya Admin Gateway</span>
                  <span>{formatIDR(invoice.adminFee)}</span>
                </div>
              </div>

              <div className="py-2.5 border-b border-dashed border-slate-400 space-y-1 text-[12px]">
                <div className="flex justify-between font-bold text-sm">
                  <span>TOTAL BAYAR</span>
                  <span>{formatIDR(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Metode</span>
                  <span className="uppercase font-semibold">{invoice.paymentMethod || 'TUNAI / QRIS'}</span>
                </div>
                <div className="flex justify-between text-[11px]">
                  <span>Status</span>
                  <span className="font-bold text-emerald-700 uppercase">
                    {invoice.status === 'paid' ? 'LUNAS (PAID)' : 'BELUM LUNAS'}
                  </span>
                </div>
                {invoice.paymentRef && (
                  <div className="flex justify-between text-[10px] text-slate-500">
                    <span>Reff</span>
                    <span className="truncate max-w-[130px]">{invoice.paymentRef}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 text-center text-[10px] text-slate-500 space-y-1">
                <div className="flex justify-center py-1">
                  <div className="w-16 h-16 border border-slate-300 flex items-center justify-center bg-slate-50">
                    <QrCode className="w-12 h-12 text-slate-700" />
                  </div>
                </div>
                <p className="font-semibold text-slate-700">TERIMA KASIH ATAS PEMBAYARANNYA</p>
                <p>Simpan struk ini sebagai bukti pembayaran yang sah.</p>
                <p>Layanan kendala & bantuan: WA 0812-8899-0011</p>
              </div>
            </div>
          ) : (
            /* Formal A4 Invoice View */
            <div
              id="printable-invoice"
              className="w-full bg-white p-6 border border-slate-300 shadow-sm text-xs text-slate-800 leading-relaxed"
            >
              <div className="flex justify-between items-start pb-4 border-b border-slate-200">
                <div>
                  <h2 className="text-base font-bold text-slate-900">PT DIANDRA MEDIA SOLUSINDO</h2>
                  <p className="text-slate-500 text-[11px]">Internet Service Provider & Fiber Network Solution</p>
                  <p className="text-slate-500 text-[11px]">Jl. Sukamaju Raya No. 102, Bandung - Jawa Barat</p>
                  <p className="text-slate-500 text-[11px]">Email: billing@diandranet.id | WA: 0812-8899-0011</p>
                </div>
                <div className="text-right">
                  <span className="inline-block px-2.5 py-1 bg-emerald-100 text-emerald-800 font-bold rounded text-[11px] uppercase">
                    {invoice.status === 'paid' ? 'KUITANSI LUNAS' : 'TAGIHAN / INVOICE'}
                  </span>
                  <p className="text-slate-600 mt-2 font-mono font-semibold">{invoice.id}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 py-4 border-b border-slate-200 text-[11px]">
                <div>
                  <p className="text-slate-400 font-medium">DITUJUKAN KEPADA:</p>
                  <p className="font-bold text-slate-900 text-sm mt-0.5">{invoice.customerName}</p>
                  <p className="text-slate-600">ID: {invoice.customerId}</p>
                  <p className="text-slate-600">No. WA: {invoice.customerPhone}</p>
                  {customer?.address && <p className="text-slate-500 mt-1">{customer.address}</p>}
                </div>
                <div className="text-right space-y-1">
                  <p className="text-slate-500">Periode Tagihan: <span className="font-semibold text-slate-800">{invoice.periodMonth}</span></p>
                  <p className="text-slate-500">Jatuh Tempo: <span className="font-semibold text-slate-800">{invoice.dueDate}</span></p>
                  <p className="text-slate-500">Tanggal Bayar: <span className="font-semibold text-slate-800">{invoice.paidAt || '-'}</span></p>
                  <p className="text-slate-500">Metode Bayar: <span className="font-semibold text-slate-800 uppercase">{invoice.paymentMethod || 'Manual'}</span></p>
                </div>
              </div>

              <div className="py-4">
                <table className="w-full text-left text-[11px]">
                  <thead>
                    <tr className="border-b border-slate-300 text-slate-500 uppercase">
                      <th className="py-1.5">Deskripsi Layanan</th>
                      <th className="py-1.5 text-center">Kecepatan</th>
                      <th className="py-1.5 text-right">Biaya (Rp)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="py-2.5 font-medium">Langganan Internet: {invoice.packageName}</td>
                      <td className="py-2.5 text-center font-mono">{invoice.packageSpeed}</td>
                      <td className="py-2.5 text-right font-mono tabular-nums">{formatIDR(invoice.amount)}</td>
                    </tr>
                    <tr>
                      <td className="py-2 text-slate-500">Biaya Administrasi & Payment Gateway</td>
                      <td className="py-2 text-center text-slate-400">-</td>
                      <td className="py-2 text-right font-mono tabular-nums">{formatIDR(invoice.adminFee)}</td>
                    </tr>
                  </tbody>
                  <tfoot>
                    <tr className="border-t-2 border-slate-800 font-bold text-sm">
                      <td colSpan={2} className="py-2.5">TOTAL TAGIHAN</td>
                      <td className="py-2.5 text-right font-mono tabular-nums text-slate-900">
                        {formatIDR(invoice.totalAmount)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-between items-center text-[11px] text-slate-500">
                <div>
                  <p className="font-semibold text-slate-700">Syarat & Ketentuan Pembayaran:</p>
                  <p>1. Pembayaran otomatis tercatat ke router MikroTik & mengaktifkan koneksi seketika.</p>
                  <p>2. Keterlambatan lebih dari tanggal jatuh tempo akan dikenakan pemutusan/isolir otomatis.</p>
                </div>
                <div className="text-center w-36">
                  <p className="text-[10px] text-slate-400">Bagian Finance & Billing</p>
                  <div className="h-10 flex items-center justify-center font-serif italic text-slate-400">
                    Diandra Media Solusindo
                  </div>
                  <p className="text-[10px] font-semibold text-slate-700">Finance DiandraNet</p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-200 bg-white no-print">
          <span className="text-xs text-slate-500">
            {paperFormat === 'thermal' ? 'Disarankan gunakan printer thermal 58mm/80mm Bluetooth/USB.' : 'Disarankan gunakan printer inkjet/laser format A4.'}
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Tutup
            </button>
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              <Printer className="w-4 h-4" />
              <span>Cetak Sekarang</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
