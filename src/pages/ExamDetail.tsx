import { useParams, useNavigate, Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { AddCategoryDialog } from '@/components/dialogs/AddDialogs';
import { ProgressBar, CircularProgress } from '@/components/ui/progress-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ChevronLeft, Plus, Calendar, Layers, MoreVertical, 
  Trash2, Pencil, Clock, BookOpen, FileText, Trophy 
} from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { calculateProgress, formatTime } from '@/types';
import { cn } from '@/lib/utils';

const getTargetIcon = (type: string) => {
  switch (type) {
    case 'time': return Clock;
    case 'tasks': return BookOpen;
    case 'units': return FileText;
    case 'scores': return Trophy;
    default: return BookOpen;
  }
};

export default function ExamDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { exams, getExamProgress, deleteExam, deleteCategory, studyEntries } = useApp();

  const exam = exams.find(e => e.id === id);

  if (!exam) {
    return (
      <AppLayout>
        <div className="p-4 lg:p-8 max-w-6xl mx-auto">
          <div className="text-center py-12">
            <h2 className="text-xl font-display font-semibold mb-2">Exam not found</h2>
            <p className="text-muted-foreground mb-4">This exam may have been deleted.</p>
            <Link to="/exams">
              <Button>Go to Exams</Button>
            </Link>
          </div>
        </div>
      </AppLayout>
    );
  }

  const progress = getExamProgress(exam.id);
  const examEntries = studyEntries.filter(e => e.examId === exam.id);
  
  const daysUntilExam = exam.targetDate 
    ? Math.ceil((new Date(exam.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const handleDeleteExam = () => {
    deleteExam(exam.id);
    navigate('/exams');
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6 pb-32 lg:pb-8">
        {/* Back button */}
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          <span className="text-sm">Back</span>
        </button>

        {/* Header */}
        <header className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-2xl lg:text-3xl font-display font-bold">{exam.name}</h1>
            {exam.description && (
              <p className="text-muted-foreground mt-1">{exam.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="gap-2">
                <Pencil className="w-4 h-4" />
                Edit Exam
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="gap-2 text-destructive focus:text-destructive"
                onClick={handleDeleteExam}
              >
                <Trash2 className="w-4 h-4" />
                Delete Exam
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-elevated">
            <CardContent className="p-4 flex items-center gap-4">
              <CircularProgress value={progress} size={56} strokeWidth={6} />
              <div>
                <p className="text-xs text-muted-foreground">Overall</p>
                <p className="font-display font-semibold">{progress}%</p>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold">{exam.categories.length}</p>
                  <p className="text-xs text-muted-foreground">Categories</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="card-elevated">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                  <BookOpen className="w-5 h-5 text-success" />
                </div>
                <div>
                  <p className="text-xl font-display font-bold">{examEntries.length}</p>
                  <p className="text-xs text-muted-foreground">Study Entries</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {daysUntilExam !== null && (
            <Card className={cn(
              "card-elevated",
              daysUntilExam < 7 && "border-destructive/50"
            )}>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    daysUntilExam < 7 ? "bg-destructive/10" : "bg-warning/10"
                  )}>
                    <Calendar className={cn(
                      "w-5 h-5",
                      daysUntilExam < 7 ? "text-destructive" : "text-warning"
                    )} />
                  </div>
                  <div>
                    <p className="text-xl font-display font-bold">
                      {daysUntilExam > 0 ? daysUntilExam : 'Due'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {daysUntilExam > 0 ? 'Days Left' : 'Past Due'}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Categories */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-display font-semibold">Categories</h2>
            <AddCategoryDialog
              examId={exam.id}
              trigger={
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Category
                </Button>
              }
            />
          </div>

          {exam.categories.length === 0 ? (
            <Card className="card-elevated">
              <CardContent className="p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                  <Layers className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-display font-semibold mb-2">No categories yet</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Add categories to track different aspects of your preparation.
                </p>
                <AddCategoryDialog
                  examId={exam.id}
                  trigger={
                    <Button>
                      <Plus className="w-4 h-4 mr-2" />
                      Add First Category
                    </Button>
                  }
                />
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {exam.categories.map(category => {
                const catProgress = calculateProgress(category.completedValue, category.targetValue);
                const Icon = getTargetIcon(category.targetType);
                
                return (
                  <Card key={category.id} className="card-elevated animate-fade-in">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div>
                            <CardTitle className="text-base font-display">{category.name}</CardTitle>
                            <p className="text-xs text-muted-foreground capitalize">{category.targetType}</p>
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="gap-2">
                              <Pencil className="w-4 h-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="gap-2 text-destructive focus:text-destructive"
                              onClick={() => deleteCategory(exam.id, category.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Progress</span>
                        <span className="font-medium">
                          {category.targetType === 'time' 
                            ? formatTime(category.completedValue) 
                            : category.completedValue
                          } / {category.targetType === 'time' 
                            ? formatTime(category.targetValue) 
                            : category.targetValue
                          } {category.unit}
                        </span>
                      </div>
                      <ProgressBar value={category.completedValue} max={category.targetValue} size="md" />
                      <div className="flex justify-between items-center pt-1">
                        <span className={cn(
                          "text-lg font-display font-bold",
                          catProgress >= 100 ? "text-success" : catProgress >= 50 ? "text-warning" : "text-accent"
                        )}>
                          {catProgress}%
                        </span>
                        <Link to={`/log?exam=${exam.id}&category=${category.id}`}>
                          <Button variant="outline" size="sm">
                            <Plus className="w-3 h-3 mr-1" />
                            Log
                          </Button>
                        </Link>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>

        {/* Recent Entries */}
        {examEntries.length > 0 && (
          <section>
            <h2 className="text-lg font-display font-semibold mb-4">Recent Entries</h2>
            <Card className="card-elevated">
              <CardContent className="p-4 divide-y divide-border">
                {examEntries.slice(-5).reverse().map(entry => {
                  const category = exam.categories.find(c => c.id === entry.categoryId);
                  return (
                    <div key={entry.id} className="py-3 first:pt-0 last:pb-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{entry.description}</p>
                          <p className="text-xs text-muted-foreground">
                            {category?.name} • {new Date(entry.date).toLocaleDateString()}
                          </p>
                        </div>
                        <span className="text-sm font-medium text-primary ml-4">
                          +{entry.quantity} {category?.unit}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        )}
      </div>
    </AppLayout>
  );
}
