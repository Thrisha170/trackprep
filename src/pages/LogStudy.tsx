import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useApp } from '@/context/AppContext';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PenLine, Check, BookOpen } from 'lucide-react';
import { toast } from 'sonner';

export default function LogStudy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exams, addStudyEntry } = useApp();

  const [examId, setExamId] = useState(searchParams.get('exam') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [marksTotal, setMarksTotal] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedExam = exams.find(e => e.id === examId);
  const selectedCategory = selectedExam?.categories.find(c => c.id === categoryId);
  const showMarks = selectedCategory?.targetType === 'scores';

  // Reset category when exam changes
  useEffect(() => {
    if (!selectedExam?.categories.find(c => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [examId, selectedExam, categoryId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const quantityInt = parseInt(quantity, 10);
    if (!examId || !categoryId || !description.trim() || !quantity || isNaN(quantityInt) || quantityInt < 1) {
      if (quantity && (isNaN(quantityInt) || quantityInt < 1)) {
        toast.error('Please enter a whole number greater than 0');
      }
      return;
    }

    setIsSubmitting(true);

    addStudyEntry({
      examId,
      categoryId,
      description: description.trim(),
      quantity: quantityInt,
      date,
      marks: showMarks && marksObtained && marksTotal 
        ? { obtained: parseFloat(marksObtained), total: parseFloat(marksTotal) }
        : undefined,
    });

    toast.success('Study session logged!', {
      description: `Added ${quantity} ${selectedCategory?.unit} to ${selectedCategory?.name}`,
    });

    // Reset form
    setDescription('');
    setQuantity('');
    setMarksObtained('');
    setMarksTotal('');
    setIsSubmitting(false);

    // Navigate to exam detail if came from there
    if (searchParams.get('exam')) {
      navigate(`/exams/${examId}`);
    }
  };

  return (
    <AppLayout>
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <header>
          <h1 className="text-2xl lg:text-3xl font-display font-bold">Log Study</h1>
          <p className="text-sm text-muted-foreground">Record your study progress</p>
        </header>

        {exams.length === 0 ? (
          <Card className="card-elevated">
            <CardContent className="p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-display font-semibold mb-2">No exams to log to</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create an exam first to start logging your study sessions.
              </p>
              <Button onClick={() => navigate('/exams')}>
                Go to Exams
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Card className="card-elevated">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 font-display">
                <PenLine className="w-5 h-5 text-primary" />
                New Study Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Exam Selection */}
                <div className="space-y-2">
                  <Label htmlFor="exam">Exam</Label>
                  <Select value={examId} onValueChange={setExamId} required>
                    <SelectTrigger>
                      <SelectValue placeholder="Select exam" />
                    </SelectTrigger>
                    <SelectContent>
                      {exams.map(exam => (
                        <SelectItem key={exam.id} value={exam.id}>
                          {exam.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Category Selection */}
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={categoryId} 
                    onValueChange={setCategoryId} 
                    disabled={!examId || selectedExam?.categories.length === 0}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !examId 
                          ? "Select exam first" 
                          : selectedExam?.categories.length === 0 
                            ? "No categories - add one first"
                            : "Select category"
                      } />
                    </SelectTrigger>
                    <SelectContent>
                      {selectedExam?.categories.map(cat => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name} ({cat.unit})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className="space-y-2">
                  <Label htmlFor="description">What did you study?</Label>
                  <Textarea
                    id="description"
                    placeholder="e.g., Completed Chapter 5 - Verb Conjugations"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    required
                  />
                </div>

                {/* Quantity */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="quantity">
                      Quantity {selectedCategory ? `(${selectedCategory.unit})` : ''}
                    </Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      step="1"
                      placeholder="e.g., 2"
                      value={quantity}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow whole numbers
                        if (value === '' || /^\d+$/.test(value)) {
                          setQuantity(value);
                        }
                      }}
                      onKeyDown={(e) => {
                        // Prevent decimal point and other non-integer characters
                        if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e') {
                          e.preventDefault();
                        }
                      }}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Date</Label>
                    <Input
                      id="date"
                      type="date"
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      max={new Date().toISOString().split('T')[0]}
                      required
                    />
                  </div>
                </div>

                {/* Marks (conditional) */}
                {showMarks && (
                  <div className="space-y-2">
                    <Label>Marks (optional)</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        placeholder="Obtained"
                        value={marksObtained}
                        onChange={(e) => setMarksObtained(e.target.value)}
                      />
                      <span className="text-muted-foreground">/</span>
                      <Input
                        type="number"
                        min="1"
                        placeholder="Total"
                        value={marksTotal}
                        onChange={(e) => setMarksTotal(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={!examId || !categoryId || !description.trim() || !quantity || isSubmitting}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Log Study Session
                </Button>
              </form>
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
