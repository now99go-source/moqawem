import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { School, Save, CheckCircle2, Users, BookOpen, Building2 } from "lucide-react";

export default function SchoolProfilePage() {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState({
    school_name: "", school_number: "", region: "", city: "", education_office: "",
    principal_name: "", phone: "", email: "", school_type: "حكومية", stage: "ثانوية",
    gender: "بنين", student_count: "", teacher_count: "", admin_count: "",
    class_count: "", lab_count: "", academic_year: "1446/1447",
    achievements: "", challenges: "", whatsapp: "", readiness_status: "لم تبدأ"
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    base44.entities.SchoolProfile.list().then(list => {
      if (list.length > 0) {
        setProfile(list[0]);
        setForm({ ...form, ...list[0] });
      }
      setLoading(false);
    });
  }, []);

  const handleSave = async () => {
    setSaving(true);
    let result;
    if (profile?.id) {
      result = await base44.entities.SchoolProfile.update(profile.id, form);
    } else {
      result = await base44.entities.SchoolProfile.create(form);
    }
    setProfile(result);
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const Field = ({ label, name, type = "text", options, cols = 1 }) => (
    <div className={cols === 2 ? "md:col-span-2" : ""}>
      <label className="text-sm font-medium mb-1.5 block text-foreground">{label}</label>
      {options ? (
        <select value={form[name] || ""} onChange={e => setForm(f=>({...f,[name]:e.target.value}))}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          {options.map(o => <option key={o}>{o}</option>)}
        </select>
      ) : type === "textarea" ? (
        <textarea value={form[name] || ""} onChange={e => setForm(f=>({...f,[name]:e.target.value}))}
          rows={3} className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      ) : (
        <input type={type} value={form[name] || ""} onChange={e => setForm(f=>({...f,[name]: type==="number"?Number(e.target.value):e.target.value}))}
          className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
      )}
    </div>
  );

  if (loading) return (
    <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
  );

  return (
    <div className="space-y-6 fade-in max-w-4xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">بيانات المدرسة — نموذج الجاهزية</h1>
          <p className="text-muted-foreground text-sm mt-1">معلومات المدرسة الأساسية المطلوبة للتقويم الذاتي</p>
        </div>
        <div className="flex items-center gap-2">
          {saved && (
            <div className="flex items-center gap-1.5 text-green-600 text-sm bg-green-50 px-3 py-1.5 rounded-lg border border-green-200">
              <CheckCircle2 size={15} /> تم الحفظ
            </div>
          )}
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
            {saving ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save size={15}/>}
            {saving ? "جارٍ الحفظ..." : "حفظ البيانات"}
          </button>
        </div>
      </div>

      {/* Readiness Status */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-3 flex items-center gap-2 text-primary"><School size={18}/>حالة الجاهزية</h2>
        <div className="flex gap-3">
          {["لم تبدأ","جارية","مكتملة"].map(s => (
            <button key={s} onClick={() => setForm(f=>({...f,readiness_status:s}))}
              className={`flex-1 py-2.5 rounded-lg border text-sm font-medium transition-all ${
                form.readiness_status === s
                  ? s === "مكتملة" ? "bg-green-600 text-white border-green-600"
                    : s === "جارية" ? "bg-blue-600 text-white border-blue-600"
                    : "bg-gray-600 text-white border-gray-600"
                  : "border-border hover:bg-secondary"
              }`}>{s}</button>
          ))}
        </div>
      </div>

      {/* Basic Info */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Building2 size={18} className="text-primary"/>المعلومات الأساسية</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="اسم المدرسة *" name="school_name" />
          <Field label="رقم المدرسة" name="school_number" />
          <Field label="المنطقة" name="region" />
          <Field label="المدينة" name="city" />
          <Field label="مكتب التعليم" name="education_office" />
          <Field label="اسم المدير" name="principal_name" />
          <Field label="رقم الهاتف" name="phone" />
          <Field label="البريد الإلكتروني" name="email" type="email" />
          <Field label="نوع المدرسة" name="school_type" options={["حكومية","أهلية","عالمية"]} />
          <Field label="المرحلة" name="stage" options={["ابتدائية","متوسطة","ثانوية","مشتركة"]} />
          <Field label="الجنس" name="gender" options={["بنين","بنات"]} />
          <Field label="العام الدراسي" name="academic_year" />
        </div>
      </div>

      {/* Staff & Students */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2"><Users size={18} className="text-primary"/>البيانات الإحصائية</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="عدد الطلاب" name="student_count" type="number" />
          <Field label="عدد المعلمين" name="teacher_count" type="number" />
          <Field label="عدد الإداريين" name="admin_count" type="number" />
          <Field label="عدد الفصول" name="class_count" type="number" />
          <Field label="عدد المعامل" name="lab_count" type="number" />
          <Field label="رقم الواتساب" name="whatsapp" />
        </div>
      </div>

      {/* Achievements & Challenges */}
      <div className="bg-card border border-border rounded-xl p-5">
        <h2 className="font-bold mb-4 flex items-center gap-2"><BookOpen size={18} className="text-primary"/>المنجزات والتحديات</h2>
        <div className="space-y-4">
          <Field label="أبرز المنجزات" name="achievements" type="textarea" cols={2} />
          <Field label="أبرز التحديات والمعوقات" name="challenges" type="textarea" cols={2} />
        </div>
      </div>
    </div>
  );
}