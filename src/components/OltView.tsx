import React, { useState } from 'react';
import { OltConfig, Customer, UnconfiguredOnu } from '../types/isp';
import { getRxPowerQuality } from '../utils/formatters';
import {
  Radio,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Zap,
  Server,
  Plus,
  Cpu,
  Layers,
} from 'lucide-react';

interface OltViewProps {
  olts: OltConfig[];
  customers: Customer[];
  unconfiguredOnus: UnconfiguredOnu[];
  onRefreshOptical: () => void;
  onRebootOnu: (customer: Customer) => void;
  onProvisionOnu: (onu: UnconfiguredOnu, customerId: string) => void;
}

export const OltView: React.FC<OltViewProps> = ({
  olts,
  customers,
  unconfiguredOnus,
  onRefreshOptical,
  onRebootOnu,
  onProvisionOnu,
}) => {
  const [selectedOlt, setSelectedOlt] = useState<string>(olts[0]?.id || 'olt-1');
  const [search, setSearch] = useState('');
  const [provisionModalOnu, setProvisionModalOnu] = useState<UnconfiguredOnu | null>(null);
  const [targetCustomerId, setTargetCustomerId] = useState<string>('');

  const currentOlt = olts.find((o) => o.id === selectedOlt) || olts[0];

  const filteredCustomers = customers.filter(
    (c) =>
      c.oltId === selectedOlt &&
      (c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.onuSerialNumber.toLowerCase().includes(search.toLowerCase()) ||
        c.ponPort.toLowerCase().includes(search.toLowerCase()) ||
        c.odpName.toLowerCase().includes(search.toLowerCase()))
  );

  const handleProvisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (provisionModalOnu && targetCustomerId) {
      onProvisionOnu(provisionModalOnu, targetCustomerId);
      setProvisionModalOnu(null);
      setTargetCustomerId('');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Integrasi OLT GPON / EPON (FTTH)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manajemen Optical Line Terminal, monitoring redaman RX dBm ONU/ONT, dan autofind modem baru
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onRefreshOptical}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Poll Semua Redaman (SNMP)</span>
          </button>
        </div>
      </div>

      {/* OLT Selector & Hardware Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {olts.map((olt) => (
          <div
            key={olt.id}
            onClick={() => setSelectedOlt(olt.id)}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              selectedOlt === olt.id
                ? 'border-slate-900 bg-white shadow-2xs ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-slate-900 text-xs">{olt.name}</span>
              <span className="flex items-center gap-1 font-mono text-[10px] text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                ONLINE
              </span>
            </div>
            <div className="text-[11px] text-slate-500 space-y-0.5 font-mono">
              <p>{olt.brand} · {olt.model}</p>
              <p>IP: {olt.ipHost}:{olt.port} ({olt.protocol})</p>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-600 mt-3 pt-2 border-t border-slate-100">
              <span>{olt.ponCount} Port PON</span>
              <span className="font-semibold text-slate-900">{olt.activeOnus} ONT Aktif</span>
            </div>
          </div>
        ))}
      </div>

      {/* Autofind Unconfigured ONUs Section */}
      {unconfiguredOnus.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-700" />
              <h2 className="text-xs font-bold text-amber-900">
                Autofind: {unconfiguredOnus.length} Modem ONU Baru Ditemukan (Belum Terkonfigurasi)
              </h2>
            </div>
            <span className="text-[10px] text-amber-700 font-mono">Auto-discovery OLT GPON</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {unconfiguredOnus.map((onu) => (
              <div
                key={onu.id}
                className="bg-white p-3 rounded-lg border border-amber-200 shadow-2xs flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-bold text-slate-900 text-xs">
                    SN: {onu.serialNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    {onu.vendor} · {onu.ponPort}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Redaman: <span className="font-mono text-emerald-700 font-semibold">{onu.rxPower} dBm</span> · Terdeteksi: {onu.discoveredAt}
                  </div>
                </div>
                <button
                  onClick={() => {
                    setProvisionModalOnu(onu);
                    setTargetCustomerId(customers[0]?.id || '');
                  }}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
                >
                  Provisioning
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Active ONUs Data Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-3">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xs font-bold text-slate-900">
              Daftar ONT Terdaftar pada {currentOlt.name}
            </h2>
            <p className="text-[11px] text-slate-500">
              Menampilkan optical power level (dBm) per pelanggan pada slot PON
            </p>
          </div>
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari SN modem, nama, atau port..."
              className="w-full pl-8 pr-3 py-1.5 border border-slate-300 rounded-lg text-xs"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Port PON & SN Modem</th>
                <th className="py-2.5 px-4">Nama Pelanggan</th>
                <th className="py-2.5 px-4">Titik Distribusi (ODP)</th>
                <th className="py-2.5 px-4">Redaman Optik (RX Power)</th>
                <th className="py-2.5 px-4">Kondisi Laser</th>
                <th className="py-2.5 px-4 text-right">Aksi Remote ONT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-400">
                    Tidak ada pelanggan terdaftar di OLT ini yang sesuai pencarian.
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((cust) => {
                  const q = getRxPowerQuality(cust.onuRxPower);
                  return (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-mono font-bold text-slate-900">{cust.ponPort}</div>
                        <div className="text-[11px] text-slate-500 font-mono">SN: {cust.onuSerialNumber}</div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{cust.name}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{cust.id}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">
                        {cust.odpName}
                        <span className="text-[10px] text-slate-400 block">Port #{cust.odpPort}</span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`font-mono font-bold text-xs ${q.color}`}>
                          {cust.onuRxPower} dBm
                        </span>
                        <div className="text-[10px] text-slate-400">TX OLT: +2.5 dBm</div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-[11px] font-semibold ${q.color}`}>
                          {q.label.toUpperCase()}
                        </span>
                        <div className="text-[10px] text-slate-400">
                          {cust.onuRxPower > -24 ? 'Normal Range' : cust.onuRxPower > -27 ? 'Slight Bend/Loss' : 'LOS / High Attenuation'}
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onRebootOnu(cust)}
                          className="px-2 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors inline-flex items-center gap-1"
                          title="Reboot modem ONT dari jauh via OLT CLI"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reboot ONT</span>
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

      {/* Provisioning Modal */}
      {provisionModalOnu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-md bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900 text-sm">Provisioning ONT ke Pelanggan</h3>
              <button
                onClick={() => setProvisionModalOnu(null)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>
            <form onSubmit={handleProvisionSubmit} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1 font-mono text-[11px]">
                <p><strong>SN Modem:</strong> {provisionModalOnu.serialNumber}</p>
                <p><strong>Port PON:</strong> {provisionModalOnu.ponPort}</p>
                <p><strong>Redaman:</strong> {provisionModalOnu.rxPower} dBm</p>
                <p><strong>Tipe:</strong> {provisionModalOnu.vendor}</p>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">
                  Hubungkan ke Data Pelanggan:
                </label>
                <select
                  value={targetCustomerId}
                  onChange={(e) => setTargetCustomerId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
                >
                  {customers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.id}) — {c.address}
                    </option>
                  ))}
                </select>
              </div>

              <div className="p-2.5 bg-emerald-50 text-emerald-800 rounded-lg border border-emerald-200 text-[11px]">
                Sistem akan membuat Line Profile, Service Profile, dan konfigurasi VLAN secara otomatis di OLT.
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setProvisionModalOnu(null)}
                  className="px-4 py-2 border border-slate-300 rounded-lg hover:bg-slate-50"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold"
                >
                  Selesaikan Provisioning
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
