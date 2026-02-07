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
import { PenLine, Check, BookOpen, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatTime } from '@/types';

export default function LogStudy() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { exams, addStudyEntry } = useApp();

  const [examId, setExamId] = useState(searchParams.get('exam') || '');
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '');
  const [description, setDescription] = useState('');
  const [quantity, setQuantity] = useState('');
  const [timeMinutes, setTimeMinutes] = useState('');
  const [marksObtained, setMarksObtained] = useState('');
  const [marksTotal, setMarksTotal] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedExam = exams.find(e => e.id === examId);
  const selectedCategory = selectedExam?.categories.find(c => c.id === categoryId);
  const showMarks = selectedCategory?.targetType === 'scores';
  const isTimeCategory = selectedCategory?.targetType === 'time';

  // Reset category when exam changes
  useEffect(() => {
    if (!selectedExam?.categories.find(c => c.id === categoryId)) {
      setCategoryId('');
    }
  }, [examId, selectedExam, categoryId]);

  // Convert minutes to hours for storage (internal representation)
  const getQuantityValue = (): number => {
    if (isTimeCategory) {
      const minutes = parseInt(timeMinutes, 10);
      if (isNaN(minutes) || minutes < 1) return 0;
      // Store as fractional hours (e.g., 90 minutes = 1.5 hours)
      return parseFloat((minutes / 60).toFixed(4));
    }
    return parseInt(quantity, 10);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isTimeCategory) {
      const minutes = parseInt(timeMinutes, 10);
      if (!examId || !categoryId || !description.trim() || !timeMinutes || isNaN(minutes) || minutes < 1) {
        if (timeMinutes && (isNaN(minutes) || minutes < 1)) {
          toast.error('Please enter at least 1 minute');
        }
        return;
      }
    } else {
      const quantityInt = parseInt(quantity, 10);
      if (!examId || !categoryId || !description.trim() || !quantity || isNaN(quantityInt) || quantityInt < 1) {
        if (quantity && (isNaN(quantityInt) || quantityInt < 1)) {
          toast.error('Please enter a whole number greater than 0');
        }
        return;
      }
    }

    setIsSubmitting(true);
    const quantityValue = getQuantityValue();

    addStudyEntry({
      examId,
      categoryId,
      description: description.trim(),
      quantity: quantityValue,
      date,
      marks: showMarks && marksObtained && marksTotal 
        ? { obtained: parseInt(marksObtained, 10), total: parseInt(marksTotal, 10) }
        : undefined,
    });

    const displayValue = isTimeCategory 
      ? formatTime(quantityValue)
      : `${quantity} ${selectedCategory?.unit}`;

    toast.success('Study session logged!', {
      description: `Added ${displayValue} to ${selectedCategory?.name}`,
    });

    // Reset form
    setDescription('');
    setQuantity('');
    setTimeMinutes('');
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
      <div className="p-4 lg:p-8 max-w-2xl mx-auto space-y-6 pb-32 lg:pb-8">
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
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-2 font-display">
                <PenLine className="w-5 h-5 text-primary" />
                New Study Entry
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
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

                {/* Quantity / Time Input */}
                <div className="grid grid-cols-2 gap-3">
                  {isTimeCategory ? (
                    <div className="space-y-2">
                      <Label htmlFor="time-minutes" className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5" />
                        Time (minutes)
                      </Label>
                      <Input
                        id="time-minutes"
                        type="number"
                        min="1"
                        step="1"
                        placeholder="e.g., 45"
                        value={timeMinutes}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setTimeMinutes(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter time in minutes (e.g., 30, 60, 90)
                      </p>
                    </div>
                  ) : (
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
                          if (value === '' || /^\d+$/.test(value)) {
                            setQuantity(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                        required
                      />
                    </div>
                  )}
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

                {/* Marks (conditional for scores category) */}
                {showMarks && (
                  <div className="space-y-2">
                    <Label>Marks / Score</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min="0"
                        step="1"
                        placeholder="Obtained"
                        value={marksObtained}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setMarksObtained(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                      />
                      <span className="text-muted-foreground font-medium">/</span>
                      <Input
                        type="number"
                        min="1"
                        step="1"
                        placeholder="Total"
                        value={marksTotal}
                        onChange={(e) => {
                          const value = e.target.value;
                          if (value === '' || /^\d+$/.test(value)) {
                            setMarksTotal(value);
                          }
                        }}
                        onKeyDown={(e) => {
                          if (e.key === '.' || e.key === ',' || e.key === '-' || e.key === 'e') {
                            e.preventDefault();
                          }
                        }}
                      />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Enter marks obtained out of total (e.g., 45 / 50)
                    </p>
                  </div>
                )}

                {/* Submit */}
                <Button 
                  type="submit" 
                  className="w-full" 
                  size="lg"
                  disabled={
                    !examId || 
                    !categoryId || 
                    !description.trim() || 
                    (isTimeCategory ? !timeMinutes : !quantity) || 
                    isSubmitting
                  }
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