import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExamCard } from '@/components/cards/ExamCard';
import { AddExamDialog } from '@/components/dialogs/AddDialogs';
import { CircularProgress, ProgressBar } from '@/components/ui/progress-display';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Target, Calendar, TrendingUp, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const motivationalQuotes = [
  "Every study session brings you closer to your goal.",
  "Small steps every day lead to big achievements.",
  "Your future self will thank you for studying today.",
  "Progress, not perfection.",
  "Consistency beats intensity. Keep going!",
  "You're building something great, one page at a time.",
];

export default function Dashboard() {
  const { exams, getTodayEntries, getStats, getOverallProgress } = useApp();
  const todayEntries = getTodayEntries();
  const stats = getStats();
  const overallProgress = getOverallProgress();
  
  const today = new Date();
  const todayStr = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  const randomQuote = motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)];

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">{todayStr}</p>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Dashboard</h1>
        </header>

        {/* Motivational Card */}
        <Card className="gradient-primary text-primary-foreground overflow-hidden">
          <CardContent className="p-5 flex items-center gap-4">
            <Sparkles className="w-8 h-8 opacity-80 flex-shrink-0" />
            <p className="text-sm lg:text-base font-medium">{randomQuote}</p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{overallProgress}%</p>
                  <p className="text-xs text-muted-foreground">Overall Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-accent/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalExams}</p>
                  <p className="text-xs text-muted-foreground">Active Exams</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{todayEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Today's Sessions</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-warning" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Total Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's Progress */}
        {todayEntries.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold mb-3">Today's Study</h2>
            <Card className="card-elevated">
              <CardContent className="p-4 space-y-3">
                {todayEntries.slice(0, 5).map(entry => {
                  const exam = exams.find(e => e.id === entry.examId);
                  const category = exam?.categories.find(c => c.id === entry.categoryId);
                  
                  return (
                    <div key={entry.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                      <div className="w-2 h-2 rounded-full bg-success flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{entry.description}</p>
                        <p className="text-xs text-muted-foreground">
                          {exam?.name} • {category?.name}
                        </p>
                      </div>
                      <span className="text-sm font-medium text-primary">
                        +{entry.quantity} {category?.unit}
                      </span>
                    </div>
                  );
                })}
                {todayEntries.length > 5 && (
                  <p className="text-xs text-muted-foreground text-center pt-2">
                    +{todayEntries.length - 5} more entries
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Exams */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold">Your Exams</h2>
            {exams.length > 0 && (
              <Link to="/exams" className="text-sm text-primary hover:underline">
                View all
              </Link>
            )}
          </div>

          {exams.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2">No exams yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Start tracking your study progress by adding your first exam.
                </p>
                <AddExamDialog
                  trigger={
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add Your First Exam
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {exams.slice(0, 3).map(exam => (
                <ExamCard key={exam.id} exam={exam} />
              ))}
              {exams.length <= 3 && (
                <AddExamDialog
                  trigger={
                    <Card className="card-elevated hover:shadow-md transition-shadow cursor-pointer border-dashed min-h-[200px] flex items-center justify-center">
                      <CardContent className="p-6 text-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                          <Plus className="w-6 h-6 text-muted-foreground" />
                        </div>
                        <p className="text-sm text-muted-foreground">Add New Exam</p>
                      </CardContent>
                    </Card>
                  }
                />
              )}
            </div>
          )}
        </section>

        {/* Quick Actions */}
        {exams.length > 0 && (
          <section className="pb-4">
            <h2 className="text-lg font-display font-semibold mb-3">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link to="/log">
                <Button>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Study Session
                </Button>
              </Link>
              <AddExamDialog
                trigger={
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Exam
                  </Button>
                }
              />
              <Link to="/analytics">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Analytics
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
