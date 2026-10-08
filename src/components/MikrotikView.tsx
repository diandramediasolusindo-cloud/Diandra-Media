import React, { useState } from 'react';
import { MikrotikConfig, PppoeActiveSession, Customer } from '../types/isp';
import { formatBytes } from '../utils/formatters';
import {
  Server,
  Zap,
  Terminal,
  Activity,
  Cpu,
  HardDrive,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  UserX,
} from 'lucide-react';

interface MikrotikViewProps {
  mikrotik: MikrotikConfig;
  sessions: PppoeActiveSession[];
  customers: Customer[];
  onTestConnection: () => void;
  onKickSession: (sessionId: string, username: string) => void;
  onSyncSecrets: () => void;
  onToggleCustomerIsolate: (customer: Customer) => void;
  onUpdateConfig: (config: Partial<MikrotikConfig>) => void;
}

export const MikrotikView: React.FC<MikrotikViewProps> = ({
  mikrotik,
  sessions,
  customers,
  onTestConnection,
  onKickSession,
  onSyncSecrets,
  onToggleCustomerIsolate,
  onUpdateConfig,
}) => {
  const [activeTab, setActiveTab] = useState<'sessions' | 'secrets' | 'terminal' | 'config'>('sessions');
  const [commandInput, setCommandInput] = useState('/ppp active print');
  const [terminalHistory, setTerminalHistory] = useState<
    { cmd: string; output: string; time: string }[]
  >([
    {
      cmd: '/system resource print',
      output: `uptime: 47d14h22m\nversion: 7.14.3 (stable)\nbuild-time: Feb/20/2026 12:44:01\nfree-memory: 3420.4MiB\ntotal-memory: 4096.0MiB\ncpu: tilegx\ncpu-count: 36\ncpu-frequency: 1200MHz\ncpu-load: 18%\nfree-hdd-space: 820.2MiB\ntotal-hdd-space: 1024.0MiB\narchitecture-name: tile\nboard-name: CCR1036-8G-2S+`,
      time: '09:00:12',
    },
    {
      cmd: '/ppp active print',
      output: `Flags: R - RADIUS\n #   NAME             SERVICE  CALLER-ID         ADDRESS         UPTIME       ENCODING\n 0   budi_sukamaju    pppoe    F4:8C:EB:12:44:01 10.10.20.14    3d08h12m     \n 1   siti_permata     pppoe    BC:24:11:8A:22:90 10.10.20.25    1d19h40m     \n 2   warkop_dedi      pppoe    00:1E:67:88:99:AA 10.10.20.102   14d02h11m    \n 3   hendra_klinik    pppoe    D4:6E:0E:55:12:33 10.10.20.150   6d11h05m     `,
      time: '09:05:44',
    },
  ]);

  const handleRunCommand = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commandInput.trim()) return;

    let simulatedOutput = '';
    const cmd = commandInput.trim().toLowerCase();

    if (cmd.includes('/ppp secret print')) {
      simulatedOutput = `Flags: X - disabled\n #   NAME             SERVICE  CALLER-ID  PROFILE               LOCAL-ADDRESS   REMOTE-ADDRESS\n 0   budi_sukamaju    pppoe               PROFILE-50M           10.10.20.1      10.10.20.14\n 1   siti_permata     pppoe               PROFILE-20M           10.10.20.1      10.10.20.25\n 2   fauzi_melati     pppoe               PROFILE-ISOLIR        10.10.20.1      10.10.20.88\n 3   warkop_dedi      pppoe               PROFILE-200M-DEDIC... 10.10.20.1      10.10.20.102\n 4   hendra_klinik    pppoe               PROFILE-50M           10.10.20.1      10.10.20.150\n 5   rina_gading      pppoe               PROFILE-20M           10.10.20.1      10.10.20.177`;
    } else if (cmd.includes('/interface print')) {
      simulatedOutput = `Flags: D - dynamic, X - disabled, R - running, S - slave\n #     NAME                                TYPE       ACTUAL-MTU L2MTU  MAX-L2MTU MAC-ADDRESS\n 0  R  ether1-WAN                          ether            1500  1580       4076 48:8D:36:11:00:01\n 1  R  ether2-LAN-Distribution             ether            1500  1580       4076 48:8D:36:11:00:02\n 2  R  sfp-sfpplus1-OLT-Uplink             ether            1500  1580       4076 48:8D:36:11:00:08`;
    } else if (cmd.includes('/ping')) {
      simulatedOutput = `  SEQ HOST                                     SIZE TTL TIME  STATUS\n    0 8.8.8.8                                    56  57 11ms\n    1 8.8.8.8                                    56  57 12ms\n    2 8.8.8.8                                    56  57 11ms\n    sent=3 received=3 packet-loss=0% min-rtt=11ms avg-rtt=11ms max-rtt=12ms`;
    } else {
      simulatedOutput = `[admin@${mikrotik.name}] > OK. Command executed successfully on RouterOS v7 via API socket.`;
    }

    setTerminalHistory((prev) => [
      ...prev,
      {
        cmd: commandInput,
        output: simulatedOutput,
        time: new Date().toLocaleTimeString(),
      },
    ]);
    setCommandInput('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Integrasi MikroTik RouterOS
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Sinkronisasi PPPoE Secrets, Simple Queues, isolir otomatis, dan pemantauan sesi aktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onTestConnection}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Tes Koneksi API</span>
          </button>
          <button
            onClick={onSyncSecrets}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors shadow-xs"
          >
            <Zap className="w-3.5 h-3.5" />
            <span>Sinkronkan PPPoE ke Router</span>
          </button>
        </div>
      </div>

      {/* Router Live Telemetry Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Status Koneksi API</span>
            <span
              className={`w-2 h-2 rounded-full ${
                mikrotik.status === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
              }`}
            />
          </div>
          <div className="text-base font-bold text-slate-900 font-mono mt-1">
            {mikrotik.status === 'connected' ? 'CONNECTED' : 'DISCONNECTED'}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Host: {mikrotik.host}:{mikrotik.apiPort} · Latency: {mikrotik.lastPingMs}ms
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Hardware & RouterOS</span>
            <Cpu className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-base font-bold text-slate-900 font-mono mt-1">
            {mikrotik.boardName}
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            {mikrotik.version} · Uptime: {mikrotik.uptime}
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Beban CPU & RAM</span>
            <Activity className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-base font-bold text-slate-900 font-mono mt-1">
            CPU: {mikrotik.cpuLoad}%
          </div>
          <div className="text-[11px] text-slate-500 font-mono mt-0.5">
            Free RAM: {mikrotik.freeMemoryMB} MB / {mikrotik.totalMemoryMB} MB
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500">
            <span>Profil Isolir Terpasang</span>
            <UserX className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-base font-bold text-rose-700 font-mono mt-1">
            {mikrotik.isolateProfile}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            Auto-drop TCP 80/443 redirect landing page
          </div>
        </div>
      </div>

      {/* Tabs Controller */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium w-fit">
        <button
          onClick={() => setActiveTab('sessions')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'sessions'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Sesi Aktif ({sessions.length})
        </button>
        <button
          onClick={() => setActiveTab('secrets')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'secrets'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Database PPPoE Secrets ({customers.length})
        </button>
        <button
          onClick={() => setActiveTab('terminal')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'terminal'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Terminal API Console
        </button>
        <button
          onClick={() => setActiveTab('config')}
          className={`px-3 py-1.5 rounded-md transition-colors ${
            activeTab === 'config'
              ? 'bg-white text-slate-900 shadow-2xs font-semibold'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Konfigurasi Koneksi Router
        </button>
      </div>

      {/* Tab 1: Sesi Aktif */}
      {activeTab === 'sessions' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-800">
              Daftar Koneksi PPPoE Sedang Online (/ppp active)
            </span>
            <span className="text-slate-500 font-mono text-[11px]">{sessions.length} pelanggan online</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                  <th className="py-2.5 px-4">Username PPPoE</th>
                  <th className="py-2.5 px-4">IP Address Klien</th>
                  <th className="py-2.5 px-4">Caller ID (MAC)</th>
                  <th className="py-2.5 px-4">Waktu Uptime</th>
                  <th className="py-2.5 px-4">Rate Trafik (Rx / Tx)</th>
                  <th className="py-2.5 px-4 text-right">Aksi Router</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sessions.map((sess) => (
                  <tr key={sess.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-slate-900">{sess.username}</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{sess.ipAddress}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-[11px]">{sess.callerId}</td>
                    <td className="py-3 px-4 font-mono text-slate-600">{sess.uptime}</td>
                    <td className="py-3 px-4 font-mono text-xs">
                      <span className="text-emerald-700 font-semibold">{sess.rxRateMbps}M</span> /{' '}
                      <span className="text-blue-700 font-semibold">{sess.txRateMbps}M</span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onKickSession(sess.id, sess.username)}
                        className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded transition-colors"
                        title="Putus koneksi aktif agar login ulang atau terlempar ke isolir"
                      >
                        Kick Sesi
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: PPPoE Secrets */}
      {activeTab === 'secrets' && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-200 bg-slate-50 flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-800">
              Daftar PPPoE Secrets Terdaftar di Router (/ppp secret)
            </span>
            <span className="text-slate-500 text-[11px]">Otomatis tersinkron dengan billing</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 font-medium bg-slate-50/50">
                  <th className="py-2.5 px-4">Nama Pelanggan</th>
                  <th className="py-2.5 px-4">Username & Password</th>
                  <th className="py-2.5 px-4">Profil MikroTik</th>
                  <th className="py-2.5 px-4">Remote IP</th>
                  <th className="py-2.5 px-4">Status Akun</th>
                  <th className="py-2.5 px-4 text-right">Aksi Isolir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-500">{c.id}</div>
                    </td>
                    <td className="py-3 px-4 font-mono">
                      <div className="font-bold text-slate-800">{c.pppoeUsername}</div>
                      <div className="text-slate-400 text-[11px]">{c.pppoePassword}</div>
                    </td>
                    <td className="py-3 px-4 font-mono font-medium">
                      {c.status === 'isolir' ? (
                        <span className="text-rose-700 font-bold">{mikrotik.isolateProfile}</span>
                      ) : (
                        <span className="text-slate-800">{c.package.mikrotikProfile}</span>
                      )}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600">{c.ipAddress}</td>
                    <td className="py-3 px-4">
                      {c.status === 'aktif' ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">NORMAL</span>
                      ) : (
                        <span className="text-rose-700 font-semibold text-[11px]">ISOLATED</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => onToggleCustomerIsolate(c)}
                        className={`px-2.5 py-1 text-xs font-semibold rounded border transition-colors ${
                          c.status === 'isolir'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                            : 'bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100'
                        }`}
                      >
                        {c.status === 'isolir' ? 'Buka Isolir' : 'Isolir Manual'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Terminal API Console */}
      {activeTab === 'terminal' && (
        <div className="bg-slate-950 text-slate-100 rounded-xl p-4 font-mono text-xs space-y-4 shadow-md">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800 text-slate-400">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span>MikroTik RouterOS v7 API Direct Console</span>
            </div>
            <span className="text-[11px]">admin@{mikrotik.name}</span>
          </div>

          {/* Terminal History */}
          <div className="space-y-4 max-h-80 overflow-y-auto pr-2">
            {terminalHistory.map((item, idx) => (
              <div key={idx} className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span>[admin@{mikrotik.name}] &gt;</span>
                  <span className="text-white font-semibold">{item.cmd}</span>
                  <span className="text-[10px] text-slate-500 ml-auto">{item.time}</span>
                </div>
                <pre className="text-slate-300 text-[11px] whitespace-pre-wrap pl-4 leading-relaxed bg-slate-900/50 p-2 rounded">
                  {item.output}
                </pre>
              </div>
            ))}
          </div>

          {/* Command Input Form */}
          <form onSubmit={handleRunCommand} className="flex gap-2 pt-2 border-t border-slate-800">
            <span className="text-emerald-400 py-1.5">&gt;</span>
            <input
              type="text"
              value={commandInput}
              onChange={(e) => setCommandInput(e.target.value)}
              placeholder="Ketik perintah RouterOS, misal: /ppp active print, /ping 8.8.8.8, /system resource print"
              className="flex-1 bg-transparent border-none text-white focus:outline-none text-xs font-mono"
            />
            <button
              type="submit"
              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-semibold flex items-center gap-1"
            >
              <Play className="w-3 h-3" />
              <span>Kirim</span>
            </button>
          </form>
        </div>
      )}

      {/* Tab 4: Konfigurasi Router */}
      {activeTab === 'config' && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Pengaturan Parameter API RouterOS</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nama Identitas Router</label>
              <input
                type="text"
                value={mikrotik.name}
                onChange={(e) => onUpdateConfig({ name: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">IP Host / Domain DDNS</label>
              <input
                type="text"
                value={mikrotik.host}
                onChange={(e) => onUpdateConfig({ host: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Port API RouterOS</label>
              <input
                type="number"
                value={mikrotik.apiPort}
                onChange={(e) => onUpdateConfig({ apiPort: Number(e.target.value) })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
            <div>
              <label className="block text-slate-700 font-medium mb-1">Nama Profil Isolir (MikroTik)</label>
              <input
                type="text"
                value={mikrotik.isolateProfile}
                onChange={(e) => onUpdateConfig({ isolateProfile: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs font-mono"
              />
            </div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-[11px] text-slate-600">
            Sistem billing berkomunikasi langsung ke RouterOS menggunakan protocol MikroTik API binary protocol (port 8728) atau REST API RouterOS v7+.
          </div>
        </div>
      )}
    </div>
  );
};
