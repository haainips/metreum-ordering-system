const rtf = new Intl.RelativeTimeFormat("id-ID", { numeric: "auto" });

export function formatTimeAgo(date: string | Date) {
  const d = typeof date === "string" ? new Date(date) : date;
  const diffInSeconds = Math.round((Date.now() - d.getTime()) / 1000);

  if (diffInSeconds < 5) return "baru saja";

  const diffInMinutes = Math.round(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return rtf.format(-diffInMinutes, "minute"); // contoh: "5 menit yang lalu"
  }

  const diffInHours = Math.round(diffInMinutes / 60);
  if (diffInHours < 24) {
    return rtf.format(-diffInHours, "hour"); // "3 jam yang lalu"
  }

  const diffInDays = Math.round(diffInHours / 24);
  return rtf.format(-diffInDays, "day"); // "2 hari yang lalu"
}
