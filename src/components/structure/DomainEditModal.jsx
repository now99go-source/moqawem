import { useState } from "react";
import { X, Save } from "lucide-react";

const COLORS = [
  { value: "purple", label: "بنفسجي", cls: "bg-purple-600" },
  { value: "blue",   label: "أزرق",   cls: "bg-blue-600" },
  { value: "green",  label: "أخضر",   cls: "bg-green-600" },
  { value: "orange", label: "برتقالي",cls: "bg-orange-600" },
  { value: "teal",   label: "فيروزي", cls: "bg-teal-600" },
  { value: "red",    label: "أحمر",   cls: "bg-red-600" },
];

export default function DomainEditModal({ domain, onSave, onClose }) {
  const [form, setForm] = useState({
    name: domain?.name || "",
    code: domain?.code || "",
    color: domain?.color || "purple",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">{domain ? "تعديل المجال" : "إضافة مجال جديد"}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">اسم المجال *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: التخطيط الاستراتيجي"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">رمز المجال *</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: 5"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">اللون</label>
            <div className="flex gap-2 flex-wrap">
              {COLORS.map(c => (
                <button
                  key={c.value}
                  onClick={() => setForm(f => ({ ...f, color: c.value }))}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm transition-all ${
                    form.color === c.value ? "border-gray-800 scale-105" : "border-transparent"
                  }`}
                >
                  <span className={`w-4 h-4 rounded-full ${c.cls}`} />
                  {c.label}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t">
          <button
            onClick={() => onSave(form)}
            disabled={!form.name || !form.code}
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