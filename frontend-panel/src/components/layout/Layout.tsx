import React from "react";
import { Newspaper } from "lucide-react";
import { UserRole } from "@types";
import { useAuthStore } from "@/features/auth/stores/authStore";
import Header from "./Header";
import Sidebar from "./Sidebar";

interface LayoutProps {
  children: React.ReactNode;
  headerActions?: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children, headerActions }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = React.useState(false);
  const { usuario } = useAuthStore();
  const isAdmin = usuario?.roles?.includes(UserRole.ADMIN);

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
      {isAdmin && (
        <a
          href="https://test.62344037.xyz/noticiasAdmin"
          className="fixed bottom-6 right-6 z-50 inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-3 font-bold text-white shadow-lg transition hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          <Newspaper size={20} />
          Publicar noticia
        </a>
      )}
    </div>
  );
};

export default Layout;
