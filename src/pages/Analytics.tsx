import { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CircularProgress, ProgressBar } from '@/components/ui/progress-display';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, BarChart3, Target, BookOpen, Trophy } from 'lucide-react';
import { calculateProgress, formatTime } from '@/types';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

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
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  
  // Calculate all analytics from real data using useMemo for performance
  const analyticsData = useMemo(() => {
    const overallProgress = getOverallProgress();
    
    // Separate study logs from test logs
    const studyLogs = studyEntries.filter(e => !e.marks);
    const testLogs = studyEntries.filter(e => e.marks);
    
    // Calculate total study effort by type
    const studyEffort = {
      time: 0,
      tasks: 0,
      units: 0,
    };
    
    studyLogs.forEach(entry => {
      const exam = exams.find(e => e.id === entry.examId);
      const category = exam?.categories.find(c => c.id === entry.categoryId);
      if (category) {
        if (category.targetType === 'time') {
          studyEffort.time += entry.quantity;
        } else if (category.targetType === 'tasks') {
          studyEffort.tasks += entry.quantity;
        } else if (category.targetType === 'units') {
          studyEffort.units += entry.quantity;
        }
      }
    });
    
    // Calculate average test performance
    const avgTestScore = testLogs.length > 0
      ? Math.round(testLogs.reduce((sum, e) => sum + (e.marks!.obtained / e.marks!.total) * 100, 0) / testLogs.length)
      : null;
    
    // Exam progress data
    const examProgressData = exams.map(exam => ({
      name: exam.name.length > 10 ? exam.name.slice(0, 10) + '...' : exam.name,
      progress: getExamProgress(exam.id),
      fullName: exam.name,
    }));
    
    // Category distribution
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
      const dayStudyEntries = studyLogs.filter(e => e.date === date);
      const dayTestEntries = testLogs.filter(e => e.date === date);
      return {
        date: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
        studySessions: dayStudyEntries.length,
        testSessions: dayTestEntries.length,
        total: dayStudyEntries.length + dayTestEntries.length,
      };
    });
    
    // All unique categories that have test logs
    const testCategories = Array.from(new Set(testLogs.map(e => e.categoryId)))
      .map(catId => {
        const exam = exams.find(ex => ex.categories.some(c => c.id === catId));
        const category = exam?.categories.find(c => c.id === catId);
        return category ? { id: catId, name: category.name, color: category.color } : null;
      })
      .filter(Boolean) as { id: string; name: string; color?: string }[];

    // Scores data - ALL test logs, sorted newest first, with unique id for dedup
    const allScoresData = testLogs
      .map(entry => {
        const exam = exams.find(ex => ex.id === entry.examId);
        const category = exam?.categories.find(c => c.id === entry.categoryId);
        return {
          id: entry.id,
          categoryId: entry.categoryId,
          date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
          rawDate: entry.date,
          description: entry.description.length > 25 ? entry.description.slice(0, 25) + '...' : entry.description,
          fullDescription: entry.description,
          obtained: entry.marks!.obtained,
          total: entry.marks!.total,
          percentage: Math.round((entry.marks!.obtained / entry.marks!.total) * 100),
          category: category?.name || 'Unknown',
          categoryColor: category?.color,
        };
      })
      .sort((a, b) => b.rawDate.localeCompare(a.rawDate));
    
    return {
      overallProgress,
      studyLogs,
      testLogs,
      studyEffort,
      avgTestScore,
      examProgressData,
      allCategories,
      entriesByDay,
      allScoresData,
      testCategories,
    };
  }, [exams, studyEntries, getExamProgress, getOverallProgress]);

  // Filtered scores based on selected categories
  const filteredScoresData = useMemo(() => {
    if (selectedCategories.size === 0) return analyticsData.allScoresData;
    return analyticsData.allScoresData.filter(s => selectedCategories.has(s.categoryId));
  }, [analyticsData.allScoresData, selectedCategories]);

  const toggleCategory = (catId: string) => {
    setSelectedCategories(prev => {
      const next = new Set(prev);
      if (next.has(catId)) {
        next.delete(catId);
      } else {
        next.add(catId);
      }
      return next;
    });
  };

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
            {/* Summary Stats */}
            <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
              <Card className="card-elevated">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Target className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold">{analyticsData.overallProgress}%</p>
                    <p className="text-xs text-muted-foreground">Overall Progress</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-success" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold">{analyticsData.studyLogs.length}</p>
                    <p className="text-xs text-muted-foreground">Study Logs</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
                    <Trophy className="w-5 h-5 text-warning" />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold">{analyticsData.testLogs.length}</p>
                    <p className="text-xs text-muted-foreground">Test Logs</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="card-elevated">
                <CardContent className="p-4 flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    analyticsData.avgTestScore !== null 
                      ? analyticsData.avgTestScore >= 80 ? 'bg-success/10' 
                        : analyticsData.avgTestScore >= 50 ? 'bg-warning/10' 
                        : 'bg-destructive/10'
                      : 'bg-muted'
                  }`}>
                    <TrendingUp className={`w-5 h-5 ${
                      analyticsData.avgTestScore !== null 
                        ? analyticsData.avgTestScore >= 80 ? 'text-success' 
                          : analyticsData.avgTestScore >= 50 ? 'text-warning' 
                          : 'text-destructive'
                        : 'text-muted-foreground'
                    }`} />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold">
                      {analyticsData.avgTestScore !== null ? `${analyticsData.avgTestScore}%` : '-'}
                    </p>
                    <p className="text-xs text-muted-foreground">Avg Test Score</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Study Effort Summary */}
            {(analyticsData.studyEffort.time > 0 || analyticsData.studyEffort.tasks > 0 || analyticsData.studyEffort.units > 0) && (
              <Card className="card-elevated">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-primary" />
                    Total Study Effort
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    {analyticsData.studyEffort.time > 0 && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-lg font-display font-bold text-foreground">
                          {formatTime(analyticsData.studyEffort.time)}
                        </p>
                        <p className="text-xs text-muted-foreground">Time Studied</p>
                      </div>
                    )}
                    {analyticsData.studyEffort.tasks > 0 && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-lg font-display font-bold text-foreground">
                          {analyticsData.studyEffort.tasks}
                        </p>
                        <p className="text-xs text-muted-foreground">Tasks Completed</p>
                      </div>
                    )}
                    {analyticsData.studyEffort.units > 0 && (
                      <div className="p-3 rounded-lg bg-muted">
                        <p className="text-lg font-display font-bold text-foreground">
                          {analyticsData.studyEffort.units}
                        </p>
                        <p className="text-xs text-muted-foreground">Units Completed</p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Overall Progress & Activity Chart */}
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
                    value={analyticsData.overallProgress} 
                    size={120} 
                    strokeWidth={10} 
                    label="complete"
                  />
                  <p className="text-sm text-muted-foreground mt-4 text-center px-2">
                    {analyticsData.overallProgress >= 80 
                      ? "Excellent progress! Keep it up!"
                      : analyticsData.overallProgress >= 50 
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
                    Activity (Last 7 Days)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[180px] sm:h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={analyticsData.entriesByDay} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
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
                        <Legend content={<CustomLegend />} />
                        <Bar 
                          dataKey="studySessions" 
                          fill="hsl(var(--primary))" 
                          radius={[4, 4, 0, 0]}
                          name="Study"
                          stackId="a"
                        />
                        <Bar 
                          dataKey="testSessions" 
                          fill="hsl(var(--warning))" 
                          radius={[4, 4, 0, 0]}
                          name="Tests"
                          stackId="a"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Exam Progress */}
            {analyticsData.examProgressData.length > 0 && (
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
                        data={analyticsData.examProgressData} 
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
                          const categoryEntries = studyEntries.filter(e => e.categoryId === cat.id);
                          const hasStudyLogs = categoryEntries.some(e => !e.marks);
                          const hasTestLogs = categoryEntries.some(e => e.marks);
                          
                          return (
                            <div key={cat.id}>
                              <div className="flex justify-between text-sm mb-1">
                                <span className="text-foreground truncate mr-2">{cat.name}</span>
                                <span className="font-semibold text-foreground">{catProgress}%</span>
                              </div>
                              <ProgressBar value={cat.completedValue} max={cat.targetValue} size="sm" />
                              <div className="flex gap-2 mt-1">
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasStudyLogs ? 'bg-success/20 text-success' : 'bg-muted text-muted-foreground'}`}>
                                  Study {hasStudyLogs ? '✓' : '○'}
                                </span>
                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${hasTestLogs ? 'bg-warning/20 text-warning' : 'bg-muted text-muted-foreground'}`}>
                                  Test {hasTestLogs ? '✓' : '○'}
                                </span>
                              </div>
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
            {analyticsData.allCategories.length > 0 && (
              <Card className="card-elevated">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display">Study Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[280px] sm:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                        <Pie
                          data={analyticsData.allCategories}
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
                          {analyticsData.allCategories.map((_, index) => (
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
            {analyticsData.allScoresData.length > 0 && (
              <Card className="card-elevated">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base font-display flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-warning" />
                    Test Scores History
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Category Toggle Filters */}
                  {analyticsData.testCategories.length > 1 && (
                    <ScrollArea className="w-full whitespace-nowrap">
                      <div className="flex gap-2 pb-2">
                        <button
                          onClick={() => setSelectedCategories(new Set())}
                          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                            selectedCategories.size === 0
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground hover:bg-muted/80'
                          }`}
                        >
                          All Categories
                        </button>
                        {analyticsData.testCategories.map((cat, i) => (
                          <button
                            key={cat.id}
                            onClick={() => toggleCategory(cat.id)}
                            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                              selectedCategories.has(cat.id)
                                ? 'text-primary-foreground'
                                : 'bg-muted text-muted-foreground hover:bg-muted/80'
                            }`}
                            style={selectedCategories.has(cat.id) ? {
                              backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                            } : undefined}
                          >
                            {cat.name}
                          </button>
                        ))}
                      </div>
                      <ScrollBar orientation="horizontal" />
                    </ScrollArea>
                  )}

                  {/* Chart */}
                  <div className="h-[200px] sm:h-[250px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart 
                        data={filteredScoresData.slice(0, 20)}
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
                                  <p className="text-sm font-medium text-foreground mb-1">{data.fullDescription}</p>
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
                          radius={[4, 4, 0, 0]}
                          name="Score %"
                        >
                          {filteredScoresData.slice(0, 20).map((entry, index) => {
                            const catIndex = analyticsData.testCategories.findIndex(c => c.id === entry.categoryId);
                            return (
                              <Cell 
                                key={entry.id} 
                                fill={catIndex >= 0 ? CHART_COLORS[catIndex % CHART_COLORS.length] : (
                                  entry.percentage >= 80 
                                    ? 'hsl(var(--success))' 
                                    : entry.percentage >= 50 
                                      ? 'hsl(var(--warning))' 
                                      : 'hsl(var(--destructive))'
                                )} 
                              />
                            );
                          })}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Results List - same filtered data */}
                  <div className="space-y-2 border-t border-border pt-4">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Results</p>
                    {filteredScoresData.map((score) => (
                      <div key={score.id} className="flex items-center justify-between text-sm py-1.5">
                        <div className="flex-1 min-w-0">
                          <span className="text-foreground truncate block">{score.fullDescription}</span>
                          <span className="text-xs text-muted-foreground">{score.category} • {score.date}</span>
                        </div>
                        <span className={`font-semibold ml-2 shrink-0 ${
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
