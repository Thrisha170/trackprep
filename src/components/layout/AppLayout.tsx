import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Plus, Settings, Moon, Sun, Target } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/exams', icon: BookOpen, label: 'Exams' },
  { to: '/log', icon: Plus, label: 'Log Study' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export function DesktopSidebar() {
  const location = useLocation();
  const { theme, toggleTheme, getStats } = useApp();
  const stats = getStats();

  return (
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border sticky top-0">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl gradient-primary flex items-center justify-center">
            <Target className="w-5 h-5 text-primary-foreground" />
          </div>
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">TrackPrep</h1>
            <p className="text-xs text-muted-foreground">Study smarter</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Stats card */}
      <div className="p-4">
        <div className="bg-sidebar-accent rounded-lg p-4">
          <p className="text-xs text-muted-foreground mb-2">Overall Progress</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold text-sidebar-foreground">
              {stats.overallProgress}%
            </span>
            <span className="text-xs text-muted-foreground mb-1">complete</span>
          </div>
          <div className="mt-2 h-2 bg-progress-bg rounded-full overflow-hidden">
            <div 
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="p-4 border-t border-sidebar-border">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          {theme === 'light' ? 'Dark Mode' : 'Light Mode'}
        </button>
      </div>
    </aside>
  );
}

export function MobileBottomNav() {
  const location = useLocation();

  const mobileItems = [
    { to: '/', icon: Home, label: 'Home' },
    { to: '/exams', icon: BookOpen, label: 'Exams' },
    { to: '/log', icon: Plus, label: 'Log', highlight: true },
    { to: '/analytics', icon: BarChart3, label: 'Stats' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card border-t border-border safe-bottom z-50">
      <div className="flex items-center justify-around py-2 px-1">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          if (item.highlight) {
            return (
              <Link
                key={item.to}
                to={item.to}
                className="flex flex-col items-center -mt-6"
              >
                <div className="w-14 h-14 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                  <item.icon className="w-6 h-6 text-primary-foreground" />
                </div>
                <span className="text-[10px] mt-1 text-muted-foreground">{item.label}</span>
              </Link>
            );
          }
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex flex-col items-center py-2 px-3 rounded-lg transition-colors min-w-[60px]",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar />
      <main className="flex-1 min-h-screen pb-20 lg:pb-0">
        {children}
      </main>
      <MobileBottomNav />
    </div>
  );
}
