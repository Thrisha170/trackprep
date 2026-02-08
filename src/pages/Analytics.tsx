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

// Custom tooltip component for better dark mode visibility
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
        <p className="text-sm font-medium text-foreground mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm text-foreground">
            <span className="font-medium" style={{ color: entry.color }}>{entry.name}: </span>
            {typeof entry.value === 'number' ? entry.value.toFixed(1) : entry.value}
            {entry.name === 'Progress' && '%'}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Custom legend with better visibility
const CustomLegend = ({ payload }: any) => {
  return (
    <div className="flex flex-wrap justify-center gap-3 mt-4">
      {payload?.map((entry: any, index: number) => (
        <div key={index} className="flex items-center gap-1.5">
          <div 
            className="w-3 h-3 rounded-full" 
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-xs text-foreground font-medium">{entry.value}</span>
        </div>
      ))}
    </div>
  );
};

export default function Analytics() {
  const { exams, getExamProgress, getOverallProgress, studyEntries } = useApp();
  const overallProgress = getOverallProgress();

  // Prepare exam progress data for bar chart
  const examProgressData = exams.map(exam => ({
    name: exam.name.length > 10 ? exam.name.slice(0, 10) + '...' : exam.name,
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

  // Calculate marks/scores data for score-type categories
  const scoresData = studyEntries
    .filter(e => e.marks)
    .map(entry => {
      const exam = exams.find(ex => ex.id === entry.examId);
      const category = exam?.categories.find(c => c.id === entry.categoryId);
      return {
        date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        description: entry.description.length > 20 ? entry.description.slice(0, 20) + '...' : entry.description,
        obtained: entry.marks!.obtained,
        total: entry.marks!.total,
        percentage: Math.round((entry.marks!.obtained / entry.marks!.total) * 100),
        category: category?.name || 'Unknown',
      };
    })
    .slice(-10)
    .reverse();

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 pb-32 lg:pb-8">
        {/* Header */}
        <header>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Analytics</h1>
          <p className="text-sm text-muted-foreground">Track your study progress visually</p>
        </header>

        {exams.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-8 sm:p-12 text-center">
              <div className="w-16 sm:w-20 h-16 sm:h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4 sm:mb-6">
                <BarChart3 className="w-8 sm:w-10 h-8 sm:h-10 text-muted-foreground" />
              </div>
              <h2 className="text-lg sm:text-xl font-display font-semibold mb-2">No data yet</h2>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Start adding exams and logging study sessions to see your progress analytics.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Overall Progress */}
            <div className="grid gap-4 lg:grid-cols-3">
              <Card className="card-elevated lg:col-span-1">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Overall Progress
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col items-center justify-center py-4">
                  <CircularProgress 
                    value={overallProgress} 
                    size={120} 
                    strokeWidth={10} 
                    label="complete"
                  />
                  <p className="text-sm text-muted-foreground mt-4 text-center px-2">
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-primary" />
                    Study Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={entriesByDay} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <Tooltip content={<CustomTooltip />} />
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-primary" />
                    Progress by Exam
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={examProgressData} 
                        layout="vertical"
                        margin={{ top: 5, right: 20, left: 0, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          type="number" 
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          dataKey="name" 
                          type="category" 
                          width={80}
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <Tooltip 
                          content={<CustomTooltip />}
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
                        <CardTitle className="text-base font-display truncate">{exam.name}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {exam.categories.map(cat => {
                          const catProgress = calculateProgress(cat.completedValue, cat.targetValue);
                          return (
                            <div key={cat.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground truncate mr-2">{cat.name}</span>
                                <span className="font-semibold text-foreground">{catProgress}%</span>
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
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display">Study Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <Pie
                          data={allCategories}
                          cx="50%"
                          cy="45%"
                          labelLine={false}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                          label={({ name, percent }) => 
                            percent > 0.08 ? `${(percent * 100).toFixed(0)}%` : ''
                          }
                        >
                          {allCategories.map((_, index) => (
                            <Cell 
                              key={`cell-${index}`} 
                              fill={CHART_COLORS[index % CHART_COLORS.length]} 
                            />
                          ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend content={<CustomLegend />} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Marks/Scores Analytics */}
            {scoresData.length > 0 && (
              <Card className="card-elevated">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Target className="w-4 h-4 text-primary" />
                    Test Scores History
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={scoresData}
                        margin={{ top: 5, right: 20, left: -10, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                        <XAxis 
                          dataKey="date" 
                          tick={{ fontSize: 10, fill: 'hsl(var(--foreground))' }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                        />
                        <YAxis 
                          domain={[0, 100]}
                          tick={{ fontSize: 11, fill: 'hsl(var(--foreground))' }}
                          stroke="hsl(var(--muted-foreground))"
                          tickLine={{ stroke: 'hsl(var(--border))' }}
                          tickFormatter={(value) => `${value}%`}
                        />
                        <Tooltip 
                          content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                              const data = payload[0].payload;
                              return (
                                <div className="bg-card border border-border rounded-lg p-3 shadow-lg">
                                  <p className="text-sm font-medium text-foreground mb-1">{data.description}</p>
                                  <p className="text-xs text-muted-foreground">{data.category}</p>
                                  <p className="text-sm text-foreground mt-1">
                                    <span className="font-semibold">{data.obtained}/{data.total}</span> ({data.percentage}%)
                                  </p>
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Bar 
                          dataKey="percentage" 
                          fill="hsl(var(--warning))" 
                          radius={[4, 4, 0, 0]}
                          name="Score %"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-4 space-y-2">
                    {scoresData.slice(0, 5).map((score, index) => (
                      <div key={index} className="flex items-center justify-between text-sm">
                        <div className="flex-1 min-w-0">
                          <span className="text-foreground truncate block">{score.description}</span>
                          <span className="text-xs text-muted-foreground">{score.category} • {score.date}</span>
                        </div>
                        <span className={`font-semibold ml-2 ${
                          score.percentage >= 80 ? 'text-success' : 
                          score.percentage >= 50 ? 'text-warning' : 
                          'text-destructive'
                        }`}>
                          {score.obtained}/{score.total}
                        </span>
                      </div>
                    ))}
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
