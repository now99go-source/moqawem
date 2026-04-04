import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import StatsCard from "../components/StatsCard";
import PerformanceBadge from "../components/PerformanceBadge";
import { BookOpen, FileText, CheckSquare, TrendingUp, AlertCircle, Clock, CheckCircle2, School } from "lucide-react";

const DOMAINS_DATA = [
  { name: "الإدارة المدرسية", color: "bg-purple-500", indicators: 15 },
  { name: "التعليم والتعلم", color: "bg-blue-500", indicators: 13 },
  { name: "نواتج التعلم", color: "bg-green-500", indicators: 13 },
  { name: "البيئة المدرسية", color: "bg-orange-500", indicators: 6 },
];

export default function Dashboard() {
  const [indicators, setIndicators] = useState([]);
  const [evidence, setEvidence] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [improvements, setImprovements] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      base44.entities.Indicator.list(),
      base44.entities.Evidence.list(),
      base44.entities.Task.list(),
      base44.entities.ImprovementPlan.list(),
    ]).then(([ind, ev, tsk, imp]) => {
      setIndicators(ind);
      setEvidence(ev);
      setTasks(tsk);
      setImprovements(imp);
      setLoading(false);
    });
  }, []);

  const completedIndicators = indicators.filter(i => i.status === "مكتمل").length;
  const totalIndicators = indicators.length || 52;
  const completionPct = totalIndicators > 0 ? Math.round((completedIndicators / totalIndicators) * 100) : 0;

  const levelCounts = {
    "تميز": indicators.filter(i => i.performance_level === "تميز").length,
    "تقدم": indicators.filter(i => i.performance_level === "تقدم").length,
    "انطلاق": indicators.filter(i => i.performance_level === "انطلاق").length,
    "تهيئة": indicators.filter(i => i.performance_level === "تهيئة").length,
  };

  const pendingTasks = tasks.filter(t => t.status !== "مكتملة").length;
  const urgentTasks = tasks.filter(t => t.priority === "عاجل" && t.status !== "مكتملة").length;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-muted-foreground text-sm">جارٍ تحميل البيانات...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">لوحة التحكم</h1>
          <p className="text-muted-foreground text-sm mt-1">التقويم الذاتي المدرسي — هيئة تقويم التعليم والتدريب</p>
        </div>
        <div className="hidden md:flex items-center gap-2 bg-card border border-border rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">العام الدراسي 1446/1447هـ</span>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="bg-card rounded-xl border border-border p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="font-bold text-lg">نسبة الإنجاز الإجمالية</h2>
            <p className="text-muted-foreground text-sm">إجمالي المؤشرات المكتملة من الكلي</p>
          </div>
          <div className="text-4xl font-bold text-primary">{completionPct}%</div>
        </div>
        <div className="w-full bg-secondary rounded-full h-3">
          <div
            className="h-3 rounded-full transition-all duration-1000"
            style={{
              width: `${completionPct}%`,
              background: "linear-gradient(90deg, hsl(247,55%,36%) 0%, hsl(174,60%,35%) 100%)"
            }}
          />
        </div>
        <div className="flex justify-between mt-2 text-xs text-muted-foreground">
          <span>التهيئة 0%</span>
          <span>الانطلاق 50%</span>
          <span>التقدم 75%</span>
          <span>التميز 90%</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="المؤشرات المكتملة" value={`${completedIndicators}/${totalIndicators || 52}`} icon={BookOpen} color="primary" trend={completionPct} />
        <StatsCard title="الشواهد المرفوعة" value={evidence.length} subtitle={`${evidence.filter(e=>e.status==="مكتمل").length} مكتمل`} icon={FileText} color="green" />
        <StatsCard title="التكليفات المعلقة" value={pendingTasks} subtitle={`${urgentTasks} عاجل`} icon={CheckSquare} color={urgentTasks > 0 ? "red" : "orange"} />
        <StatsCard title="خطط التحسين" value={improvements.length} subtitle={`${improvements.filter(i=>i.status==="جارية").length} جارية`} icon={TrendingUp} color="blue" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance Levels */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <BookOpen size={18} className="text-primary" />
            توزيع مستويات الأداء
          </h3>
          <div className="space-y-3">
            {[
              { level: "تميز", count: levelCounts["تميز"], color: "bg-green-500", total: totalIndicators },
              { level: "تقدم", count: levelCounts["تقدم"], color: "bg-blue-500", total: totalIndicators },
              { level: "انطلاق", count: levelCounts["انطلاق"], color: "bg-orange-500", total: totalIndicators },
              { level: "تهيئة", count: levelCounts["تهيئة"], color: "bg-red-500", total: totalIndicators },
            ].map(({ level, count, color, total }) => (
              <div key={level} className="flex items-center gap-3">
                <PerformanceBadge level={level} />
                <div className="flex-1 bg-secondary rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${color} transition-all`}
                    style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }}
                  />
                </div>
                <span className="text-sm font-medium w-6 text-left">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Domains Progress */}
        <div className="bg-card rounded-xl border border-border p-5">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <School size={18} className="text-primary" />
            المجالات الأربعة
          </h3>
          <div className="space-y-3">
            {DOMAINS_DATA.map((domain) => {
              const domainIndicators = indicators.filter(i => i.domain_id?.includes(domain.name.split(" ")[0]));
              const domainCompleted = domainIndicators.filter(i => i.status === "مكتمل").length;
              const pct = domainIndicators.length > 0 ? Math.round((domainCompleted / domainIndicators.length) * 100) : 0;
              return (
                <div key={domain.name}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{domain.name}</span>
                    <span className="text-muted-foreground">{pct}%</span>
                  </div>
                  <div className="w-full bg-secondary rounded-full h-2">
                    <div className={`h-2 rounded-full ${domain.color} transition-all`} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="bg-card rounded-xl border border-border p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold flex items-center gap-2">
            <CheckSquare size={18} className="text-primary" />
            آخر التكليفات
          </h3>
          <Link to="/tasks" className="text-primary text-sm hover:underline">عرض الكل</Link>
        </div>
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle2 size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">لا توجد تكليفات بعد</p>
            <Link to="/tasks" className="text-primary text-sm hover:underline mt-1 inline-block">إنشاء تكليف</Link>
          </div>
        ) : (
          <div className="space-y-2">
            {tasks.slice(0, 5).map((task) => (
              <div key={task.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                  task.status === "مكتملة" ? "bg-green-500" :
                  task.priority === "عاجل" ? "bg-red-500" : "bg-orange-400"
                }`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{task.title}</p>
                  <p className="text-xs text-muted-foreground">{task.assigned_to} — {task.due_date}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  task.status === "مكتملة" ? "bg-green-100 text-green-700" :
                  task.status === "متأخرة" ? "bg-red-100 text-red-700" :
                  "bg-orange-100 text-orange-700"
                }`}>{task.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { to: "/standards", label: "تقييم المؤشرات", icon: BookOpen, bg: "bg-purple-600" },
          { to: "/evidence", label: "رفع شاهد", icon: FileText, bg: "bg-teal-600" },
          { to: "/tasks", label: "إنشاء تكليف", icon: CheckSquare, bg: "bg-blue-600" },
          { to: "/improvement", label: "خطة التحسين", icon: TrendingUp, bg: "bg-orange-600" },
        ].map(({ to, label, icon: Icon, bg }) => (
          <Link
            key={to}
            to={to}
            className={`${bg} text-white rounded-xl p-4 flex flex-col items-center gap-2 hover:opacity-90 transition-opacity`}
          >
            <Icon size={24} />
            <span className="text-sm font-medium text-center">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}