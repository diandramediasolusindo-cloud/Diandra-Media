import React from 'react';
import {
  Wifi,
  Smartphone,
  Server,
  Layers,
  MessageSquare,
  CreditCard,
  LifeBuoy,
  Users,
  Receipt,
  Radio,
} from 'lucide-react';

export type ActiveTab =
  | 'dashboard'
  | 'customers'
  | 'billing'
  | 'mikrotik'
  | 'olt'
  | 'wa_gateway'
  | 'payment_gateway'
  | 'tickets';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  portalMode: boolean;
  setPortalMode: (mode: boolean) => void;
  mikrotikStatus: 'connected' | 'error' | 'connecting';
  waConnected: boolean;
  onQuickNewCustomer: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  portalMode,
  setPortalMode,
  mikrotikStatus,
  waConnected,
  onQuickNewCustomer,
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode }[] = [
    { id: 'dashboard', label: 'Ringkasan', icon: <Layers className="w-3.5 h-3.5" /> },
    { id: 'customers', label: 'Pelanggan', icon: <Users className="w-3.5 h-3.5" /> },
    { id: 'billing', label: 'Tagihan', icon: <Receipt className="w-3.5 h-3.5" /> },
    { id: 'mikrotik', label: 'MikroTik', icon: <Server className="w-3.5 h-3.5" /> },
    { id: 'olt', label: 'OLT GPON', icon: <Radio className="w-3.5 h-3.5" /> },
    { id: 'wa_gateway', label: 'WA Gateway', icon: <MessageSquare className="w-3.5 h-3.5" /> },
    { id: 'payment_gateway', label: 'Payment', icon: <CreditCard className="w-3.5 h-3.5" /> },
    { id: 'tickets', label: 'Tiket NOC', icon: <LifeBuoy className="w-3.5 h-3.5" /> },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        {/* Zone 1: Single text element wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-slate-950 flex items-center justify-center text-white font-bold text-sm shadow-xs">
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
              DiandraNet Billing
            </span>
          </div>

          {/* Quick Hardware Status (Unboxed subtle text) */}
          <div className="hidden lg:flex items-center gap-2 text-[11px] text-slate-500 pl-3 border-l border-slate-200">
            <span className="flex items-center gap-1 font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  mikrotikStatus === 'connected' ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
              />
              CCR1036
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              MA5800
            </span>
            <span aria-hidden="true">·</span>
            <span className="flex items-center gap-1 font-mono">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  waConnected ? 'bg-emerald-500' : 'bg-amber-500'
                }`}
              />
              WA Live
            </span>
          </div>
        </div>

        {/* Zone 2: Navigation Links (If in Admin mode) */}
        {!portalMode ? (
          <nav className="hidden md:flex items-center gap-1 text-xs font-medium text-slate-600">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors whitespace-nowrap ${
                  activeTab === item.id
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {item.icon}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        ) : (
          <div className="text-xs font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-md">
            Portal Mandiri Pelanggan (Self-Service)
          </div>
        )}

        {/* Zone 3: 1-2 Primary Actions */}
        <div className="flex items-center gap-2">
          {/* Toggle between Admin Panel and Customer Portal */}
          <button
            onClick={() => setPortalMode(!portalMode)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border transition-all whitespace-nowrap ${
              portalMode
                ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>{portalMode ? 'Kembali ke Admin' : 'Lihat Portal Pelanggan'}</span>
          </button>

          {!portalMode && (
            <button
              onClick={onQuickNewCustomer}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors whitespace-nowrap shadow-xs"
            >
              + Pelanggan Baru
            </button>
          )}
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      {!portalMode && (
        <div className="md:hidden overflow-x-auto flex items-center gap-1 px-4 py-2 bg-slate-50 border-t border-slate-200">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-1 px-2.5 py-1 text-xs rounded-md whitespace-nowrap transition-colors ${
                activeTab === item.id
                  ? 'bg-slate-900 text-white font-medium'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}
    </header>
  );
};
