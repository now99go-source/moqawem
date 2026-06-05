import { useState } from "react";
import { X, Save, Plus, Minus } from "lucide-react";

export default function IndicatorEditModal({ indicator, standardCode, domainCode, onSave, onClose }) {
  const [form, setForm] = useState({
    code: indicator?.code || "",
    desc: indicator?.desc || indicator?.description || "",
    tamayuz: indicator?.tamayuz || "",
    tools: indicator?.tools || [],
  });
  const [newTool, setNewTool] = useState("");

  const addTool = () => {
    if (newTool.trim()) {
      setForm(f => ({ ...f, tools: [...f.tools, newTool.trim()] }));
      setNewTool("");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-5 border-b sticky top-0 bg-white z-10">
          <h3 className="font-bold text-lg">{indicator ? "تعديل المؤشر" : "إضافة مؤشر جديد"}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">رمز المؤشر *</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={`مثال: ${standardCode}-1`}
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">نص المؤشر *</label>
            <textarea
              value={form.desc}
              onChange={e => setForm(f => ({ ...f, desc: e.target.value }))}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="اكتب وصف المؤشر..."
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">وصف مستوى التميز</label>
            <textarea
              value={form.tamayuz}
              onChange={e => setForm(f => ({ ...f, tamayuz: e.target.value }))}
              rows={3}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="ما الذي يجعل هذا المؤشر يصل لمستوى التميز؟"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">أدوات القياس</label>
            <div className="flex gap-2 mb-2">
              <input
                value={newTool}
                onChange={e => setNewTool(e.target.value)}
                onKeyDown={e => e.key === "Enter" && addTool()}
                className="flex-1 border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="مثال: استبانة المعلم"
              />
              <button onClick={addTool} className="bg-primary text-white rounded-lg px-3 py-2 text-sm"><Plus size={14} /></button>
            </div>
            {form.tools.length > 0 && (
              <div className="flex flex-wrap gap-1.5">
                {form.tools.map((t, i) => (
                  <span key={i} className="flex items-center gap-1 bg-teal-50 text-teal-700 border border-teal-200 rounded px-2 py-0.5 text-xs">
                    {t}
                    <button onClick={() => setForm(f => ({ ...f, tools: f.tools.filter((_, j) => j !== i) }))}><X size={10} /></button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t sticky bottom-0 bg-white">
          <button
            onClick={() => onSave({ ...form, standard_code: standardCode, domain_code: domainCode })}
            disabled={!form.code || !form.desc}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={14} /> حفظ
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}