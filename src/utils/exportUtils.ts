import { Customer, Invoice } from '../types/isp';

/**
 * Escapes CSV field value to prevent delimiters and quotes from breaking columns
 */
const escapeCsv = (val: string | number | undefined | null): string => {
  if (val === undefined || val === null) return '""';
  const str = String(val).replace(/"/g, '""');
  return `"${str}"`;
};

/**
 * Triggers a client-side file download with UTF-8 BOM so Microsoft Excel
 * immediately parses characters, commas, and Indonesian text correctly.
 */
const downloadFile = (content: string, filename: string, mimeType = 'text/csv;charset=utf-8;') => {
  const blob = new Blob(['\uFEFF' + content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Exports full customer database to accounting-friendly CSV format
 */
export const exportCustomersToCsv = (customers: Customer[], filenamePrefix = 'Data_Pelanggan_DiandraNet') => {
  const headers = [
    'ID Pelanggan',
    'Nama Lengkap',
    'No WhatsApp',
    'Email',
    'Alamat Pemasangan',
    'Paket Internet',
    'Download (Mbps)',
    'Upload (Mbps)',
    'Tarif Bulanan (IDR)',
    'Username PPPoE',
    'Password PPPoE',
    'IP Address',
    'MAC Address',
    'OLT Headend',
    'Port PON',
    'SN Modem ONU',
    'Redaman Optik (dBm)',
    'Nama ODP',
    'Port ODP',
    'Status Layanan',
    'Tanggal Pasang',
    'Tanggal Jatuh Tempo',
    'Isolir Otomatis',
  ];

  const rows = customers.map((c) => [
    escapeCsv(c.id),
    escapeCsv(c.name),
    escapeCsv(c.phone),
    escapeCsv(c.email || '-'),
    escapeCsv(c.address),
    escapeCsv(c.package.name),
    escapeCsv(c.package.speedDownload),
    escapeCsv(c.package.speedUpload),
    escapeCsv(c.package.price),
    escapeCsv(c.pppoeUsername),
    escapeCsv(c.pppoePassword),
    escapeCsv(c.ipAddress),
    escapeCsv(c.macAddress),
    escapeCsv(c.oltId),
    escapeCsv(c.ponPort),
    escapeCsv(c.onuSerialNumber),
    escapeCsv(c.onuRxPower),
    escapeCsv(c.odpName),
    escapeCsv(c.odpPort),
    escapeCsv(c.status.toUpperCase()),
    escapeCsv(c.joinDate),
    escapeCsv(c.billingDueDate),
    escapeCsv(c.autoIsolate ? 'YA' : 'TIDAK'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `${filenamePrefix}_${dateStr}.csv`);
};

/**
 * Exports billing & invoice reports to accounting-friendly CSV format
 */
export const exportBillingReportToCsv = (
  invoices: Invoice[],
  customers?: Customer[],
  filenamePrefix = 'Laporan_Billing_Keuangan_DiandraNet'
) => {
  const headers = [
    'No Faktur Invoice',
    'ID Pelanggan',
    'Nama Pelanggan',
    'No WhatsApp',
    'Paket Layanan',
    'Kecepatan',
    'Periode Tagihan',
    'Biaya Pokok Langganan (IDR)',
    'Biaya Admin Gateway (IDR)',
    'Total Nominal Tagihan (IDR)',
    'Tanggal Jatuh Tempo',
    'Status Pembayaran',
    'Tanggal Pelunasan',
    'Metode Pembayaran',
    'Nomor Referensi Gateway / Kasir',
    'Catatan Faktur',
  ];

  const rows = invoices.map((inv) => [
    escapeCsv(inv.id),
    escapeCsv(inv.customerId),
    escapeCsv(inv.customerName),
    escapeCsv(inv.customerPhone),
    escapeCsv(inv.packageName),
    escapeCsv(inv.packageSpeed),
    escapeCsv(inv.periodMonth),
    escapeCsv(inv.amount),
    escapeCsv(inv.adminFee),
    escapeCsv(inv.totalAmount),
    escapeCsv(inv.dueDate),
    escapeCsv(
      inv.status === 'paid'
        ? 'LUNAS (PAID)'
        : inv.status === 'overdue'
        ? 'TERLAMBAT (OVERDUE)'
        : 'BELUM BAYAR (UNPAID)'
    ),
    escapeCsv(inv.paidAt || '-'),
    escapeCsv(inv.paymentMethod ? inv.paymentMethod.toUpperCase() : '-'),
    escapeCsv(inv.paymentRef || '-'),
    escapeCsv(inv.notes || '-'),
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\r\n');
  const dateStr = new Date().toISOString().split('T')[0];
  downloadFile(csvContent, `${filenamePrefix}_${dateStr}.csv`);
};
