import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Moon, Sun, Target, Heart, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { ExportProgress } from '@/components/export/ExportProgress';
import { ShareProgress } from '@/components/export/ShareProgress';

export default function Settings() {
  const { theme, toggleTheme, exams, studyEntries } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/signin');
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6 pb-32 lg:pb-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </header>

        {/* Appearance */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {theme === 'dark' ? (
                  <Moon className="w-5 h-5 text-primary" />
                ) : (
                  <Sun className="w-5 h-5 text-warning" />
                )}
                <div>
                  <Label htmlFor="theme-toggle" className="font-medium">
                    Dark Mode
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    Switch between light and dark theme
                  </p>
                </div>
              </div>
              <Switch
                id="theme-toggle"
                checked={theme === 'dark'}
                onCheckedChange={toggleTheme}
              />
            </div>
          </CardContent>
        </Card>

        {/* Export Progress */}
        <ExportProgress />

        {/* Share Progress */}
        <ShareProgress />

        {/* Account */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-primary">
                    {user.email?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-sm truncate">{user.email}</p>
                  <p className="text-xs text-muted-foreground">Signed in</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display">Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 sm:p-4 rounded-lg bg-muted">
                <p className="text-xl sm:text-2xl font-display font-bold">{exams.length}</p>
                <p className="text-xs text-muted-foreground">Exams Created</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted">
                <p className="text-xl sm:text-2xl font-display font-bold">
                  {exams.reduce((sum, e) => sum + e.categories.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted">
                <p className="text-xl sm:text-2xl font-display font-bold">{studyEntries.length}</p>
                <p className="text-xs text-muted-foreground">Study Entries</p>
              </div>
              <div className="p-3 sm:p-4 rounded-lg bg-muted">
                <p className="text-xl sm:text-2xl font-display font-bold">
                  {new Set(studyEntries.map(e => e.date)).size}
                </p>
                <p className="text-xs text-muted-foreground">Days Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="card-elevated">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-display flex items-center gap-2">
              <Target className="w-4 h-4 text-primary" />
              About TrackPrep
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              TrackPrep helps you track preparation for any exam by setting targets, 
              logging study activities, and visualizing your progress.
            </p>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-destructive" /> for serious students
            </p>
          </CardContent>
        </Card>

        {/* Logout Section - Prominent at bottom */}
        <Card className="card-elevated border-destructive/20">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center flex-shrink-0">
                  <LogOut className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-xs text-muted-foreground">
                    Log out of your account on this device
                  </p>
                </div>
              </div>
              <Button 
                variant="destructive" 
                onClick={handleSignOut}
                className="w-full sm:w-auto"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
