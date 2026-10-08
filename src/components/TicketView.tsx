import React, { useState } from 'react';
import { NetworkTicket, Customer } from '../types/isp';
import {
  LifeBuoy,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Phone,
  MessageSquare,
} from 'lucide-react';

interface TicketViewProps {
  tickets: NetworkTicket[];
  customers: Customer[];
  onAddTicket: (ticket: Partial<NetworkTicket>) => void;
  onUpdateTicketStatus: (ticketId: string, status: NetworkTicket['status']) => void;
}

export const TicketView: React.FC<TicketViewProps> = ({
  tickets,
  customers,
  onAddTicket,
  onUpdateTicketStatus,
}) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(customers[0]?.id || '');
  const [category, setCategory] = useState<NetworkTicket['category']>('LOS Red');
  const [priority, setPriority] = useState<NetworkTicket['priority']>('high');
  const [description, setDescription] = useState('');
  const [technician, setTechnician] = useState('Rian & Bayu (Teknisi 1)');

  const filteredTickets = tickets.filter(
    (t) =>
      t.customerName.toLowerCase().includes(search.toLowerCase()) ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.category.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cust = customers.find((c) => c.id === selectedCustomer);
    if (!cust) return;

    onAddTicket({
      id: `TCK-2026-${Math.floor(Math.random() * 800 + 100)}`,
      customerId: cust.id,
      customerName: cust.name,
      customerPhone: cust.phone,
      category,
      priority,
      status: 'open',
      description,
      assignedTechnician: technician,
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
    });

    setShowAddModal(false);
    setDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            NOC Helpdesk & Tiket Gangguan Jaringan
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Penanganan gangguan fiber optik, lampu LOS merah, redaman drop, dan dispatch teknisi lapangan
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Laporan Gangguan</span>
        </button>
      </div>

      {/* Summary KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Tiket Terbuka (Open)</span>
          <div className="text-xl font-bold text-amber-700 font-mono tabular-nums mt-0.5">
            {tickets.filter((t) => t.status === 'open').length} Tiket
          </div>
          <span className="text-[11px] text-slate-400 mt-1 block">Menunggu penugasan teknisi</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Sedang Dikerjakan di Lapangan</span>
          <div className="text-xl font-bold text-blue-700 font-mono tabular-nums mt-0.5">
            {tickets.filter((t) => t.status === 'in_progress').length} Kasus
          </div>
          <span className="text-[11px] text-blue-600 mt-1 block">Teknisi aktif di tiang / rumah klien</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-[11px] text-slate-500 block">Tiket Telah Selesai (Resolved)</span>
          <div className="text-xl font-bold text-emerald-700 font-mono tabular-nums mt-0.5">
            {tickets.filter((t) => t.status === 'resolved').length} Tiket
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block">Koneksi telah normal kembali</span>
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari ID tiket, nama pelanggan, atau jenis gangguan..."
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-slate-900"
          />
        </div>
      </div>

      {/* Ticket List Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-3 px-4">ID & Waktu</th>
                <th className="py-3 px-4">Pelanggan & Kontak</th>
                <th className="py-3 px-4">Kategori & Prioritas</th>
                <th className="py-3 px-4">Deskripsi Gangguan</th>
                <th className="py-3 px-4">Teknisi Bertugas</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Update Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTickets.map((t, idx) => (
                <tr key={`${t.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4">
                    <div className="font-mono font-bold text-slate-900">{t.id}</div>
                    <div className="text-[10px] text-slate-400 font-mono">{t.createdAt}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{t.customerName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">{t.customerPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-800">{t.category}</div>
                    <span
                      className={`text-[10px] font-semibold uppercase ${
                        t.priority === 'critical'
                          ? 'text-rose-700'
                          : t.priority === 'high'
                          ? 'text-amber-700'
                          : 'text-slate-500'
                      }`}
                    >
                      Prioritas: {t.priority}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 max-w-xs text-[11px] leading-relaxed">
                    {t.description}
                  </td>
                  <td className="py-3 px-4 text-slate-700">
                    {t.assignedTechnician || <span className="text-slate-400 italic">Belum ditugaskan</span>}
                  </td>
                  <td className="py-3 px-4">
                    {t.status === 'resolved' ? (
                      <span className="text-emerald-700 font-bold text-[11px]">SELESAI</span>
                    ) : t.status === 'in_progress' ? (
                      <span className="text-blue-700 font-bold text-[11px]">DIPROSES TEKNISI</span>
                    ) : (
                      <span className="text-amber-700 font-bold text-[11px]">MENUNGGU (OPEN)</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                    {t.status !== 'resolved' && (
                      <button
                        onClick={() => onUpdateTicketStatus(t.id, 'resolved')}
                        className="px-2 py-1 bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200 rounded text-xs font-semibold transition-colors"
                      >
                        Tandai Selesai
                      </button>
                    )}
                    {t.status === 'open' && (
                      <button
                        onClick={() => onUpdateTicketStatus(t.id, 'in_progress')}
                        className="px-2 py-1 bg-blue-50 text-blue-800 hover:bg-blue-100 border border-blue-200 rounded text-xs font-semibold transition-colors"
                      >
                        Tugaskan Teknisi
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Buat Tiket Gangguan Baru</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Pelanggan Mengalami Kendala</label>
                <select
                  value={selectedCustomer}
                  onChange={(e) => setSelectedCustomer(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) — {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Kategori Kendala</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="LOS Red">Lampu LOS Merah (Loss of Signal)</option>
                  <option value="Redaman Drop">Redaman Drop / Tinggi di atas -27 dBm</option>
                  <option value="Lambat / RTO">Koneksi Lambat / Sering RTO</option>
                  <option value="Kabel Putus">Kabel Dropcore Putus Fisik</option>
                  <option value="Router Error">Router Mati / Setting WiFi Error</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Prioritas</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  <option value="critical">Kritis (Pelanggan Bisnis / Putus Total)</option>
                  <option value="high">Tinggi</option>
                  <option value="medium">Sedang</option>
                  <option value="low">Rendah</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Deskripsi Masalah</label>
                <textarea
                  rows={3}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Keterangan keluhan dari pelanggan atau hasil tes NOC..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tugaskan Teknisi</label>
                <input
                  type="text"
                  value={technician}
                  onChange={(e) => setTechnician(e.target.value)}
                  placeholder="Nama teknisi lapangan"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold"
                >
                  Simpan Tiket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
