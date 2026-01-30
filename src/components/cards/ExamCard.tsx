import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Exam } from '@/types';
import { ProgressBar, CircularProgress } from '@/components/ui/progress-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, Layers, MoreVertical, Trash2, Pencil } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ExamCardProps {
  exam: Exam;
  variant?: 'default' | 'compact';
}

export function ExamCard({ exam, variant = 'default' }: ExamCardProps) {
  const { getExamProgress, deleteExam } = useApp();
  const progress = getExamProgress(exam.id);
  
  const daysUntilExam = exam.targetDate 
    ? Math.ceil((new Date(exam.targetDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  if (variant === 'compact') {
    return (
      <Link to={`/exams/${exam.id}`}>
        <Card className="card-elevated hover:shadow-md transition-shadow cursor-pointer animate-fade-in">
          <CardContent className="p-4 flex items-center gap-4">
            <CircularProgress value={progress} size={56} strokeWidth={6} showLabel={false} />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold truncate">{exam.name}</h3>
              <p className="text-xs text-muted-foreground">
                {exam.categories.length} categories • {progress}% complete
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="card-elevated animate-fade-in overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg truncate">{exam.name}</CardTitle>
            {exam.description && (
              <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{exam.description}</p>
            )}
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2">
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
                onClick={() => deleteExam(exam.id)}
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Progress */}
        <div className="flex items-center gap-4">
          <CircularProgress value={progress} size={64} strokeWidth={6} label="done" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Layers className="w-4 h-4" />
              <span>{exam.categories.length} categories</span>
            </div>
            {daysUntilExam !== null && (
              <div className={cn(
                "flex items-center gap-2 text-sm",
                daysUntilExam < 7 ? "text-destructive" : daysUntilExam < 30 ? "text-warning" : "text-muted-foreground"
              )}>
                <Calendar className="w-4 h-4" />
                <span>
                  {daysUntilExam > 0 
                    ? `${daysUntilExam} days left`
                    : daysUntilExam === 0 
                      ? "Today!"
                      : "Past due"
                  }
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Category previews */}
        {exam.categories.length > 0 && (
          <div className="space-y-2">
            {exam.categories.slice(0, 3).map(cat => (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 truncate">{cat.name}</span>
                <ProgressBar 
                  value={cat.completedValue} 
                  max={cat.targetValue} 
                  size="sm" 
                  className="flex-1"
                />
                <span className="text-xs text-muted-foreground w-12 text-right">
                  {Math.round((cat.completedValue / cat.targetValue) * 100)}%
                </span>
              </div>
            ))}
            {exam.categories.length > 3 && (
              <p className="text-xs text-muted-foreground text-center pt-1">
                +{exam.categories.length - 3} more
              </p>
            )}
          </div>
        )}

        <Link to={`/exams/${exam.id}`}>
          <Button variant="outline" className="w-full mt-2">
            View Details
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
