import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { ExamCard } from '@/components/cards/ExamCard';
import { AddExamDialog } from '@/components/dialogs/AddDialogs';
import { Button } from '@/components/ui/button';
import { Plus, BookOpen } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';

export default function Exams() {
  const { exams } = useApp();

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl lg:text-3xl font-display font-bold">Exams</h1>
            <p className="text-sm text-muted-foreground">Manage your exam preparations</p>
          </div>
          <AddExamDialog
            trigger={
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Exam
              </Button>
            }
          />
        </header>

        {/* Exams Grid */}
        {exams.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-6">
                <BookOpen className="w-10 h-10 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-display font-semibold mb-2">No exams yet</h2>
              <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                Start tracking your study progress by adding your first exam. You can add any exam type - competitive, academic, or professional.
              </p>
              <AddExamDialog
                trigger={
                  <Button size="lg">
                    <Plus className="w-5 h-5 mr-2" />
                    Add Your First Exam
                  </Button>
                }
              />
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exams.map(exam => (
              <ExamCard key={exam.id} exam={exam} />
            ))}
            <AddExamDialog
              trigger={
                <Card className="card-elevated hover:shadow-md transition-shadow cursor-pointer border-dashed min-h-[200px] flex items-center justify-center">
                  <CardContent className="p-6 text-center">
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                      <Plus className="w-6 h-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium">Add New Exam</p>
                  </CardContent>
                </Card>
              }
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
