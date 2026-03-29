import { Link, useLocation } from "react-router-dom";
import { Recycle, LayoutDashboard, Truck, User } from "lucide-react";
import { cn } from "../lib/utils";

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { label: "Home", path: "/", icon: Recycle },
    { label: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
    { label: "Request", path: "/request", icon: Truck },
  ];

  return (
    <nav className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-white/80 backdrop-blur-xl border border-zinc-200 rounded-2xl px-4 py-2 shadow-lg z-50 flex items-center gap-2">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = location.pathname === item.path;
        return (
          <Link
            key={item.path}
            to={item.path}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-xl transition-all",
              isActive 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-200" 
                : "text-zinc-500 hover:bg-zinc-100"
            )}
          >
            <Icon size={20} />
            <span className={cn("text-sm font-medium", !isActive && "hidden sm:inline")}>
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
