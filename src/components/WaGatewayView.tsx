import React, { useState } from 'react';
import { WaGatewayConfig, WaMessageLog } from '../types/isp';
import {
  MessageSquare,
  QrCode,
  Send,
  Save,
  CheckCircle2,
  Smartphone,
  RefreshCw,
  Clock,
  Radio,
  Copy,
  Check,
  Server,
  Code,
  ShieldCheck,
  ExternalLink,
} from 'lucide-react';

interface WaGatewayViewProps {
  config: WaGatewayConfig;
  logs: WaMessageLog[];
  onUpdateConfig: (config: Partial<WaGatewayConfig>) => void;
  onSendTestMessage: (phone: string, text: string) => void;
}

export const WaGatewayView: React.FC<WaGatewayViewProps> = ({
  config,
  logs,
  onUpdateConfig,
  onSendTestMessage,
}) => {
  const [selectedTemplateKey, setSelectedTemplateKey] = useState<keyof WaGatewayConfig['templates']>('tagihanTerbit');
  const [templateContent, setTemplateContent] = useState<string>(config.templates.tagihanTerbit);
  const [testPhone, setTestPhone] = useState('081234567891');
  const [testText, setTestText] = useState('Halo! Ini adalah uji coba pesan otomatis dari sistem Billing DiandraNet.');
  const [saveFeedback, setSaveFeedback] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);
  const [isQrScanning, setIsQrScanning] = useState(false);

  // Switch provider handler with intelligent default endpoints
  const handleSelectProvider = (prov: 'Fonnte' | 'MPWA' | 'Wablas') => {
    let defaultEndpoint = config.endpointUrl;
    let defaultDomain = config.serverDomain || '';

    if (prov === 'Fonnte') {
      defaultEndpoint = 'https://api.fonnte.com/send';
      defaultDomain = 'https://api.fonnte.com';
    } else if (prov === 'MPWA') {
      defaultEndpoint = 'https://wa.diandranet.id/send-message';
      defaultDomain = 'https://wa.diandranet.id';
    } else if (prov === 'Wablas') {
      defaultEndpoint = 'https://pati.wablas.com/api/send-message';
      defaultDomain = 'https://pati.wablas.com';
    }

    onUpdateConfig({
      provider: prov,
      endpointUrl: defaultEndpoint,
      serverDomain: defaultDomain,
    });
  };

  const handleSelectTemplate = (key: keyof WaGatewayConfig['templates']) => {
    setSelectedTemplateKey(key);
    setTemplateContent(config.templates[key]);
  };

  const handleSaveTemplate = () => {
    const updated = {
      ...config.templates,
      [selectedTemplateKey]: templateContent,
    };
    onUpdateConfig({ templates: updated });
    setSaveFeedback(true);
    setTimeout(() => setSaveFeedback(false), 2000);
  };

  const handleTestSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!testPhone || !testText) return;
    onSendTestMessage(testPhone, testText);
  };

  // Generate simulated provider payload format
  const getProviderPayloadPreview = () => {
    if (config.provider === 'Fonnte') {
      return {
        headers: {
          Authorization: `${config.apiKey.slice(0, 10)}••••••••`,
          'Content-Type': 'application/json',
        },
        body: {
          target: testPhone,
          message: testText,
          countryCode: '62',
        },
      };
    } else if (config.provider === 'MPWA') {
      return {
        headers: {
          'Content-Type': 'application/json',
        },
        body: {
          api_key: `${config.apiKey.slice(0, 10)}••••••••`,
          sender: config.senderNumber,
          number: testPhone,
          message: testText,
        },
      };
    } else {
      // Wablas
      return {
        headers: {
          Authorization: `${config.apiKey.slice(0, 10)}••••••••`,
          'Content-Type': 'application/json',
        },
        body: {
          phone: testPhone,
          message: testText,
        },
      };
    }
  };

  const handleSimulateQrPairing = () => {
    setIsQrScanning(true);
    setTimeout(() => {
      setIsQrScanning(false);
      setShowQrModal(false);
      onUpdateConfig({ connected: true, batteryLevel: 98 });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Integrasi WhatsApp Gateway
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Pilihan engine pengiriman pesan: Fonnte, MPWA (Multi-Device), dan Wablas
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Active: {config.provider} ({config.senderNumber})
          </span>
          <button
            onClick={() => setShowQrModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <QrCode className="w-3.5 h-3.5 text-slate-600" />
            <span>Scan QR Device</span>
          </button>
        </div>
      </div>

      {/* 1. Dedicated Provider Switcher (Fonnte, MPWA, Wablas) */}
      <div className="space-y-2">
        <label className="text-xs font-bold text-slate-800 block">
          Pilih Engine WhatsApp Gateway:
        </label>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Option 1: Fonnte */}
          <div
            onClick={() => handleSelectProvider('Fonnte')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              config.provider === 'Fonnte'
                ? 'border-slate-900 bg-white shadow-2xs ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Fonnte</span>
                <span className="text-[10px] bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                  Cloud API
                </span>
              </div>
              {config.provider === 'Fonnte' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Layanan WA Gateway cloud Indonesia terpopuler. Pengaturan instan cukup dengan API Token tanpa perlu setup server sendiri.
            </p>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 truncate">
              Endpoint: api.fonnte.com/send
            </div>
          </div>

          {/* Option 2: MPWA */}
          <div
            onClick={() => handleSelectProvider('MPWA')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              config.provider === 'MPWA'
                ? 'border-slate-900 bg-white shadow-2xs ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">MPWA</span>
                <span className="text-[10px] bg-blue-50 text-blue-700 font-semibold px-2 py-0.5 rounded border border-blue-200">
                  Multi-Device / VPS
                </span>
              </div>
              {config.provider === 'MPWA' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Multi-Platform WhatsApp Gateway berbasis Node.js Baileys. Favorit RT-RW Net &amp; ISP untuk dipasang di VPS sendiri (self-hosted).
            </p>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 truncate">
              Endpoint: /send-message (Multi-sender)
            </div>
          </div>

          {/* Option 3: Wablas */}
          <div
            onClick={() => handleSelectProvider('Wablas')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              config.provider === 'Wablas'
                ? 'border-slate-900 bg-white shadow-2xs ring-1 ring-slate-900'
                : 'border-slate-200 bg-white hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-sm">Wablas</span>
                <span className="text-[10px] bg-purple-50 text-purple-700 font-semibold px-2 py-0.5 rounded border border-purple-200">
                  High Volume
                </span>
              </div>
              {config.provider === 'Wablas' && (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
            </div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Server enterprise multi-cluster (Pati, Solo, Kudus). Kecepatan broadcast tinggi dengan auto-rotate &amp; message scheduler.
            </p>
            <div className="text-[10px] text-slate-400 font-mono mt-2 pt-2 border-t border-slate-100 truncate">
              Endpoint: [server].wablas.com/api/send-message
            </div>
          </div>
        </div>
      </div>

      {/* 2. Provider Credentials & Endpoint Settings */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Pengaturan Kredensial &amp; Endpoint ({config.provider})
            </h2>
            <p className="text-[11px] text-slate-500">
              Konfigurasi token API dan endpoint sesuai dashboard akun {config.provider} Anda
            </p>
          </div>
          <span className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Gateway Siap Digunakan
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-xs">
          {/* API Key / Token */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              {config.provider === 'Fonnte'
                ? 'API Token Fonnte *'
                : config.provider === 'MPWA'
                ? 'API Key / Token MPWA *'
                : 'API Token Wablas *'}
            </label>
            <input
              type="text"
              value={config.apiKey}
              onChange={(e) => onUpdateConfig({ apiKey: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          {/* Sender Phone Number */}
          <div>
            <label className="block text-slate-700 font-medium mb-1">
              Nomor WhatsApp Pengirim (Sender) *
            </label>
            <input
              type="text"
              value={config.senderNumber}
              onChange={(e) => onUpdateConfig({ senderNumber: e.target.value })}
              placeholder="6281288990011"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>

          {/* Endpoint URL or Server Domain */}
          <div className="sm:col-span-2 lg:col-span-1">
            <label className="block text-slate-700 font-medium mb-1">
              {config.provider === 'MPWA'
                ? 'Base URL Server MPWA (VPS) *'
                : config.provider === 'Wablas'
                ? 'Server Domain Wablas *'
                : 'Full API Endpoint URL *'}
            </label>
            <input
              type="text"
              value={config.endpointUrl}
              onChange={(e) => onUpdateConfig({ endpointUrl: e.target.value })}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
            />
          </div>
        </div>

        {/* Informative Guidance per Provider */}
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          {config.provider === 'Fonnte' && (
            <span>
              <strong>Format Header Fonnte:</strong> <code>Authorization: {'{API_TOKEN}'}</code> dengan body JSON <code>target</code> dan <code>message</code>.
            </span>
          )}
          {config.provider === 'MPWA' && (
            <span>
              <strong>Format Body MPWA:</strong> Mengirimkan parameter <code>api_key</code>, <code>sender</code>, <code>number</code>, dan <code>message</code> via HTTP POST.
            </span>
          )}
          {config.provider === 'Wablas' && (
            <span>
              <strong>Format Header Wablas:</strong> <code>Authorization: {'{API_TOKEN}'}</code> dengan body JSON <code>phone</code> dan <code>message</code>.
            </span>
          )}
          <span className="text-[10px] text-slate-400 font-mono">
            Protokol: Asynchronous REST Webhook
          </span>
        </div>
      </div>

      {/* 3. Main Grid: Template Editor & Test Sender */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Template Editor */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Editor Template Pesan Otomatis</h2>
              <p className="text-[11px] text-slate-500">
                Format pesan WhatsApp untuk penagihan, pengingat, isolir, dan kuitansi
              </p>
            </div>
            {saveFeedback && (
              <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="w-4 h-4" /> Tersimpan!
              </span>
            )}
          </div>

          {/* Template Selector Buttons */}
          <div className="flex flex-wrap gap-1.5 text-xs font-medium">
            <button
              onClick={() => handleSelectTemplate('tagihanTerbit')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedTemplateKey === 'tagihanTerbit'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Tagihan Terbit
            </button>
            <button
              onClick={() => handleSelectTemplate('pengingatHMin3')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedTemplateKey === 'pengingatHMin3'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pengingat H-3
            </button>
            <button
              onClick={() => handleSelectTemplate('pengingatHariH')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedTemplateKey === 'pengingatHariH'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pengingat Hari-H
            </button>
            <button
              onClick={() => handleSelectTemplate('notifikasiIsolir')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedTemplateKey === 'notifikasiIsolir'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Pemberitahuan Isolir
            </button>
            <button
              onClick={() => handleSelectTemplate('kuitansiLunas')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedTemplateKey === 'kuitansiLunas'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Kuitansi Lunas
            </button>
            <button
              onClick={() => handleSelectTemplate('maintenanceNotice')}
              className={`px-3 py-1.5 rounded-lg border transition-colors ${
                selectedTemplateKey === 'maintenanceNotice'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
            >
              Broadcast Gangguan
            </button>
          </div>

          {/* Text Area */}
          <div>
            <textarea
              rows={8}
              value={templateContent}
              onChange={(e) => setTemplateContent(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg text-xs font-mono leading-relaxed focus:outline-none focus:ring-2 focus:ring-slate-900"
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-slate-500">
              Gunakan tanda bintang <code>*tebal*</code> dan <code>_miring_</code> untuk format WhatsApp.
            </span>
            <button
              onClick={handleSaveTemplate}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 text-white text-xs font-semibold rounded-lg hover:bg-slate-800 transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5" />
              <span>Simpan Template</span>
            </button>
          </div>
        </div>

        {/* Right 1 Col: Test Direct WhatsApp Message & Payload Inspector */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="pb-3 border-b border-slate-100">
            <h2 className="text-sm font-bold text-slate-900">Uji Coba Pengiriman Pesan</h2>
            <p className="text-[11px] text-slate-500">
              Kirim pesan langsung via engine <strong>{config.provider}</strong>
            </p>
          </div>

          <form onSubmit={handleTestSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nomor WhatsApp Tujuan</label>
              <input
                type="tel"
                required
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                placeholder="081234567890"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-medium mb-1">Isi Pesan Uji Coba</label>
              <textarea
                rows={3}
                required
                value={testText}
                onChange={(e) => setTestText(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-xs"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Kirim via {config.provider}</span>
            </button>
          </form>

          {/* Provider Payload Preview */}
          <div className="pt-2 border-t border-slate-100 space-y-1.5">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-700">
              <Code className="w-3.5 h-3.5 text-slate-500" />
              <span>Format Payload HTTP ({config.provider}):</span>
            </div>
            <pre className="p-2.5 bg-slate-900 text-slate-300 rounded-lg text-[10px] font-mono overflow-x-auto leading-relaxed">
              {JSON.stringify(getProviderPayloadPreview(), null, 2)}
            </pre>
          </div>
        </div>
      </div>

      {/* Outbox Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden space-y-3">
        <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
          <span className="font-semibold text-slate-800">
            Riwayat Outbox Pesan WhatsApp Terkirim
          </span>
          <span className="text-slate-500 font-mono text-[11px]">{logs.length} entri</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500 font-medium">
                <th className="py-2.5 px-4">Waktu Terkirim</th>
                <th className="py-2.5 px-4">Penerima &amp; Nomor WA</th>
                <th className="py-2.5 px-4">Kategori Pesan</th>
                <th className="py-2.5 px-4">Ringkasan Pesan</th>
                <th className="py-2.5 px-4 text-right">Status Delivery</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {logs.map((log, idx) => (
                <tr key={`${log.id}-${idx}`} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono text-[11px] text-slate-500">{log.sentAt}</td>
                  <td className="py-3 px-4">
                    <div className="font-semibold text-slate-900">{log.recipientName}</div>
                    <div className="font-mono text-[11px] text-slate-500">{log.to}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-[11px] uppercase font-semibold text-slate-700">
                      {log.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-slate-600 text-[11px] truncate max-w-md">
                    {log.message}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className="text-emerald-700 font-semibold font-mono text-[11px] uppercase">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* QR Code Scan Pairing Modal */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-2xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-4 border-b border-slate-200 bg-slate-50 flex justify-between items-center">
              <h3 className="font-semibold text-slate-900">
                Scan QR Code Device ({config.provider})
              </h3>
              <button
                onClick={() => setShowQrModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="p-6 flex flex-col items-center text-center space-y-4">
              <div className="p-3 bg-white border border-slate-300 rounded-xl shadow-xs">
                <svg
                  className="w-48 h-48 text-slate-900"
                  viewBox="0 0 100 100"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <rect width="100" height="100" fill="white" />
                  <rect x="8" y="8" width="28" height="28" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="14" y="14" width="16" height="16" fill="currentColor" />
                  <rect x="64" y="8" width="28" height="28" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="70" y="14" width="16" height="16" fill="currentColor" />
                  <rect x="8" y="64" width="28" height="28" stroke="currentColor" strokeWidth="4" fill="none" />
                  <rect x="14" y="70" width="16" height="16" fill="currentColor" />
                  {/* Internal matrix dots */}
                  <rect x="42" y="14" width="6" height="6" fill="currentColor" />
                  <rect x="52" y="14" width="6" height="6" fill="currentColor" />
                  <rect x="44" y="26" width="8" height="8" fill="currentColor" />
                  <rect x="16" y="44" width="8" height="8" fill="currentColor" />
                  <rect x="28" y="48" width="8" height="8" fill="currentColor" />
                  <rect x="44" y="44" width="12" height="12" fill="#059669" />
                  <rect x="62" y="42" width="8" height="8" fill="currentColor" />
                  <rect x="78" y="46" width="8" height="8" fill="currentColor" />
                  <rect x="42" y="64" width="8" height="8" fill="currentColor" />
                  <rect x="56" y="70" width="8" height="8" fill="currentColor" />
                  <rect x="72" y="64" width="8" height="8" fill="currentColor" />
                  <rect x="64" y="78" width="14" height="8" fill="currentColor" />
                  <circle cx="50" cy="50" r="4" fill="#059669" />
                </svg>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800">
                  Buka WhatsApp di HP &gt; Perangkat Tertaut &gt; Tautkan Perangkat
                </p>
                <p className="text-[11px] text-slate-500">
                  Arahkan kamera ke QR code di atas untuk menyambungkan sesi gateway {config.provider}.
                </p>
              </div>

              <button
                onClick={handleSimulateQrPairing}
                disabled={isQrScanning}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {isQrScanning ? (
                  <span>Menginisialisasi Sesi Baileys...</span>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Simulasikan QR Berhasil Terhubung</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
