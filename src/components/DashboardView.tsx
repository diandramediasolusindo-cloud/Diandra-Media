import React, { useState, useEffect, useMemo } from 'react';
import { Customer, Invoice, MikrotikConfig, OltConfig, SystemLog } from '../types/isp';
import { formatIDR, getRxPowerQuality } from '../utils/formatters';
import { exportBillingReportToCsv } from '../utils/exportUtils';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  Users,
  CreditCard,
  AlertTriangle,
  Server,
  Zap,
  MessageSquare,
  Radio,
  ArrowUpRight,
  RefreshCw,
  CheckCircle2,
  TrendingUp,
  Percent,
  Clock,
  Wallet,
  FileSpreadsheet,
} from 'lucide-react';

interface DashboardViewProps {
  customers: Customer[];
  invoices: Invoice[];
  mikrotik: MikrotikConfig;
  olts: OltConfig[];
  logs: SystemLog[];
  onTriggerAutoIsolate: () => void;
  onSendBulkReminders: () => void;
  onRefreshOltPowers: () => void;
  onSelectCustomer: (cust: Customer) => void;
  onOpenPaymentModal: (invoice: Invoice) => void;
  onOpenReceiptModal: (invoice: Invoice) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  customers,
  invoices,
  mikrotik,
  olts,
  logs,
  onTriggerAutoIsolate,
  onSendBulkReminders,
  onRefreshOltPowers,
  onSelectCustomer,
  onOpenPaymentModal,
  onOpenReceiptModal,
}) => {
  // Live simulated traffic throughput for ether1-gateway
  const [trafficRx, setTrafficRx] = useState(142.4);
  const [trafficTx, setTrafficTx] = useState(48.6);
  const [chartBars, setChartBars] = useState<number[]>([
    45, 52, 60, 58, 65, 70, 68, 75, 82, 88, 80, 92, 105, 115, 128, 142,
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      const deltaRx = (Math.random() - 0.48) * 8;
      const deltaTx = (Math.random() - 0.48) * 4;
      setTrafficRx((prev) => Math.max(80, Math.min(220, +(prev + deltaRx).toFixed(1))));
      setTrafficTx((prev) => Math.max(25, Math.min(85, +(prev + deltaTx).toFixed(1))));

      setChartBars((prev) => {
        const nextVal = Math.floor(Math.random() * 40 + 75);
        return [...prev.slice(1), nextVal];
      });
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  // Financial aggregates
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalPaid = invoices
    .filter((inv) => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);
  const totalUnpaid = invoices
    .filter((inv) => inv.status === 'unpaid' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + inv.totalAmount, 0);

  const activeCustomers = customers.filter((c) => c.status === 'aktif').length;
  const isolatedCustomers = customers.filter((c) => c.status === 'isolir').length;
  const criticalOnuCount = customers.filter((c) => c.onuRxPower <= -27).length;

  // Analytics Timeframe & Revenue Data
  const [analyticsRange, setAnalyticsRange] = useState<'6m' | '12m'>('6m');

  const revenueData = useMemo(() => {
    // Current month real-time calculations from props
    const currentBilled = invoices.reduce((acc, inv) => acc + inv.totalAmount, 0);
    const currentCollected = invoices
      .filter((inv) => inv.status === 'paid')
      .reduce((acc, inv) => acc + inv.totalAmount, 0);
    const currentRate = currentBilled > 0 ? +((currentCollected / currentBilled) * 100).toFixed(1) : 0;

    const base6Months = [
      { month: 'Mei', period: 'Mei 2026', billed: 1350000, collected: 1250000, uncollected: 100000, rate: 92.6, gatewayShare: 72 },
      { month: 'Jun', period: 'Jun 2026', billed: 1480000, collected: 1400000, uncollected: 80000, rate: 94.6, gatewayShare: 75 },
      { month: 'Jul', period: 'Jul 2026', billed: 1620000, collected: 1500000, uncollected: 120000, rate: 92.6, gatewayShare: 77 },
      { month: 'Agu', period: 'Agu 2026', billed: 1750000, collected: 1680000, uncollected: 70000, rate: 96.0, gatewayShare: 80 },
      { month: 'Sep', period: 'Sep 2026', billed: 1840000, collected: 1740000, uncollected: 100000, rate: 94.6, gatewayShare: 82 },
      {
        month: 'Okt (MTD)',
        period: 'Okt 2026 (Berjalan)',
        billed: currentBilled,
        collected: currentCollected,
        uncollected: Math.max(0, currentBilled - currentCollected),
        rate: currentRate,
        gatewayShare: 85,
      },
    ];

    if (analyticsRange === '12m') {
      const priorMonths = [
        { month: 'Nov 25', period: 'Nov 2025', billed: 980000, collected: 890000, uncollected: 90000, rate: 90.8, gatewayShare: 65 },
        { month: 'Des 25', period: 'Des 2025', billed: 1050000, collected: 980000, uncollected: 70000, rate: 93.3, gatewayShare: 68 },
        { month: 'Jan 26', period: 'Jan 2026', billed: 1120000, collected: 1020000, uncollected: 100000, rate: 91.1, gatewayShare: 70 },
        { month: 'Feb 26', period: 'Feb 2026', billed: 1180000, collected: 1100000, uncollected: 80000, rate: 93.2, gatewayShare: 70 },
        { month: 'Mar 26', period: 'Mar 2026', billed: 1240000, collected: 1150000, uncollected: 90000, rate: 92.7, gatewayShare: 71 },
        { month: 'Apr 26', period: 'Apr 2026', billed: 1300000, collected: 1220000, uncollected: 80000, rate: 93.8, gatewayShare: 72 },
      ];
      return [...priorMonths, ...base6Months];
    }

    return base6Months;
  }, [invoices, analyticsRange]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950 text-white p-3 rounded-lg border border-slate-800 shadow-xl text-xs space-y-1.5 font-sans">
          <p className="font-bold text-slate-200 border-b border-slate-800 pb-1">{data.period}</p>
          <div className="flex justify-between gap-4 text-slate-300">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-slate-400" />
              Total Tagihan:
            </span>
            <span className="font-mono font-semibold text-white">{formatIDR(data.billed)}</span>
          </div>
          <div className="flex justify-between gap-4 text-emerald-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-emerald-500" />
              Kas Terkumpul:
            </span>
            <span className="font-mono font-bold text-emerald-300">{formatIDR(data.collected)}</span>
          </div>
          <div className="flex justify-between gap-4 text-rose-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-xs bg-rose-500" />
              Tertunda / Piutang:
            </span>
            <span className="font-mono font-semibold text-rose-300">{formatIDR(data.uncollected)}</span>
          </div>
          <div className="flex justify-between gap-4 text-blue-400 pt-1 border-t border-slate-800 font-semibold">
            <span>Collection Rate:</span>
            <span className="font-mono">{data.rate}%</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Operational Status */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Pusat Kendali ISP & Billing
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
            <span>Core Router: {mikrotik.name}</span>
            <span aria-hidden="true">·</span>
            <span>Uptime: {mikrotik.uptime}</span>
            <span aria-hidden="true">·</span>
            <span>Headend GPON: MA5800-X7 Online</span>
          </div>
        </div>

        {/* 1-Click Automation Actions */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={onTriggerAutoIsolate}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors whitespace-nowrap"
            title="Eksekusi profile isolir di MikroTik untuk pelanggan jatuh tempo"
          >
            <Zap className="w-3.5 h-3.5 text-rose-600" />
            <span>Eksekusi Isolir Otomatis</span>
          </button>
          <button
            onClick={onSendBulkReminders}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors whitespace-nowrap"
            title="Kirim pesan WhatsApp penagihan ke semua pelanggan yang belum lunas"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>Kirim Broadcast Tagihan WA</span>
          </button>
          <button
            onClick={onRefreshOltPowers}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors whitespace-nowrap"
            title="Poller SNMP untuk mengambil pembacaan redaman optik ONT terkini"
          >
            <RefreshCw className="w-3.5 h-3.5 text-slate-500" />
            <span>Poll OLT Laser</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (High density, single-elevation, tabular nums) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Pelanggan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Total Pelanggan Terdaftar</span>
            <Users className="w-4 h-4 text-slate-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {customers.length}
            </span>
            <span className="text-xs text-slate-500 font-medium">unit sambungan</span>
          </div>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-600">
            <span className="text-emerald-700 font-semibold">{activeCustomers} Aktif</span>
            <span aria-hidden="true">·</span>
            <span className="text-rose-700 font-semibold">{isolatedCustomers} Terisolir</span>
            <span aria-hidden="true">·</span>
            <span className="text-slate-500">{customers.length - activeCustomers - isolatedCustomers} Lainnya</span>
          </div>
        </div>

        {/* KPI 2: Penerimaan Kas Bulan Berjalan */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Penerimaan Kas (Lunas)</span>
            <CreditCard className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-700 font-mono tabular-nums">
            {formatIDR(totalPaid)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Dari total tagihan terbit:</span>
            <span className="font-semibold text-slate-700">{formatIDR(totalInvoiced)}</span>
          </div>
        </div>

        {/* KPI 3: Piutang Tertunggak */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Piutang Belum Lunas</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold tracking-tight text-amber-700 font-mono tabular-nums">
            {formatIDR(totalUnpaid)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span>Tertunggak:</span>
            <span className="font-semibold text-rose-700">
              {invoices.filter((i) => i.status === 'overdue').length} pelanggan telat
            </span>
          </div>
        </div>

        {/* KPI 4: MikroTik Throughput WAN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 mb-2">
            <span>Trafik Core RouterOS (WAN)</span>
            <Server className="w-4 h-4 text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold tracking-tight text-slate-900 font-mono tabular-nums">
              {trafficRx}
            </span>
            <span className="text-xs font-mono text-slate-500">Mbps Down</span>
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">
            <span className="font-mono">Up: {trafficTx} Mbps</span>
            <span className="font-mono text-slate-700">CPU: {mikrotik.cpuLoad}%</span>
          </div>
        </div>
      </div>

      {/* Revenue Analytics Section (Recharts Visualization) */}
      <div className="bg-white p-5 sm:p-6 rounded-xl border border-slate-200 shadow-2xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base font-bold text-slate-900">
                Analisis Pendapatan & Efektivitas Penagihan (Revenue Analytics)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Visualisasi tren omset bulanan, realisasi kas masuk, serta rasio penagihan (payment collection rate)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center bg-slate-100 p-1 rounded-lg text-xs font-medium">
              <button
                onClick={() => setAnalyticsRange('6m')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  analyticsRange === '6m'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                6 Bulan Terakhir
              </button>
              <button
                onClick={() => setAnalyticsRange('12m')}
                className={`px-3 py-1 rounded-md transition-colors ${
                  analyticsRange === '12m'
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                12 Bulan (Tahunan)
              </button>
            </div>

            <button
              onClick={() => exportBillingReportToCsv(invoices, customers, 'Laporan_Keuangan_Pendapatan')}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors shadow-2xs"
              title="Download laporan penerimaan kas dan rekonsiliasi akuntansi CSV"
            >
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Ekspor Laporan CSV</span>
            </button>
          </div>
        </div>

        {/* 4 Mini Performance Indicators */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px]">Rata-Rata Collection Rate</span>
              <Percent className="w-3.5 h-3.5 text-emerald-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-emerald-700 font-mono tabular-nums">94.2%</span>
              <span className="text-[10px] text-emerald-600 font-medium">Tertagih Lancar</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Benchmark target ISP &ge; 90%</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px]">Pertumbuhan Omset MoM</span>
              <TrendingUp className="w-3.5 h-3.5 text-slate-700" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">+14.6%</span>
              <span className="text-[10px] text-emerald-600 font-medium">Kenaikan Sehat</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Ekspansi sambungan baru</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px]">Saluran Gateway (QRIS &amp; VA)</span>
              <Wallet className="w-3.5 h-3.5 text-blue-600" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-blue-700 font-mono tabular-nums">78.5%</span>
              <span className="text-[10px] text-slate-500">Volume</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Auto-reconnect MikroTik instant</p>
          </div>

          <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200/80">
            <div className="flex items-center justify-between text-slate-500 mb-1">
              <span className="text-[11px]">Waktu Pelunasan Rata-Rata</span>
              <Clock className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="flex items-baseline gap-1 mt-0.5">
              <span className="text-lg font-bold text-slate-900 font-mono tabular-nums">2.3 Hari</span>
              <span className="text-[10px] text-slate-500">Sejak terbit</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-1">Didorong reminder WA otomatis</p>
          </div>
        </div>

        {/* Main Chart Area */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 pt-1">
          {/* Main Composed Chart (Billed vs Collected & Rate %) */}
          <div className="lg:col-span-3 space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-600 px-1">
              <span className="font-semibold text-slate-800">
                Grafik Perbandingan: Total Tagihan Terbit vs Realisasi Kas Lunas &amp; Collection Rate
              </span>
              <div className="flex items-center gap-4 text-[11px] font-mono">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-300" />
                  Tagihan (Rp)
                </span>
                <span className="flex items-center gap-1.5 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600" />
                  Kas Lunas (Rp)
                </span>
                <span className="flex items-center gap-1.5 text-blue-600">
                  <span className="w-3 h-0.5 bg-blue-600" />
                  Rate (%)
                </span>
              </div>
            </div>

            <div className="h-72 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={revenueData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: '#64748b' }}
                    axisLine={{ stroke: '#cbd5e1' }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `Rp ${(val / 1000000).toFixed(1)}jt`}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    domain={[0, 100]}
                    tick={{ fontSize: 10, fill: '#64748b', fontFamily: 'JetBrains Mono' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => `${val}%`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar
                    yAxisId="left"
                    dataKey="billed"
                    name="Tagihan Terbit"
                    fill="#cbd5e1"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="collected"
                    name="Kas Lunas"
                    fill="#059669"
                    radius={[4, 4, 0, 0]}
                    maxBarSize={32}
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="rate"
                    name="Collection Rate"
                    stroke="#2563eb"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: '#2563eb', strokeWidth: 1, stroke: '#ffffff' }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Right Column: Breakdown & Efficiency Panel */}
          <div className="bg-slate-50/70 p-4 rounded-xl border border-slate-200 flex flex-col justify-between space-y-4 text-xs">
            <div>
              <span className="font-semibold text-slate-900 block text-xs">
                Distribusi Saluran Pembayaran
              </span>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Realisasi kas masuk berdasarkan kanal
              </p>

              <div className="space-y-3 mt-4">
                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">QRIS Dinamis (All E-Wallet)</span>
                    <span className="font-mono font-bold text-slate-900">48%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-emerald-600 h-full rounded-full" style={{ width: '48%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">GoPay, ShopeePay, Dana, BCA Mobile</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">Virtual Account (BCA/Mandiri/BRI)</span>
                    <span className="font-mono font-bold text-slate-900">32%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-blue-600 h-full rounded-full" style={{ width: '32%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Verifikasi instan via Xendit / Midtrans</span>
                </div>

                <div>
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-700 font-medium">Tunai Loket &amp; Transfer Bank</span>
                    <span className="font-mono font-bold text-slate-900">20%</span>
                  </div>
                  <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                    <div className="bg-amber-600 h-full rounded-full" style={{ width: '20%' }} />
                  </div>
                  <span className="text-[10px] text-slate-400 mt-0.5 block">Loket kantor ISP &amp; cetak nota thermal</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-white rounded-lg border border-slate-200 space-y-1 text-[11px]">
              <span className="font-semibold text-slate-800 block">Efisiensi Otomatisasi</span>
              <p className="text-slate-600 text-[10px] leading-relaxed">
                Pembayaran via Payment Gateway otomatis mencabut isolir di MikroTik RouterOS dalam tempo &lt; 3 detik tanpa intervensi manual admin NOC.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Row: Bandwidth Monitoring & Alarm OLT */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Live Traffic Interface Graph */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Monitoring Trafik Interface (ether1-WAN / Uplink)
              </h2>
              <p className="text-[11px] text-slate-500">
                MikroTik RouterOS API streaming /queue/simple & interface counter
              </p>
            </div>
            <div className="flex items-center gap-3 text-xs font-mono">
              <span className="flex items-center gap-1 text-emerald-700">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                RX: {trafficRx} Mbps
              </span>
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2 h-2 rounded-full bg-blue-500" />
                TX: {trafficTx} Mbps
              </span>
            </div>
          </div>

          {/* Sparkline / Bar Graph */}
          <div className="h-40 flex items-end gap-1.5 pt-4 px-2 bg-slate-50 rounded-lg border border-slate-200">
            {chartBars.map((val, idx) => (
              <div
                key={idx}
                className="flex-1 flex flex-col justify-end items-center h-full group relative"
              >
                <div
                  style={{ height: `${(val / 160) * 100}%` }}
                  className="w-full bg-slate-800 rounded-t-xs hover:bg-emerald-600 transition-all duration-300"
                />
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
            <span>Interval update: 2.5 detik</span>
            <span>Kapasitas Bandwidth ISP: 1.0 Gbps Metro Ethernet</span>
          </div>
        </div>

        {/* Right 1 Col: OLT Health & Laser Redaman Alarms */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Status OLT & Redaman Optik</h2>
              <p className="text-[11px] text-slate-500">Huawei MA5800 & ZTE C320</p>
            </div>
            <Radio className="w-4 h-4 text-slate-400" />
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50 flex justify-between items-center">
              <div>
                <span className="text-[11px] text-slate-500 block">Total ONT Terdaftar</span>
                <span className="font-mono text-base font-bold text-slate-900">
                  {olts[0].activeOnus + olts[1].activeOnus} unit
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-slate-500 block">Suhu Headend</span>
                <span className="font-mono text-base font-bold text-slate-900">{olts[0].temperatureC}°C</span>
              </div>
            </div>

            <div className="space-y-1.5 pt-1">
              <span className="text-[11px] font-semibold text-slate-700 block">
                Pelanggan Butuh Perhatian (Redaman Tinggi / Drop):
              </span>
              {customers
                .filter((c) => c.onuRxPower <= -24)
                .map((cust) => {
                  const q = getRxPowerQuality(cust.onuRxPower);
                  return (
                    <div
                      key={cust.id}
                      onClick={() => onSelectCustomer(cust)}
                      className="p-2 rounded-lg border border-slate-200 hover:border-slate-300 bg-white cursor-pointer transition-colors flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-slate-900 text-xs">{cust.name}</p>
                        <p className="text-[10px] text-slate-500">{cust.odpName} · {cust.ponPort}</p>
                      </div>
                      <div className="text-right">
                        <span className={`font-mono font-bold text-xs ${q.color}`}>
                          {cust.onuRxPower} dBm
                        </span>
                        <span className="block text-[10px] text-slate-500">{q.label}</span>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Row: Invoices Requiring Action & Real-time System Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Tagihan Belum Lunas / Overdue */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Tagihan Perlu Tindakan</h2>
              <p className="text-[11px] text-slate-500">
                Daftar pelanggan belum lunas atau melewati batas jatuh tempo
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500">
                  <th className="py-2 px-3 font-medium">No. Inv / Pelanggan</th>
                  <th className="py-2 px-3 font-medium">Paket</th>
                  <th className="py-2 px-3 font-medium text-right">Nominal</th>
                  <th className="py-2 px-3 font-medium">Jatuh Tempo</th>
                  <th className="py-2 px-3 font-medium">Status</th>
                  <th className="py-2 px-3 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-2.5 px-3">
                      <div className="font-semibold text-slate-900">{inv.customerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{inv.id}</div>
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">{inv.packageName}</td>
                    <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-900">
                      {formatIDR(inv.totalAmount)}
                    </td>
                    <td className="py-2.5 px-3 text-slate-500 font-mono text-[11px]">{inv.dueDate}</td>
                    <td className="py-2.5 px-3">
                      {inv.status === 'paid' ? (
                        <span className="text-emerald-700 font-semibold text-[11px]">LUNAS</span>
                      ) : inv.status === 'overdue' ? (
                        <span className="text-rose-700 font-semibold text-[11px]">TERLAMBAT (ISOLIR)</span>
                      ) : (
                        <span className="text-amber-700 font-semibold text-[11px]">BELUM BAYAR</span>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-right space-x-1 whitespace-nowrap">
                      {inv.status !== 'paid' ? (
                        <button
                          onClick={() => onOpenPaymentModal(inv)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors"
                        >
                          Bayar QRIS/VA
                        </button>
                      ) : (
                        <button
                          onClick={() => onOpenReceiptModal(inv)}
                          className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded transition-colors"
                        >
                          Cetak Struk
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right 1 Col: Log Otomatisasi Terkini */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Log Aktivitas Sistem</h2>
              <p className="text-[11px] text-slate-500">RouterOS, OLT, WA Gateway, & Webhook</p>
            </div>
          </div>

          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {logs.map((log, idx) => (
              <div key={`${log.id}-${idx}`} className="text-xs pb-2 border-b border-slate-100 last:border-b-0">
                <div className="flex items-center justify-between text-[10px] text-slate-400 mb-0.5">
                  <span className="font-mono uppercase font-semibold text-slate-600">{log.source}</span>
                  <span className="font-mono">{log.timestamp.slice(11)}</span>
                </div>
                <p className="text-slate-700 text-[11px] leading-relaxed">{log.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
