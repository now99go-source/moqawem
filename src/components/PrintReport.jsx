import { useRef } from "react";
import { X, Printer } from "lucide-react";

const LEVEL_LABEL = {
  "تهيئة": { symbol: "⬇", color: "#dc2626" },
  "انطلاق": { symbol: "→", color: "#ea580c" },
  "تقدم": { symbol: "↑", color: "#2563eb" },
  "تميز": { symbol: "★", color: "#16a34a" },
  "لم يُقيَّم": { symbol: "○", color: "#9ca3af" },
};

function EvidenceList({ evidences }) {
  if (!evidences || evidences.length === 0) return null;
  return (
    <div style={{ marginTop: 4 }}>
      {evidences.map((ev, i) => (
        <div key={i} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 10, color: "#166534", marginTop: 2 }}>
          <span style={{ color: "#16a34a" }}>📎</span>
          {ev.file_url
            ? <a href={ev.file_url} style={{ color: "#15803d", textDecoration: "none" }}>{ev.file_name || ev.title}</a>
            : <span>{ev.title}</span>
          }
          {ev.status && <span style={{ background: "#dcfce7", color: "#166534", borderRadius: 4, padding: "1px 6px", fontSize: 9 }}>{ev.status}</span>}
        </div>
      ))}
    </div>
  );
}

export default function PrintReport({ etecStructure, evaluations, evidenceByCode, onClose }) {
  const printRef = useRef(null);

  const handlePrint = () => {
    const style = document.createElement("style");
    style.innerHTML = `
      @media print {
        body > *:not(#print-root) { display: none !important; }
        #print-root { display: block !important; position: static !important; }
      }
    `;
    document.head.appendChild(style);
    const el = printRef.current;
    const orig = document.body.innerHTML;
    document.body.innerHTML = `<div dir="rtl" style="font-family:'Tajawal',Arial,sans-serif;">${el.innerHTML}</div>`;
    window.print();
    document.body.innerHTML = orig;
    window.location.reload();
  };

  const now = new Date().toLocaleDateString("ar-SA", { year: "numeric", month: "long", day: "numeric" });

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-start justify-center overflow-y-auto py-6 px-4" dir="rtl">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl">
        {/* Controls - no print */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 no-print">
          <div className="flex items-center gap-2">
            <Printer size={18} className="text-primary" />
            <span className="font-bold text-gray-800">معاينة التقرير للطباعة</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 bg-primary text-white px-5 py-2 rounded-xl text-sm font-medium hover:bg-primary/90"
            >
              <Printer size={15} /> طباعة
            </button>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 text-gray-500">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Printable content */}
        <div ref={printRef} style={{ fontFamily: "'Tajawal', Arial, sans-serif", direction: "rtl", padding: "32px 40px", color: "#1e1b4b" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: 32, borderBottom: "3px solid #3730a3", paddingBottom: 20 }}>
            <div style={{ fontSize: 11, color: "#6b7280", letterSpacing: 1, marginBottom: 6 }}>المملكة العربية السعودية — هيئة تقويم التعليم والتدريب</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: "#1e1b4b", marginBottom: 4 }}>تقرير التقويم الذاتي المدرسي</div>
            <div style={{ fontSize: 12, color: "#6b7280" }}>تاريخ الإصدار: {now}</div>
          </div>

          {/* Domains */}
          {etecStructure.map((domain) => {
            const DOMAIN_COLORS = {
              purple: { bg: "#7c3aed", light: "#f5f3ff", border: "#ddd6fe", text: "#5b21b6" },
              blue: { bg: "#2563eb", light: "#eff6ff", border: "#bfdbfe", text: "#1d4ed8" },
              green: { bg: "#16a34a", light: "#f0fdf4", border: "#bbf7d0", text: "#15803d" },
              orange: { bg: "#ea580c", light: "#fff7ed", border: "#fed7aa", text: "#c2410c" },
            };
            const dc = DOMAIN_COLORS[domain.color] || DOMAIN_COLORS.blue;
            const totalIndicators = domain.standards.flatMap(s => s.indicators).length;
            const evaluated = domain.standards.flatMap(s => s.indicators).filter(i => evaluations[i.code]?.performance_level && evaluations[i.code].performance_level !== "لم يُقيَّم").length;

            return (
              <div key={domain.code} style={{ marginBottom: 36, pageBreakInside: "avoid" }}>
                {/* Domain header */}
                <div style={{ background: dc.bg, color: "#fff", borderRadius: "10px 10px 0 0", padding: "12px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ background: "rgba(255,255,255,0.2)", borderRadius: 8, width: 32, height: 32, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 15 }}>
                      {domain.code}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: 16 }}>المجال {domain.code}: {domain.domain}</div>
                      <div style={{ fontSize: 11, opacity: 0.8 }}>{evaluated} / {totalIndicators} مؤشر مُقيَّم</div>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: 120, textAlign: "left" }}>
                    <div style={{ background: "rgba(255,255,255,0.25)", borderRadius: 6, height: 8 }}>
                      <div style={{ background: "#fff", borderRadius: 6, height: 8, width: `${totalIndicators > 0 ? (evaluated / totalIndicators) * 100 : 0}%` }} />
                    </div>
                    <div style={{ fontSize: 10, opacity: 0.85, marginTop: 3, textAlign: "center" }}>
                      {totalIndicators > 0 ? Math.round((evaluated / totalIndicators) * 100) : 0}%
                    </div>
                  </div>
                </div>

                {/* Standards */}
                <div style={{ border: `1px solid ${dc.border}`, borderTop: "none", borderRadius: "0 0 10px 10px", overflow: "hidden" }}>
                  {domain.standards.map((standard, si) => (
                    <div key={standard.code} style={{ borderTop: si > 0 ? `1px solid ${dc.border}` : "none" }}>
                      {/* Standard header */}
                      <div style={{ background: dc.light, padding: "8px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                        <span style={{ background: dc.bg, color: "#fff", borderRadius: 4, fontSize: 10, padding: "2px 7px", fontWeight: 700 }}>{standard.code}</span>
                        <span style={{ color: dc.text, fontWeight: 700, fontSize: 13 }}>{standard.name}</span>
                      </div>

                      {/* Indicators */}
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11 }}>
                        <thead>
                          <tr style={{ background: "#f9fafb" }}>
                            <th style={{ padding: "6px 12px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: "10%", borderBottom: "1px solid #e5e7eb" }}>الرمز</th>
                            <th style={{ padding: "6px 12px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: "40%", borderBottom: "1px solid #e5e7eb" }}>المؤشر</th>
                            <th style={{ padding: "6px 12px", textAlign: "center", color: "#6b7280", fontWeight: 600, width: "12%", borderBottom: "1px solid #e5e7eb" }}>مستوى الأداء</th>
                            <th style={{ padding: "6px 12px", textAlign: "center", color: "#6b7280", fontWeight: 600, width: "8%", borderBottom: "1px solid #e5e7eb" }}>النسبة</th>
                            <th style={{ padding: "6px 12px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: "15%", borderBottom: "1px solid #e5e7eb" }}>المسؤول</th>
                            <th style={{ padding: "6px 12px", textAlign: "right", color: "#6b7280", fontWeight: 600, width: "15%", borderBottom: "1px solid #e5e7eb" }}>الشواهد</th>
                          </tr>
                        </thead>
                        <tbody>
                          {standard.indicators.map((ind, idx) => {
                            const ev = evaluations[ind.code] || {};
                            const level = ev.performance_level || "لم يُقيَّم";
                            const lc = LEVEL_LABEL[level] || LEVEL_LABEL["لم يُقيَّم"];
                            const evidences = evidenceByCode[ind.code] || [];
                            return (
                              <tr key={ind.code} style={{ background: idx % 2 === 0 ? "#ffffff" : "#fafafa", borderBottom: "1px solid #f3f4f6" }}>
                                <td style={{ padding: "8px 12px", color: "#6b7280", fontFamily: "monospace", fontSize: 10 }}>{ind.code}</td>
                                <td style={{ padding: "8px 12px", lineHeight: 1.5, color: "#1f2937" }}>{ind.desc}</td>
                                <td style={{ padding: "8px 12px", textAlign: "center" }}>
                                  <span style={{ display: "inline-flex", alignItems: "center", gap: 4, background: lc.color + "18", color: lc.color, borderRadius: 20, padding: "2px 10px", fontSize: 10, fontWeight: 700, border: `1px solid ${lc.color}40` }}>
                                    {lc.symbol} {level}
                                  </span>
                                </td>
                                <td style={{ padding: "8px 12px", textAlign: "center", color: ev.score_percentage ? "#1d4ed8" : "#9ca3af", fontWeight: 700 }}>
                                  {ev.score_percentage ? `${ev.score_percentage}%` : "—"}
                                </td>
                                <td style={{ padding: "8px 12px", color: "#374151", fontSize: 10 }}>{ev.responsible || "—"}</td>
                                <td style={{ padding: "8px 12px" }}>
                                  <EvidenceList evidences={evidences} />
                                  {evidences.length === 0 && <span style={{ color: "#d1d5db", fontSize: 10 }}>لا يوجد</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {/* Footer */}
          <div style={{ borderTop: "2px solid #e5e7eb", paddingTop: 16, marginTop: 24, display: "flex", justifyContent: "space-between", fontSize: 10, color: "#9ca3af" }}>
            <span>منصة التقويم الذاتي المدرسي — هيئة تقويم التعليم والتدريب</span>
            <span>{now}</span>
          </div>
        </div>
      </div>
    </div>
  );
}