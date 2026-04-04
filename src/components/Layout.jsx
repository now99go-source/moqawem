import { Outlet, Link, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard, BookOpen, FileText, CheckSquare, TrendingUp,
  School, Bell, Search, Menu, X, ChevronLeft, Settings, LogOut, MessageSquare
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { useAuth } from "@/lib/AuthContext";

const navItems = [
  { path: "/", label: "لوحة التحكم", icon: LayoutDashboard },
  { path: "/standards", label: "المعايير والمؤشرات", icon: BookOpen },
  { path: "/evidence", label: "إدارة الشواهد", icon: FileText },
  { path: "/tasks", label: "التكليفات", icon: CheckSquare },
  { path: "/improvement", label: "خطة التحسين", icon: TrendingUp },
  { path: "/school-profile", label: "بيانات المدرسة", icon: School },
  { path: "/notifications", label: "الإشعارات", icon: Bell },
  { path: "/messaging", label: "المراسلة", icon: MessageSquare },
];

export default function Layout() {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-background flex font-tajawal" dir="rtl">
      {/* Sidebar */}
      <aside
        className={`${collapsed ? "w-16" : "w-64"} flex-shrink-0 transition-all duration-300 flex flex-col`}
        style={{ background: "linear-gradient(160deg, hsl(247,55%,28%) 0%, hsl(247,55%,20%) 100%)" }}
      >
        {/* Logo */}
        <div className={`flex items-center ${collapsed ? "justify-center px-2" : "px-5"} py-5 border-b border-white/10`}>
          {!collapsed && (
            <div className="flex-1">
              <div className="text-white font-bold text-base leading-tight">منصة التقويم</div>
              <div className="text-white/60 text-xs mt-0.5">الذاتي المدرسي</div>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="text-white/60 hover:text-white p-1 rounded-lg transition-colors"
          >
            {collapsed ? <ChevronLeft size={18} className="rotate-180" /> : <Menu size={18} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`sidebar-item ${active ? "active text-white" : "text-white/65"}`}
                title={collapsed ? item.label : ""}
              >
                <Icon size={19} className="flex-shrink-0" />
                {!collapsed && <span>{item.label}</span>}
                {active && !collapsed && (
                  <div className="mr-auto w-1.5 h-1.5 rounded-full bg-green-400" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        <div className={`border-t border-white/10 px-3 py-3 ${collapsed ? "flex justify-center" : ""}`}>
          {!collapsed ? (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user?.full_name?.[0] || "م"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-white text-xs font-medium truncate">{user?.full_name || "المدير"}</div>
                <div className="text-white/50 text-xs truncate">{user?.role === "admin" ? "مدير المدرسة" : "عضو فريق"}</div>
              </div>
              <button
                onClick={() => base44.auth.logout()}
                className="text-white/40 hover:text-white transition-colors"
                title="تسجيل الخروج"
              >
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
              {user?.full_name?.[0] || "م"}
            </div>
          )}
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="h-14 bg-card border-b border-border flex items-center px-6 gap-4 flex-shrink-0">
          <div className="flex-1 flex items-center gap-3">
            <div className="relative max-w-sm w-full">
              <Search size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="بحث في المنصة..."
                className="w-full bg-secondary border-0 rounded-lg pr-9 pl-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/notifications" className="relative p-2 rounded-lg hover:bg-secondary transition-colors">
              <Bell size={18} className="text-muted-foreground" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
            </Link>
            <div className="text-xs text-muted-foreground hidden md:block">
              هيئة تقويم التعليم والتدريب
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}