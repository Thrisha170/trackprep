import { Link } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { Exam } from '@/types';
import { ProgressBar, CircularProgress } from '@/components/ui/progress-display';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronRight, Calendar, MapPin, MoreVertical, Trash2, Pencil } from 'lucide-react';
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
        <Card className="card-milestone hover:shadow-lg transition-all duration-300 cursor-pointer animate-fade-in group">
          <CardContent className="p-4 flex items-center gap-4">
            <CircularProgress value={progress} size={56} strokeWidth={6} showLabel={false} />
            <div className="flex-1 min-w-0">
              <h3 className="font-display font-semibold truncate group-hover:text-primary transition-colors">{exam.name}</h3>
              <p className="text-xs text-muted-foreground">
                {exam.categories.length} milestones • {progress}% complete
              </p>
            </div>
            <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Card className="card-milestone animate-fade-in overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className="h-1 progress-gradient opacity-60" />
      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <CardTitle className="font-display text-lg truncate group-hover:text-primary transition-colors">{exam.name}</CardTitle>
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
        {/* Journey Progress */}
        <div className="flex items-center gap-4">
          <CircularProgress value={progress} size={68} strokeWidth={7} label="complete" />
          <div className="flex-1 space-y-1">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="w-4 h-4 text-accent" />
              <span>{exam.categories.length} milestones</span>
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

        {/* Milestone previews */}
        {exam.categories.length > 0 && (
          <div className="space-y-2">
            {exam.categories.slice(0, 3).map(cat => (
              <div key={cat.id} className="flex items-center gap-3">
                <span className="text-sm text-muted-foreground w-24 truncate font-medium">{cat.name}</span>
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
          <Button variant="outline" className="w-full mt-2 group-hover:border-primary group-hover:text-primary transition-colors">
            View Details
            <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}
