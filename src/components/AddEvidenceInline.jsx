import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Upload, X, Plus, Loader2, FileText, Merge } from "lucide-react";
import { trackActivity } from "@/utils/trackActivity";

/**
 * Inline evidence-adding panel, pre-bound to a specific indicator code.
 * Supports single or multi-PDF merge via PDFLib.
 */
export default function AddEvidenceInline({ indicatorCode, indicatorId, onSaved, onClose, defaultTitle = "" }) {
  const [form, setForm] = useState({
    title: defaultTitle,
    description: "",
    academic_year: "1446/1447",
    status: "قيد المراجعة",
    responsible: "",
  });
  const [files, setFiles] = useState([]);
  const [mergeConfirmed, setMergeConfirmed] = useState(null); // null=pending, true=yes, false=no
  const [uploading, setUploading] = useState(false);
  const [merging, setMerging] = useState(false);

  const handleFileChange = (e) => {
    const selected = Array.from(e.target.files);
    setFiles(selected);
    setMergeConfirmed(null); // reset merge decision
  };

  const removeFile = (idx) => {
    setFiles(prev => prev.filter((_, i) => i !== idx));
    setMergeConfirmed(null);
  };

  const allPDFs = files.length > 1 && files.every(f => f.type === "application/pdf");

  // Merge PDFs in-browser using PDF-LIB loaded from CDN
  const mergePDFs = async (pdfFiles) => {
    // Dynamically import pdf-lib (bundled via CDN script tag alternative: load via esm.sh)
    const { PDFDocument } = await import("https://esm.sh/pdf-lib@1.17.1");
    const merged = await PDFDocument.create();
    for (const pdfFile of pdfFiles) {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const doc = await PDFDocument.load(arrayBuffer);
      const pages = await merged.copyPages(doc, doc.getPageIndices());
      pages.forEach(p => merged.addPage(p));
    }
    const mergedBytes = await merged.save();
    return new File([mergedBytes], `merged_${indicatorCode.replace(/-/g, "_")}.pdf`, { type: "application/pdf" });
  };

  const handleSubmit = async () => {
    if (!form.title) return;
    if (files.length === 0) {
      await doUpload(null);
      return;
    }
    // Multi-PDF: ask to merge if not yet decided
    if (allPDFs && files.length > 1 && mergeConfirmed === null) {
      // Show confirm UI — handled below, don't submit yet
      setMergeConfirmed("asking");
      return;
    }
    await doUpload(files);
  };

  const doUpload = async (uploadFiles) => {
    setUploading(true);
    let file_url = "", file_name = "", file_type = "";
    if (uploadFiles && uploadFiles.length > 0) {
      let finalFile;
      if (mergeConfirmed === true && allPDFs && uploadFiles.length > 1) {
        setMerging(true);
        finalFile = await mergePDFs(uploadFiles);
        setMerging(false);
      } else {
        finalFile = uploadFiles[0]; // just upload first if merge refused
      }
      const res = await base44.integrations.Core.UploadFile({ file: finalFile });
      file_url = res.file_url;
      file_name = finalFile.name;
      file_type = finalFile.type;
    }
    const saved = await base44.entities.Evidence.create({
      ...form,
      indicator_code: indicatorCode,
      indicator_id: indicatorId || null,
      file_url, file_name, file_type,
    });
    // Track activity
    const currentUser = await base44.auth.me().catch(() => null);
    await trackActivity(currentUser, "إضافة شاهد", {
      indicator_code: indicatorCode,
      details: form.title,
    });
    setUploading(false);
    onSaved(saved);
  };

  const statusColors = { "قيد المراجعة": "bg-orange-100 text-orange-700", "مكتمل": "bg-green-100 text-green-700", "ناقص": "bg-red-100 text-red-700" };

  return (
    <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3" dir="rtl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-blue-600" />
          <span className="text-sm font-semibold text-blue-800">إضافة شاهد للمؤشر <span className="font-mono">{indicatorCode}</span></span>
        </div>
        <button onClick={onClose} className="text-blue-400 hover:text-blue-700"><X size={16} /></button>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <input
          value={form.title}
          onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
          placeholder="عنوان الشاهد *"
          className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
        />
        <textarea
          value={form.description}
          onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
          placeholder="وصف مختصر (اختياري)"
          rows={2}
          className="w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300 resize-none"
        />
        <div className="grid grid-cols-3 gap-2">
          <input
            value={form.academic_year}
            onChange={e => setForm(f => ({ ...f, academic_year: e.target.value }))}
            placeholder="العام الدراسي"
            className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
          <select
            value={form.status}
            onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
            className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          >
            {["قيد المراجعة", "مكتمل", "ناقص"].map(s => <option key={s}>{s}</option>)}
          </select>
          <input
            value={form.responsible}
            onChange={e => setForm(f => ({ ...f, responsible: e.target.value }))}
            placeholder="المسؤول"
            className="bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-300"
          />
        </div>
      </div>

      {/* File upload */}
      <div>
        <label className="flex items-center gap-2 border-2 border-dashed border-blue-200 bg-white rounded-xl p-3 cursor-pointer hover:border-blue-400 transition-all">
          <Upload size={18} className="text-blue-400" />
          <span className="text-sm text-blue-600">
            {files.length > 0 ? `${files.length} ملف مختار` : "انقر لاختيار ملف PDF / Word / صورة (يمكن اختيار أكثر من ملف)"}
          </span>
          <input
            type="file"
            className="hidden"
            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
            multiple
            onChange={handleFileChange}
          />
        </label>
        {files.length > 0 && (
          <div className="mt-2 space-y-1">
            {files.map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-xs bg-white border border-blue-100 rounded-lg px-3 py-1.5">
                <FileText size={12} className="text-blue-400 flex-shrink-0" />
                <span className="flex-1 truncate">{f.name}</span>
                <span className="text-muted-foreground">{(f.size / 1024).toFixed(0)} KB</span>
                <button onClick={() => removeFile(i)} className="text-red-400 hover:text-red-600"><X size={12} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Merge confirmation */}
      {mergeConfirmed === "asking" && allPDFs && files.length > 1 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-2">
            <Merge size={16} className="text-amber-600" />
            <span className="text-sm font-semibold text-amber-800">دمج ملفات PDF؟</span>
          </div>
          <p className="text-xs text-amber-700 mb-3">
            لديك <strong>{files.length} ملفات PDF</strong>. هل تريد دمجها في ملف واحد قبل الرفع؟
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => { setMergeConfirmed(true); doUpload(files); }}
              className="flex-1 bg-amber-500 text-white rounded-lg py-1.5 text-sm font-medium hover:bg-amber-600"
            >
              نعم، ادمج الملفات
            </button>
            <button
              onClick={() => { setMergeConfirmed(false); doUpload(files); }}
              className="flex-1 bg-white border border-amber-200 text-amber-700 rounded-lg py-1.5 text-sm font-medium hover:bg-amber-50"
            >
              لا، ارفع الملف الأول فقط
            </button>
          </div>
        </div>
      )}

      {/* Submit */}
      {mergeConfirmed !== "asking" && (
        <button
          onClick={handleSubmit}
          disabled={uploading || merging || !form.title}
          className="w-full bg-blue-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {(uploading || merging) ? (
            <>
              <Loader2 size={14} className="animate-spin" />
              {merging ? "جارٍ الدمج..." : "جارٍ الرفع..."}
            </>
          ) : (
            <>
              <Plus size={14} />
              حفظ الشاهد
            </>
          )}
        </button>
      )}
    </div>
  );
}