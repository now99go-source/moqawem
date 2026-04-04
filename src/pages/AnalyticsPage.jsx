import { useEffect, useState, useMemo } from "react";
import { base44 } from "@/api/base44Client";
import {
  RadialBarChart, RadialBar, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  Cell, PieChart, Pie, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Award, AlertTriangle, FileCheck, Zap } from "lucide-react";

const DOMAIN_META = [
  { name: "الإدارة المدرسية", short: "إدارة", color: "#7C3AED", total: 15 },
  { name: "التعليم والتعلم", short: "تعليم", color: "#2563EB", total: 13 },
  { name: "نواتج التعلم",    short: "نواتج", color: "#16A34A", total: 13 },
  { name: "البيئة المدرسية", short: "بيئة",  color: "#EA580C", total: 6  },
];

const LEVEL_WEIGHT = { "تميز": 4, "تقدم": 3, "انطلاق": 2, "تهيئة": 1, "لم يُقيَّم": 0 };

function computeDomainStats(indicators, evidence) {
  return DOMAIN_META.map(dm => {
    const domInds = indicators.filter(i =>
      i.domain_id && (i.domain_id.toLowerCase().includes(dm.short.slice(0,3)) ||
      dm.name.split(" ").some(w => i.domain_id.includes(w)))
    );
    const total = domInds.length || dm.total;
    const completed = domInds.filter(i => i.status === "مكتمل").length;
    const pct = total > 0 ? Math.round((completed / total) * 100) : 0;
    const avgScore = domInds.length > 0
      ? Math.round(domInds.reduce((s, i) => s + (i.score_percentage || 0), 0) / domInds.length)
      : 0;
    const weightedScore = domInds.length > 0
      ? Math.round(domInds.reduce((s, i) => s + (LEVEL_WEIGHT[i.performance_level] || 0), 0) / (domInds.length * 4) * 100)
      : 0;
    const evidenceCount = evidence.filter(e =>
      domInds.some(ind => ind.id === e.indicator_id || ind.code === e.indicator_code)
    ).length;
    const evidencePct = total > 0 ? Math.round((evidenceCount / total) * 100) : 0;
    return { ...dm, total, completed, pct, avgScore, weightedScore, evidenceCount, evidencePct };
  });
}

function KpiCard({ label, value, sub, icon: Icon, color, trend }) {
  return (
    <div className="bg-card border border-border rounded-xl p-4 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0`} style={{ background: color + "22" }}>
        <Icon size={20} style={{ color }} />
      </div>
      <div className="flex-1 min-w-0">
        <div className="text-xs text-muted-foreground">{label}</div>
        <div className="text-2xl font-bold leading-tight">{value}</div>
        {sub && <div className="text-xs text-muted-foreground mt-0.5">{sub}</div>}
      </div>
      {trend !== undefined && (
        <div className={`text-sm font-bold ${trend >= 50 ? "text-green-600" : "text-orange-500"}`}>
          {trend}%
        </div>
      )}
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 text-sm shadow-lg" dir="rtl">
        <p className="font-semibold mb-1">{label}</p>
        {payload.map(p => (
          <p key={p.name} style={{ color: p.color }}>{p.name}: {p.value}%</p>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [indicators, setIndicators] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Indicator.list(),
      base44.entities.Evidence.list(),
    ]).then(([ind, ev]) => {
      setIndicators(ind);
      setEvidence(ev);
      setLoading(false);
    });
  }, []);

  const domains = useMemo(() => computeDomainStats(indicators, evidence), [indicators, evidence]);

  const totalInd = indicators.length || 52;
  const completedInd = indicators.filter(i => i.status === "مكتمل").length;
  const overallPct = Math.round((completedInd / totalInd) * 100);
  const completedEvidence = evidence.filter(e => e.status === "مكتمل").length;
  const rated = indicators.filter(i => i.performance_level !== "لم يُقيَّم").length;

  // Sorted by completion speed (pct)
  const sorted = [...domains].sort((a, b) => b.pct - a.pct);
  const avgPct = domains.reduce((s, d) => s + d.pct, 0) / domains.length || 0;
  const slowDomains = domains.filter(d => d.pct < avgPct * 0.7);

  // Performance level distribution for pie
  const levelDist = ["تميز", "تقدم", "انطلاق", "تهيئة", "لم يُقيَّم"].map(level => ({
    name: level,
    value: indicators.filter(i => i.performance_level === level).length,
    color: level === "تميز" ? "#16A34A" : level === "تقدم" ? "#2563EB" : level === "انطلاق" ? "#EA580C" : level === "تهيئة" ? "#DC2626" : "#9CA3AF",
  })).filter(l => l.value > 0);

  // Radial data for domains
  const radialData = domains.map(d => ({ name: d.short, pct: d.pct, fill: d.color }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">لوحة المعلومات التحليلية</h1>
          <p className="text-muted-foreground text-sm mt-1">مؤشرات أداء شاملة لحالة إنجاز المعايير والشواهد</p>
        </div>
        <div className="flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-primary">1446/1447هـ</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="الإنجاز الكلي" value={`${overallPct}%`} sub={`${completedInd} من ${totalInd} مؤشر`} icon={Award} color="#7C3AED" trend={overallPct} />
        <KpiCard label="المؤشرات المُقيَّمة" value={rated} sub={`من أصل ${totalInd}`} icon={TrendingUp} color="#2563EB" trend={Math.round(rated/totalInd*100)} />
        <KpiCard label="الشواهد المكتملة" value={completedEvidence} sub={`من ${evidence.length} شاهد`} icon={FileCheck} color="#16A34A" trend={evidence.length > 0 ? Math.round(completedEvidence/evidence.length*100) : 0} />
        <KpiCard label="متوسط تكامل الشواهد" value={`${Math.round(domains.reduce((s,d)=>s+d.evidencePct,0)/domains.length)}%`} sub="نسبة تغطية المؤشرات" icon={Zap} color="#EA580C" />
      </div>

      {/* Top / Bottom domains */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp size={18} className="text-green-600" />
            <h3 className="font-bold">الأعلى إنجازاً</h3>
          </div>
          <div className="space-y-3">
            {sorted.slice(0, 2).map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{d.name}</span>
                  <span className="font-bold" style={{ color: d.color }}>{d.pct}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{d.completed} مؤشر مكتمل من {d.total} • {d.evidenceCount} شاهد</div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown size={18} className="text-red-500" />
            <h3 className="font-bold">الأقل إنجازاً</h3>
          </div>
          <div className="space-y-3">
            {sorted.slice(-2).reverse().map(d => (
              <div key={d.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-medium">{d.name}</span>
                  <span className="font-bold" style={{ color: d.color }}>{d.pct}%</span>
                </div>
                <div className="w-full bg-secondary rounded-full h-2.5">
                  <div className="h-2.5 rounded-full transition-all" style={{ width: `${d.pct}%`, background: d.color }} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{d.completed} مؤشر مكتمل من {d.total} • {d.evidenceCount} شاهد</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Completion per domain bar chart */}
        <div className="lg:col-span-2 bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold mb-4">مقارنة الإنجاز والشواهد لكل مجال</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={domains.map(d => ({ name: d.short, "نسبة الإنجاز": d.pct, "تكامل الشواهد": d.evidencePct, "الأداء المرجح": d.weightedScore }))} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,88%)" />
              <XAxis dataKey="name" tick={{ fontSize: 12, fontFamily: "Tajawal" }} />
              <YAxis tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Tajawal" }} />
              <Bar dataKey="نسبة الإنجاز" fill="#7C3AED" radius={[4, 4, 0, 0]} />
              <Bar dataKey="تكامل الشواهد" fill="#16A34A" radius={[4, 4, 0, 0]} />
              <Bar dataKey="الأداء المرجح" fill="#2563EB" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Level distribution pie */}
        <div className="bg-card border border-border rounded-xl p-5">
          <h3 className="font-bold mb-4">توزيع مستويات الأداء</h3>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={levelDist} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="value" paddingAngle={3}>
                {levelDist.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip formatter={(val, name) => [`${val} مؤشر`, name]} />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex flex-wrap gap-2 justify-center mt-2">
            {levelDist.map(l => (
              <span key={l.name} className="flex items-center gap-1 text-xs">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: l.color }} />
                {l.name} ({l.value})
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Speed / slow domains alert */}
      {slowDomains.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle size={18} className="text-orange-600" />
            <h3 className="font-bold text-orange-800">مجالات تحتاج تسريع التنفيذ</h3>
          </div>
          <p className="text-sm text-orange-700 mb-3">المجالات التالية أقل من 70% من متوسط سرعة الإنجاز ({Math.round(avgPct)}%)</p>
          <div className="flex flex-wrap gap-3">
            {slowDomains.map(d => (
              <div key={d.name} className="bg-white border border-orange-200 rounded-lg px-3 py-2 text-sm">
                <span className="font-semibold" style={{ color: d.color }}>{d.name}</span>
                <span className="text-muted-foreground mr-2">({d.pct}%)</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Detailed domain table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <h3 className="font-bold">تفاصيل المجالات — نسبة إنجاز المؤشرات وتكامل الشواهد</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-secondary text-xs text-muted-foreground">
              <tr>
                <th className="text-right px-5 py-3 font-semibold">المجال</th>
                <th className="text-center px-4 py-3 font-semibold">المؤشرات</th>
                <th className="text-center px-4 py-3 font-semibold">المكتمل</th>
                <th className="text-center px-4 py-3 font-semibold">نسبة الإنجاز</th>
                <th className="text-center px-4 py-3 font-semibold">الشواهد</th>
                <th className="text-center px-4 py-3 font-semibold">تكامل الشواهد</th>
                <th className="text-center px-4 py-3 font-semibold">الأداء المرجح</th>
                <th className="text-center px-4 py-3 font-semibold">مستوى السرعة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {sorted.map((d, idx) => {
                const speedTag = d.pct >= avgPct * 1.1 ? { label: "سريع", cls: "bg-green-100 text-green-700" }
                  : d.pct < avgPct * 0.7 ? { label: "بطيء", cls: "bg-red-100 text-red-700" }
                  : { label: "متوسط", cls: "bg-blue-100 text-blue-700" };
                return (
                  <tr key={d.name} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: d.color }} />
                        <span className="font-medium text-sm">{d.name}</span>
                        {idx === 0 && <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">الأعلى</span>}
                        {idx === sorted.length - 1 && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">الأقل</span>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{d.total}</td>
                    <td className="px-4 py-3 text-center text-sm font-medium">{d.completed}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <div className="w-16 bg-secondary rounded-full h-1.5">
                          <div className="h-1.5 rounded-full" style={{ width: `${d.pct}%`, background: d.color }} />
                        </div>
                        <span className="text-sm font-bold" style={{ color: d.color }}>{d.pct}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{d.evidenceCount}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-sm font-bold ${d.evidencePct >= 70 ? "text-green-600" : d.evidencePct >= 40 ? "text-orange-500" : "text-red-500"}`}>
                        {d.evidencePct}%
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center text-sm">{d.weightedScore}%</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${speedTag.cls}`}>{speedTag.label}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}