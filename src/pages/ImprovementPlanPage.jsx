import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Plus, X, TrendingUp, Target, Calendar, User, Trash2, Edit2, ChevronDown } from "lucide-react";
import PerformanceBadge from "../components/PerformanceBadge";

function PlanModal({ plan, onSave, onClose }) {
  const [form, setForm] = useState(plan || {
    title: "", indicator_code: "", current_level: "تهيئة", target_level: "انطلاق",
    gap_description: "", corrective_actions: "", responsible: "",
    start_date: "", end_date: "", kpi: "", status: "مقترحة",
    progress_percentage: 0, academic_year: "1446/1447"
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card rounded-xl border border-border w-full max-w-2xl shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-bold text-lg">{plan ? "تعديل خطة التحسين" : "إنشاء خطة تحسين"}</h3>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">عنوان خطة التحسين *</label>
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: تحسين مستوى القراءة لدى المتعلمين" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">رمز المؤشر المرتبط</label>
            <input value={form.indicator_code} onChange={e => setForm(f=>({...f,indicator_code:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: 2-1-1-6" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">المستوى الحالي</label>
              <select value={form.current_level} onChange={e => setForm(f=>({...f,current_level:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["تهيئة","انطلاق","تقدم"].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">المستوى المستهدف</label>
              <select value={form.target_level} onChange={e => setForm(f=>({...f,target_level:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["انطلاق","تقدم","تميز"].map(l=><option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">وصف الفجوة</label>
            <textarea value={form.gap_description} onChange={e => setForm(f=>({...f,gap_description:e.target.value}))}
              rows={2} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="ما هي الفجوة الحالية؟" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">الإجراءات العلاجية *</label>
            <textarea value={form.corrective_actions} onChange={e => setForm(f=>({...f,corrective_actions:e.target.value}))}
              rows={3} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="اذكر الإجراءات المقترحة لمعالجة الفجوة..." />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">مؤشرات قياس الأداء (KPIs)</label>
            <input value={form.kpi} onChange={e => setForm(f=>({...f,kpi:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: رفع نسبة الطلاب المتقنين للقراءة إلى 80%" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">مسؤول التنفيذ *</label>
              <input value={form.responsible} onChange={e => setForm(f=>({...f,responsible:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">تاريخ البدء</label>
              <input type="date" value={form.start_date} onChange={e => setForm(f=>({...f,start_date:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">تاريخ الانتهاء</label>
              <input type="date" value={form.end_date} onChange={e => setForm(f=>({...f,end_date:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
          </div>
          {plan && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">نسبة التقدم: {form.progress_percentage}%</label>
              <input type="range" min="0" max="100" value={form.progress_percentage}
                onChange={e => setForm(f=>({...f,progress_percentage:Number(e.target.value)}))}
                className="w-full" />
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={() => onSave(form)} disabled={!form.title || !form.responsible}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {plan ? "حفظ التعديلات" : "إنشاء الخطة"}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

const STATUS_STYLE = { "مقترحة": "bg-gray-100 text-gray-600", "جارية": "bg-blue-100 text-blue-700", "مكتملة": "bg-green-100 text-green-700", "متوقفة": "bg-red-100 text-red-700" };

export default function ImprovementPlanPage() {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editPlan, setEditPlan] = useState(null);

  useEffect(() => {
    base44.entities.ImprovementPlan.list('-created_date').then(list => { setPlans(list); setLoading(false); });
  }, []);

  const handleSave = async (form) => {
    if (editPlan) {
      const updated = await base44.entities.ImprovementPlan.update(editPlan.id, form);
      setPlans(prev => prev.map(p => p.id === editPlan.id ? updated : p));
    } else {
      const saved = await base44.entities.ImprovementPlan.create(form);
      setPlans(prev => [saved, ...prev]);
    }
    setShowModal(false); setEditPlan(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذه الخطة؟")) return;
    await base44.entities.ImprovementPlan.delete(id);
    setPlans(prev => prev.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-5 fade-in" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">خطط التحسين</h1>
          <p className="text-muted-foreground text-sm mt-1">خطط التحسين المبنية على نتائج التقويم الذاتي</p>
        </div>
        <button onClick={() => { setEditPlan(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> خطة تحسين جديدة
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "الإجمالي", value: plans.length, color: "text-foreground" },
          { label: "جارية", value: plans.filter(p=>p.status==="جارية").length, color: "text-blue-600" },
          { label: "مكتملة", value: plans.filter(p=>p.status==="مكتملة").length, color: "text-green-600" },
          { label: "متوسط التقدم", value: plans.length ? `${Math.round(plans.reduce((s,p)=>s+(p.progress_percentage||0),0)/plans.length)}%` : "0%", color: "text-primary" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : plans.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <TrendingUp size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">لا توجد خطط تحسين بعد</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-primary text-sm hover:underline">إنشاء أول خطة تحسين</button>
        </div>
      ) : (
        <div className="space-y-4">
          {plans.map(plan => (
            <div key={plan.id} className="bg-card border border-border rounded-xl p-5 hover:border-primary/30 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-bold">{plan.title}</h3>
                    {plan.indicator_code && (
                      <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">{plan.indicator_code}</span>
                    )}
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[plan.status]}`}>{plan.status}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    {plan.current_level && plan.target_level && (
                      <div className="flex items-center gap-2">
                        <PerformanceBadge level={plan.current_level} />
                        <span>→</span>
                        <PerformanceBadge level={plan.target_level} />
                      </div>
                    )}
                    {plan.responsible && <span className="flex items-center gap-1"><User size={11}/>{plan.responsible}</span>}
                    {plan.end_date && <span className="flex items-center gap-1"><Calendar size={11}/>{plan.end_date}</span>}
                  </div>
                  {plan.corrective_actions && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{plan.corrective_actions}</p>
                  )}
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>نسبة التقدم</span>
                      <span>{plan.progress_percentage || 0}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div className="h-2 rounded-full bg-primary transition-all"
                        style={{ width: `${plan.progress_percentage || 0}%` }} />
                    </div>
                  </div>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => { setEditPlan(plan); setShowModal(true); }} className="p-2 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={15}/></button>
                  <button onClick={() => handleDelete(plan.id)} className="p-2 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={15}/></button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && <PlanModal plan={editPlan} onSave={handleSave} onClose={() => { setShowModal(false); setEditPlan(null); }} />}
    </div>
  );
}