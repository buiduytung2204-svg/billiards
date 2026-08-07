export function formatVND(amount: number): string {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

export function formatDateTime(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

export function formatTimeOnly(isoString?: string | null): string {
  if (!isoString) return '--:--';
  const date = new Date(isoString);
  return date.toLocaleTimeString('vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function calculateDuration(startTimeIso?: string | null, endTimeIso?: string | null) {
  if (!startTimeIso) return { hours: 0, minutes: 0, seconds: 0, totalMinutes: 0, formatted: '00:00:00' };

  const start = new Date(startTimeIso).getTime();
  const end = endTimeIso ? new Date(endTimeIso).getTime() : Date.now();
  const diffMs = Math.max(0, end - start);

  const totalSeconds = Math.floor(diffMs / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.max(1, Math.ceil(totalSeconds / 60));

  const pad = (n: number) => n.toString().padStart(2, '0');
  const formatted = `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;

  return { hours, minutes, seconds, totalMinutes, formatted };
}

export function calculateRealtimeTableFee(startTimeIso: string | null | undefined, hourlyPrice: number) {
  if (!startTimeIso) return 0;
  const { totalMinutes } = calculateDuration(startTimeIso);
  return Math.round((hourlyPrice / 60) * totalMinutes);
}
