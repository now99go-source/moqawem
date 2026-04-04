import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import PerformanceBadge from "../components/PerformanceBadge";
import { BookOpen, ChevronDown, ChevronLeft, Plus, Edit2, Save, X } from "lucide-react";

// Built-in standards data based on ETEC framework
const ETEC_STRUCTURE = [
  {
    domain: "الإدارة المدرسية", code: "1", color: "purple",
    standards: [
      { name: "التخطيط", code: "1-1", indicators: [
        { code: "1-1-1-1", desc: "تضع المدرسة خطة تشغيلية مكتملة العناصر، وفق أهداف تطويرية محددة." },
        { code: "1-1-1-2", desc: "تتابع المدرسة تنفيذ خطتها وتطورها بما يضمن تحقيق أهدافها." },
      ]},
      { name: "قيادة العملية التعليمية", code: "1-2", indicators: [
        { code: "1-2-1-1", desc: "تعزز المدرسة القيم الإسلامية والهوية الوطنية." },
        { code: "1-2-1-2", desc: "تلتزم المدرسة بقيم مهنة التعليم وأخلاقياتها." },
        { code: "1-2-1-3", desc: "توفر المدرسة مناخاً آمناً للتعلم والنمو نفسياً واجتماعياً." },
        { code: "1-2-1-4", desc: "تنشر المدرسة قواعد السلوك والمواظبة، وتتابع تطبيقها." },
        { code: "1-2-1-5", desc: "توفر المدرسة برامج وأنشطة تربوية داعمة للسلوك الإيجابي." },
        { code: "1-2-1-6", desc: "توفر المدرسة برامج وأنشطة إثرائية غير صفية لتطوير مواهب المتعلمين." },
      ]},
      { name: "المجتمع المدرسي", code: "1-3", indicators: [
        { code: "1-3-1-1", desc: "تعزز المدرسة بناء العلاقات الإيجابية والتعاون في المجتمع المدرسي." },
        { code: "1-3-1-2", desc: "تعزز المدرسة مشاركة الأسرة في تعلم أبنائهم والتحضير لمستقبلهم." },
        { code: "1-3-1-3", desc: "تعزز المدرسة الشراكة المجتمعية لدعم التعلم والتأثير الإيجابي." },
      ]},
      { name: "التطوير المؤسسي", code: "1-4", indicators: [
        { code: "1-4-1-1", desc: "توفر المدرسة كادراً تعليمياً مكتملاً ومؤهلاً." },
        { code: "1-4-1-2", desc: "توفر المدرسة كادراً إدارياً مكتملاً ومؤهلاً." },
        { code: "1-4-1-3", desc: "تظهر المدرسة ثباتاً واستدامة مالية." },
        { code: "1-4-1-4", desc: "تشجع المدرسة منسوبيها للحصول على الرخصة المهنية." },
        { code: "1-4-1-5", desc: "تدعم المدرسة التطوير المهني لمنسوبيها وفقاً لنتائج تقويم الأداء." },
        { code: "1-4-1-6", desc: "تطبق المدرسة التقويم الذاتي المبني على المعايير المعتمدة من الهيئة." },
        { code: "1-4-1-7", desc: "تنفذ المدرسة خطة للتحسين بناء على نتائج التقويم المدرسي، وتتابعها." },
      ]},
    ]
  },
  {
    domain: "التعليم والتعلم", code: "2", color: "blue",
    standards: [
      { name: "بناء خبرات التعلم", code: "2-1", indicators: [
        { code: "2-1-1-1", desc: "توفر المدرسة فرصاً متكافئة للتعلم تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة والموهوبون." },
        { code: "2-1-1-2", desc: "تدعم المدرسة تنفيذ المناهج لتحقيق نواتج التعلم المستهدفة وفق الخطة الدراسية." },
        { code: "2-1-1-3", desc: "تنوع المدرسة في إستراتيجيات التدريس لتلبية احتياجات المتعلمين." },
        { code: "2-1-1-4", desc: "تفعّل المدرسة التعلم الإلكتروني لتلبية احتياجات المتعلمين." },
        { code: "2-1-1-5", desc: "توفر المدرسة أنشطة تعلم تطبيقية ترتبط بحياة المتعلمين." },
        { code: "2-1-1-6", desc: "تنمّي المدرسة المهارات القرائية والعددية الأساسية لدى المتعلمين." },
        { code: "2-1-1-7", desc: "تنمّي المدرسة مهارات التفكير العليا لدى المتعلمين." },
        { code: "2-1-1-8", desc: "تنمّي المدرسة المهارات العاطفية والاجتماعية لدى المتعلمين." },
        { code: "2-1-1-9", desc: "تنمّي المدرسة المهارات الرقمية لدى المتعلمين." },
        { code: "2-1-1-10", desc: "تعزز المدرسة دافعية المتعلمين للتعلم والاستمتاع به." },
      ]},
      { name: "تقويم التعلم", code: "2-2", indicators: [
        { code: "2-2-1-1", desc: "تقوّم المدرسة أداء المتعلمين باستخدام أساليب وأدوات تقويم متنوعة وفاعلة." },
        { code: "2-2-1-2", desc: "تحلل المدرسة نتائج التقويم وتوظفها في تحسين نواتج التعلم بانتظام." },
        { code: "2-2-1-3", desc: "تقدم المدرسة التغذية الراجعة للمتعلمين بانتظام." },
      ]},
    ]
  },
  {
    domain: "نواتج التعلم", code: "3", color: "green",
    standards: [
      { name: "التحصيل التعليمي", code: "3-1", indicators: [
        { code: "3-1-1-1", desc: "يحقق المتعلمون نتائج متقدمة في مجال القراءة وفقاً للاختبارات الوطنية." },
        { code: "3-1-1-2", desc: "يحقق المتعلمون نتائج متقدمة في مجال الرياضيات وفقاً للاختبارات الوطنية." },
        { code: "3-1-1-3", desc: "يحقق المتعلمون نتائج متقدمة في مجال العلوم وفقاً للاختبارات الوطنية." },
        { code: "3-1-1-4", desc: "يحقق المتعلمون تقدماً في مجال القراءة قياساً على مستوى أداء المدرسة السابق." },
        { code: "3-1-1-5", desc: "يحقق المتعلمون تقدماً في مجال الرياضيات قياساً على المستوى السابق." },
        { code: "3-1-1-6", desc: "يحقق المتعلمون تقدماً في مجال العلوم قياساً على المستوى السابق." },
      ]},
      { name: "التطور الشخصي والصحي والاجتماعي", code: "3-2", indicators: [
        { code: "3-2-1-1", desc: "يظهر المتعلمون الاعتزاز بالقيم والهوية الوطنية." },
        { code: "3-2-1-2", desc: "يظهر المتعلمون اتجاهات إيجابية نحو ذواتهم." },
        { code: "3-2-1-3", desc: "يظهر المتعلمون التزاماً بالممارسات الصحية السليمة." },
        { code: "3-2-1-4", desc: "يشارك المتعلمون في الأنشطة المجتمعية والأعمال التطوعية." },
        { code: "3-2-1-5", desc: "يلتزم المتعلمون بقواعد السلوك والانضباط المدرسي." },
        { code: "3-2-1-6", desc: "يظهر المتعلمون القدرة على البحث والتعلم الذاتي." },
        { code: "3-2-1-7", desc: "يظهر المتعلمون اعتزازاً بثقافتهم واحتراماً للتنوع الثقافي." },
      ]},
    ]
  },
  {
    domain: "البيئة المدرسية", code: "4", color: "orange",
    standards: [
      { name: "المبنى المدرسي", code: "4-1", indicators: [
        { code: "4-1-1-1", desc: "تنظيم مبنى المدرسة ملائم لعدد المتعلمين والمرحلة العمرية." },
        { code: "4-1-1-2", desc: "تتوافر فصول ومعامل ملائمة للعملية التعليمية تلبي احتياجات المتعلمين بمن فيهم ذوو الإعاقة." },
        { code: "4-1-1-3", desc: "تلبي المرافق والخدمات المساندة احتياجات المتعلمين بمن فيهم ذوو الإعاقة." },
      ]},
      { name: "الأمن والسلامة", code: "4-2", indicators: [
        { code: "4-2-1-1", desc: "تتوافر في فصول المدرسة ومعاملها وجميع مرافقها متطلبات الأمن والسلامة." },
        { code: "4-2-1-2", desc: "تعمل المدرسة على صيانة جميع مرافق المبنى وتجهيزاته بانتظام." },
        { code: "4-2-1-3", desc: "تعمل المدرسة على نظافة المبنى المدرسي وجميع مرافقه بانتظام." },
      ]},
    ]
  },
];

const DOMAIN_COLORS = {
  purple: { bg: "bg-purple-600", light: "bg-purple-50 border-purple-200", text: "text-purple-700" },
  blue: { bg: "bg-blue-600", light: "bg-blue-50 border-blue-200", text: "text-blue-700" },
  green: { bg: "bg-green-600", light: "bg-green-50 border-green-200", text: "text-green-700" },
  orange: { bg: "bg-orange-600", light: "bg-orange-50 border-orange-200", text: "text-orange-700" },
};

function EditIndicatorModal({ indicator, onSave, onClose }) {
  const [form, setForm] = useState({
    performance_level: indicator.performance_level || "لم يُقيَّم",
    score_percentage: indicator.score_percentage || "",
    status: indicator.status || "لم يبدأ",
    responsible: indicator.responsible || "",
    notes: indicator.notes || "",
  });

  const handleSave = async () => {
    await onSave(indicator.id, form);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card rounded-xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <div className="text-xs text-muted-foreground mb-0.5">{indicator.code}</div>
            <h3 className="font-bold text-sm leading-snug max-w-sm">{indicator.desc}</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground"><X size={18} /></button>
        </div>
        <div className="p-5 space-y-4">
          <div>
            <label className="text-sm font-medium mb-1.5 block">مستوى الأداء</label>
            <div className="grid grid-cols-2 gap-2">
              {["تهيئة", "انطلاق", "تقدم", "تميز"].map(level => (
                <button
                  key={level}
                  onClick={() => setForm(f => ({ ...f, performance_level: level }))}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${
                    form.performance_level === level
                      ? "border-primary bg-primary text-white"
                      : "border-border hover:bg-secondary"
                  }`}
                >
                  <PerformanceBadge level={level} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">نسبة التحقق %</label>
            <input
              type="number"
              min="0" max="100"
              value={form.score_percentage}
              onChange={e => setForm(f => ({ ...f, score_percentage: Number(e.target.value) }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="0 - 100"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">حالة الإنجاز</label>
            <select
              value={form.status}
              onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              {["لم يبدأ", "جاري", "مكتمل", "يحتاج تحسين"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المسؤول</label>
            <input
              value={form.responsible}
              onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="اسم المسؤول أو دوره"
            />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">ملاحظات</label>
            <textarea
              value={form.notes}
              onChange={e => setForm(f => ({ ...f, notes: e.target.value }))}
              rows={2}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              placeholder="أي ملاحظات إضافية..."
            />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={handleSave} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
            <Save size={15} /> حفظ التقييم
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export default function Standards() {
  const [evaluations, setEvaluations] = useState({});
  const [expandedDomains, setExpandedDomains] = useState({ "1": true });
  const [expandedStandards, setExpandedStandards] = useState({});
  const [editingIndicator, setEditingIndicator] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    base44.entities.Indicator.list().then(list => {
      const map = {};
      list.forEach(i => { map[i.code] = i; });
      setEvaluations(map);
    });
  }, []);

  const toggleDomain = (code) => setExpandedDomains(p => ({ ...p, [code]: !p[code] }));
  const toggleStandard = (code) => setExpandedStandards(p => ({ ...p, [code]: !p[code] }));

  const handleSave = async (existingId, code, desc, domainCode, standardCode, form) => {
    setSaving(true);
    const data = { code, description: desc, domain_id: domainCode, standard_id: standardCode, ...form };
    let saved;
    if (existingId) {
      saved = await base44.entities.Indicator.update(existingId, data);
    } else {
      saved = await base44.entities.Indicator.create(data);
    }
    setEvaluations(prev => ({ ...prev, [code]: saved }));
    setSaving(false);
    setEditingIndicator(null);
  };

  const getIndicatorData = (code, desc) => ({
    ...(evaluations[code] || {}),
    code,
    desc,
    performance_level: evaluations[code]?.performance_level || "لم يُقيَّم",
    status: evaluations[code]?.status || "لم يبدأ",
  });

  return (
    <div className="space-y-4 fade-in" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">المعايير والمؤشرات</h1>
          <p className="text-muted-foreground text-sm mt-1">تقييم المؤشرات وفق معايير هيئة تقويم التعليم والتدريب</p>
        </div>
        <div className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
          <span className="font-bold text-primary">{Object.keys(evaluations).length}</span>
          <span className="text-muted-foreground"> / 52 مؤشر مُقيَّم</span>
        </div>
      </div>

      {ETEC_STRUCTURE.map((domain) => {
        const colors = DOMAIN_COLORS[domain.color];
        const isExpanded = expandedDomains[domain.code];
        const domainEvaluated = ETEC_STRUCTURE
          .find(d => d.code === domain.code)?.standards
          .flatMap(s => s.indicators)
          .filter(i => evaluations[i.code]).length || 0;
        const domainTotal = domain.standards.flatMap(s => s.indicators).length;

        return (
          <div key={domain.code} className="bg-card rounded-xl border border-border overflow-hidden">
            <button
              onClick={() => toggleDomain(domain.code)}
              className={`w-full flex items-center gap-4 p-4 ${colors.bg} text-white hover:opacity-95 transition-opacity`}
            >
              <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">
                {domain.code}
              </div>
              <div className="flex-1 text-right">
                <div className="font-bold">{domain.domain}</div>
                <div className="text-xs text-white/70">{domainTotal} مؤشر — {domainEvaluated} مُقيَّم</div>
              </div>
              <ChevronDown size={18} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
            </button>

            {isExpanded && (
              <div className="divide-y divide-border">
                {domain.standards.map(standard => {
                  const stdKey = standard.code;
                  const isStdExpanded = expandedStandards[stdKey] !== false;
                  return (
                    <div key={stdKey}>
                      <button
                        onClick={() => toggleStandard(stdKey)}
                        className={`w-full flex items-center gap-3 px-5 py-3 ${colors.light} border-b border-border hover:opacity-90 transition-opacity`}
                      >
                        <ChevronLeft size={15} className={`${colors.text} transition-transform ${isStdExpanded ? "-rotate-90" : ""}`} />
                        <span className={`text-xs font-mono ${colors.text} bg-white/70 px-2 py-0.5 rounded`}>{standard.code}</span>
                        <span className={`font-semibold text-sm ${colors.text}`}>{standard.name}</span>
                        <span className="mr-auto text-xs text-muted-foreground">{standard.indicators.length} مؤشر</span>
                      </button>
                      {isStdExpanded && (
                        <div className="divide-y divide-border/50">
                          {standard.indicators.map(ind => {
                            const data = getIndicatorData(ind.code, ind.desc);
                            return (
                              <div key={ind.code} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
                                <div className="flex items-start gap-3">
                                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded flex-shrink-0 mt-0.5">{ind.code}</span>
                                  <p className="text-sm flex-1 leading-relaxed">{ind.desc}</p>
                                  <div className="flex items-center gap-2 flex-shrink-0">
                                    <PerformanceBadge level={data.performance_level} />
                                    {data.score_percentage > 0 && (
                                      <span className="text-xs text-muted-foreground">{data.score_percentage}%</span>
                                    )}
                                    <button
                                      onClick={() => setEditingIndicator({ ...data, domainCode: domain.code, standardCode: standard.code })}
                                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                    >
                                      <Edit2 size={14} />
                                    </button>
                                  </div>
                                </div>
                                {data.responsible && (
                                  <div className="mr-16 mt-1">
                                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">
                                      👤 {data.responsible}
                                    </span>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

      {editingIndicator && (
        <EditIndicatorModal
          indicator={editingIndicator}
          onSave={(_, form) => handleSave(editingIndicator.id, editingIndicator.code, editingIndicator.desc, editingIndicator.domainCode, editingIndicator.standardCode, form)}
          onClose={() => setEditingIndicator(null)}
        />
      )}
    </div>
  );
}