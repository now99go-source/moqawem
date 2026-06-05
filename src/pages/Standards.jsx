import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import { useStructure } from "../hooks/useStructure";
import PerformanceBadge from "../components/PerformanceBadge";
import AddEvidenceInline from "../components/AddEvidenceInline";
import { REQUIRED_DOCS } from "../utils/requiredDocuments";
import { trackActivity } from "../utils/trackActivity";
import PrintReport from "../components/PrintReport";
import ExportPortfolioPDF from "../components/ExportPortfolioPDF";
import DomainEditModal from "../components/structure/DomainEditModal";
import StandardEditModal from "../components/structure/StandardEditModal";
import IndicatorEditModal from "../components/structure/IndicatorEditModal";
import DeleteConfirmModal from "../components/structure/DeleteConfirmModal";
import {
  ChevronDown, ChevronLeft, Plus, Edit2, Save, X,
  PaperclipIcon, Printer, Pencil, Check, Award, Trash2, Settings
} from "lucide-react";

function EvalModal({ indicator, onSave, onClose }) {
  const [form, setForm] = useState({
    performance_level: indicator.performance_level || "لم يُقيَّم",
    score_percentage: indicator.score_percentage || "",
    status: indicator.status || "لم يبدأ",
    responsible: indicator.responsible || "",
    notes: indicator.notes || "",
  });
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
                <button key={level}
                  onClick={() => setForm(f => ({ ...f, performance_level: level }))}
                  className={`py-2 rounded-lg border text-sm font-medium transition-all ${form.performance_level === level ? "border-primary bg-primary text-white" : "border-border hover:bg-secondary"}`}>
                  <PerformanceBadge level={level} />
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">نسبة التحقق %</label>
            <input type="number" min="0" max="100" value={form.score_percentage}
              onChange={e => setForm(f => ({ ...f, score_percentage: Number(e.target.value) }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="0 - 100" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">حالة الإنجاز</label>
            <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              {["لم يبدأ", "جاري", "مكتمل", "يحتاج تحسين"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">المسؤول</label>
            <input value={form.responsible} onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="اسم المسؤول أو دوره" />
          </div>
          <div>
            <label className="text-sm font-medium mb-1.5 block">ملاحظات</label>
            <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} rows={2}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <button onClick={() => onSave(form)}
            className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 flex items-center justify-center gap-2">
            <Save size={15} /> حفظ التقييم
          </button>
          <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

export default function Standards() {
  const { user } = useAuth();
  const { structure, loading: structLoading, reload: reloadStructure, DOMAIN_COLORS } = useStructure();

  const [evaluations, setEvaluations] = useState({});
  const [tasksByCode, setTasksByCode] = useState({});
  const [expandedDomains, setExpandedDomains] = useState({ "1": true });
  const [expandedStandards, setExpandedStandards] = useState({});
  const [evalModal, setEvalModal] = useState(null);
  const [addingEvidenceFor, setAddingEvidenceFor] = useState(null);
  const [evidenceByCode, setEvidenceByCode] = useState({});
  const [editingEvidenceName, setEditingEvidenceName] = useState(null);
  const [editingEvidenceNameVal, setEditingEvidenceNameVal] = useState("");
  const [showPrint, setShowPrint] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Structure management modals
  const [domainModal, setDomainModal] = useState(null);
  const [standardModal, setStandardModal] = useState(null);
  const [indModal, setIndModal] = useState(null);
  const [deleteModal, setDeleteModal] = useState(null);

  useEffect(() => {
    Promise.all([
      base44.entities.Indicator.list(),
      base44.entities.Task.list(),
      base44.entities.Evidence.list(),
    ]).then(([list, tasks, evidences]) => {
      const evalMap = {};
      list.forEach(i => { evalMap[i.code] = i; });
      setEvaluations(evalMap);

      const emap = {};
      evidences.forEach(e => {
        if (e.indicator_code) {
          if (!emap[e.indicator_code]) emap[e.indicator_code] = [];
          emap[e.indicator_code].push(e);
        }
      });
      setEvidenceByCode(emap);

      const tmap = {};
      tasks.forEach(t => {
        if (!t.indicator_code) return;
        const code = t.indicator_code.trim();
        if (!tmap[code]) tmap[code] = [];
        tmap[code].push(t);
      });
      setTasksByCode(tmap);
    });
  }, []);

  const toggleDomain = (code) => setExpandedDomains(p => ({ ...p, [code]: !p[code] }));
  const toggleStandard = (code) => setExpandedStandards(p => ({ ...p, [code]: !p[code] }));

  const handleEvalSave = async (form) => {
    const { id, code, desc, domainCode, standardCode } = evalModal;
    const data = { code, description: desc, domain_id: domainCode, standard_id: standardCode, ...form };
    let saved;
    if (id) {
      saved = await base44.entities.Indicator.update(id, data);
    } else {
      saved = await base44.entities.Indicator.create(data);
    }
    setEvaluations(prev => ({ ...prev, [code]: saved }));
    await trackActivity(user, "تقييم مؤشر", { indicator_code: code, details: form.performance_level });
    setEvalModal(null);
  };

  const getIndicatorData = (code, desc) => ({
    ...(evaluations[code] || {}),
    code, desc,
    performance_level: evaluations[code]?.performance_level || "لم يُقيَّم",
    status: evaluations[code]?.status || "لم يبدأ",
  });

  // ---- Structure CRUD ----
  const saveDomain = async (form) => {
    const d = domainModal?.domain;
    if (d && !d._isCustom) {
      if (d._dbId) {
        await base44.entities.CustomDomain.update(d._dbId, { name: form.name, code: d.code, color: form.color, is_custom: false });
      } else {
        await base44.entities.CustomDomain.create({ name: form.name, code: d.code, color: form.color, is_custom: false });
      }
    } else if (d?._isCustom) {
      await base44.entities.CustomDomain.update(d._dbId, { name: form.name, code: form.code, color: form.color, is_custom: true });
    } else {
      await base44.entities.CustomDomain.create({ name: form.name, code: form.code, color: form.color, is_custom: true });
    }
    reloadStructure();
    setDomainModal(null);
  };

  const deleteDomain = async (d) => {
    if (d._isCustom && d._dbId) await base44.entities.CustomDomain.delete(d._dbId);
    reloadStructure();
    setDeleteModal(null);
  };

  const saveStandard = async (form) => {
    const { standard, domainCode } = standardModal;
    if (standard && !standard._isCustom) {
      if (standard._dbId) {
        await base44.entities.CustomStandard.update(standard._dbId, { name: form.name, code: standard.code, domain_code: domainCode, is_custom: false });
      } else {
        await base44.entities.CustomStandard.create({ name: form.name, code: standard.code, domain_code: domainCode, is_custom: false });
      }
    } else if (standard?._isCustom) {
      await base44.entities.CustomStandard.update(standard._dbId, { name: form.name, code: form.code, domain_code: domainCode, is_custom: true });
    } else {
      await base44.entities.CustomStandard.create({ name: form.name, code: form.code, domain_code: domainCode, is_custom: true });
    }
    reloadStructure();
    setStandardModal(null);
  };

  const deleteStandard = async (s) => {
    if (s._isCustom && s._dbId) await base44.entities.CustomStandard.delete(s._dbId);
    reloadStructure();
    setDeleteModal(null);
  };

  const saveIndicator = async (form) => {
    const { indicator } = indModal;
    if (indicator && !indicator._isCustom) {
      const data = { code: indicator.code, override_desc: form.desc, desc: form.desc, tamayuz: form.tamayuz, tools: form.tools, standard_code: form.standard_code, domain_code: form.domain_code, is_custom: false };
      if (indicator._dbId) {
        await base44.entities.CustomIndicator.update(indicator._dbId, data);
      } else {
        await base44.entities.CustomIndicator.create(data);
      }
    } else if (indicator?._isCustom) {
      await base44.entities.CustomIndicator.update(indicator._dbId, { ...form, is_custom: true });
    } else {
      await base44.entities.CustomIndicator.create({ ...form, is_custom: true });
    }
    reloadStructure();
    setIndModal(null);
  };

  const deleteIndicator = async (ind, standardCode, domainCode) => {
    if (ind._isCustom && ind._dbId) {
      await base44.entities.CustomIndicator.delete(ind._dbId);
    } else {
      if (ind._dbId) {
        await base44.entities.CustomIndicator.update(ind._dbId, { is_deleted: true });
      } else {
        await base44.entities.CustomIndicator.create({ code: ind.code, desc: ind.desc, standard_code: standardCode, domain_code: domainCode, is_deleted: true, is_custom: false });
      }
    }
    reloadStructure();
    setDeleteModal(null);
  };

  const totalIndicatorsCount = structure.flatMap(d => d.standards?.flatMap(s => s.indicators) || []).length;

  if (structLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-4 fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold">المعايير والمؤشرات</h1>
          <p className="text-muted-foreground text-sm mt-1">تقييم المؤشرات وفق معايير هيئة تقويم التعليم والتدريب</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button onClick={() => setDomainModal({})}
            className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-3 py-2 rounded-xl text-sm font-medium transition-colors">
            <Plus size={14} /> إضافة مجال
          </button>
          <button onClick={() => setShowExport(true)}
            className="flex items-center gap-2 bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
            <Award size={15} /> ملف الإنجاز
          </button>
          <button onClick={() => setShowPrint(true)}
            className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90 transition-colors">
            <Printer size={15} /> طباعة
          </button>
          <div className="bg-card border border-border rounded-lg px-4 py-2 text-sm">
            <span className="font-bold text-primary">{Object.keys(evaluations).length}</span>
            <span className="text-muted-foreground"> / {totalIndicatorsCount} مؤشر مُقيَّم</span>
          </div>
        </div>
      </div>

      {showExport && <ExportPortfolioPDF etecStructure={structure} evaluations={evaluations} evidenceByCode={evidenceByCode} onClose={() => setShowExport(false)} />}
      {showPrint && <PrintReport etecStructure={structure} evaluations={evaluations} evidenceByCode={evidenceByCode} onClose={() => setShowPrint(false)} />}

      {/* Domains */}
      {structure.map((domain) => {
        const colors = DOMAIN_COLORS[domain.color] || DOMAIN_COLORS.teal;
        const isExpanded = expandedDomains[domain.code];
        const allIndicators = domain.standards?.flatMap(s => s.indicators) || [];
        const domainEvaluated = allIndicators.filter(i => evaluations[i.code]).length;

        return (
          <div key={domain.code} className="bg-card rounded-xl border border-border overflow-hidden">
            {/* Domain header */}
            <div className={`flex items-center ${colors.bg} text-white`}>
              <button onClick={() => toggleDomain(domain.code)}
                className="flex-1 flex items-center gap-4 p-4 hover:opacity-95 transition-opacity text-right">
                <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center font-bold text-sm flex-shrink-0">{domain.code}</div>
                <div className="flex-1 text-right">
                  <div className="font-bold">{domain.name || domain.domain}</div>
                  <div className="text-xs text-white/70">{allIndicators.length} مؤشر — {domainEvaluated} مُقيَّم</div>
                </div>
                <ChevronDown size={18} className={`transition-transform ${isExpanded ? "rotate-180" : ""}`} />
              </button>
              <div className="flex items-center gap-1 px-3">
                <button title="تعديل المجال" onClick={() => setDomainModal({ domain })}
                  className="p-1.5 rounded-lg bg-white/10 hover:bg-white/25 transition-colors">
                  <Edit2 size={13} />
                </button>
                {domain._isCustom && (
                  <button title="حذف المجال" onClick={() => setDeleteModal({ type: "domain", item: domain, label: domain.name || domain.domain })}
                    className="p-1.5 rounded-lg bg-white/10 hover:bg-red-400/60 transition-colors">
                    <Trash2 size={13} />
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="divide-y divide-border">
                {domain.standards?.map(standard => {
                  const isStdExpanded = expandedStandards[standard.code] !== false;
                  return (
                    <div key={standard.code}>
                      {/* Standard header */}
                      <div className={`flex items-center ${colors.light} border-b border-border`}>
                        <button onClick={() => toggleStandard(standard.code)}
                          className="flex-1 flex items-center gap-3 px-5 py-3 hover:opacity-90 transition-opacity text-right">
                          <ChevronLeft size={15} className={`${colors.text} transition-transform ${isStdExpanded ? "-rotate-90" : ""}`} />
                          <span className={`text-xs font-mono ${colors.text} bg-white/70 px-2 py-0.5 rounded`}>{standard.code}</span>
                          <span className={`font-semibold text-sm ${colors.text}`}>{standard.name}</span>
                          <span className="mr-auto text-xs text-muted-foreground">{standard.indicators?.length || 0} مؤشر</span>
                        </button>
                        <div className="flex items-center gap-1 px-3">
                          <button title="إضافة مؤشر" onClick={() => setIndModal({ standardCode: standard.code, domainCode: domain.code })}
                            className={`p-1.5 rounded-lg bg-white/60 hover:bg-white transition-colors ${colors.text}`}>
                            <Plus size={13} />
                          </button>
                          <button title="تعديل المعيار" onClick={() => setStandardModal({ standard, domainCode: domain.code })}
                            className={`p-1.5 rounded-lg bg-white/60 hover:bg-white transition-colors ${colors.text}`}>
                            <Edit2 size={13} />
                          </button>
                          {standard._isCustom && (
                            <button title="حذف المعيار" onClick={() => setDeleteModal({ type: "standard", item: standard, label: standard.name })}
                              className="p-1.5 rounded-lg bg-white/60 hover:bg-red-100 text-red-600 transition-colors">
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Indicators */}
                      {isStdExpanded && (
                        <div className="divide-y divide-border/50">
                          {standard.indicators?.map(ind => {
                            const data = getIndicatorData(ind.code, ind.desc);
                            return (
                              <div key={ind.code} className="px-5 py-3 hover:bg-secondary/30 transition-colors">
                                <div className="flex items-start gap-3">
                                  <span className="text-xs font-mono text-muted-foreground bg-secondary px-2 py-0.5 rounded flex-shrink-0 mt-0.5">{ind.code}</span>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-sm leading-relaxed">{ind.desc}</p>
                                    {ind.tamayuz && (
                                      <p className="text-xs text-amber-700 mt-1 leading-relaxed">
                                        <span className="font-semibold">★ التميز: </span>{ind.tamayuz}
                                      </p>
                                    )}
                                    {ind.tools?.length > 0 && (
                                      <div className="mt-1.5 flex flex-wrap gap-1">
                                        {ind.tools.map(tool => (
                                          <span key={tool} className="text-xs bg-teal-50 text-teal-700 border border-teal-200 rounded px-2 py-0.5 font-medium">{tool}</span>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                  <div className="flex items-center gap-1.5 flex-shrink-0">
                                    <PerformanceBadge level={data.performance_level} />
                                    {data.score_percentage > 0 && <span className="text-xs text-muted-foreground">{data.score_percentage}%</span>}
                                    <button onClick={() => setAddingEvidenceFor(prev => prev?.code === ind.code ? null : { code: ind.code })}
                                      className={`p-1.5 rounded-lg transition-colors ${addingEvidenceFor?.code === ind.code ? "bg-blue-100 text-blue-600" : "hover:bg-blue-50 text-muted-foreground hover:text-blue-600"}`}
                                      title="إضافة شاهد"><PaperclipIcon size={14} /></button>
                                    <button onClick={() => setEvalModal({ ...data, domainCode: domain.code, standardCode: standard.code })}
                                      className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                                      title="تقييم المؤشر"><Edit2 size={14} /></button>
                                    <button onClick={() => setIndModal({ indicator: ind, standardCode: standard.code, domainCode: domain.code })}
                                      className="p-1.5 rounded-lg hover:bg-amber-50 text-muted-foreground hover:text-amber-700 transition-colors"
                                      title="تعديل نص المؤشر"><Settings size={14} /></button>
                                    <button onClick={() => setDeleteModal({ type: "indicator", item: ind, standardCode: standard.code, domainCode: domain.code, label: ind.code })}
                                      className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-600 transition-colors"
                                      title="حذف المؤشر"><Trash2 size={14} /></button>
                                  </div>
                                </div>

                                <div className="mt-2 mr-14 space-y-1.5">
                                  {(tasksByCode[ind.code] || []).filter(t => t.status !== "مكتملة").map(t => (
                                    <span key={t.id} className="inline-flex items-center gap-1 text-xs bg-blue-50 text-blue-700 border border-blue-200 rounded-full px-2.5 py-0.5 font-medium">👤 {t.assigned_to}</span>
                                  ))}
                                  {data.responsible && (
                                    <span className="inline-flex items-center gap-1 text-xs bg-primary/10 text-primary border border-primary/20 rounded-full px-2.5 py-0.5 font-medium">👤 {data.responsible}</span>
                                  )}
                                  {(evidenceByCode[ind.code] || []).length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                      {(evidenceByCode[ind.code] || []).map(ev => (
                                        <span key={ev.id} className="inline-flex items-center gap-1 text-xs bg-green-50 text-green-700 border border-green-200 rounded-lg px-2 py-0.5 max-w-[220px]">
                                          {ev.file_url
                                            ? <a href={ev.file_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:underline truncate"><PaperclipIcon size={10} className="flex-shrink-0" /><span className="truncate">{ev.file_name || ev.title}</span></a>
                                            : <span className="flex items-center gap-1 truncate"><PaperclipIcon size={10} className="flex-shrink-0" /><span className="truncate">{ev.title}</span></span>
                                          }
                                          {editingEvidenceName === ev.id ? (
                                            <span className="flex items-center gap-0.5 mr-1">
                                              <input value={editingEvidenceNameVal} onChange={e => setEditingEvidenceNameVal(e.target.value)}
                                                className="w-24 border border-green-300 rounded px-1 text-xs bg-white" autoFocus />
                                              <button onClick={async () => {
                                                await base44.entities.Evidence.update(ev.id, { file_name: editingEvidenceNameVal, title: editingEvidenceNameVal });
                                                setEvidenceByCode(prev => ({ ...prev, [ind.code]: prev[ind.code].map(e => e.id === ev.id ? { ...e, file_name: editingEvidenceNameVal, title: editingEvidenceNameVal } : e) }));
                                                setEditingEvidenceName(null);
                                              }} className="text-green-600 hover:text-green-800"><Check size={11} /></button>
                                              <button onClick={() => setEditingEvidenceName(null)} className="text-red-400 hover:text-red-600"><X size={11} /></button>
                                            </span>
                                          ) : (
                                            <button onClick={() => { setEditingEvidenceName(ev.id); setEditingEvidenceNameVal(ev.file_name || ev.title); }} className="text-green-400 hover:text-green-700 mr-0.5 flex-shrink-0"><Pencil size={10} /></button>
                                          )}
                                        </span>
                                      ))}
                                    </div>
                                  )}
                                  {REQUIRED_DOCS[ind.code] && (
                                    <div>
                                      <div className="text-xs text-blue-600 font-semibold mb-1">📂 الوثائق والسجلات المطلوبة:</div>
                                      <div className="flex flex-wrap gap-1.5">
                                        {REQUIRED_DOCS[ind.code].map(doc => {
                                          const linked = (evidenceByCode[ind.code] || []).find(ev => ev.title === doc || ev.description?.includes(doc));
                                          return (
                                            <button key={doc} onClick={() => setAddingEvidenceFor({ code: ind.code, docTitle: doc })}
                                              className={`inline-flex items-center gap-1.5 text-xs rounded-md px-2.5 py-1 font-medium border transition-all ${linked ? "bg-green-50 text-green-700 border-green-300" : "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100"}`}>
                                              <PaperclipIcon size={11} />{doc}{linked && <span className="text-green-500">✓</span>}
                                            </button>
                                          );
                                        })}
                                      </div>
                                    </div>
                                  )}
                                </div>

                                {addingEvidenceFor?.code === ind.code && (
                                  <AddEvidenceInline
                                    indicatorCode={ind.code}
                                    indicatorId={evaluations[ind.code]?.id || null}
                                    defaultTitle={addingEvidenceFor?.docTitle || ""}
                                    onSaved={(saved) => {
                                      setEvidenceByCode(prev => ({ ...prev, [ind.code]: [...(prev[ind.code] || []), saved] }));
                                      setAddingEvidenceFor(null);
                                    }}
                                    onClose={() => setAddingEvidenceFor(null)}
                                  />
                                )}
                              </div>
                            );
                          })}
                          <div className="px-5 py-2">
                            <button onClick={() => setIndModal({ standardCode: standard.code, domainCode: domain.code })}
                              className={`flex items-center gap-1.5 text-xs ${colors.text} hover:opacity-80 transition-opacity font-medium`}>
                              <Plus size={13} /> إضافة مؤشر جديد لـ "{standard.name}"
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
                <div className="px-5 py-3 bg-secondary/30">
                  <button onClick={() => setStandardModal({ domainCode: domain.code })}
                    className={`flex items-center gap-1.5 text-sm ${colors.text} hover:opacity-80 transition-opacity font-medium`}>
                    <Plus size={14} /> إضافة معيار جديد لمجال "{domain.name || domain.domain}"
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}

      {/* Modals */}
      {evalModal && (
        <EvalModal indicator={evalModal} onSave={handleEvalSave} onClose={() => setEvalModal(null)} />
      )}
      {domainModal && (
        <DomainEditModal domain={domainModal.domain} onSave={saveDomain} onClose={() => setDomainModal(null)} />
      )}
      {standardModal && (
        <StandardEditModal standard={standardModal.standard} domainCode={standardModal.domainCode} onSave={saveStandard} onClose={() => setStandardModal(null)} />
      )}
      {indModal && (
        <IndicatorEditModal indicator={indModal.indicator} standardCode={indModal.standardCode} domainCode={indModal.domainCode} onSave={saveIndicator} onClose={() => setIndModal(null)} />
      )}
      {deleteModal && (
        <DeleteConfirmModal
          title={`حذف ${deleteModal.type === "domain" ? "المجال" : deleteModal.type === "standard" ? "المعيار" : "المؤشر"}`}
          message={`هل أنت متأكد من حذف "${deleteModal.label}"؟`}
          onConfirm={() => {
            if (deleteModal.type === "domain") deleteDomain(deleteModal.item);
            else if (deleteModal.type === "standard") deleteStandard(deleteModal.item);
            else deleteIndicator(deleteModal.item, deleteModal.standardCode, deleteModal.domainCode);
          }}
          onClose={() => setDeleteModal(null)}
        />
      )}
    </div>
  );
}