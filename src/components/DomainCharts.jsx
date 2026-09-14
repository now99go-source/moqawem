import { BarChart, Bar, RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend } from "recharts";
import { BarChart3, Radar as RadarIcon } from "lucide-react";

const DOMAIN_DEFS = [
  { key: "الإدارة",   name: "الإدارة المدرسية", color: "#7c3aed" },
  { key: "التعليم",   name: "التعليم والتعلم",  color: "#2563eb" },
  { key: "نواتج",     name: "نواتج التعلم",     color: "#16a34a" },
  { key: "البيئة",    name: "البيئة المدرسية",  color: "#ea580c" },
];

function matchDomain(domainId = "") {
  const s = String(domainId);
  if (s.includes("الإدارة") || s.includes("ادارة") || s.includes("1")) return DOMAIN_DEFS[0];
  if (s.includes("التعليم") || s.includes("تعليم") || s.includes("2")) return DOMAIN_DEFS[1];
  if (s.includes("نواتج") || s.includes("3")) return DOMAIN_DEFS[2];
  if (s.includes("البيئة") || s.includes("بيئة") || s.includes("4")) return DOMAIN_DEFS[3];
  return null;
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload;
  return (
    <div className="bg-card border border-border rounded-lg shadow-xl px-3 py-2 text-xs" dir="rtl">
      <div className="font-bold mb-1" style={{ color: d.color }}>{d.name}</div>
      <div>نسبة الإنجاز: <span className="font-bold">{d.pct}%</span></div>
      <div>المُقيَّم: <span className="font-bold">{d.evaluated}</span> / {d.total}</div>
      <div>مؤشرات التميز: <span className="font-bold text-green-600">{d.tamayuz}</span></div>
    </div>
  );
}

export default function DomainCharts({ indicators }) {
  const data = DOMAIN_DEFS.map(def => {
    const inds = indicators.filter(i => matchDomain(i.domain_id)?.key === def.key);
    const total = inds.length;
    const evaluated = inds.filter(i => i.performance_level && i.performance_level !== "لم يُقيَّم").length;
    const tamayuz = inds.filter(i => i.performance_level === "تميز").length;
    const pct = total > 0 ? Math.round((evaluated / total) * 100) : 0;
    return { name: def.name, short: def.key, color: def.color, total, evaluated, tamayuz, pct };
  });

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Bar chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <BarChart3 size={18} className="text-primary" />
          نسب إنجاز المجالات
        </h3>
        <div style={{ width: "100%", height: 280 }} dir="rtl">
          <ResponsiveContainer>
            <BarChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="short" tick={{ fontSize: 12, fontFamily: "Tajawal" }} stroke="hsl(var(--muted-foreground))" />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" unit="%" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "hsl(var(--secondary) / 0.4)" }} />
              <Bar dataKey="pct" radius={[8, 8, 0, 0]} maxBarSize={70}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Radar chart */}
      <div className="bg-card rounded-xl border border-border p-5">
        <h3 className="font-bold mb-4 flex items-center gap-2">
          <RadarIcon size={18} className="text-primary" />
          مقارنة المجالات (راداري)
        </h3>
        <div style={{ width: "100%", height: 280 }} dir="rtl">
          <ResponsiveContainer>
            <RadarChart data={data} margin={{ top: 10, right: 30, left: 30, bottom: 10 }}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="short" tick={{ fontSize: 12, fontFamily: "Tajawal" }} stroke="hsl(var(--muted-foreground))" />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} stroke="hsl(var(--muted-foreground))" unit="%" />
              <Radar name="نسبة الإنجاز" dataKey="pct" stroke="#7c3aed" fill="#7c3aed" fillOpacity={0.35} />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}