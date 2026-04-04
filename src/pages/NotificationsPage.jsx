import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { Bell, Check, Trash2, Plus, X } from "lucide-react";

const TYPE_STYLE = {
  "تنبيه": "bg-orange-100 text-orange-700",
  "تذكير": "bg-blue-100 text-blue-700",
  "إشعار": "bg-gray-100 text-gray-600",
  "تحذير": "bg-red-100 text-red-700",
};

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ title: "", message: "", type: "إشعار" });

  useEffect(() => {
    base44.entities.Notification.list('-created_date').then(list => { setNotifications(list); setLoading(false); });
  }, []);

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { is_read: true });
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
  };

  const handleDelete = async (id) => {
    await base44.entities.Notification.delete(id);
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const handleAdd = async () => {
    if (!form.title || !form.message) return;
    const saved = await base44.entities.Notification.create({ ...form, is_read: false });
    setNotifications(prev => [saved, ...prev]);
    setForm({ title: "", message: "", type: "إشعار" });
    setShowAdd(false);
  };

  const unread = notifications.filter(n => !n.is_read).length;

  return (
    <div className="space-y-5 fade-in max-w-2xl" dir="rtl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell size={22} /> الإشعارات
            {unread > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-2 py-0.5">{unread}</span>}
          </h1>
          <p className="text-muted-foreground text-sm mt-1">التنبيهات والإشعارات الداخلية</p>
        </div>
        <button onClick={() => setShowAdd(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary/90">
          <Plus size={15}/> إضافة إشعار
        </button>
      </div>

      {showAdd && (
        <div className="bg-card border border-border rounded-xl p-5">
          <div className="flex justify-between mb-3">
            <h3 className="font-bold">إضافة إشعار جديد</h3>
            <button onClick={() => setShowAdd(false)}><X size={16} className="text-muted-foreground"/></button>
          </div>
          <div className="space-y-3">
            <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} placeholder="عنوان الإشعار"
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
            <textarea value={form.message} onChange={e=>setForm(f=>({...f,message:e.target.value}))} placeholder="نص الإشعار" rows={2}
              className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
            <div className="flex gap-2">
              <select value={form.type} onChange={e=>setForm(f=>({...f,type:e.target.value}))}
                className="bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none">
                {["إشعار","تنبيه","تذكير","تحذير"].map(t=><option key={t}>{t}</option>)}
              </select>
              <button onClick={handleAdd} className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90">إرسال</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex justify-center py-16"><div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" /></div>
      ) : notifications.length === 0 ? (
        <div className="bg-card border border-border rounded-xl p-12 text-center">
          <Bell size={40} className="mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">لا توجد إشعارات</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => (
            <div key={n.id} className={`bg-card border rounded-xl p-4 transition-all ${n.is_read ? "border-border opacity-70" : "border-primary/30 shadow-sm"}`}>
              <div className="flex items-start gap-3">
                {!n.is_read && <div className="w-2 h-2 rounded-full bg-primary mt-1.5 flex-shrink-0" />}
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="font-semibold text-sm">{n.title}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${TYPE_STYLE[n.type]}`}>{n.type}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{n.message}</p>
                  <p className="text-xs text-muted-foreground/60 mt-1">{new Date(n.created_date).toLocaleDateString("ar-SA")}</p>
                </div>
                <div className="flex gap-1">
                  {!n.is_read && (
                    <button onClick={() => markRead(n.id)} className="p-1.5 text-muted-foreground hover:text-green-500 transition-colors" title="تحديد كمقروء">
                      <Check size={14}/>
                    </button>
                  )}
                  <button onClick={() => handleDelete(n.id)} className="p-1.5 text-muted-foreground hover:text-red-500 transition-colors">
                    <Trash2 size={14}/>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}