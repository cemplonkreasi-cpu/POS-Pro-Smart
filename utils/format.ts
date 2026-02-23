export function formatCurrency(amount: number): string {
  return 'Rp ' + amount.toLocaleString('id-ID');
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
}

export function formatDateTime(dateStr: string): string {
  return formatDate(dateStr) + ' ' + formatTime(dateStr);
}

export function generateInvoiceNo(): string {
  const now = new Date();
  const date = now.toISOString().slice(0, 10).replace(/-/g, '');
  const rand = Math.floor(Math.random() * 999).toString().padStart(3, '0');
  return `INV-${date}-${rand}`;
}
