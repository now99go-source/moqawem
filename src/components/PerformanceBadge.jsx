export default function PerformanceBadge({ level, size = "sm" }) {
  const config = {
    "تهيئة": { cls: "badge-tah2ia", icon: "⬇", pct: "< 50%" },
    "انطلاق": { cls: "badge-intilaaq", icon: "→", pct: "50-74%" },
    "تقدم": { cls: "badge-taqadum", icon: "↑", pct: "75-89%" },
    "تميز": { cls: "badge-tamayuz", icon: "★", pct: "≥ 90%" },
    "لم يُقيَّم": { cls: "badge-unrated", icon: "○", pct: "" },
  };
  const c = config[level] || config["لم يُقيَّم"];
  const padding = size === "lg" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium ${padding} ${c.cls}`}>
      <span>{c.icon}</span>
      <span>{level}</span>
    </span>
  );
}