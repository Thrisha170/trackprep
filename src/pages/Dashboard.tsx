import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExamCard } from '@/components/cards/ExamCard';
import { AddExamDialog } from '@/components/dialogs/AddDialogs';
import { CircularProgress, ProgressBar } from '@/components/ui/progress-display';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen, Target, Calendar, TrendingUp, Sparkles, Flame, Trophy } from 'lucide-react';
import { Link } from 'react-router-dom';

const motivationalQuotes = [
  "Every step forward is progress on your journey.",
  "Small milestones lead to big destinations.",
  "Your future self will thank you for today's effort.",
  "Progress, not perfection. Keep moving forward.",
  "Consistency is the road to mastery. Keep going!",
  "You're on the path to something great.",
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
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 pb-32 lg:pb-8">
        {/* Header */}
        <header className="space-y-1">
          <p className="text-sm text-muted-foreground">{todayStr}</p>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Your Journey</h1>
        </header>

        {/* Journey motivation card with gradient */}
        <Card className="gradient-primary text-primary-foreground overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent" />
          <CardContent className="p-5 flex items-center gap-4 relative">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm lg:text-base font-medium">{randomQuote}</p>
              <p className="text-xs opacity-80 mt-1">Keep moving forward</p>
            </div>
          </CardContent>
        </Card>

        {/* Milestone stats grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-milestone group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-primary/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Target className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{overallProgress}%</p>
                  <p className="text-xs text-muted-foreground">Journey Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-milestone group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-accent/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-accent/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <BookOpen className="w-5 h-5 text-accent" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalExams}</p>
                  <p className="text-xs text-muted-foreground">Active Paths</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-milestone group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-success/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-success/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{todayEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Today's Steps</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-milestone group hover:scale-[1.02] transition-transform duration-300">
            <CardContent className="p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 bg-achievement/5 rounded-full -translate-y-1/2 translate-x-1/2" />
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-xl bg-achievement/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <Trophy className="w-5 h-5 text-achievement" />
                </div>
                <div>
                  <p className="text-2xl font-display font-bold">{stats.totalEntries}</p>
                  <p className="text-xs text-muted-foreground">Milestones</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Today's journey progress */}
        {todayEntries.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold mb-3">Today's Progress</h2>
            <Card className="card-milestone">
              <CardContent className="p-4 space-y-1">
                {todayEntries.slice(0, 5).map(entry => {
                  const exam = exams.find(e => e.id === entry.examId);
                  const category = exam?.categories.find(c => c.id === entry.categoryId);
                  
                  return (
                    <div key={entry.id} className="flex items-center gap-3 py-3 border-b border-border/50 last:border-0 group">
                      <div className="w-2.5 h-2.5 rounded-full bg-success flex-shrink-0 group-hover:scale-125 transition-transform" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">{entry.description}</p>
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
                    +{todayEntries.length - 5} more milestones
                  </p>
                )}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Learning paths (Exams) */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-display font-semibold">Your Learning Paths</h2>
            {exams.length > 0 && (
              <Link to="/exams" className="text-sm text-primary hover:underline">
                View all
              </Link>
            )}
          </div>

          {exams.length === 0 ? (
            <Card className="card-milestone">
              <CardContent className="p-8 text-center">
                <div className="w-20 h-20 rounded-2xl gradient-journey flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-10 h-10 text-primary" />
                </div>
                <h3 className="font-display font-semibold mb-2">Start Your Journey</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Begin tracking your progress by adding your first learning path.
                </p>
                <AddExamDialog
                  trigger={
                    <Button className="gradient-primary border-0">
                      <Plus className="w-4 h-4 mr-2" />
                      Start Your First Path
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
                    <Card className="card-milestone hover:shadow-lg transition-all duration-300 cursor-pointer border-dashed border-primary/20 hover:border-primary/40 min-h-[200px] flex items-center justify-center group">
                      <CardContent className="p-6 text-center">
                        <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-3 group-hover:scale-110 group-hover:bg-primary/20 transition-all">
                          <Plus className="w-7 h-7 text-primary" />
                        </div>
                        <p className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">Add New Path</p>
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
                <Button className="gradient-primary border-0 shadow-md hover:shadow-lg transition-shadow">
                  <Plus className="w-4 h-4 mr-2" />
                  Log Progress
                </Button>
              </Link>
              <AddExamDialog
                trigger={
                  <Button variant="outline">
                    <BookOpen className="w-4 h-4 mr-2" />
                    Add Path
                  </Button>
                }
              />
              <Link to="/analytics">
                <Button variant="outline">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Journey
                </Button>
              </Link>
            </div>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
