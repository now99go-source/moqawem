import { useState } from "react";
import { X, Save } from "lucide-react";

export default function StandardEditModal({ standard, domainCode, onSave, onClose }) {
  const [form, setForm] = useState({
    name: standard?.name || "",
    code: standard?.code || "",
  });

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
        <div className="flex items-center justify-between p-5 border-b">
          <h3 className="font-bold text-lg">{standard ? "تعديل المعيار" : "إضافة معيار جديد"}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium block mb-1.5">اسم المعيار *</label>
            <input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="مثال: التخطيط التقني"
            />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1.5">رمز المعيار *</label>
            <input
              value={form.code}
              onChange={e => setForm(f => ({ ...f, code: e.target.value }))}
              className="w-full border border-border rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder={`مثال: ${domainCode}-5`}
            />
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