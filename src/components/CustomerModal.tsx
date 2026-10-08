import React, { useState } from 'react';
import { Customer, InternetPackage, OltConfig, MikrotikConfig } from '../types/isp';
import { X, User, Wifi, Radio, Server, MapPin, CheckCircle2 } from 'lucide-react';

interface CustomerModalProps {
  customer?: Customer | null;
  packages: InternetPackage[];
  olts: OltConfig[];
  mikrotik: MikrotikConfig;
  onSave: (cust: Partial<Customer>) => void;
  onClose: () => void;
}

export const CustomerModal: React.FC<CustomerModalProps> = ({
  customer,
  packages,
  olts,
  mikrotik,
  onSave,
  onClose,
}) => {
  const isEditing = !!customer;

  const [name, setName] = useState(customer?.name || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [address, setAddress] = useState(customer?.address || '');
  const [packageId, setPackageId] = useState(customer?.packageId || packages[0]?.id || 'pkg-1');
  const [pppoeUsername, setPppoeUsername] = useState(customer?.pppoeUsername || '');
  const [pppoePassword, setPppoePassword] = useState(customer?.pppoePassword || '');
  const [ipAddress, setIpAddress] = useState(customer?.ipAddress || '10.10.20.' + Math.floor(Math.random() * 200 + 20));
  const [oltId, setOltId] = useState(customer?.oltId || olts[0]?.id || 'olt-1');
  const [ponPort, setPonPort] = useState(customer?.ponPort || 'PON 1/1/1');
  const [onuSerialNumber, setOnuSerialNumber] = useState(customer?.onuSerialNumber || 'HWTC' + Math.floor(Math.random() * 899999 + 100000));
  const [odpName, setOdpName] = useState(customer?.odpName || 'ODP-SMJ-01/08');
  const [odpPort, setOdpPort] = useState(customer?.odpPort || 1);
  const [billingDueDate, setBillingDueDate] = useState(customer?.billingDueDate || 10);
  const [autoIsolate, setAutoIsolate] = useState(customer?.autoIsolate ?? true);

  const handleGeneratePppoe = () => {
    if (!name.trim()) return;
    const clean = name.toLowerCase().replace(/[^a-z0-9]/g, '_').slice(0, 10);
    const rand = Math.floor(Math.random() * 90 + 10);
    setPppoeUsername(`${clean}_${rand}`);
    setPppoePassword(`pass_${clean}_${rand}`);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone || !pppoeUsername) return;

    const selectedPkg = packages.find((p) => p.id === packageId) || packages[0];

    onSave({
      id: customer?.id || `CUST-0${Math.floor(Math.random() * 800 + 100)}`,
      name,
      phone,
      email,
      address,
      connectionType: 'pppoe',
      packageId,
      package: selectedPkg,
      pppoeUsername,
      pppoePassword,
      ipAddress,
      macAddress: customer?.macAddress || '48:8D:' + Math.random().toString(16).slice(2, 6).toUpperCase() + ':00',
      routerId: mikrotik.id,
      oltId,
      ponPort,
      onuSerialNumber,
      onuRxPower: customer?.onuRxPower ?? -19.5,
      odpName,
      odpPort: Number(odpPort),
      latitude: customer?.latitude || -6.917464,
      longitude: customer?.longitude || 107.619123,
      status: customer?.status || 'aktif',
      joinDate: customer?.joinDate || new Date().toISOString().split('T')[0],
      billingDueDate: Number(billingDueDate),
      autoIsolate,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div className="flex items-center gap-2">
            <User className="w-5 h-5 text-slate-700" />
            <div>
              <h3 className="font-semibold text-slate-900 text-sm">
                {isEditing ? `Edit Pelanggan: ${customer.name}` : 'Tambah Pelanggan Baru & Provisioning'}
              </h3>
              <p className="text-[11px] text-slate-500">
                Data terhubung langsung ke MikroTik PPP Secret & OLT GPON
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {/* Section 1: Data Identitas & Kontak */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 pb-1 border-b border-slate-100">
              <User className="w-4 h-4 text-slate-500" />
              <span>1. Informasi Pelanggan & Kontak WhatsApp</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Nama Lengkap *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Contoh: Budi Santoso"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">No. WhatsApp (Aktif) *</label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Contoh: 081234567890"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Alamat Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Contoh: pelanggan@gmail.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Tanggal Jatuh Tempo Bulanan</label>
                <select
                  value={billingDueDate}
                  onChange={(e) => setBillingDueDate(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                >
                  <option value={5}>Setiap tanggal 5</option>
                  <option value={10}>Setiap tanggal 10 (Standar)</option>
                  <option value={15}>Setiap tanggal 15</option>
                  <option value={20}>Setiap tanggal 20</option>
                  <option value={25}>Setiap tanggal 25</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Alamat Pemasangan Rumah / Ruko *</label>
                <input
                  type="text"
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Contoh: Jl. Merpati No. 12 RT 01/RW 03, Kel. Sukamaju"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Paket & Konfigurasi MikroTik PPPoE */}
          <div className="space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-900">
                <Server className="w-4 h-4 text-slate-500" />
                <span>2. Paket Internet & Akun PPPoE MikroTik</span>
              </div>
              <button
                type="button"
                onClick={handleGeneratePppoe}
                className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
              >
                + Generate Akun Otomatis
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Pilih Paket Layanan *</label>
                <select
                  value={packageId}
                  onChange={(e) => setPackageId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-medium"
                >
                  {packages.map((pkg) => (
                    <option key={pkg.id} value={pkg.id}>
                      {pkg.name} — Down: {pkg.speedDownload}Mbps / Up: {pkg.speedUpload}Mbps (Rp {pkg.price.toLocaleString('id-ID')}/bln)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Username PPPoE *</label>
                <input
                  type="text"
                  required
                  value={pppoeUsername}
                  onChange={(e) => setPppoeUsername(e.target.value)}
                  placeholder="budi_sukamaju"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Password PPPoE *</label>
                <input
                  type="text"
                  required
                  value={pppoePassword}
                  onChange={(e) => setPppoePassword(e.target.value)}
                  placeholder="pass_rahasia_123"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Remote IP Address (Pool)</label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  placeholder="10.10.20.14"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-6">
                <input
                  type="checkbox"
                  id="autoIsolate"
                  checked={autoIsolate}
                  onChange={(e) => setAutoIsolate(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
                />
                <label htmlFor="autoIsolate" className="text-slate-700 font-medium text-xs cursor-pointer">
                  Aktifkan Isolir Otomatis MikroTik jika telat bayar
                </label>
              </div>
            </div>
          </div>

          {/* Section 3: Jalur Fisik Fiber Optik (OLT, PON, ODP) */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-900 pb-1 border-b border-slate-100">
              <Radio className="w-4 h-4 text-slate-500" />
              <span>3. Jalur Fiber Optik (OLT & ODP Tiang)</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div>
                <label className="block text-slate-700 font-medium mb-1">Pilih OLT Headend</label>
                <select
                  value={oltId}
                  onChange={(e) => setOltId(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                >
                  {olts.map((olt) => (
                    <option key={olt.id} value={olt.id}>
                      {olt.name} ({olt.brand})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Port PON OLT</label>
                <input
                  type="text"
                  value={ponPort}
                  onChange={(e) => setPonPort(e.target.value)}
                  placeholder="PON 1/1/1"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Serial Number (SN) Modem ONU</label>
                <input
                  type="text"
                  value={onuSerialNumber}
                  onChange={(e) => setOnuSerialNumber(e.target.value)}
                  placeholder="HWTC489912FA"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs font-mono"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-slate-700 font-medium mb-1">Nama Kotak ODP / Lokasi Tiang</label>
                <input
                  type="text"
                  value={odpName}
                  onChange={(e) => setOdpName(e.target.value)}
                  placeholder="ODP-SMJ-01/08 (Tiang Depan Gang 2)"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>

              <div>
                <label className="block text-slate-700 font-medium mb-1">Nomor Port Splitter ODP</label>
                <input
                  type="number"
                  min={1}
                  max={16}
                  value={odpPort}
                  onChange={(e) => setOdpPort(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-xs"
                />
              </div>
            </div>
          </div>

          {/* Form Submit */}
          <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg border border-slate-200 hover:bg-slate-50 transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
            >
              {isEditing ? 'Simpan Perubahan' : 'Simpan & Sinkronkan ke MikroTik'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
