import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function toggleSidebar() {
    setSidebarOpen(function(prev) { return !prev; });
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }

  function renderOverlay() {
    if (!sidebarOpen) return null;
    return (
      <div
        className="fixed inset-0 bg-black/50 z-20 lg:hidden"
        onClick={closeSidebar}
      />
    );
  }

  return (
    <div className="flex min-h-screen bg-surface">
      {renderOverlay()}
      <div className={"fixed inset-y-0 left-0 z-30 lg:static lg:block transition-transform duration-300 " +
        (sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0")}>
        <Sidebar onClose={closeSidebar} />
      </div>
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar onMenuClick={toggleSidebar} />
        <main className="flex-1 p-4 lg:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}