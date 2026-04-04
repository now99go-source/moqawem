import { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Send, MessageCircle, Mail, Phone, CheckCircle2 } from "lucide-react";

export default function MessagingPage() {
  const [tab, setTab] = useState("whatsapp");

  // WhatsApp
  const [phone, setPhone] = useState("");
  const [waMessage, setWaMessage] = useState("");

  // Email
  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  const openWhatsApp = () => {
    if (!phone) return;
    const digits = phone.replace(/\D/g, "").replace(/^0/, "");
    const number = digits.startsWith("966") ? digits : `966${digits}`;
    const url = `https://wa.me/${number}${waMessage ? `?text=${encodeURIComponent(waMessage)}` : ""}`;
    window.open(url, "_blank");
  };

  const sendEmail = async () => {
    if (!to || !subject || !body) return;
    setSending(true);
    await base44.integrations.Core.SendEmail({ to, subject, body });
    setSending(false);
    setSent(true);
    setTimeout(() => { setSent(false); setTo(""); setSubject(""); setBody(""); }, 3000);
  };

  return (
    <div className="space-y-6 fade-in max-w-2xl" dir="rtl">
      <div>
        <h1 className="text-2xl font-bold">المراسلة</h1>
        <p className="text-muted-foreground text-sm mt-1">إرسال رسائل عبر البريد الإلكتروني أو واتساب</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-secondary rounded-xl p-1">
        <button
          onClick={() => setTab("whatsapp")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "whatsapp" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <MessageCircle size={16} /> واتساب
        </button>
        <button
          onClick={() => setTab("email")}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all ${tab === "email" ? "bg-card shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
        >
          <Mail size={16} /> بريد إلكتروني
        </button>
      </div>

      {/* WhatsApp */}
      {tab === "whatsapp" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
              <MessageCircle size={16} className="text-green-600" />
            </div>
            <h2 className="font-semibold">إرسال عبر واتساب</h2>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">رقم الجوال *</label>
            <div className="flex gap-2 items-center">
              <div className="flex items-center gap-1.5 bg-secondary border border-border rounded-lg px-3 py-2 text-sm text-muted-foreground flex-shrink-0">
                <Phone size={13} />
                <span>+966</span>
              </div>
              <input
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="5xxxxxxxx"
                className="flex-1 bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                type="tel"
                maxLength={10}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">أدخل الرقم بدون الصفر الأول مثال: 512345678</p>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">الرسالة (اختياري)</label>
            <textarea
              value={waMessage}
              onChange={e => setWaMessage(e.target.value)}
              rows={4}
              placeholder="اكتب رسالتك هنا وستُفتح تلقائيًا في واتساب..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          <button
            onClick={openWhatsApp}
            disabled={!phone}
            className="w-full flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
          >
            <MessageCircle size={16} />
            فتح محادثة واتساب
          </button>
        </div>
      )}

      {/* Email */}
      {tab === "email" && (
        <div className="bg-card border border-border rounded-xl p-6 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
              <Mail size={16} className="text-blue-600" />
            </div>
            <h2 className="font-semibold">إرسال بريد إلكتروني</h2>
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني للمستلم *</label>
            <input
              value={to}
              onChange={e => setTo(e.target.value)}
              type="email"
              placeholder="example@school.edu.sa"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">الموضوع *</label>
            <input
              value={subject}
              onChange={e => setSubject(e.target.value)}
              placeholder="موضوع الرسالة"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1.5 block">نص الرسالة *</label>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value)}
              rows={6}
              placeholder="اكتب نص الرسالة هنا..."
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {sent ? (
            <div className="w-full flex items-center justify-center gap-2 bg-green-100 text-green-700 rounded-lg py-2.5 text-sm font-medium">
              <CheckCircle2 size={16} />
              تم إرسال الرسالة بنجاح!
            </div>
          ) : (
            <button
              onClick={sendEmail}
              disabled={sending || !to || !subject || !body}
              className="w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 disabled:opacity-50 text-white rounded-lg py-2.5 text-sm font-medium transition-all"
            >
              {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
              {sending ? "جارٍ الإرسال..." : "إرسال الرسالة"}
            </button>
          )}
        </div>
      )}
    </div>
  );
}