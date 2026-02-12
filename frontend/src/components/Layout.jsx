import { Outlet, NavLink, useLocation } from "react-router-dom";
import { useState } from "react";
import {
  LayoutDashboard,
  PenTool,
  Calendar,
  Lightbulb,
  BarChart3,
  Camera,
  Menu,
  X,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const navItems = [
  { path: "/", icon: LayoutDashboard, label: "Dashboard" },
  { path: "/create", icon: PenTool, label: "Create Content" },
  { path: "/calendar", icon: Calendar, label: "Calendar" },
  { path: "/ideas", icon: Lightbulb, label: "Ideas Hub" },
  { path: "/growth", icon: Rocket, label: "Growth Tools" },
  { path: "/analytics", icon: BarChart3, label: "Analytics" },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile menu button */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed top-4 left-4 z-50 md:hidden"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        data-testid="mobile-menu-toggle"
      >
        {sidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </Button>

      {/* Sidebar */}
      <aside
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        data-testid="sidebar"
      >
        <div className="p-6">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-sm bg-gradient-to-br from-red-500 to-red-600 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground heading-display">
                PhotoContent
              </h1>
              <p className="text-xs text-muted-foreground">AI Studio</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`sidebar-nav-item ${
                  location.pathname === item.path ? "active" : ""
                }`}
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-border">
          <div className="text-xs text-muted-foreground">
            <p>Powered by AI</p>
            <p className="mt-1 text-[10px]">Gemini 3 Flash • GPT Image 1</p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="main-content" data-testid="main-content">
        <Outlet />
      </main>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
