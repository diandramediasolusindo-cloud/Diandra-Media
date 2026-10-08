import React, { useState } from 'react';
import { Customer, InternetPackage } from '../types/isp';
import { getRxPowerQuality, formatIDR } from '../utils/formatters';
import { exportCustomersToCsv } from '../utils/exportUtils';
import {
  Users,
  Search,
  Plus,
  Radio,
  Zap,
  MessageSquare,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertCircle,
  ShieldAlert,
  Server,
  Filter,
  Download,
  FileSpreadsheet,
} from 'lucide-react';

interface CustomerViewProps {
  customers: Customer[];
  packages: InternetPackage[];
  onAddCustomer: () => void;
  onEditCustomer: (customer: Customer) => void;
  onDeleteCustomer: (id: string) => void;
  onToggleIsolate: (customer: Customer) => void;
  onCheckOpticalPower: (customer: Customer) => void;
  onSendWhatsappMessage: (customer: Customer) => void;
}

export const CustomerView: React.FC<CustomerViewProps> = ({
  customers,
  packages,
  onAddCustomer,
  onEditCustomer,
  onDeleteCustomer,
  onToggleIsolate,
  onCheckOpticalPower,
  onSendWhatsappMessage,
}) => {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'aktif' | 'isolir'>('all');
  const [selectedPackage, setSelectedPackage] = useState<string>('all');
  const [exportedFeedback, setExportedFeedback] = useState(false);

  const filteredCustomers = customers.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.pppoeUsername.toLowerCase().includes(search.toLowerCase()) ||
      c.phone.includes(search) ||
      c.id.toLowerCase().includes(search.toLowerCase()) ||
      c.odpName.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesPackage = selectedPackage === 'all' || c.packageId === selectedPackage;

    return matchesSearch && matchesStatus && matchesPackage;
  });

  const handleExportCsv = () => {
    exportCustomersToCsv(filteredCustomers);
    setExportedFeedback(true);
    setTimeout(() => setExportedFeedback(false), 2500);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Data Pelanggan & PPPoE Secrets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen pelanggan internet, akun autentikasi MikroTik RouterOS, dan jalur fiber optik OLT
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap shadow-2xs"
            title="Download database pelanggan dalam format CSV / Excel untuk pembukuan"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>{exportedFeedback ? 'Terekspor!' : 'Ekspor CSV / Excel'}</span>
          </button>
          <button
            onClick={onAddCustomer}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Tambah Pelanggan Baru</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama, ID, no WA, username PPPoE, atau ODP tiang..."
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          {/* Segmented Status Filter (Interactive buttons) */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Semua ({customers.length})
            </button>
            <button
              onClick={() => setStatusFilter('aktif')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'aktif'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Aktif ({customers.filter((c) => c.status === 'aktif').length})
            </button>
            <button
              onClick={() => setStatusFilter('isolir')}
              className={`px-3 py-1.5 rounded-md transition-colors ${
                statusFilter === 'isolir'
                  ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Terisolir ({customers.filter((c) => c.status === 'isolir').length})
            </button>
          </div>

          {/* Package Filter */}
          <div className="w-full md:w-56">
            <select
              value={selectedPackage}
              onChange={(e) => setSelectedPackage(e.target.value)}
              className="w-full py-2 px-3 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
            >
              <option value="all">Semua Paket Bandwidth</option>
              {packages.map((pkg) => (
                <option key={pkg.id} value={pkg.id}>
                  {pkg.name} ({pkg.speedDownload}M)
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Customer Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-3 px-4">Identitas & Kontak</th>
                <th className="py-3 px-4">Paket & Akun PPPoE</th>
                <th className="py-3 px-4">Jalur Fiber & OLT</th>
                <th className="py-3 px-4">Redaman Optik</th>
                <th className="py-3 px-4">Status Layanan</th>
                <th className="py-3 px-4 text-right">Aksi Terintegrasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400">
                    Tidak ditemukan data pelanggan dengan kriteria pencarian tersebut.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust, idx) => {
                  const q = getRxPowerQuality(cust.onuRxPower);
                  return (
                    <tr key={`${cust.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                      {/* Identitas */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900 text-sm">{cust.name}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-mono mt-0.5">
                          <span>{cust.id}</span>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-700">{cust.phone}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">
                          {cust.address}
                        </div>
                      </td>

                      {/* Paket & PPPoE */}
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{cust.package.name}</div>
                        <div className="text-[11px] text-slate-600 font-mono mt-0.5">
                          User: <span className="font-bold text-slate-800">{cust.pppoeUsername}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          IP: {cust.ipAddress} · Due: tgl {cust.billingDueDate}
                        </div>
                      </td>

                      {/* OLT & ODP */}
                      <td className="py-3 px-4">
                        <div className="font-mono text-slate-800 font-semibold">{cust.ponPort}</div>
                        <div className="text-[11px] text-slate-600 font-mono">SN: {cust.onuSerialNumber}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          {cust.odpName} (Port {cust.odpPort})
                        </div>
                      </td>

                      {/* Redaman RX Power */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className={`font-mono font-bold text-xs ${q.color}`}>
                            {cust.onuRxPower} dBm
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500">{q.label}</span>
                        <button
                          onClick={() => onCheckOpticalPower(cust)}
                          className="block text-[10px] text-emerald-700 hover:underline mt-0.5 font-medium"
                        >
                          Tes Redaman Ulang
                        </button>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4">
                        {cust.status === 'aktif' ? (
                          <div className="space-y-0.5">
                            <span className="text-emerald-700 font-bold text-[11px] block">AKTIF NORMAL</span>
                            <span className="text-[10px] text-slate-400">Router Profile OK</span>
                          </div>
                        ) : cust.status === 'isolir' ? (
                          <div className="space-y-0.5">
                            <span className="text-rose-700 font-bold text-[11px] block">TERISOLIR</span>
                            <span className="text-[10px] text-rose-500">PROFILE-ISOLIR</span>
                          </div>
                        ) : (
                          <span className="text-slate-500 font-medium text-[11px]">NONAKTIF</span>
                        )}
                      </td>

                      {/* Action Buttons */}
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        {/* Toggle Isolir / Aktifkan MikroTik */}
                        <button
                          onClick={() => onToggleIsolate(cust)}
                          className={`p-1.5 rounded-lg border transition-colors ${
                            cust.status === 'isolir'
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                              : 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          }`}
                          title={cust.status === 'isolir' ? 'Buka Isolir (Aktifkan di RouterOS)' : 'Isolir Pelanggan (Putus Bandwidth)'}
                        >
                          <Zap className="w-3.5 h-3.5" />
                        </button>

                        {/* Kirim WA */}
                        <button
                          onClick={() => onSendWhatsappMessage(cust)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Kirim Pesan WhatsApp Penagihan"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditCustomer(cust)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors"
                          title="Edit Pelanggan & Parameter ONT"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteCustomer(cust.id)}
                          className="p-1.5 rounded-lg border border-slate-200 text-slate-400 hover:text-rose-600 hover:border-rose-200 hover:bg-rose-50 transition-colors"
                          title="Hapus Data Pelanggan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
