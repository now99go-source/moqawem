import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { trackActivity } from "../utils/trackActivity";
import { Plus, X, CheckCircle2, Clock, AlertCircle, Calendar, User, Trash2, Edit2 } from "lucide-react";
import { indicatorLabel } from "../utils/indicatorMap";

const ASSIGNMENT_OPTIONS = [
  { group: "المجالات", items: [
    { value: "مجال الإدارة المدرسية", label: "مجال الإدارة المدرسية" },
    { value: "مجال التعليم والتعلم", label: "مجال التعليم والتعلم" },
    { value: "مجال نواتج التعلم", label: "مجال نواتج التعلم" },
    { value: "مجال البيئة المدرسية", label: "مجال البيئة المدرسية" },
  ]},
  { group: "المعايير", items: [
    { value: "1-1 التخطيط", label: "1-1 التخطيط" },
    { value: "1-2 قيادة العملية التعليمية", label: "1-2 قيادة العملية التعليمية" },
    { value: "1-3 المجتمع المدرسي", label: "1-3 المجتمع المدرسي" },
    { value: "1-4 التطوير المؤسسي", label: "1-4 التطوير المؤسسي" },
    { value: "2-1 بناء خبرات التعلم", label: "2-1 بناء خبرات التعلم" },
    { value: "2-2 تقويم التعلم", label: "2-2 تقويم التعلم" },
    { value: "3-1 التحصيل التعليمي", label: "3-1 التحصيل التعليمي" },
    { value: "3-2 التطور الشخصي والصحي والاجتماعي", label: "3-2 التطور الشخصي والاجتماعي" },
    { value: "4-1 المبنى المدرسي", label: "4-1 المبنى المدرسي" },
    { value: "4-2 الأمن والسلامة", label: "4-2 الأمن والسلامة" },
  ]},
  { group: "المؤشرات — الإدارة", items: [
    "1-1-1-1","1-1-1-2","1-2-1-1","1-2-1-2","1-2-1-3","1-2-1-4","1-2-1-5","1-2-1-6",
    "1-3-1-1","1-3-1-2","1-3-1-3","1-4-1-1","1-4-1-2","1-4-1-3","1-4-1-4","1-4-1-5","1-4-1-6","1-4-1-7",
  ].map(v=>({value:v,label:indicatorLabel(v)}))},
  { group: "المؤشرات — التعليم والتعلم", items: [
    "2-1-1-1","2-1-1-2","2-1-1-3","2-1-1-4","2-1-1-5","2-1-1-6","2-1-1-7","2-1-1-8","2-1-1-9","2-1-1-10",
    "2-2-1-1","2-2-1-2","2-2-1-3",
  ].map(v=>({value:v,label:indicatorLabel(v)}))},
  { group: "المؤشرات — نواتج التعلم", items: [
    "3-1-1-1","3-1-1-2","3-1-1-3","3-1-1-4","3-1-1-5","3-1-1-6",
    "3-2-1-1","3-2-1-2","3-2-1-3","3-2-1-4","3-2-1-5","3-2-1-6","3-2-1-7",
  ].map(v=>({value:v,label:indicatorLabel(v)}))},
  { group: "المؤشرات — البيئة المدرسية", items: [
    "4-1-1-1","4-1-1-2","4-1-1-3","4-2-1-1","4-2-1-2","4-2-1-3",
  ].map(v=>({value:v,label:indicatorLabel(v)}))},
];

function TaskModal({ task, onSave, onClose }) {
  const [form, setForm] = useState(task || {
    title: "", description: "", assigned_to: "محمد عبدالرحمن العمري", assigned_role: "مدير المدرسة",
    indicator_code: "", due_date: "", priority: "عادي", status: "لم تبدأ",
    completion_percentage: 0, notes: ""
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-bold text-lg">{task ? "تعديل تكليف" : "إنشاء تكليف جديد"}</h3>
          <button onClick={onClose}><X size={18} className="text-muted-foreground" /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">عنوان التكليف *</label>
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="وصف واضح للتكليف" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">التفاصيل</label>
            <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
              rows={2} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">المكلَّف *</label>
              <input value={form.assigned_to} onChange={e => setForm(f=>({...f,assigned_to:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="اسم الشخص" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الدور</label>
              <select value={form.assigned_role} onChange={e => setForm(f=>({...f,assigned_role:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["مدير المدرسة","وكيل","مرشد طلابي","منسق تقويم ذاتي","مسؤول جودة","معلم"].map(r=><option key={r}>{r}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">تاريخ التسليم *</label>
              <input type="date" value={form.due_date} onChange={e => setForm(f=>({...f,due_date:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الأولوية</label>
              <select value={form.priority} onChange={e => setForm(f=>({...f,priority:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["عاجل","مهم","عادي"].map(p=><option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">نطاق التكليف (مجال / معيار / مؤشر)</label>
            <select value={form.indicator_code} onChange={e => setForm(f=>({...f,indicator_code:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— اختر النطاق —</option>
              {ASSIGNMENT_OPTIONS.map(group => (
                <optgroup key={group.group} label={group.group}>
                  {group.items.map(item => (
                    <option key={item.value} value={item.value}>{item.label}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>
          {task && (
            <div>
              <label className="text-sm font-medium mb-1.5 block">الحالة</label>
              <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["لم تبدأ","جارية","مكتملة","متأخرة"].map(s=><option key={s}>{s}</option>)}
              </select>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={() => onSave(form)} disabled={!form.title || !form.assigned_to || !form.due_date}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {task ? "حفظ التعديلات" : "إنشاء التكليف"}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

const PRIORITY_STYLE = { "عاجل": "bg-red-100 text-red-700", "مهم": "bg-orange-100 text-orange-700", "عادي": "bg-gray-100 text-gray-600" };
const STATUS_STYLE = { "لم تبدأ": "bg-gray-100 text-gray-600", "جارية": "bg-blue-100 text-blue-700", "مكتملة": "bg-green-100 text-green-700", "متأخرة": "bg-red-100 text-red-700" };
const STATUS_ICON = { "لم تبدأ": Clock, "جارية": AlertCircle, "مكتملة": CheckCircle2, "متأخرة": AlertCircle };

export default function TasksPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [filter, setFilter] = useState("الكل");

  useEffect(() => {
    base44.entities.Task.list('-created_date').then(list => { setTasks(list); setLoading(false); });
  }, []);

  const handleSave = async (form) => {
    if (editTask) {
      const updated = await base44.entities.Task.update(editTask.id, form);
      setTasks(prev => prev.map(t => t.id === editTask.id ? updated : t));
      if (form.status === "مكتملة" && editTask.status !== "مكتملة") {
        await trackActivity(user, "إتمام تكليف", { indicator_code: form.indicator_code, details: form.title });
      }
    } else {
      const saved = await base44.entities.Task.create(form);
      setTasks(prev => [saved, ...prev]);
      await trackActivity(user, "إضافة تكليف", { indicator_code: form.indicator_code, details: form.title });
    }
    setShowModal(false); setEditTask(null);
  };

  const handleDelete = async (id) => {
    if (!confirm("حذف هذا التكليف؟")) return;
    await base44.entities.Task.delete(id);
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const filtered = filter === "الكل" ? tasks : tasks.filter(t => t.status === filter);

  return (
    <div className="space-y-5 fade-in" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">التكليفات والمهام</h1>
          <p className="text-muted-foreground text-sm mt-1">إدارة ومتابعة تكليفات فريق التقويم الذاتي</p>
        </div>
        <button onClick={() => { setEditTask(null); setShowModal(true); }}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> تكليف جديد
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "الكل", count: tasks.length, color: "text-foreground" },
          { label: "جارية", count: tasks.filter(t=>t.status==="جارية").length, color: "text-blue-600" },
          { label: "مكتملة", count: tasks.filter(t=>t.status==="مكتملة").length, color: "text-green-600" },
          { label: "عاجل", count: tasks.filter(t=>t.priority==="عاجل"&&t.status!=="مكتملة").length, color: "text-red-600" },
        ].map(({ label, count, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-3 text-center cursor-pointer hover:border-primary/50"
            onClick={() => setFilter(label === "عاجل" ? "الكل" : label)}>
            <div className={`text-2xl font-bold ${color}`}>{count}</div>
            <div className="text-xs text-muted-foreground">{label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {["الكل","لم تبدأ","جارية","مكتملة","متأخرة"].map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${filter===s?"bg-primary text-white":"bg-card border border-border hover:bg-secondary"}`}>
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <CheckCircle2 size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">لا توجد تكليفات</p>
          <button onClick={() => setShowModal(true)} className="mt-3 text-primary text-sm hover:underline">إنشاء تكليف جديد</button>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(task => {
            const Icon = STATUS_ICON[task.status] || Clock;
            return (
              <div key={task.id} className="bg-card border border-border rounded-xl p-4 hover:border-primary/30 transition-all">
                <div className="flex items-start gap-3">
                  <Icon size={18} className={
                    task.status === "مكتملة" ? "text-green-500 mt-0.5 flex-shrink-0" :
                    task.status === "متأخرة" ? "text-red-500 mt-0.5 flex-shrink-0" :
                    "text-muted-foreground mt-0.5 flex-shrink-0"
                  } />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-sm">{task.title}</h3>
                      {task.indicator_code && (
                        <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">{task.indicator_code}</span>
                      )}
                    </div>
                    {task.description && <p className="text-xs text-muted-foreground mt-0.5">{task.description}</p>}
                    <div className="flex items-center gap-3 mt-2 flex-wrap">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <User size={12} />{task.assigned_to} — {task.assigned_role}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Calendar size={12} />{task.due_date}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLE[task.priority]}`}>{task.priority}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_STYLE[task.status]}`}>{task.status}</span>
                    <button onClick={() => { setEditTask(task); setShowModal(true); }} className="p-1.5 text-muted-foreground hover:text-primary transition-colors"><Edit2 size={14}/></button>
                    <button onClick={() => handleDelete(task.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {showModal && <TaskModal task={editTask} onSave={handleSave} onClose={() => { setShowModal(false); setEditTask(null); }} />}
    </div>
  );
}