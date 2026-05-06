import {
  Search,
  Bell,
  ChevronDown,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
} from "lucide-react";

interface TopbarProps {
  user: { name: string; email: string };
  collapsed: boolean;
  onToggleCollapsed: () => void;
  onOpenMobile: () => void;
}

export default function Topbar({
  user,
  collapsed,
  onToggleCollapsed,
  onOpenMobile,
}: TopbarProps) {
  // Get initials for the avatar
  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="h-[60px] flex-shrink-0 bg-white border-b border-gray-100 flex items-center justify-between px-4 md:px-6">
      {/* Page title is rendered by each page via next/navigation,
          so we keep topbar generic */}
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onOpenMobile}
          className="md:hidden w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label="Open sidebar"
          title="Open sidebar"
        >
          <Menu size={16} />
        </button>
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="hidden md:flex w-8 h-8 rounded-full bg-gray-50 border border-gray-100 items-center justify-center text-gray-600 hover:bg-gray-100 transition-colors"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeftOpen size={16} />
          ) : (
            <PanelLeftClose size={16} />
          )}
        </button>
      </div>
      <div className="flex items-center gap-2 md:gap-3">
        <button
          aria-label="Search"
          title="Search"
          className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <Search size={14} />
        </button>
        <button
          aria-label="Notifications"
          title="Notifications"
          className="w-8 h-8 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-colors"
        >
          <Bell size={14} />
        </button>

        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center text-white text-xs font-semibold">
            {initials}
          </div>
          <span className="text-[13px] font-medium text-gray-800">
            {user.name}
          </span>
          <ChevronDown size={13} className="text-gray-400" />
        </div>
      </div>
    </header>
  );
}
