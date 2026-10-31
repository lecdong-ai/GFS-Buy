export type DateRangePeriod = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'half' | 'yearly';

export function formatDate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function getDateRangeForPeriod(baseDate: Date, period: DateRangePeriod): { startDate: string; endDate: string } {
  const year = baseDate.getFullYear();
  const month = baseDate.getMonth(); // 0-indexed
  const date = baseDate.getDate();

  switch (period) {
    case 'daily': {
      const s = formatDate(baseDate);
      return { startDate: s, endDate: s };
    }
    case 'weekly': {
      // Monday to Sunday or recent 7 days
      const day = baseDate.getDay(); // 0 is Sun, 1 is Mon...
      const diffToMon = day === 0 ? -6 : 1 - day;
      const mon = new Date(year, month, date + diffToMon);
      const sun = new Date(year, month, date + diffToMon + 6);
      return { startDate: formatDate(mon), endDate: formatDate(sun) };
    }
    case 'monthly': {
      const first = new Date(year, month, 1);
      const last = new Date(year, month + 1, 0);
      return { startDate: formatDate(first), endDate: formatDate(last) };
    }
    case 'quarterly': {
      const q = Math.floor(month / 3);
      const first = new Date(year, q * 3, 1);
      const last = new Date(year, (q + 1) * 3, 0);
      return { startDate: formatDate(first), endDate: formatDate(last) };
    }
    case 'half': {
      const h = month < 6 ? 0 : 6;
      const first = new Date(year, h, 1);
      const last = new Date(year, h + 6, 0);
      return { startDate: formatDate(first), endDate: formatDate(last) };
    }
    case 'yearly': {
      const first = new Date(year, 0, 1);
      const last = new Date(year, 11, 31);
      return { startDate: formatDate(first), endDate: formatDate(last) };
    }
    default:
      return { startDate: formatDate(baseDate), endDate: formatDate(baseDate) };
  }
}

export function shiftDate(baseDate: Date, period: DateRangePeriod, direction: -1 | 1): Date {
  const d = new Date(baseDate);
  switch (period) {
    case 'daily':
      d.setDate(d.getDate() + direction);
      break;
    case 'weekly':
      d.setDate(d.getDate() + direction * 7);
      break;
    case 'monthly':
      d.setMonth(d.getMonth() + direction);
      break;
    case 'quarterly':
      d.setMonth(d.getMonth() + direction * 3);
      break;
    case 'half':
      d.setMonth(d.getMonth() + direction * 6);
      break;
    case 'yearly':
      d.setFullYear(d.getFullYear() + direction);
      break;
  }
  return d;
}

