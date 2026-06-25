import React from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, headerActions }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);

  return (
    <div className="min-h-screen bg-white text-[var(--color-navy)]">
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        actions={headerActions}
      />
      <div className="flex min-h-[calc(100vh-4rem)] items-start">
        <Sidebar
          isOpen={sidebarOpen}
          isCollapsed={sidebarCollapsed}
          onClose={() => setSidebarOpen(false)}
          onToggleCollapse={() => setSidebarCollapsed((current) => !current)}
        />
        <main className="flex-1 overflow-auto">
          <div className="w-full px-4 py-5 sm:px-6 lg:px-8 2xl:px-10">
            <div className="mx-auto w-full max-w-[1680px]">{children}</div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
