import { Link, useLocation } from 'react-router-dom';
import { Home, BookOpen, BarChart3, Plus, Settings, Moon, Sun, Flame } from 'lucide-react';
import { useApp } from '@/context/AppContext';
import { cn } from '@/lib/utils';
import TrackPrepLogo from '@/components/icons/TrackPrepLogo';

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
    <aside className="hidden lg:flex flex-col w-64 h-screen bg-sidebar border-r border-sidebar-border sticky top-0 overflow-hidden">
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 gradient-journey opacity-50 pointer-events-none" />
      
      {/* Logo */}
      <div className="relative p-6 border-b border-sidebar-border/50">
        <div className="flex items-center gap-3">
          <TrackPrepLogo size={44} />
          <div>
            <h1 className="font-display font-bold text-lg text-sidebar-foreground">TrackPrep</h1>
            <p className="text-xs text-muted-foreground">Your learning journey</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="relative flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-md" 
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:translate-x-1"
              )}
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Progress milestone card */}
      <div className="relative p-4">
        <div className="card-milestone p-4 bg-sidebar-accent/50">
          <p className="text-xs text-muted-foreground mb-2">Overall Progress</p>
          <div className="flex items-end gap-2">
            <span className="text-2xl font-display font-bold text-sidebar-foreground">
              {stats.overallProgress}%
            </span>
            <span className="text-xs text-muted-foreground mb-1">of your journey</span>
          </div>
          {/* Curved progress indicator */}
          <div className="mt-3 h-2.5 bg-progress-bg rounded-full overflow-hidden">
            <div 
              className="h-full progress-gradient rounded-full transition-all duration-700 ease-out"
              style={{ width: `${stats.overallProgress}%` }}
            />
          </div>
          {/* Milestone markers */}
          <div className="flex justify-between mt-1.5">
            <span className="text-[10px] text-muted-foreground">Start</span>
            <span className="text-[10px] text-muted-foreground">50%</span>
            <span className="text-[10px] text-muted-foreground">Goal</span>
          </div>
        </div>
      </div>

      {/* Theme toggle */}
      <div className="relative p-4 border-t border-sidebar-border/50">
        <button
          onClick={toggleTheme}
          className="flex items-center gap-3 w-full px-4 py-3 rounded-xl text-sm font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-all duration-200"
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
    { to: '/analytics', icon: BarChart3, label: 'Stats' },
    { to: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-card/90 backdrop-blur-md border-t border-border/50 safe-bottom z-40">
      <div className="flex items-center justify-around py-2.5 px-2">
        {mobileItems.map((item) => {
          const isActive = location.pathname === item.to || 
            (item.to !== '/' && location.pathname.startsWith(item.to));
          
          return (
            <Link
              key={item.to}
              to={item.to}
              className={cn(
                "relative flex flex-col items-center py-2 px-4 rounded-xl transition-all duration-200 min-w-[64px]",
                isActive 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn(
                "w-5 h-5 transition-transform duration-200",
                isActive && "scale-110"
              )} />
              <span className={cn(
                "text-[10px] mt-1 font-medium transition-colors",
                isActive && "text-primary"
              )}>{item.label}</span>
              {isActive && <span className="nav-active-indicator" />}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export function FloatingActionButton() {
  return (
    <Link
      to="/log"
      className="fab lg:hidden bottom-20 right-4 w-14 h-14 gradient-primary flex items-center justify-center"
      aria-label="Log Study Session"
    >
      <Plus className="w-6 h-6 text-primary-foreground" />
    </Link>
  );
}

export function MobileHeader() {
  const { theme, toggleTheme } = useApp();

  return (
    <header className="lg:hidden sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <TrackPrepLogo size={38} />
          <h1 className="font-display font-bold text-lg text-foreground">TrackPrep</h1>
        </div>
        <button
          onClick={toggleTheme}
          className="p-2.5 rounded-xl text-muted-foreground hover:bg-secondary hover:text-foreground transition-all duration-200"
        >
          {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
        </button>
      </div>
    </header>
  );
}

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex w-full bg-background">
      <DesktopSidebar />
      <div className="flex-1 flex flex-col min-h-screen w-full overflow-x-hidden">
        <MobileHeader />
        <main className="flex-1">
          {children}
        </main>
      </div>
      <MobileBottomNav />
      <FloatingActionButton />
    </div>
  );
}
