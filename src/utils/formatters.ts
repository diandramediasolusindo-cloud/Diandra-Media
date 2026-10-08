export const formatIDR = (value: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('id-ID').format(value);
};

export const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export const getRxPowerQuality = (rxPower: number): {
  label: 'Bagus' | 'Waspada' | 'Kritis' | 'LOS';
  color: string;
  badgeBg: string;
} => {
  if (rxPower > -24 && rxPower < -12) {
    return { label: 'Bagus', color: 'text-emerald-700', badgeBg: 'bg-emerald-50 border-emerald-200' };
  } else if (rxPower <= -24 && rxPower >= -27) {
    return { label: 'Waspada', color: 'text-amber-700', badgeBg: 'bg-amber-50 border-amber-200' };
  } else {
    return { label: 'Kritis', color: 'text-rose-700', badgeBg: 'bg-rose-50 border-rose-200' };
  }
};
