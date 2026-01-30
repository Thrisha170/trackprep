// Core types for TrackPrep study tracking application

export type TargetType = 'time' | 'tasks' | 'units' | 'scores';

export interface Exam {
  id: string;
  name: string;
  description?: string;
  targetDate?: string;
  createdAt: string;
  categories: Category[];
}

export interface Category {
  id: string;
  examId: string;
  name: string;
  targetType: TargetType;
  targetValue: number;
  completedValue: number;
  unit: string; // e.g., "hours", "chapters", "pages", "marks"
  color?: string;
}

export interface StudyEntry {
  id: string;
  examId: string;
  categoryId: string;
  description: string;
  quantity: number;
  marks?: { obtained: number; total: number };
  date: string;
  createdAt: string;
}

export interface DailyTarget {
  id: string;
  examId: string;
  categoryId: string;
  targetValue: number;
  completedValue: number;
  date: string;
}

export interface ProgressStats {
  totalExams: number;
  totalCategories: number;
  totalEntries: number;
  overallProgress: number;
  todayProgress: number;
  streak: number;
}

// Helper functions for target type labels
export const getTargetTypeLabel = (type: TargetType): string => {
  switch (type) {
    case 'time': return 'Time';
    case 'tasks': return 'Tasks';
    case 'units': return 'Units';
    case 'scores': return 'Scores';
  }
};

export const getDefaultUnit = (type: TargetType): string => {
  switch (type) {
    case 'time': return 'hours';
    case 'tasks': return 'chapters';
    case 'units': return 'pages';
    case 'scores': return 'marks';
  }
};

// Calculate progress percentage
export const calculateProgress = (completed: number, target: number): number => {
  if (target === 0) return 0;
  return Math.min(Math.round((completed / target) * 100), 100);
};

// Format time display
export const formatTime = (hours: number): string => {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (h === 0) return `${m}m`;
  if (m === 0) return `${h}h`;
  return `${h}h ${m}m`;
};
