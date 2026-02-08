import { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pencil } from 'lucide-react';
import { Category, TargetType, getDefaultUnit } from '@/types';

interface EditCategoryDialogProps {
  examId: string;
  category: Category;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditCategoryDialog({ examId, category, open, onOpenChange }: EditCategoryDialogProps) {
  const { updateCategory } = useApp();
  const [name, setName] = useState('');
  const [targetType, setTargetType] = useState<TargetType>('tasks');
  const [targetValue, setTargetValue] = useState('');
  const [unit, setUnit] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Pre-fill form with category data when dialog opens
  useEffect(() => {
    if (open && category) {
      setName(category.name);
      setTargetType(category.targetType);
      setTargetValue(category.targetValue.toString());
      setUnit(category.unit);
    }
  }, [open, category]);

  const handleTargetTypeChange = (type: TargetType) => {
    setTargetType(type);
    // Only update unit if it's still the default for the old type
    if (unit === getDefaultUnit(targetType)) {
      setUnit(getDefaultUnit(type));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !targetValue) return;

    setIsSubmitting(true);
    try {
      await updateCategory(examId, category.id, {
        name: name.trim(),
        targetType,
        targetValue: parseFloat(targetValue),
        unit: unit || getDefaultUnit(targetType),
      });
      onOpenChange(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-display">
            <Pencil className="w-5 h-5 text-primary" />
            Edit Category
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="edit-cat-name">Category Name</Label>
            <Input
              id="edit-cat-name"
              placeholder="e.g., Kanji, Grammar, Polity"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-target-type">Target Type</Label>
            <Select value={targetType} onValueChange={(v) => handleTargetTypeChange(v as TargetType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="time">Time (log in minutes)</SelectItem>
                <SelectItem value="tasks">Tasks (chapters/topics)</SelectItem>
                <SelectItem value="units">Units (pages/questions)</SelectItem>
                <SelectItem value="scores">Scores / Marks (tests)</SelectItem>
              </SelectContent>
            </Select>
            {targetType === 'time' && (
              <p className="text-xs text-muted-foreground">
                Target is set in hours. When logging, you'll enter minutes.
              </p>
            )}
            {targetType === 'scores' && (
              <p className="text-xs text-muted-foreground">
                Track test scores for this category. Enter marks when logging.
              </p>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-target-value">Target Value</Label>
              <Input
                id="edit-target-value"
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
              <Label htmlFor="edit-unit">Unit</Label>
              <Input
                id="edit-unit"
                placeholder={getDefaultUnit(targetType)}
                value={unit}
                onChange={(e) => setUnit(e.target.value)}
              />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <Button 
              type="button" 
              variant="outline" 
              className="flex-1" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
