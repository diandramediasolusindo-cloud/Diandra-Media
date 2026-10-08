/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  INITIAL_PACKAGES,
  INITIAL_CUSTOMERS,
  INITIAL_INVOICES,
  INITIAL_MIKROTIK,
  INITIAL_PPPOE_SESSIONS,
  INITIAL_OLT,
  INITIAL_UNCONFIGURED_ONUS,
  INITIAL_WA_GATEWAY,
  INITIAL_WA_LOGS,
  INITIAL_PAYMENT_GATEWAY,
  INITIAL_TICKETS,
  INITIAL_LOGS,
} from './data/mockData';
import {
  Customer,
  Invoice,
  InternetPackage,
  MikrotikConfig,
  PppoeActiveSession,
  OltConfig,
  UnconfiguredOnu,
  WaGatewayConfig,
  WaMessageLog,
  PaymentGatewayConfig,
  NetworkTicket,
  SystemLog,
} from './types/isp';
import { Header, ActiveTab } from './components/Header';
import { DashboardView } from './components/DashboardView';
import { CustomerView } from './components/CustomerView';
import { BillingView } from './components/BillingView';
import { MikrotikView } from './components/MikrotikView';
import { OltView } from './components/OltView';
import { WaGatewayView } from './components/WaGatewayView';
import { PaymentGatewayView } from './components/PaymentGatewayView';
import { TicketView } from './components/TicketView';
import { CustomerPortalView } from './components/CustomerPortalView';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';
import { PaymentSimulatorModal } from './components/PaymentSimulatorModal';
import { CustomerModal } from './components/CustomerModal';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function App() {
  // Core Entities State
  const [customers, setCustomers] = useState<Customer[]>(INITIAL_CUSTOMERS);
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);
  const [packages, setPackages] = useState<InternetPackage[]>(INITIAL_PACKAGES);
  const [mikrotik, setMikrotik] = useState<MikrotikConfig>(INITIAL_MIKROTIK);
  const [sessions, setSessions] = useState<PppoeActiveSession[]>(INITIAL_PPPOE_SESSIONS);
  const [olts, setOlts] = useState<OltConfig[]>(INITIAL_OLT);
  const [unconfiguredOnus, setUnconfiguredOnus] = useState<UnconfiguredOnu[]>(INITIAL_UNCONFIGURED_ONUS);
  const [waGateway, setWaGateway] = useState<WaGatewayConfig>(INITIAL_WA_GATEWAY);
  const [waLogs, setWaLogs] = useState<WaMessageLog[]>(INITIAL_WA_LOGS);
  const [paymentGateway, setPaymentGateway] = useState<PaymentGatewayConfig>(INITIAL_PAYMENT_GATEWAY);
  const [tickets, setTickets] = useState<NetworkTicket[]>(INITIAL_TICKETS);
  const [logs, setLogs] = useState<SystemLog[]>(INITIAL_LOGS);

  // Navigation & UI States
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [portalMode, setPortalMode] = useState(false);

  // Modal States
  const [receiptModalInvoice, setReceiptModalInvoice] = useState<Invoice | null>(null);
  const [paymentModalInvoice, setPaymentModalInvoice] = useState<Invoice | null>(null);
  const [customerModalData, setCustomerModalData] = useState<Customer | null>(null);
  const [isCustomerModalOpen, setIsCustomerModalOpen] = useState(false);

  // Toast Banner State
  const [toast, setToast] = useState<{
    type: 'success' | 'warn' | 'info';
    message: string;
  } | null>(null);

  const showToast = (type: 'success' | 'warn' | 'info', message: string) => {
    setToast({ type, message });
    setTimeout(() => {
      setToast(null);
    }, 4000);
  };

  // Monotonically increasing sequence counter to guarantee 100% unique IDs across millisecond batches
  let seqCounter = 0;
  const generateUniqueId = (prefix: string) => {
    seqCounter += 1;
    return `${prefix}-${Date.now()}-${seqCounter}-${Math.random().toString(36).substring(2, 6)}`;
  };

  const addSystemLog = (
    source: SystemLog['source'],
    level: SystemLog['level'],
    message: string
  ) => {
    const newLog: SystemLog = {
      id: generateUniqueId('log'),
      timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
      source,
      level,
      message,
    };
    setLogs((prev) => [newLog, ...prev]);
  };

  // Workflow 1: Payment Settlement (from Webhook or Checkout)
  const handlePaymentSuccess = (invoiceId: string, method: string, ref: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    const paidTimestamp = new Date().toISOString().replace('T', ' ').slice(0, 19);

    // 1. Update Invoice to PAID
    setInvoices((prev) =>
      prev.map((i) =>
        i.id === invoiceId
          ? {
              ...i,
              status: 'paid',
              paidAt: paidTimestamp,
              paymentMethod: method as any,
              paymentRef: ref,
            }
          : i
      )
    );

    // 2. MikroTik RouterOS Action: If customer was isolated, restore normal profile & kick session
    const targetCust = customers.find((c) => c.id === inv.customerId);
    if (targetCust) {
      if (targetCust.status === 'isolir') {
        setCustomers((prev) =>
          prev.map((c) =>
            c.id === targetCust.id ? { ...c, status: 'aktif' } : c
          )
        );

        // Remove active session on RouterOS so client reconnects with normal profile
        setSessions((prev) => prev.filter((s) => s.username !== targetCust.pppoeUsername));

        addSystemLog(
          'MIKROTIK',
          'success',
          `Buka Isolir MikroTik: Akun ${targetCust.pppoeUsername} dipulihkan ke profil ${targetCust.package.mikrotikProfile}. Sesi isolir ditendang.`
        );
      }
    }

    // 3. WA Gateway Action: Auto-dispatch Payment Receipt Message
    const receiptMsg = waGateway.templates.kuitansiLunas
      .replace('{nama}', inv.customerName)
      .replace('{periode}', inv.periodMonth)
      .replace('{tagihan}', inv.totalAmount.toLocaleString('id-ID'))
      .replace('{nomor_ref}', ref)
      .replace('{metode}', method.toUpperCase());

    const newWaLog: WaMessageLog = {
      id: generateUniqueId('wlog'),
      to: inv.customerPhone,
      recipientName: inv.customerName,
      category: 'lunas',
      message: receiptMsg,
      sentAt: paidTimestamp,
      status: 'read',
    };
    setWaLogs((prev) => [newWaLog, ...prev]);

    addSystemLog(
      'PAYMENT_GATEWAY',
      'success',
      `Webhook Payment Valid: Tagihan ${inv.id} (${inv.customerName}) lunas sebesar Rp ${inv.totalAmount.toLocaleString('id-ID')} via ${method.toUpperCase()}.`
    );

    addSystemLog(
      'WA_GATEWAY',
      'info',
      `Kuitansi digital otomatis terkirim ke WhatsApp ${inv.customerPhone}.`
    );

    setPaymentModalInvoice(null);
    showToast(
      'success',
      `Pembayaran ${inv.id} berhasil! Isolir MikroTik otomatis dibuka & Kuitansi WA terkirim.`
    );
  };

  // Workflow 2: Manual Mark Paid (Kasir Loket)
  const handleManualMarkPaid = (invoiceId: string) => {
    const inv = invoices.find((i) => i.id === invoiceId);
    if (!inv) return;

    handlePaymentSuccess(
      invoiceId,
      'cash',
      `CSH-LOKET-${Date.now().toString().slice(-6)}`
    );
  };

  // Workflow 3: Trigger Isolir Otomatis Massal (MikroTik Sync)
  const handleTriggerAutoIsolate = () => {
    const overdueInvoices = invoices.filter((i) => i.status === 'overdue' || (i.status === 'unpaid' && new Date(i.dueDate) < new Date()));
    const overdueCustomerIds = new Set(overdueInvoices.map((i) => i.customerId));

    let isolatedCount = 0;
    setCustomers((prev) =>
      prev.map((c) => {
        if (overdueCustomerIds.has(c.id) && c.autoIsolate && c.status !== 'isolir') {
          isolatedCount++;
          return { ...c, status: 'isolir' };
        }
        return c;
      })
    );

    // Kick active sessions for overdue customers on MikroTik
    setSessions((prev) =>
      prev.filter((s) => {
        const matchingCust = customers.find((c) => c.pppoeUsername === s.username);
        return !(matchingCust && overdueCustomerIds.has(matchingCust.id));
      })
    );

    // Send WhatsApp notification for each isolated customer
    overdueInvoices.forEach((inv) => {
      const waMsg = waGateway.templates.notifikasiIsolir
        .replace('{nama}', inv.customerName)
        .replace('{periode}', inv.periodMonth)
        .replace('{tagihan}', inv.totalAmount.toLocaleString('id-ID'))
        .replace('{link_bayar}', `https://billing.diandranet.id/pay/${inv.id}`);

      setWaLogs((prev) => [
        {
          id: generateUniqueId(`wlog-iso-${inv.id}`),
          to: inv.customerPhone,
          recipientName: inv.customerName,
          category: 'isolir',
          message: waMsg,
          sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'delivered',
        },
        ...prev,
      ]);
    });

    addSystemLog(
      'MIKROTIK',
      'warn',
      `Scheduler Isolir Otomatis Selesai: ${overdueCustomerIds.size} pelanggan dialihkan ke ${mikrotik.isolateProfile} pada ${mikrotik.name}.`
    );

    showToast(
      'warn',
      `Isolir otomatis selesai: ${overdueCustomerIds.size} pelanggan jatuh tempo dialihkan ke PROFILE-ISOLIR MikroTik.`
    );
  };

  // Workflow 4: Send Bulk Reminders via WA Gateway
  const handleSendBulkReminders = () => {
    const unpaidInvoices = invoices.filter((i) => i.status === 'unpaid' || i.status === 'overdue');
    unpaidInvoices.forEach((inv) => {
      const msg = waGateway.templates.pengingatHariH
        .replace('{nama}', inv.customerName)
        .replace('{jatuh_tempo}', inv.dueDate)
        .replace('{tagihan}', inv.totalAmount.toLocaleString('id-ID'))
        .replace('{link_bayar}', `https://billing.diandranet.id/pay/${inv.id}`);

      setWaLogs((prev) => [
        {
          id: generateUniqueId(`wlog-bulk-${inv.id}`),
          to: inv.customerPhone,
          recipientName: inv.customerName,
          category: 'pengingat',
          message: msg,
          sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
          status: 'delivered',
        },
        ...prev,
      ]);
    });

    addSystemLog(
      'WA_GATEWAY',
      'info',
      `Broadcast pengingat tagihan WA dikirim ke ${unpaidInvoices.length} nomor pelanggan.`
    );

    showToast(
      'success',
      `Broadcast tagihan berhasil dikirim ke ${unpaidInvoices.length} pelanggan melalui WA Gateway!`
    );
  };

  // Workflow 5: Poll OLT Optical Powers
  const handleRefreshOltPowers = () => {
    setCustomers((prev) =>
      prev.map((c) => {
        const drift = +(Math.random() * 0.6 - 0.3).toFixed(1);
        return {
          ...c,
          onuRxPower: +(c.onuRxPower + drift).toFixed(1),
        };
      })
    );

    addSystemLog(
      'OLT',
      'info',
      `SNMP Poll Selesai: Pembacaan laser RX optical power diperbarui untuk semua ONU di MA5800-X7 & ZTE C320.`
    );

    showToast('info', 'Data redaman optik ONT (RX Power dBm) berhasil diperbarui dari OLT.');
  };

  // Workflow 6: Toggle Customer Isolate Manually
  const handleToggleCustomerIsolate = (customer: Customer) => {
    const newStatus = customer.status === 'isolir' ? 'aktif' : 'isolir';
    setCustomers((prev) =>
      prev.map((c) => (c.id === customer.id ? { ...c, status: newStatus } : c))
    );

    if (newStatus === 'isolir') {
      // Remove from active sessions
      setSessions((prev) => prev.filter((s) => s.username !== customer.pppoeUsername));
      addSystemLog(
        'MIKROTIK',
        'warn',
        `Isolir Manual: ${customer.pppoeUsername} diubah ke ${mikrotik.isolateProfile}. Sesi diputus.`
      );
      showToast('warn', `Pelanggan ${customer.name} berhasil diisolir di MikroTik.`);
    } else {
      addSystemLog(
        'MIKROTIK',
        'success',
        `Buka Isolir Manual: ${customer.pppoeUsername} dikembalikan ke profil normal ${customer.package.mikrotikProfile}.`
      );
      showToast('success', `Isolir dibuka. Pelanggan ${customer.name} aktif normal di MikroTik.`);
    }
  };

  // Workflow 7: Kick Session MikroTik
  const handleKickSession = (sessionId: string, username: string) => {
    setSessions((prev) => prev.filter((s) => s.id !== sessionId));
    addSystemLog(
      'MIKROTIK',
      'info',
      `API Command /ppp active remove: Sesi ${username} diputus oleh operator.`
    );
    showToast('info', `Sesi PPPoE ${username} berhasil diputus (kicked) dari RouterOS.`);
  };

  // Workflow 8: Reboot ONT from OLT
  const handleRebootOnu = (customer: Customer) => {
    addSystemLog(
      'OLT',
      'info',
      `OLT Command ont reset: Modem ONU ${customer.onuSerialNumber} (${customer.name}) sedang direstart.`
    );
    showToast('info', `Perintah reboot ONT untuk ${customer.name} (SN: ${customer.onuSerialNumber}) berhasil dikirim.`);
  };

  // Workflow 9: Provision Unconfigured ONU
  const handleProvisionOnu = (onu: UnconfiguredOnu, customerId: string) => {
    const cust = customers.find((c) => c.id === customerId);
    if (!cust) return;

    setCustomers((prev) =>
      prev.map((c) =>
        c.id === customerId
          ? {
              ...c,
              onuSerialNumber: onu.serialNumber,
              ponPort: onu.ponPort,
              onuRxPower: onu.rxPower,
            }
          : c
      )
    );

    setUnconfiguredOnus((prev) => prev.filter((u) => u.id !== onu.id));

    addSystemLog(
      'OLT',
      'success',
      `ONU Provisioned: SN ${onu.serialNumber} berhasil di-binding ke ${cust.name} pada ${onu.ponPort}.`
    );

    showToast('success', `Modem ONT SN ${onu.serialNumber} berhasil di-provisioning untuk ${cust.name}!`);
  };

  // Workflow 10: Generate Monthly Invoices Bulk
  const handleGenerateBulkInvoices = (periodMonth: string) => {
    const newInvoices: Invoice[] = customers.map((c, idx) => ({
      id: `INV-2026-${Date.now().toString().slice(-4)}${idx + 1}-${Math.floor(Math.random() * 899 + 100)}`,
      customerId: c.id,
      customerName: c.name,
      customerPhone: c.phone,
      packageName: c.package.name,
      packageSpeed: `${c.package.speedDownload} Mbps`,
      periodMonth,
      amount: c.package.price,
      adminFee: 2500,
      totalAmount: c.package.price + 2500,
      dueDate: `2026-11-${c.billingDueDate.toString().padStart(2, '0')}`,
      status: 'unpaid',
      notes: `Tagihan periode ${periodMonth}`,
      pdfGenerated: true,
    }));

    setInvoices((prev) => [...newInvoices, ...prev]);

    addSystemLog(
      'SYSTEM',
      'info',
      `Generate Tagihan Selesai: ${newInvoices.length} faktur baru diterbitkan untuk periode ${periodMonth}.`
    );

    showToast('success', `Berhasil membuat ${newInvoices.length} tagihan baru untuk periode ${periodMonth}!`);
  };

  // Workflow 11: Save or Add Customer
  const handleSaveCustomer = (custData: Partial<Customer>) => {
    if (customerModalData) {
      // Editing
      setCustomers((prev) =>
        prev.map((c) => (c.id === customerModalData.id ? ({ ...c, ...custData } as Customer) : c))
      );
      addSystemLog(
        'SYSTEM',
        'info',
        `Data pelanggan ${custData.name} (${customerModalData.id}) dan parameter PPPoE diperbarui.`
      );
      showToast('success', `Data pelanggan ${custData.name} berhasil diperbarui.`);
    } else {
      // Creating
      const newCust = custData as Customer;
      setCustomers((prev) => [newCust, ...prev]);

      // Add to Mikrotik PPPoE Secrets log
      addSystemLog(
        'MIKROTIK',
        'success',
        `PPPoE Secret Created: ${newCust.pppoeUsername} (Profil: ${newCust.package.mikrotikProfile}) ditambahkan ke RouterOS.`
      );
      showToast('success', `Pelanggan baru ${newCust.name} berhasil didaftarkan & disinkronkan ke MikroTik!`);
    }

    setIsCustomerModalOpen(false);
    setCustomerModalData(null);
  };

  // Workflow 12: Delete Customer
  const handleDeleteCustomer = (id: string) => {
    const cust = customers.find((c) => c.id === id);
    if (!cust) return;

    if (window.confirm(`Yakin ingin menghapus pelanggan ${cust.name} dari billing dan RouterOS?`)) {
      setCustomers((prev) => prev.filter((c) => c.id !== id));
      setSessions((prev) => prev.filter((s) => s.username !== cust.pppoeUsername));
      addSystemLog('MIKROTIK', 'warn', `PPPoE Secret ${cust.pppoeUsername} dihapus dari RouterOS.`);
      showToast('info', `Pelanggan ${cust.name} berhasil dihapus.`);
    }
  };

  // Workflow 13: Test Single WA Message
  const handleSendTestMessage = (phone: string, text: string) => {
    const newLog: WaMessageLog = {
      id: generateUniqueId('wlog-test'),
      to: phone,
      recipientName: 'Uji Coba Direct',
      category: 'test',
      message: text,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'delivered',
    };
    setWaLogs((prev) => [newLog, ...prev]);
    addSystemLog('WA_GATEWAY', 'info', `Uji coba pengiriman pesan WhatsApp ke ${phone} sukses diproses.`);
    showToast('success', `Pesan WhatsApp uji coba berhasil dikirim ke ${phone}!`);
  };

  // Workflow 14: Send Invoice via WA
  const handleSendInvoiceWa = (invoice: Invoice) => {
    const msg = waGateway.templates.tagihanTerbit
      .replace('{nama}', invoice.customerName)
      .replace('{periode}', invoice.periodMonth)
      .replace('{paket}', invoice.packageName)
      .replace('{tagihan}', invoice.totalAmount.toLocaleString('id-ID'))
      .replace('{jatuh_tempo}', invoice.dueDate)
      .replace('{link_bayar}', `https://billing.diandranet.id/pay/${invoice.id}`);

    const newLog: WaMessageLog = {
      id: generateUniqueId('wlog-inv'),
      to: invoice.customerPhone,
      recipientName: invoice.customerName,
      category: 'tagihan',
      message: msg,
      sentAt: new Date().toISOString().replace('T', ' ').slice(0, 16),
      status: 'delivered',
    };
    setWaLogs((prev) => [newLog, ...prev]);
    showToast('success', `Notifikasi tagihan WhatsApp terkirim ke ${invoice.customerName}!`);
  };

  // Workflow 15: Add Ticket
  const handleAddTicket = (ticketData: Partial<NetworkTicket>) => {
    setTickets((prev) => [ticketData as NetworkTicket, ...prev]);
    addSystemLog('SYSTEM', 'info', `Tiket NOC ${ticketData.id} dibuat untuk kendala ${ticketData.category}.`);
    showToast('success', `Laporan gangguan ${ticketData.id} berhasil dicatat.`);
  };

  // Workflow 16: Update Ticket Status
  const handleUpdateTicketStatus = (ticketId: string, status: NetworkTicket['status']) => {
    setTickets((prev) =>
      prev.map((t) => (t.id === ticketId ? { ...t, status } : t))
    );
    showToast('success', `Status tiket ${ticketId} diperbarui.`);
  };

  return (
    <div className="min-h-screen bg-slate-100/70 text-slate-900 font-sans antialiased selection:bg-slate-900 selection:text-white">
      {/* Toast Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 bg-slate-950 text-white rounded-xl shadow-xl text-xs border border-slate-800 animate-slide-up">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          ) : toast.type === 'warn' ? (
            <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          ) : (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span className="font-medium pr-2">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white ml-auto"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        portalMode={portalMode}
        setPortalMode={setPortalMode}
        mikrotikStatus={mikrotik.status}
        waConnected={waGateway.connected}
        onQuickNewCustomer={() => {
          setCustomerModalData(null);
          setIsCustomerModalOpen(true);
        }}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        {portalMode ? (
          /* Customer Portal Mode (Self-Service) */
          <CustomerPortalView
            customers={customers}
            invoices={invoices}
            onOpenPaymentModal={(inv) => setPaymentModalInvoice(inv)}
            onOpenReceiptModal={(inv) => setReceiptModalInvoice(inv)}
            onCreateCustomerTicket={handleAddTicket}
          />
        ) : (
          /* Admin / NOC Management Mode */
          <>
            {activeTab === 'dashboard' && (
              <DashboardView
                customers={customers}
                invoices={invoices}
                mikrotik={mikrotik}
                olts={olts}
                logs={logs}
                onTriggerAutoIsolate={handleTriggerAutoIsolate}
                onSendBulkReminders={handleSendBulkReminders}
                onRefreshOltPowers={handleRefreshOltPowers}
                onSelectCustomer={(cust) => {
                  setCustomerModalData(cust);
                  setIsCustomerModalOpen(true);
                }}
                onOpenPaymentModal={(inv) => setPaymentModalInvoice(inv)}
                onOpenReceiptModal={(inv) => setReceiptModalInvoice(inv)}
              />
            )}

            {activeTab === 'customers' && (
              <CustomerView
                customers={customers}
                packages={packages}
                onAddCustomer={() => {
                  setCustomerModalData(null);
                  setIsCustomerModalOpen(true);
                }}
                onEditCustomer={(cust) => {
                  setCustomerModalData(cust);
                  setIsCustomerModalOpen(true);
                }}
                onDeleteCustomer={handleDeleteCustomer}
                onToggleIsolate={handleToggleCustomerIsolate}
                onCheckOpticalPower={handleRebootOnu}
                onSendWhatsappMessage={(cust) => {
                  const inv = invoices.find((i) => i.customerId === cust.id);
                  if (inv) handleSendInvoiceWa(inv);
                  else showToast('info', `Tidak ada tagihan tertunggak untuk ${cust.name}.`);
                }}
              />
            )}

            {activeTab === 'billing' && (
              <BillingView
                invoices={invoices}
                customers={customers}
                onGenerateBulkInvoices={handleGenerateBulkInvoices}
                onOpenPaymentModal={(inv) => setPaymentModalInvoice(inv)}
                onOpenReceiptModal={(inv) => setReceiptModalInvoice(inv)}
                onManualMarkPaid={handleManualMarkPaid}
                onSendInvoiceWa={handleSendInvoiceWa}
              />
            )}

            {activeTab === 'mikrotik' && (
              <MikrotikView
                mikrotik={mikrotik}
                sessions={sessions}
                customers={customers}
                onTestConnection={() => {
                  showToast('success', `Koneksi API ke MikroTik ${mikrotik.name} (${mikrotik.host}) normal. Latency 12ms.`);
                }}
                onKickSession={handleKickSession}
                onSyncSecrets={() => {
                  addSystemLog('MIKROTIK', 'success', 'Sinkronisasi seluruh PPPoE Secrets & Queues ke RouterOS berhasil.');
                  showToast('success', 'Seluruh database akun PPPoE telah tersinkronisasi ke MikroTik RouterOS.');
                }}
                onToggleCustomerIsolate={handleToggleCustomerIsolate}
                onUpdateConfig={(cfg) => setMikrotik((prev) => ({ ...prev, ...cfg }))}
              />
            )}

            {activeTab === 'olt' && (
              <OltView
                olts={olts}
                customers={customers}
                unconfiguredOnus={unconfiguredOnus}
                onRefreshOptical={handleRefreshOltPowers}
                onRebootOnu={handleRebootOnu}
                onProvisionOnu={handleProvisionOnu}
              />
            )}

            {activeTab === 'wa_gateway' && (
              <WaGatewayView
                config={waGateway}
                logs={waLogs}
                onUpdateConfig={(cfg) => setWaGateway((prev) => ({ ...prev, ...cfg }))}
                onSendTestMessage={handleSendTestMessage}
              />
            )}

            {activeTab === 'payment_gateway' && (
              <PaymentGatewayView
                config={paymentGateway}
                invoices={invoices}
                customers={customers}
                onUpdateConfig={(cfg) => setPaymentGateway((prev) => ({ ...prev, ...cfg }))}
                onSimulateWebhook={(invoiceId, method) => {
                  handlePaymentSuccess(
                    invoiceId,
                    method,
                    `WEBHOOK-${method.toUpperCase()}-${Date.now().toString().slice(-6)}`
                  );
                }}
              />
            )}

            {activeTab === 'tickets' && (
              <TicketView
                tickets={tickets}
                customers={customers}
                onAddTicket={handleAddTicket}
                onUpdateTicketStatus={handleUpdateTicketStatus}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-12 py-6 border-t border-slate-200 text-center text-xs text-slate-500 bg-white">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>PT Diandra Media Solusindo · Sistem Billing & Manajemen ISP Core</span>
          <div className="flex items-center gap-3 font-mono text-[11px] text-slate-400">
            <span>RouterOS v7.14</span>
            <span aria-hidden="true">·</span>
            <span>Huawei GPON MA5800</span>
            <span aria-hidden="true">·</span>
            <span>WA Engine v2.4</span>
            <span aria-hidden="true">·</span>
            <span>QRIS ASPI Compliant</span>
          </div>
        </div>
      </footer>

      {/* Modals */}
      {/* 1. Thermal Receipt & Invoice Print Modal */}
      {receiptModalInvoice && (
        <ThermalReceiptModal
          invoice={receiptModalInvoice}
          customer={customers.find((c) => c.id === receiptModalInvoice.customerId)}
          onClose={() => setReceiptModalInvoice(null)}
        />
      )}

      {/* 2. Payment Checkout & Webhook Simulator Modal */}
      {paymentModalInvoice && (
        <PaymentSimulatorModal
          invoice={paymentModalInvoice}
          customer={customers.find((c) => c.id === paymentModalInvoice.customerId)}
          onPaymentSuccess={handlePaymentSuccess}
          onClose={() => setPaymentModalInvoice(null)}
        />
      )}

      {/* 3. Customer Add / Edit Modal */}
      {isCustomerModalOpen && (
        <CustomerModal
          customer={customerModalData}
          packages={packages}
          olts={olts}
          mikrotik={mikrotik}
          onSave={handleSaveCustomer}
          onClose={() => {
            setIsCustomerModalOpen(false);
            setCustomerModalData(null);
          }}
        />
      )}
    </div>
  );
}
