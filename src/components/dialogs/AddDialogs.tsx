import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, BookOpen } from 'lucide-react';
import { TargetType, getDefaultUnit } from '@/types';

interface AddExamDialogProps {
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddExamDialog({ trigger, open, onOpenChange }: AddExamDialogProps) {
  const { addExam } = useApp();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const controlledOpen = open ?? isOpen;
  const setControlledOpen = onOpenChange ?? setIsOpen;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addExam(name.trim(), description.trim() || undefined, targetDate || undefined);
    setName('');
    setDescription('');
    setTargetDate('');
    setControlledOpen(false);
  };

  return (
    <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <BookOpen className="w-5 h-5 text-primary" />
            Add New Exam
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="exam-name">Exam Name</Label>
            <Input
              id="exam-name"
              placeholder="e.g., JLPT N3, UPSC Prelims, Math 101"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-desc">Description (optional)</Label>
            <Textarea
              id="exam-desc"
              placeholder="Brief description of your exam preparation"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="exam-date">Target Date (optional)</Label>
            <Input
              id="exam-date"
              type="date"
              value={targetDate}
              onChange={(e) => setTargetDate(e.target.value)}
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setControlledOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Exam
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface AddCategoryDialogProps {
  examId: string;
  trigger?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function AddCategoryDialog({ examId, trigger, open, onOpenChange }: AddCategoryDialogProps) {
  const { addCategory } = useApp();
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('tasks');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [isOpen, setIsOpen] = useState(false);

  const controlledOpen = open ?? isOpen;
  const setControlledOpen = onOpenChange ?? setIsOpen;

  const handleTargetTypeChange = (type: TargetType) => {
    setTargetType(type);
    setUnit(getDefaultUnit(type));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetValue) return;

    addCategory(examId, {
      name: name.trim(),
      targetType,
      targetValue: parseFloat(targetValue),
      unit: unit || getDefaultUnit(targetType),
    });
    
    setName('');
    setTargetType('tasks');
    setTargetValue('');
    setUnit('');
    setControlledOpen(false);
  };

  return (
    <Dialog open={controlledOpen} onOpenChange={setControlledOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Plus className="w-5 h-5 text-primary" />
            Add Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="cat-name">Category Name</Label>
            <Input
              id="cat-name"
              placeholder="e.g., Kanji, Grammar, Polity"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="target-type">Target Type</Label>
            <Select value={targetType} onValueChange={(v) => handleTargetTypeChange(v as TargetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time (hours)</SelectItem>
                <SelectItem value="tasks">Tasks (chapters/topics)</SelectItem>
                <SelectItem value="units">Units (pages/questions)</SelectItem>
                <SelectItem value="scores">Scores (marks)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="target-value">Target Value</Label>
              <Input
                id="target-value"
                type="number"
                min="1"
                step={targetType === 'time' ? '0.5' : '1'}
                placeholder="e.g., 50"
                value={targetValue}
                onChange={(e) => setTargetValue(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Input
                id="unit"
                placeholder={getDefaultUnit(targetType)}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setControlledOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Category
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
