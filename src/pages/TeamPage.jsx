import { useEffect, useState } from "react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";
import {
  Users, Trophy, Star, TrendingUp, Mail, Plus, Crown,
  Medal, Award, Zap, Target, CheckCircle2, FileText, BarChart2, RefreshCw
} from "lucide-react";

const POINTS_MAP = {
  "إضافة شاهد": 10,
  "تقييم مؤشر": 8,
  "إضافة تكليف": 5,
  "إتمام تكليف": 15,
  "إضافة خطة تحسين": 12,
  "تحديث خطة تحسين": 6,
  "إضافة ملاحظة": 3,
};

const ACTION_ICONS = {
  "إضافة شاهد": { icon: FileText, color: "text-blue-500" },
  "تقييم مؤشر": { icon: Target, color: "text-purple-500" },
  "إضافة تكليف": { icon: Plus, color: "text-orange-500" },
  "إتمام تكليف": { icon: CheckCircle2, color: "text-green-500" },
  "إضافة خطة تحسين": { icon: TrendingUp, color: "text-indigo-500" },
  "تحديث خطة تحسين": { icon: RefreshCw, color: "text-teal-500" },
  "إضافة ملاحظة": { icon: Star, color: "text-yellow-500" },
};

const RANK_CONFIG = [
  { min: 0,   label: "مبتدئ",    color: "text-gray-500",   bg: "bg-gray-100",   border: "border-gray-200",  icon: "🌱" },
  { min: 20,  label: "نشيط",     color: "text-blue-600",   bg: "bg-blue-50",    border: "border-blue-200",  icon: "⚡" },
  { min: 50,  label: "متقدم",    color: "text-purple-600", bg: "bg-purple-50",  border: "border-purple-200",icon: "🎯" },
  { min: 100, label: "خبير",     color: "text-orange-600", bg: "bg-orange-50",  border: "border-orange-200",icon: "🏆" },
  { min: 200, label: "متميز",    color: "text-yellow-600", bg: "bg-yellow-50",  border: "border-yellow-200",icon: "👑" },
];

function getRank(points) {
  for (let i = RANK_CONFIG.length - 1; i >= 0; i--) {
    if (points >= RANK_CONFIG[i].min) return RANK_CONFIG[i];
  }
  return RANK_CONFIG[0];
}

function InviteModal({ onClose, onInvited }) {
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("user");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleInvite = async () => {
    if (!email) return;
    setLoading(true);
    await base44.users.inviteUser(email, role);
    setLoading(false);
    setDone(true);
    onInvited?.();
    setTimeout(onClose, 1500);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" dir="rtl">
      <div className="bg-card rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h3 className="font-bold">دعوة عضو جديد</h3>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-xl leading-none">×</button>
        </div>
        <div className="p-5 space-y-4">
          {done ? (
            <div className="text-center py-6">
              <div className="text-4xl mb-2">✅</div>
              <p className="font-semibold text-green-700">تم إرسال الدعوة بنجاح!</p>
            </div>
          ) : (
            <>
              <div>
                <label className="text-sm font-medium mb-1.5 block">البريد الإلكتروني *</label>
                <input
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  type="email"
                  placeholder="example@school.edu.sa"
                  className="w-full bg-secondary border border-border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">الدور</label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { val: "user", label: "عضو فريق", icon: "👤", desc: "يمكنه المساهمة في التقييم" },
                    { val: "admin", label: "مدير", icon: "🔑", desc: "صلاحيات كاملة" }
                  ].map(r => (
                    <button
                      key={r.val}
                      onClick={() => setRole(r.val)}
                      className={`p-3 rounded-xl border text-right transition-all ${role === r.val ? "border-primary bg-primary/5" : "border-border hover:bg-secondary"}`}
                    >
                      <div className="text-lg mb-0.5">{r.icon}</div>
                      <div className="font-semibold text-sm">{r.label}</div>
                      <div className="text-xs text-muted-foreground">{r.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
                💡 سيصلهم رابط تسجيل الدخول على بريدهم الإلكتروني
              </div>
            </>
          )}
        </div>
        {!done && (
          <div className="flex gap-2 p-5 border-t border-border">
            <button
              onClick={handleInvite}
              disabled={loading || !email}
              className="flex-1 bg-primary text-white rounded-lg py-2 text-sm font-medium hover:bg-primary/90 disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Mail size={15} />}
              {loading ? "جارٍ الإرسال..." : "إرسال الدعوة"}
            </button>
            <button onClick={onClose} className="px-4 py-2 rounded-lg border border-border text-sm hover:bg-secondary">إلغاء</button>
          </div>
        )}
      </div>
    </div>
  );
}

function LeaderboardCard({ member, rank, isMe }) {
  const rankConfig = getRank(member.points);
  const medals = ["🥇", "🥈", "🥉"];

  return (
    <div className={`relative bg-card rounded-2xl border p-4 transition-all hover:shadow-md ${isMe ? "border-primary ring-2 ring-primary/20" : "border-border"}`}>
      {isMe && (
        <span className="absolute -top-2.5 right-4 text-xs bg-primary text-white px-2 py-0.5 rounded-full font-medium">أنت</span>
      )}
      <div className="flex items-start gap-3">
        {/* Rank number */}
        <div className="text-2xl font-black text-muted-foreground/30 w-8 text-center flex-shrink-0">
          {rank <= 3 ? medals[rank - 1] : `#${rank}`}
        </div>
        {/* Avatar */}
        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold flex-shrink-0 ${rankConfig.bg} border ${rankConfig.border}`}>
          {member.name?.[0] || "؟"}
        </div>
        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-sm truncate">{member.name}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${rankConfig.bg} ${rankConfig.color} border ${rankConfig.border}`}>
              {rankConfig.icon} {rankConfig.label}
            </span>
          </div>
          <div className="text-xs text-muted-foreground truncate mt-0.5">{member.email}</div>
          {/* Activity breakdown */}
          <div className="flex flex-wrap gap-1.5 mt-2">
            {Object.entries(member.actions).map(([action, count]) => {
              const cfg = ACTION_ICONS[action];
              if (!cfg || count === 0) return null;
              const Icon = cfg.icon;
              return (
                <span key={action} className="inline-flex items-center gap-1 text-xs bg-secondary rounded-full px-2 py-0.5">
                  <Icon size={10} className={cfg.color} />
                  <span>{count}</span>
                </span>
              );
            })}
          </div>
        </div>
        {/* Points */}
        <div className="text-center flex-shrink-0">
          <div className={`text-2xl font-black ${rankConfig.color}`}>{member.points}</div>
          <div className="text-xs text-muted-foreground">نقطة</div>
          {/* Progress to next rank */}
          {(() => {
            const nextRankIdx = RANK_CONFIG.findIndex(r => r.min > member.points);
            if (nextRankIdx === -1) return null;
            const next = RANK_CONFIG[nextRankIdx];
            const prev = RANK_CONFIG[nextRankIdx - 1];
            const pct = Math.min(100, ((member.points - prev.min) / (next.min - prev.min)) * 100);
            return (
              <div className="mt-1">
                <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${pct}%` }} />
                </div>
                <div className="text-xs text-muted-foreground mt-0.5">{next.min - member.points} للرتبة التالية</div>
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default function TeamPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [activeTab, setActiveTab] = useState("leaderboard");

  const isAdmin = user?.role === "admin";

  const loadData = async () => {
    setLoading(true);
    const [userList, activityList] = await Promise.all([
      base44.entities.User.list(),
      base44.entities.UserActivity.list('-created_date', 200),
    ]);
    setUsers(userList);
    setActivities(activityList);
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  // Build leaderboard data per user
  const leaderboard = users.map(u => {
    const userActivities = activities.filter(a => a.user_email === u.email);
    const actions = {};
    let points = 0;
    userActivities.forEach(a => {
      actions[a.action_type] = (actions[a.action_type] || 0) + 1;
      points += POINTS_MAP[a.action_type] || a.points || 1;
    });
    return { ...u, name: u.full_name || u.email, points, actions, activityCount: userActivities.length };
  }).sort((a, b) => b.points - a.points);

  const totalPoints = leaderboard.reduce((s, u) => s + u.points, 0);
  const totalActivities = activities.length;
  const topUser = leaderboard[0];

  // Recent activities
  const recentActivities = activities.slice(0, 30);

  return (
    <div className="space-y-5 fade-in" dir="rtl">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Trophy size={24} className="text-yellow-500" />
            لوحة الفريق والأداء
          </h1>
          <p className="text-muted-foreground text-sm mt-1">تتبع تفاعل وأداء أعضاء الفريق في منصة التقويم الذاتي</p>
        </div>
        <button
          onClick={() => setShowInvite(true)}
          className="flex items-center gap-2 bg-primary text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary/90"
        >
          <Plus size={16} /> دعوة عضو جديد
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "أعضاء الفريق", value: users.length, icon: Users, color: "text-blue-600", bg: "bg-blue-50" },
          { label: "إجمالي النشاطات", value: totalActivities, icon: Zap, color: "text-orange-600", bg: "bg-orange-50" },
          { label: "إجمالي النقاط", value: totalPoints, icon: Star, color: "text-yellow-600", bg: "bg-yellow-50" },
          { label: "أعلى نشاط", value: topUser?.name?.split(' ')[0] || "—", icon: Crown, color: "text-purple-600", bg: "bg-purple-50" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-card border border-border rounded-xl p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
              <Icon size={18} className={color} />
            </div>
            <div>
              <div className="font-bold text-lg leading-tight">{value}</div>
              <div className="text-xs text-muted-foreground">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border pb-2">
        {[
          { id: "leaderboard", label: "🏆 المتصدرون", },
          { id: "activity", label: "⚡ آخر النشاطات" },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id ? "bg-primary text-white" : "hover:bg-secondary text-muted-foreground"}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <div className="w-8 h-8 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        </div>
      ) : activeTab === "leaderboard" ? (
        <div className="space-y-3">
          {leaderboard.length === 0 ? (
            <div className="bg-card border border-border rounded-xl p-12 text-center">
              <Users size={40} className="mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">لا يوجد أعضاء بعد</p>
            </div>
          ) : (
            leaderboard.map((member, idx) => (
              <LeaderboardCard
                key={member.id}
                member={member}
                rank={idx + 1}
                isMe={member.email === user?.email}
              />
            ))
          )}

          {/* Motivational banner */}
          <div className="bg-gradient-to-l from-primary/10 to-accent/10 border border-primary/20 rounded-2xl p-4">
            <div className="flex items-center gap-3">
              <div className="text-3xl">🎯</div>
              <div>
                <div className="font-bold text-sm">نظام النقاط التحفيزي</div>
                <div className="text-xs text-muted-foreground mt-0.5 flex flex-wrap gap-2">
                  {Object.entries(POINTS_MAP).map(([action, pts]) => (
                    <span key={action} className="bg-white/70 rounded-full px-2 py-0.5 border border-border">
                      {action}: <strong>{pts} نقطة</strong>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          {recentActivities.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">لا توجد نشاطات مسجلة بعد</div>
          ) : (
            <div className="divide-y divide-border/50">
              {recentActivities.map(act => {
                const cfg = ACTION_ICONS[act.action_type];
                const Icon = cfg?.icon || Zap;
                const pts = POINTS_MAP[act.action_type] || act.points || 1;
                const date = new Date(act.created_date);
                return (
                  <div key={act.id} className="flex items-center gap-3 px-4 py-3 hover:bg-secondary/30 transition-colors">
                    <div className={`w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0`}>
                      <Icon size={14} className={cfg?.color || "text-primary"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium truncate">{act.user_name || act.user_email}</div>
                      <div className="text-xs text-muted-foreground">
                        {act.action_type}
                        {act.indicator_code && <span className="font-mono mr-1 bg-secondary px-1 rounded">{act.indicator_code}</span>}
                        {act.details && <span className="mr-1">— {act.details}</span>}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-primary">+{pts}</div>
                      <div className="text-xs text-muted-foreground">
                        {date.toLocaleDateString('ar-SA', { month: 'short', day: 'numeric' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {showInvite && (
        <InviteModal
          onClose={() => setShowInvite(false)}
          onInvited={loadData}
        />
      )}
    </div>
  );
}