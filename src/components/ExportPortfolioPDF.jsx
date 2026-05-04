import { useState } from "react";
import { X, Download, Loader2, BookOpen, Award, FileText, Link2 } from "lucide-react";

const SCHOOL_NAME = "مدرسة الموهوبين التقنية الثانوية للبنين";
const REPORT_YEAR = "2026";
const FILE_TITLE = `ملف انجاز المدرسة - فريق التقويم الذاتي - ${SCHOOL_NAME} - ${REPORT_YEAR}`;

const DOMAIN_PALETTE = {
  purple: { primary: "#6d28d9", light: "#f5f3ff", border: "#c4b5fd", grad1: "#7c3aed", grad2: "#4c1d95" },
  blue:   { primary: "#1d4ed8", light: "#eff6ff", border: "#93c5fd", grad1: "#2563eb", grad2: "#1e3a8a" },
  green:  { primary: "#15803d", light: "#f0fdf4", border: "#86efac", grad1: "#16a34a", grad2: "#14532d" },
  orange: { primary: "#c2410c", light: "#fff7ed", border: "#fdba74", grad1: "#ea580c", grad2: "#7c2d12" },
};

const LEVEL_CONFIG = {
  "تهيئة":    { color: "#dc2626", bg: "#fef2f2", border: "#fca5a5", symbol: "⬇", pct: "< 50%" },
  "انطلاق":   { color: "#ea580c", bg: "#fff7ed", border: "#fdba74", symbol: "→", pct: "50–74%" },
  "تقدم":     { color: "#1d4ed8", bg: "#eff6ff", border: "#93c5fd", symbol: "↑", pct: "75–89%" },
  "تميز":     { color: "#15803d", bg: "#f0fdf4", border: "#86efac", symbol: "★", pct: "≥ 90%" },
  "لم يُقيَّم": { color: "#6b7280", bg: "#f9fafb", border: "#d1d5db", symbol: "○", pct: "—" },
};

function buildHTML(etecStructure, evaluations, evidenceByCode) {
  const now = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  const totalIndicators = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators)).length;
  const evaluated = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators))
    .filter(i => evaluations[i.code]?.performance_level && evaluations[i.code].performance_level !== "لم يُقيَّم").length;
  const tamayuzCount = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators))
    .filter(i => evaluations[i.code]?.performance_level === "تميز").length;
  const taqadumCount = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators))
    .filter(i => evaluations[i.code]?.performance_level === "تقدم").length;
  const totalEvidence = Object.values(evidenceByCode).reduce((s, arr) => s + arr.length, 0);

  // TOC entries
  const tocItems = etecStructure.map(d => `
    <div style="display:flex;align-items:center;gap:10px;padding:8px 0;border-bottom:1px dashed #e5e7eb;">
      <div style="width:28px;height:28px;border-radius:8px;background:${DOMAIN_PALETTE[d.color].primary};color:#fff;display:flex;align-items:center;justify-content:center;font-weight:800;font-size:14px;flex-shrink:0;">${d.code}</div>
      <a href="#domain-${d.code}" style="color:${DOMAIN_PALETTE[d.color].primary};font-weight:700;font-size:14px;text-decoration:none;">${d.domain}</a>
      <span style="margin-right:auto;color:#9ca3af;font-size:12px;">${d.standards.flatMap(s => s.indicators).length} مؤشر</span>
    </div>
  `).join("");

  // Domain sections
  const domainSections = etecStructure.map(domain => {
    const pal = DOMAIN_PALETTE[domain.color];
    const domainIndicators = domain.standards.flatMap(s => s.indicators);
    const domainEvaluated = domainIndicators.filter(i => evaluations[i.code]?.performance_level && evaluations[i.code].performance_level !== "لم يُقيَّم").length;
    const domainEvidence = domainIndicators.reduce((s, i) => s + (evidenceByCode[i.code]?.length || 0), 0);
    const pct = domainIndicators.length > 0 ? Math.round((domainEvaluated / domainIndicators.length) * 100) : 0;

    const standardSections = domain.standards.map(std => {
      const indicatorRows = std.indicators.map((ind, idx) => {
        const ev = evaluations[ind.code] || {};
        const level = ev.performance_level || "لم يُقيَّم";
        const lc = LEVEL_CONFIG[level];
        const evidences = evidenceByCode[ind.code] || [];

        const evidenceLinks = evidences.map(e => {
          if (e.file_url) {
            return `<a href="${e.file_url}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;color:#15803d;border:1px solid #86efac;border-radius:6px;padding:3px 8px;font-size:10px;text-decoration:none;margin:2px;">
              📎 ${e.file_name || e.title}
            </a>`;
          }
          return `<span style="display:inline-flex;align-items:center;gap:4px;background:#f0fdf4;color:#15803d;border:1px solid #86efac;border-radius:6px;padding:3px 8px;font-size:10px;margin:2px;">📎 ${e.title}</span>`;
        }).join("");

        return `
          <tr style="background:${idx % 2 === 0 ? "#ffffff" : "#fafafa"};">
            <td style="padding:10px 12px;font-family:monospace;font-size:10px;color:#6b7280;white-space:nowrap;border-bottom:1px solid #f3f4f6;vertical-align:top;">${ind.code}</td>
            <td style="padding:10px 12px;font-size:12px;color:#1f2937;line-height:1.7;border-bottom:1px solid #f3f4f6;vertical-align:top;">
              <div style="font-weight:500;">${ind.desc}</div>
              ${evidenceLinks ? `<div style="margin-top:6px;">${evidenceLinks}</div>` : ""}
              ${ev.notes ? `<div style="margin-top:4px;font-size:10px;color:#6b7280;font-style:italic;">ملاحظة: ${ev.notes}</div>` : ""}
            </td>
            <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #f3f4f6;vertical-align:top;">
              <span style="display:inline-flex;align-items:center;gap:5px;background:${lc.bg};color:${lc.color};border:1px solid ${lc.border};border-radius:20px;padding:4px 12px;font-size:11px;font-weight:700;white-space:nowrap;">
                ${lc.symbol} ${level}
              </span>
              ${ev.score_percentage ? `<div style="margin-top:4px;font-size:11px;color:${lc.color};font-weight:700;">${ev.score_percentage}%</div>` : ""}
            </td>
            <td style="padding:10px 12px;text-align:center;border-bottom:1px solid #f3f4f6;vertical-align:top;font-size:11px;color:#374151;">${ev.responsible || "—"}</td>
          </tr>
        `;
      }).join("");

      return `
        <div style="margin-bottom:20px;" id="std-${std.code}">
          <div style="display:flex;align-items:center;gap:8px;background:${pal.light};border:1px solid ${pal.border};border-radius:8px;padding:10px 14px;margin-bottom:8px;">
            <span style="background:${pal.primary};color:#fff;border-radius:5px;padding:2px 8px;font-size:11px;font-weight:700;">${std.code}</span>
            <span style="color:${pal.primary};font-weight:700;font-size:13px;">${std.name}</span>
            <span style="margin-right:auto;color:#6b7280;font-size:11px;">${std.indicators.length} مؤشر</span>
          </div>
          <table style="width:100%;border-collapse:collapse;font-size:12px;border-radius:8px;overflow:hidden;border:1px solid #e5e7eb;">
            <thead>
              <tr style="background:#f9fafb;">
                <th style="padding:8px 12px;text-align:right;color:#6b7280;font-weight:600;font-size:11px;border-bottom:2px solid #e5e7eb;width:12%;">الرمز</th>
                <th style="padding:8px 12px;text-align:right;color:#6b7280;font-weight:600;font-size:11px;border-bottom:2px solid #e5e7eb;width:50%;">المؤشر والشواهد</th>
                <th style="padding:8px 12px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;border-bottom:2px solid #e5e7eb;width:20%;">مستوى الأداء</th>
                <th style="padding:8px 12px;text-align:center;color:#6b7280;font-weight:600;font-size:11px;border-bottom:2px solid #e5e7eb;width:18%;">المسؤول</th>
              </tr>
            </thead>
            <tbody>${indicatorRows}</tbody>
          </table>
        </div>
      `;
    }).join("");

    return `
      <div style="margin-bottom:40px;page-break-inside:avoid;" id="domain-${domain.code}">
        <!-- Domain Header -->
        <div style="background:linear-gradient(135deg,${pal.grad1},${pal.grad2});color:#fff;border-radius:12px 12px 0 0;padding:18px 24px;display:flex;align-items:center;justify-content:space-between;gap:16px;">
          <div style="display:flex;align-items:center;gap:14px;">
            <div style="width:44px;height:44px;border-radius:12px;background:rgba(255,255,255,0.2);display:flex;align-items:center;justify-content:center;font-weight:800;font-size:20px;">${domain.code}</div>
            <div>
              <div style="font-weight:800;font-size:18px;">المجال ${domain.code}: ${domain.domain}</div>
              <div style="font-size:12px;opacity:0.8;margin-top:2px;">${domainEvaluated} / ${domainIndicators.length} مؤشر مُقيَّم — ${domainEvidence} شاهد مرفوع</div>
            </div>
          </div>
          <div style="text-align:center;min-width:80px;">
            <div style="font-size:28px;font-weight:900;">${pct}%</div>
            <div style="font-size:11px;opacity:0.8;">نسبة الإنجاز</div>
            <div style="background:rgba(255,255,255,0.25);border-radius:4px;height:6px;margin-top:6px;">
              <div style="background:#fff;border-radius:4px;height:6px;width:${pct}%;"></div>
            </div>
          </div>
        </div>
        <!-- Standards -->
        <div style="border:1px solid ${pal.border};border-top:none;border-radius:0 0 12px 12px;padding:20px;">
          ${standardSections}
        </div>
      </div>
    `;
  }).join("");

  // Legend
  const legendItems = Object.entries(LEVEL_CONFIG).map(([level, lc]) => `
    <span style="display:inline-flex;align-items:center;gap:6px;background:${lc.bg};color:${lc.color};border:1px solid ${lc.border};border-radius:16px;padding:4px 12px;font-size:11px;font-weight:700;margin:3px;">
      ${lc.symbol} ${level} <span style="opacity:0.7;font-weight:400;">(${lc.pct})</span>
    </span>
  `).join("");

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>${FILE_TITLE}</title>
<link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet"/>
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Tajawal', Arial, sans-serif; direction: rtl; background: #f8fafc; color: #1e293b; }
  a { color: inherit; }
  @media print {
    body { background: white; }
    .no-print { display: none !important; }
    .page-break { page-break-before: always; }
  }
</style>
</head>
<body>

<!-- ========== COVER PAGE ========== -->
<div style="min-height:100vh;display:flex;flex-direction:column;justify-content:center;align-items:center;background:linear-gradient(160deg,#1e1b4b 0%,#3730a3 50%,#6d28d9 100%);color:#fff;padding:60px 40px;text-align:center;position:relative;overflow:hidden;">
  <!-- Decorative circles -->
  <div style="position:absolute;top:-80px;left:-80px;width:300px;height:300px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
  <div style="position:absolute;bottom:-60px;right:-60px;width:250px;height:250px;border-radius:50%;background:rgba(255,255,255,0.05);"></div>
  <div style="position:absolute;top:40%;left:5%;width:100px;height:100px;border-radius:50%;border:2px solid rgba(255,255,255,0.1);"></div>

  <div style="position:relative;z-index:1;max-width:700px;">
    <!-- ETEC Badge -->
    <div style="display:inline-flex;align-items:center;gap:8px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.3);border-radius:50px;padding:8px 20px;font-size:13px;margin-bottom:32px;backdrop-filter:blur(10px);">
      🏛️ هيئة تقويم التعليم والتدريب — إطار ضمان الجودة المدرسي
    </div>

    <!-- Star decoration -->
    <div style="font-size:48px;margin-bottom:16px;">🏫</div>

    <!-- Main title -->
    <div style="font-size:13px;letter-spacing:2px;text-transform:uppercase;opacity:0.7;margin-bottom:12px;font-weight:300;">ملف الإنجاز المدرسي</div>
    <h1 style="font-size:36px;font-weight:900;line-height:1.3;margin-bottom:8px;text-shadow:0 2px 20px rgba(0,0,0,0.3);">
      فريق التقويم الذاتي
    </h1>
    <h2 style="font-size:22px;font-weight:700;opacity:0.9;margin-bottom:24px;">${SCHOOL_NAME}</h2>

    <!-- Year badge -->
    <div style="display:inline-block;background:linear-gradient(135deg,#f59e0b,#d97706);border-radius:12px;padding:10px 28px;font-size:20px;font-weight:800;margin-bottom:40px;box-shadow:0 4px 20px rgba(245,158,11,0.4);">
      العام ${REPORT_YEAR}م
    </div>

    <!-- Stats row -->
    <div style="display:flex;gap:20px;justify-content:center;flex-wrap:wrap;margin-top:8px;">
      ${[
        { icon: "📊", val: totalIndicators, label: "مؤشر تقويمي" },
        { icon: "✅", val: evaluated, label: "مؤشر مُقيَّم" },
        { icon: "⭐", val: tamayuzCount, label: "مستوى تميز" },
        { icon: "📎", val: totalEvidence, label: "شاهد موثق" },
      ].map(s => `
        <div style="background:rgba(255,255,255,0.15);backdrop-filter:blur(10px);border:1px solid rgba(255,255,255,0.25);border-radius:16px;padding:16px 24px;min-width:120px;">
          <div style="font-size:24px;margin-bottom:4px;">${s.icon}</div>
          <div style="font-size:28px;font-weight:900;">${s.val}</div>
          <div style="font-size:12px;opacity:0.8;">${s.label}</div>
        </div>
      `).join("")}
    </div>

    <!-- Date -->
    <div style="margin-top:40px;font-size:13px;opacity:0.6;">تاريخ الإصدار: ${now}</div>
  </div>
</div>

<!-- ========== PAGE 2: INTRO & TOC ========== -->
<div class="page-break" style="max-width:900px;margin:0 auto;padding:50px 40px;">

  <!-- Introduction -->
  <div style="background:linear-gradient(135deg,#f5f3ff,#ede9fe);border:2px solid #c4b5fd;border-radius:16px;padding:28px;margin-bottom:36px;">
    <h2 style="font-size:20px;font-weight:800;color:#4c1d95;margin-bottom:12px;display:flex;align-items:center;gap:10px;">
      📋 مقدمة الملف
    </h2>
    <p style="font-size:14px;line-height:2;color:#374151;">
      يُعدّ هذا الملف وثيقةً شاملةً لجهود فريق التقويم الذاتي في <strong>${SCHOOL_NAME}</strong> خلال العام الدراسي <strong>${REPORT_YEAR}م</strong>،
      وفق إطار ضمان الجودة المدرسي الصادر عن <strong>هيئة تقويم التعليم والتدريب (إتقان)</strong>.
      يشمل الملف تقييم جميع المجالات الأربعة ومؤشراتها البالغة <strong>${totalIndicators} مؤشراً</strong>،
      مع توثيق الشواهد والمستندات الداعمة لكل مؤشر، ويهدف إلى إبراز جهود المدرسة في تحقيق الجودة والتميز التعليمي.
    </p>
  </div>

  <!-- Performance Legend -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:36px;">
    <h3 style="font-size:15px;font-weight:700;color:#374151;margin-bottom:14px;">🎯 مستويات الأداء المعتمدة</h3>
    <div style="display:flex;flex-wrap:wrap;gap:6px;">
      ${legendItems}
    </div>
  </div>

  <!-- Overall Summary -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:20px;margin-bottom:36px;">
    <h3 style="font-size:15px;font-weight:700;color:#374151;margin-bottom:16px;">📈 ملخص التقويم الكلي</h3>
    <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:12px;">
      ${etecStructure.map(d => {
        const pal = DOMAIN_PALETTE[d.color];
        const inds = d.standards.flatMap(s => s.indicators);
        const ev = inds.filter(i => evaluations[i.code]?.performance_level && evaluations[i.code].performance_level !== "لم يُقيَّم").length;
        const pct = inds.length > 0 ? Math.round((ev / inds.length) * 100) : 0;
        const tamayuz = inds.filter(i => evaluations[i.code]?.performance_level === "تميز").length;
        return `
          <div style="background:${pal.light};border:1px solid ${pal.border};border-radius:10px;padding:14px;text-align:center;">
            <a href="#domain-${d.code}" style="text-decoration:none;">
              <div style="font-size:22px;font-weight:900;color:${pal.primary};">${pct}%</div>
              <div style="font-size:11px;font-weight:700;color:${pal.primary};margin:4px 0;">${d.domain}</div>
              <div style="font-size:10px;color:#6b7280;">${ev}/${inds.length} مؤشر</div>
              ${tamayuz > 0 ? `<div style="font-size:10px;color:#15803d;margin-top:4px;">★ ${tamayuz} تميز</div>` : ""}
            </a>
          </div>
        `;
      }).join("")}
    </div>
  </div>

  <!-- Table of Contents -->
  <div style="background:#fff;border:1px solid #e5e7eb;border-radius:12px;padding:24px;">
    <h3 style="font-size:16px;font-weight:800;color:#1e1b4b;margin-bottom:16px;display:flex;align-items:center;gap:8px;">
      📑 فهرس المحتويات
    </h3>
    ${tocItems}
  </div>
</div>

<!-- ========== DOMAIN SECTIONS ========== -->
<div class="page-break" style="max-width:900px;margin:0 auto;padding:40px;">
  ${domainSections}
</div>

<!-- ========== FOOTER ========== -->
<div style="background:linear-gradient(135deg,#1e1b4b,#3730a3);color:#fff;padding:32px 40px;text-align:center;margin-top:20px;">
  <div style="font-size:16px;font-weight:700;margin-bottom:6px;">🏫 ${SCHOOL_NAME}</div>
  <div style="font-size:12px;opacity:0.7;margin-bottom:4px;">ملف الإنجاز المدرسي — فريق التقويم الذاتي — ${REPORT_YEAR}م</div>
  <div style="font-size:11px;opacity:0.5;">هيئة تقويم التعليم والتدريب — إطار ضمان الجودة المدرسي</div>
</div>

</body>
</html>`;
}

export default function ExportPortfolioPDF({ etecStructure, evaluations, evidenceByCode, onClose }) {
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState(false);
  const [htmlContent, setHtmlContent] = useState("");

  const generate = () => {
    const html = buildHTML(etecStructure, evaluations, evidenceByCode);
    setHtmlContent(html);
    return html;
  };

  const handlePreview = () => {
    const html = generate();
    setHtmlContent(html);
    setPreview(true);
  };

  const handleDownload = () => {
    setGenerating(true);
    const html = buildHTML(etecStructure, evaluations, evidenceByCode);
    const blob = new Blob([html], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${FILE_TITLE}.html`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setGenerating(false);
  };

  const handlePrintFromPreview = () => {
    const win = window.open("", "_blank");
    win.document.write(buildHTML(etecStructure, evaluations, evidenceByCode));
    win.document.close();
    win.onload = () => { win.focus(); win.print(); };
  };

  const totalIndicators = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators)).length;
  const totalEvidence = Object.values(evidenceByCode).reduce((s, arr) => s + arr.length, 0);
  const evaluated = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators))
    .filter(i => evaluations[i.code]?.performance_level && evaluations[i.code].performance_level !== "لم يُقيَّم").length;
  const tamayuzCount = etecStructure.flatMap(d => d.standards.flatMap(s => s.indicators))
    .filter(i => evaluations[i.code]?.performance_level === "تميز").length;

  if (preview) {
    return (
      <div className="fixed inset-0 bg-black/80 z-50 flex flex-col" dir="rtl">
        {/* Toolbar */}
        <div className="flex items-center gap-3 bg-gray-900 px-5 py-3 flex-shrink-0 no-print">
          <span className="text-white font-bold text-sm flex-1 truncate">📄 {FILE_TITLE}</span>
          <button onClick={handlePrintFromPreview} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            🖨️ طباعة / حفظ PDF
          </button>
          <button onClick={handleDownload} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <Download size={14} /> تحميل HTML
          </button>
          <button onClick={() => setPreview(false)} className="flex items-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm font-medium">
            <X size={14} /> رجوع
          </button>
        </div>
        {/* Preview iframe */}
        <iframe
          srcDoc={htmlContent}
          className="flex-1 w-full bg-white"
          title="preview"
        />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-l from-violet-700 to-indigo-900 p-6 text-white">
          <div className="flex items-start justify-between">
            <div>
              <div className="text-xs opacity-70 mb-1">تصدير ملف الإنجاز</div>
              <h2 className="text-lg font-black leading-snug">فريق التقويم الذاتي</h2>
              <div className="text-sm opacity-80 mt-1">{SCHOOL_NAME}</div>
              <div className="inline-block mt-2 bg-amber-400 text-amber-900 text-xs font-bold px-3 py-1 rounded-full">{REPORT_YEAR}م</div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white mt-1"><X size={20} /></button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-0 border-b border-gray-100">
          {[
            { icon: "📊", val: totalIndicators, label: "مؤشر" },
            { icon: "✅", val: evaluated, label: "مُقيَّم" },
            { icon: "⭐", val: tamayuzCount, label: "تميز" },
            { icon: "📎", val: totalEvidence, label: "شاهد" },
          ].map(s => (
            <div key={s.label} className="text-center py-4 border-l last:border-0 border-gray-100">
              <div className="text-xl">{s.icon}</div>
              <div className="text-xl font-black text-indigo-700">{s.val}</div>
              <div className="text-xs text-gray-500">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Content description */}
        <div className="p-5 space-y-3">
          <p className="text-sm text-gray-600 leading-relaxed">
            سيتم إنشاء <strong>ملف HTML تفاعلي</strong> يشمل جميع المجالات والمعايير والمؤشرات مع الشواهد الموثقة والروابط التفاعلية، مُصمَّم بشكل احترافي يعكس جهد المدرسة.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 space-y-1.5">
            {[
              { icon: "🏠", text: "صفحة غلاف احترافية مع إحصائيات" },
              { icon: "📑", text: "فهرس تفاعلي للتنقل السريع" },
              { icon: "📊", text: "جميع المجالات والمؤشرات مُنسَّقة" },
              { icon: "📎", text: "روابط الشواهد قابلة للنقر" },
              { icon: "🖨️", text: "قابل للطباعة مباشرة كـ PDF" },
            ].map(item => (
              <div key={item.text} className="flex items-center gap-2 text-sm text-blue-800">
                <span>{item.icon}</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-800">
            💡 <strong>نصيحة:</strong> بعد المعاينة، انقر "طباعة / حفظ PDF" ثم اختر "حفظ كـ PDF" من خيارات الطباعة للحصول على ملف PDF نهائي.
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 p-5 pt-0">
          <button
            onClick={handlePreview}
            className="flex-1 bg-indigo-700 hover:bg-indigo-800 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors"
          >
            <BookOpen size={16} /> معاينة وتصدير
          </button>
          <button
            onClick={handleDownload}
            disabled={generating}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
          >
            {generating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
            تحميل مباشر
          </button>
        </div>
      </div>
    </div>
  );
}