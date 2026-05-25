import { useState } from 'react';
import { Menu } from 'lucide-react';
import MobileSidebar from './MobileSidebar';

export default function MobileLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#111111]">
      {/* Top bar with menu button */}
      <header className="fixed top-0 left-0 right-0 z-30 bg-[#111111]/80 backdrop-blur-sm border-b border-white/10 px-4 py-3 flex items-center lg:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          className="p-2 rounded-lg hover:bg-white/10 transition-colors"
        >
          <Menu className="w-5 h-5 text-white" />
        </button>
        <div className="flex-1 text-center">
          <span className="text-sm font-medium text-white">NEXAbot.AI</span>
        </div>
        <div className="w-9" /> {/* Spacer for alignment */}
      </header>

      {/* Sidebar */}
      <MobileSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main content - add padding for fixed header on mobile */}
      <main className="lg:ml-72 pt-14 lg:pt-0">
        {children}
      </main>
    </div>
  );
}
