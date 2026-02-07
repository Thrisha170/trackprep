import { useApp } from '@/context/AppContext';
import { useAuth } from '@/context/AuthContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Moon, Sun, Trash2, Download, Target, Heart, LogOut } from 'lucide-react';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const { theme, toggleTheme, exams, studyEntries } = useApp();
  const { user, signOut } = useAuth();
  const navigate = useNavigate();

  const handleExportData = () => {
    const data = {
      exams,
      studyEntries,
      exportedAt: new Date().toISOString(),
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `trackprep-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Data exported successfully');
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
    navigate('/signin');
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Settings</h1>
          <p className="text-sm text-muted-foreground">Customize your experience</p>
        </header>

        {/* Appearance */}
        <Card className="card-elevated">
          <CardHeader>
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

        {/* Data Management */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-display">Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Download className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-medium">Export Data</p>
                  <p className="text-xs text-muted-foreground">
                    Download all your data as JSON
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleExportData}>
                Export
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Account */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-display">Account</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {user && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-sm font-medium text-primary">
                      {user.email?.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-sm">{user.email}</p>
                    <p className="text-xs text-muted-foreground">Signed in</p>
                  </div>
                </div>
              </div>
            )}

            <Separator />

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">Sign Out</p>
                  <p className="text-xs text-muted-foreground">
                    Log out of your account
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleSignOut}>
                Sign Out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Statistics */}
        <Card className="card-elevated">
          <CardHeader>
            <CardTitle className="text-base font-display">Your Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-display font-bold">{exams.length}</p>
                <p className="text-xs text-muted-foreground">Exams Created</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-display font-bold">
                  {exams.reduce((sum, e) => sum + e.categories.length, 0)}
                </p>
                <p className="text-xs text-muted-foreground">Categories</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-display font-bold">{studyEntries.length}</p>
                <p className="text-xs text-muted-foreground">Study Entries</p>
              </div>
              <div className="p-4 rounded-lg bg-muted">
                <p className="text-2xl font-display font-bold">
                  {new Set(studyEntries.map(e => e.date)).size}
                </p>
                <p className="text-xs text-muted-foreground">Days Studied</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* About */}
        <Card className="card-elevated">
          <CardHeader>
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
      </div>
    </AppLayout>
  );
}
