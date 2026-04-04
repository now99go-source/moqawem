import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, FileText, Link2, Search, Plus, X, Check, File, Eye, Trash2 } from "lucide-react";
import { INDICATOR_CODES_LIST, indicatorLabel } from "../utils/indicatorMap";

function AddEvidenceModal({ onSave, onClose }) {
  const [form, setForm] = useState({
    title: "", description: "", indicator_code: "", academic_year: "1446/1447",
    status: "قيد المراجعة", responsible: "", source: ""
  });
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  const handleSubmit = async () => {
    if (!form.title || !form.indicator_code) return;
    setUploading(true);
    let file_url = "", file_name = "", file_type = "";
    if (file) {
      const res = await base44.integrations.Core.UploadFile({ file });
      file_url = res.file_url;
      file_name = file.name;
      file_type = file.type;
    }
    await onSave({ ...form, file_url, file_name, file_type });
    setUploading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
          <h3 className="font-bold text-lg">إضافة شاهد جديد</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18}/></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">عنوان الشاهد *</label>
            <input value={form.title} onChange={e => setForm(f=>({...f,title:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: خطة تشغيلية المدرسة 1446هـ" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المؤشر المرتبط *</label>
            <select value={form.indicator_code} onChange={e => setForm(f=>({...f,indicator_code:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">اختر المؤشر</option>
              {INDICATOR_CODES_LIST.map(c => <option key={c} value={c}>{indicatorLabel(c)}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">الوصف</label>
            <textarea value={form.description} onChange={e => setForm(f=>({...f,description:e.target.value}))}
              rows={2} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="وصف مختصر للشاهد..." />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-sm font-medium mb-1.5 block">العام الدراسي</label>
              <input value={form.academic_year} onChange={e => setForm(f=>({...f,academic_year:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1.5 block">الحالة</label>
              <select value={form.status} onChange={e => setForm(f=>({...f,status:e.target.value}))}
                className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                {["قيد المراجعة","مكتمل","ناقص"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المسؤول</label>
            <input value={form.responsible} onChange={e => setForm(f=>({...f,responsible:e.target.value}))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="اسم المسؤول" />
          </div>
          {/* File Upload */}
          <div>
            <label className="text-sm font-medium mb-1.5 block">رفع الملف (PDF, Word, صورة)</label>
            <label className="flex flex-col items-center gap-2 border-2 border-dashed border-border rounded-xl p-6 cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
              <Upload size={24} className="text-muted-foreground" />
              <span className="text-sm text-muted-foreground text-center">
                {file ? file.name : "انقر لاختيار ملف أو اسحبه هنا"}
              </span>
              <input type="file" className="hidden" accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                onChange={e => setFile(e.target.files[0])} />
            </label>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={handleSubmit} disabled={uploading || !form.title || !form.indicator_code}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2">
            {uploading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15}/>}
            {uploading ? "جارٍ الرفع..." : "إضافة الشاهد"}
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export default function EvidencePage() {
  const [evidence, setEvidence] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [indicatorIdMap, setIndicatorIdMap] = useState({});
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState("الكل");

  useEffect(() => {
    Promise.all([
      base44.entities.Evidence.list('-created_date'),
      base44.entities.Indicator.list(),
    ]).then(([list, indicators]) => {
      setEvidence(list);
      const map = {};
      indicators.forEach(i => { map[i.code] = i.id; });
      setIndicatorIdMap(map);
      setLoading(false);
    });
  }, []);

  const handleAdd = async (data) => {
    const indicator_id = indicatorIdMap[data.indicator_code] || null;
    const saved = await base44.entities.Evidence.create({ ...data, indicator_id });
    setEvidence(prev => [saved, ...prev]);
    setShowAdd(false);
  };

  const handleStatusChange = async (id, newStatus) => {
    const updated = await base44.entities.Evidence.update(id, { status: newStatus });
    setEvidence(prev => prev.map(e => e.id === id ? { ...e, status: updated.status } : e));
  };

  const handleDelete = async (id) => {
    if (!confirm("هل تريد حذف هذا الشاهد؟")) return;
    await base44.entities.Evidence.delete(id);
    setEvidence(prev => prev.filter(e => e.id !== id));
  };

  const filtered = evidence.filter(e => {
    const matchSearch = !search || e.title?.includes(search) || e.indicator_code?.includes(search);
    const matchStatus = filterStatus === "الكل" || e.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const statusColors = { "مكتمل": "bg-green-100 text-green-700", "ناقص": "bg-red-100 text-red-700", "قيد المراجعة": "bg-orange-100 text-orange-700" };

  return (
    <div className="space-y-5 fade-in" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">إدارة الشواهد والأدلة</h1>
          <p className="text-muted-foreground text-sm mt-1">رفع وإدارة شواهد التقويم الذاتي</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus size={16} /> إضافة شاهد
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "إجمالي الشواهد", value: evidence.length, color: "text-primary" },
          { label: "مكتمل", value: evidence.filter(e=>e.status==="مكتمل").length, color: "text-green-600" },
          { label: "ناقص / قيد المراجعة", value: evidence.filter(e=>e.status!=="مكتمل").length, color: "text-orange-600" },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className={`text-2xl font-bold ${color}`}>{value}</div>
            <div className="text-xs text-muted-foreground mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="بحث بالعنوان أو رمز المؤشر..."
            className="w-full bg-card border border-border rounded-lg pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
        </div>
        <div className="flex gap-2">
          {["الكل", "مكتمل", "ناقص", "قيد المراجعة"].map(s => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${filterStatus === s ? "bg-primary text-white" : "bg-card border border-border hover:bg-secondary"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <FileText size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">لا توجد شواهد مضافة بعد</p>
          <button onClick={() => setShowAdd(true)} className="mt-3 text-primary text-sm hover:underline">إضافة أول شاهد</button>
        </div>
      ) : (
        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-secondary border-b border-border">
                <tr>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">عنوان الشاهد</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">المؤشر</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">العام الدراسي</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">الحالة</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">الملف</th>
                  <th className="text-xs font-semibold text-muted-foreground px-4 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {filtered.map(ev => (
                  <tr key={ev.id} className="hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-sm">{ev.title}</div>
                      {ev.description && <div className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{ev.description}</div>}
                    </td>
                    <td className="px-4 py-3">
                      {ev.indicator_code && (
                        <span className="text-xs font-mono bg-secondary px-2 py-0.5 rounded">{ev.indicator_code}</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground">{ev.academic_year || "—"}</td>
                    <td className="px-4 py-3">
                      <select
                        value={ev.status}
                        onChange={e => handleStatusChange(ev.id, e.target.value)}
                        className={`text-xs px-2 py-1 rounded-full font-medium border-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/30 ${statusColors[ev.status] || ""}`}
                      >
                        {["قيد المراجعة", "مكتمل", "ناقص"].map(s => (
                          <option key={s} value={s}>{s}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {ev.file_url ? (
                        <a href={ev.file_url} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-1 text-primary text-xs hover:underline">
                          <File size={13} /> {ev.file_name || "عرض"}
                        </a>
                      ) : <span className="text-muted-foreground text-xs">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => handleDelete(ev.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      {showAdd && <AddEvidenceModal onSave={handleAdd} onClose={() => setShowAdd(false)} />}
    </div>
  );
}