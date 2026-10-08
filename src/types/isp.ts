export type CustomerStatus = 'aktif' | 'isolir' | 'nonaktif' | 'registrasi';

export type ConnectionType = 'pppoe' | 'hotspot' | 'static';

export interface InternetPackage {
  id: string;
  name: string;
  speedDownload: number; // in Mbps
  speedUpload: number; // in Mbps
  price: number; // IDR
  mikrotikProfile: string;
  description: string;
}

export interface Customer {
  id: string; // e.g. CUST-0101
  name: string;
  phone: string; // WA number e.g. 081234567890
  email: string;
  address: string;
  connectionType: ConnectionType;
  packageId: string;
  package: InternetPackage;
  pppoeUsername: string;
  pppoePassword: string;
  ipAddress: string;
  macAddress: string;
  routerId: string;
  oltId: string;
  ponPort: string; // e.g. PON 1/1/2
  onuSerialNumber: string; // e.g. ZTEGC1849182
  onuRxPower: number; // dBm e.g. -19.4
  odpName: string; // e.g. ODP-MRH-03/08
  odpPort: number;
  latitude: number;
  longitude: number;
  status: CustomerStatus;
  joinDate: string;
  billingDueDate: number; // date of month e.g. 10 or 20
  autoIsolate: boolean;
}

export type InvoiceStatus = 'unpaid' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string; // INV-2026-0801
  customerId: string;
  customerName: string;
  customerPhone: string;
  packageName: string;
  packageSpeed: string;
  periodMonth: string; // e.g. "Agustus 2026"
  amount: number; // IDR
  adminFee: number;
  totalAmount: number;
  dueDate: string; // e.g. "2026-08-10"
  paidAt?: string;
  paymentMethod?: 'qris' | 'va_bca' | 'va_mandiri' | 'va_bri' | 'cash' | 'transfer';
  paymentRef?: string;
  status: InvoiceStatus;
  notes?: string;
  pdfGenerated?: boolean;
}

export interface MikrotikConfig {
  id: string;
  name: string;
  host: string;
  apiPort: number;
  username: string;
  password: string;
  useSsl: boolean;
  isolateProfile: string;
  defaultProfile: string;
  status: 'connected' | 'error' | 'connecting';
  lastPingMs: number;
  cpuLoad: number;
  freeMemoryMB: number;
  totalMemoryMB: number;
  uptime: string;
  version: string;
  boardName: string;
}

export interface PppoeActiveSession {
  id: string;
  username: string;
  ipAddress: string;
  callerId: string; // MAC
  uptime: string;
  rxBytes: number;
  txBytes: number;
  rxRateMbps: number;
  txRateMbps: number;
  service: string;
}

export interface OltConfig {
  id: string;
  name: string;
  brand: 'Huawei' | 'ZTE' | 'VSOL' | 'Fiberhome' | 'BDCOM';
  model: string;
  ipHost: string;
  port: number;
  protocol: 'SNMP' | 'Telnet' | 'SSH';
  communityOrUser: string;
  status: 'online' | 'offline';
  temperatureC: number;
  ponCount: number;
  activeOnus: number;
  offlineOnus: number;
  losOnus: number;
}

export interface UnconfiguredOnu {
  id: string;
  oltId: string;
  ponPort: string;
  serialNumber: string;
  vendor: string;
  discoveredAt: string;
  rxPower: number;
}

export interface WaGatewayConfig {
  provider: 'Fonnte' | 'MPWA' | 'Wablas' | 'GenericWebhook';
  apiKey: string;
  senderNumber: string;
  endpointUrl: string;
  serverDomain?: string;
  connected: boolean;
  batteryLevel?: number;
  templates: {
    tagihanTerbit: string;
    pengingatHMin3: string;
    pengingatHariH: string;
    notifikasiIsolir: string;
    kuitansiLunas: string;
    maintenanceNotice: string;
  };
}

export interface WaMessageLog {
  id: string;
  to: string;
  recipientName: string;
  category: 'tagihan' | 'pengingat' | 'isolir' | 'lunas' | 'broadcast' | 'test';
  message: string;
  sentAt: string;
  status: 'delivered' | 'read' | 'pending' | 'failed';
}

export interface PaymentGatewayConfig {
  provider: 'Midtrans' | 'Xendit' | 'Tripay' | 'QRIS_Dinamis';
  merchantId: string;
  clientKey: string;
  serverKey: string;
  webhookSecret: string;
  webhookUrl: string;
  isActive: boolean;
  isSandbox: boolean;
  enableQris: boolean;
  enableVa: boolean;
  enableEwallet: boolean;
}

export interface NetworkTicket {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  category: 'LOS Red' | 'Redaman Drop' | 'Lambat / RTO' | 'Kabel Putus' | 'Router Error';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_progress' | 'resolved';
  description: string;
  assignedTechnician?: string;
  createdAt: string;
  resolvedAt?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  source: 'MIKROTIK' | 'OLT' | 'WA_GATEWAY' | 'PAYMENT_GATEWAY' | 'SYSTEM';
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  details?: string;
}
