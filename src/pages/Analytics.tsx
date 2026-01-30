import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress, ProgressBar } from '@/components/ui/progress-display';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BarChart3, Target } from 'lucide-react';
import { calculateProgress } from '@/types';

const CHART_COLORS = [
  'hsl(150 45% 45%)',
  'hsl(38 90% 55%)',
  'hsl(20 70% 55%)',
  'hsl(200 60% 50%)',
  'hsl(280 50% 55%)',
];

export default function Analytics() {
  const { exams, getExamProgress, getOverallProgress, studyEntries } = useApp();
  const overallProgress = getOverallProgress();

  // Prepare exam progress data for bar chart
  const examProgressData = exams.map(exam => ({
    name: exam.name.length > 12 ? exam.name.slice(0, 12) + '...' : exam.name,
    progress: getExamProgress(exam.id),
    fullName: exam.name,
  }));

  // Prepare category distribution data for pie chart
  const allCategories = exams.flatMap(exam => 
    exam.categories.map(cat => ({
      name: cat.name,
      value: cat.completedValue,
      exam: exam.name,
    }))
  ).filter(c => c.value > 0);

  // Study entries by date (last 7 days)
  const last7Days = [...Array(7)].map((_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  const entriesByDay = last7Days.map(date => {
    const dayEntries = studyEntries.filter(e => e.date === date);
    return {
      date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
      entries: dayEntries.length,
      quantity: dayEntries.reduce((sum, e) => sum + e.quantity, 0),
    };
  });

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your study progress visually</p>
        </header>

        {exams.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <BarChart3 className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-semibold mb-2">No data yet</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start adding exams and logging study sessions to see your progress analytics.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="card-elevated lg:col-span-1">
                <CardHeader>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-4">
                  <CircularProgress 
                    value={overallProgress} 
                    size={140} 
                    strokeWidth={12} 
                    label="complete"
                  />
                  <p className="text-sm text-muted-foreground mt-4 text-center">
                    {overallProgress >= 80 
                      ? "Excellent progress! Keep it up!"
                      : overallProgress >= 50 
                        ? "Good progress! You're halfway there."
                        : "Keep studying! Every session counts."
                    }
                  </p>
                </CardContent>
              </Card>

              <Card className="card-elevated lg:col-span-2">
                <CardHeader>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Study Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={entriesByDay}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                        />
                        <Bar 
                          dataKey="entries" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                          name="Sessions"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exam Progress */}
            {examProgressData.length > 0 && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Progress by Exam
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={examProgressData} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={100}
                          tick={{ fontSize: 12 }}
                          className="text-muted-foreground"
                        />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number, name: string, props: any) => [
                            `${value}%`,
                            props.payload.fullName
                          ]}
                        />
                        <Bar 
                          dataKey="progress" 
                          fill="hsl(var(--success))" 
                          radius={[0, 4, 4, 0]}
                          name="Progress"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Category breakdown per exam */}
            <div className="space-y-4">
              <h2 className="text-lg font-display font-semibold">Category Breakdown</h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {exams.map(exam => {
                  if (exam.categories.length === 0) return null;
                  
                  return (
                    <Card key={exam.id} className="card-elevated">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-base font-display">{exam.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {exam.categories.map(cat => {
                          const catProgress = calculateProgress(cat.completedValue, cat.targetValue);
                          return (
                            <div key={cat.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-muted-foreground truncate mr-2">{cat.name}</span>
                                <span className="font-medium">{catProgress}%</span>
                              </div>
                              <ProgressBar value={cat.completedValue} max={cat.targetValue} size="sm" />
                            </div>
                          );
                        })}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>

            {/* Distribution Pie Chart */}
            {allCategories.length > 0 && (
              <Card className="card-elevated">
                <CardHeader>
                  <CardTitle className="text-base font-display">Study Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={allCategories}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          outerRadius={100}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            percent > 0.05 ? `${name} (${(percent * 100).toFixed(0)}%)` : ''
                          }
                        >
                          {allCategories.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ 
                            backgroundColor: 'hsl(var(--card))',
                            border: '1px solid hsl(var(--border))',
                            borderRadius: '8px',
                          }}
                          formatter={(value: number, name: string) => [
                            value.toFixed(1),
                            name
                          ]}
                        />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    </AppLayout>
  );
}
