import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Users, Settings, Activity, Menu, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { Button } from './ui/button';

import { Toaster } from './ui/toaster';

const Layout = ({ children }) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);


  const navItems = [
    { label: 'Dashboard', path: '/', icon: LayoutDashboard },
    { label: 'Simulate Events', path: '/simulate', icon: Activity },
    { label: 'Rules', path: '/settings', icon: Settings },
  ];

  const NavContent = () => (
    <nav className="flex-1 p-4 space-y-1">
      {navItems.map((item) => (
        <Link key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}>
            <Button 
                variant={location.pathname === item.path ? "secondary" : "ghost"} 
                className="w-full justify-start gap-2"
            >
                <item.icon className="h-4 w-4" />
                {item.label}
            </Button>
        </Link>
      ))}
    </nav>
  );

  return (
    <div className="min-h-screen bg-background font-sans antialiased flex flex-col md:flex-row">
      {/* Mobile Header */}
      <header className="md:hidden border-b border-blue-100 dark:border-blue-900 bg-card p-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2 font-bold text-lg">
             <img src="/vite.png" alt="Logo" className="h-8 w-8 rounded-md border border-blue-500/30 bg-blue-500/10 p-1" />
             LeadFlow
        </div>
        <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </header>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="md:hidden absolute top-16 left-0 w-full h-[calc(100vh-4rem)] bg-background z-50 border-t border-blue-100 dark:border-blue-900 p-4">
            <NavContent />
        </div>
      )}

      {/* Desktop Sidebar */}
      <aside className="w-64 border-r border-blue-100 dark:border-blue-900 bg-card flex-col hidden md:flex h-screen sticky top-0">
        <div className="p-6 border-b border-blue-100 dark:border-blue-900">
           <div className="flex items-center gap-2 font-bold text-xl">
             <img src="/vite.png" alt="Logo" className="h-8 w-8 rounded-md border border-blue-500/30 bg-blue-500/10 p-1" />
             LeadFlow
           </div>
        </div>
        <NavContent />
      </aside>

      {/* Main Content */}
      <main className="flex-1 bg-muted/20 min-h-[calc(100vh-4rem)] md:min-h-screen">
        <div className="p-4 md:p-8 max-w-7xl mx-auto w-full">
          {children}
        </div>
      </main>
      <Toaster />
    </div>
  );
};

export default Layout;
