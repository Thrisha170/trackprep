import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './AuthContext';
import { Exam, Category, StudyEntry, DailyTarget, ProgressStats, calculateProgress, TargetType, getDefaultUnit } from '@/types';
import { 
  examSchema, 
  categorySchema, 
  studyEntrySchema, 
  dailyTargetSchema,
  examUpdateSchema,
  categoryUpdateSchema,
  validateInput,
  safeValidateInput 
} from '@/lib/validation-schemas';
interface AppContextType {
  // Data
  exams: Exam[];
  studyEntries: StudyEntry[];
  dailyTargets: DailyTarget[];
  loading: boolean;
  
  // Exam operations
  addExam: (name: string, description?: string, targetDate?: string) => Promise<Exam | null>;
  updateExam: (id: string, updates: Partial<Exam>) => Promise<void>;
  deleteExam: (id: string) => Promise<void>;
  
  // Category operations
  addCategory: (examId: string, category: Omit<Category, 'id' | 'examId' | 'completedValue'>) => Promise<void>;
  updateCategory: (examId: string, categoryId: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (examId: string, categoryId: string) => Promise<void>;
  
  // Study entry operations
  addStudyEntry: (entry: Omit<StudyEntry, 'id' | 'createdAt'>) => Promise<void>;
  deleteStudyEntry: (id: string) => Promise<void>;
  
  // Daily target operations
  setDailyTarget: (examId: string, categoryId: string, targetValue: number) => Promise<void>;
  getDailyTargets: (date?: string) => DailyTarget[];
  
  // Statistics
  getExamProgress: (examId: string) => number;
  getCategoryProgress: (examId: string, categoryId: string) => number;
  getOverallProgress: () => number;
  getTodayEntries: () => StudyEntry[];
  getStats: () => ProgressStats;
  
  // Theme
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  
  // Refresh data
  refreshData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys for theme only (data now in Supabase)
const THEME_STORAGE_KEY = 'trackprep_theme';

// Load theme from localStorage
const loadTheme = (): 'light' | 'dark' => {
  try {
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    return stored === 'dark' ? 'dark' : 'light';
  } catch {
    return 'light';
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [exams, setExams] = useState<Exam[]>([]);
  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>([]);
  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<'light' | 'dark'>(loadTheme);

  // Apply theme to document
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Fetch all data from Supabase
  const fetchData = useCallback(async () => {
    if (!user) {
      setExams([]);
      setStudyEntries([]);
      setDailyTargets([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      // Fetch exams with their categories
      const { data: examsData, error: examsError } = await supabase
        .from('exams')
        .select('*')
        .order('created_at', { ascending: false });

      if (examsError) throw examsError;

      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('created_at', { ascending: true });

      if (categoriesError) throw categoriesError;

      // Map categories to exams
      const examsWithCategories: Exam[] = (examsData || []).map(exam => ({
        id: exam.id,
        name: exam.name,
        description: exam.description || undefined,
        targetDate: exam.target_date || undefined,
        createdAt: exam.created_at,
        categories: (categoriesData || [])
          .filter(cat => cat.exam_id === exam.id)
          .map(cat => ({
            id: cat.id,
            examId: cat.exam_id,
            name: cat.name,
            targetType: cat.target_type as TargetType,
            targetValue: Number(cat.target_value),
            completedValue: Number(cat.completed_value),
            unit: cat.unit,
            color: cat.color || undefined,
          })),
      }));

      setExams(examsWithCategories);

      // Fetch study entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('study_entries')
        .select('*')
        .order('created_at', { ascending: false });

      if (entriesError) throw entriesError;

      const entries: StudyEntry[] = (entriesData || []).map(entry => ({
        id: entry.id,
        examId: entry.exam_id,
        categoryId: entry.category_id,
        description: entry.description,
        quantity: Number(entry.quantity),
        marks: entry.marks_obtained !== null && entry.marks_total !== null
          ? { obtained: Number(entry.marks_obtained), total: Number(entry.marks_total) }
          : undefined,
        date: entry.date,
        createdAt: entry.created_at,
      }));

      setStudyEntries(entries);

      // Fetch daily targets
      const { data: targetsData, error: targetsError } = await supabase
        .from('daily_targets')
        .select('*')
        .order('date', { ascending: false });

      if (targetsError) throw targetsError;

      const targets: DailyTarget[] = (targetsData || []).map(target => ({
        id: target.id,
        examId: target.exam_id,
        categoryId: target.category_id,
        targetValue: Number(target.target_value),
        completedValue: Number(target.completed_value),
        date: target.date,
      }));

      setDailyTargets(targets);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  // Refresh data function
  const refreshData = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  // Load data when user changes
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Exam operations
  const addExam = async (name: string, description?: string, targetDate?: string): Promise<Exam | null> => {
    if (!user) return null;

    // Validate input with Zod
    const validation = safeValidateInput(examSchema, { name, description, targetDate });
    if (!validation.success) {
      console.error('Exam validation failed:', validation.error);
      return null;
    }

    const validatedData = validation.data!;

    const { data, error } = await supabase
      .from('exams')
      .insert({
        user_id: user.id,
        name: validatedData.name,
        description: validatedData.description || null,
        target_date: validatedData.targetDate || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding exam:', error);
      return null;
    }

    const newExam: Exam = {
      id: data.id,
      name: data.name,
      description: data.description || undefined,
      targetDate: data.target_date || undefined,
      createdAt: data.created_at,
      categories: [],
    };

    setExams(prev => [newExam, ...prev]);
    return newExam;
  };

  const updateExam = async (id: string, updates: Partial<Exam>) => {
    if (!user) return;

    // Validate input with Zod
    const validation = safeValidateInput(examUpdateSchema, updates);
    if (!validation.success) {
      console.error('Exam update validation failed:', validation.error);
      return;
    }

    const validatedData = validation.data!;

    const { error } = await supabase
      .from('exams')
      .update({
        name: validatedData.name,
        description: validatedData.description || null,
        target_date: validatedData.targetDate || null,
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating exam:', error);
      return;
    }

    setExams(prev => prev.map(exam =>
      exam.id === id ? { ...exam, ...updates } : exam
    ));
  };

  const deleteExam = async (id: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('exams')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting exam:', error);
      return;
    }

    setExams(prev => prev.filter(exam => exam.id !== id));
    setStudyEntries(prev => prev.filter(entry => entry.examId !== id));
    setDailyTargets(prev => prev.filter(target => target.examId !== id));
  };

  // Category operations
  const addCategory = async (examId: string, category: Omit<Category, 'id' | 'examId' | 'completedValue'>) => {
    if (!user) return;

    // Validate input with Zod
    const validation = safeValidateInput(categorySchema, {
      name: category.name,
      targetType: category.targetType,
      targetValue: category.targetValue,
      unit: category.unit || getDefaultUnit(category.targetType),
      color: category.color,
    });
    if (!validation.success) {
      console.error('Category validation failed:', validation.error);
      return;
    }

    const validatedData = validation.data!;

    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: user.id,
        exam_id: examId,
        name: validatedData.name,
        target_type: validatedData.targetType,
        target_value: validatedData.targetValue,
        completed_value: 0,
        unit: validatedData.unit || getDefaultUnit(validatedData.targetType),
        color: validatedData.color || null,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding category:', error);
      return;
    }

    const newCategory: Category = {
      id: data.id,
      examId: data.exam_id,
      name: data.name,
      targetType: data.target_type as TargetType,
      targetValue: Number(data.target_value),
      completedValue: Number(data.completed_value),
      unit: data.unit,
      color: data.color || undefined,
    };

    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? { ...exam, categories: [...exam.categories, newCategory] }
        : exam
    ));
  };

  const updateCategory = async (examId: string, categoryId: string, updates: Partial<Category>) => {
    if (!user) return;

    // Validate input with Zod
    const validation = safeValidateInput(categoryUpdateSchema, updates);
    if (!validation.success) {
      console.error('Category update validation failed:', validation.error);
      return;
    }

    const validatedData = validation.data!;

    const { error } = await supabase
      .from('categories')
      .update({
        name: validatedData.name,
        target_type: validatedData.targetType,
        target_value: validatedData.targetValue,
        completed_value: validatedData.completedValue,
        unit: validatedData.unit,
        color: validatedData.color || null,
      })
      .eq('id', categoryId);

    if (error) {
      console.error('Error updating category:', error);
      return;
    }

    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? {
            ...exam,
            categories: exam.categories.map(cat =>
              cat.id === categoryId ? { ...cat, ...updates } : cat
            )
          }
        : exam
    ));
  };

  const deleteCategory = async (examId: string, categoryId: string) => {
    if (!user) return;

    const { error } = await supabase
      .from('categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      return;
    }

    setExams(prev => prev.map(exam =>
      exam.id === examId
        ? { ...exam, categories: exam.categories.filter(cat => cat.id !== categoryId) }
        : exam
    ));
    setStudyEntries(prev => prev.filter(entry => entry.categoryId !== categoryId));
    setDailyTargets(prev => prev.filter(target => target.categoryId !== categoryId));
  };

  // Study entry operations
  const addStudyEntry = async (entry: Omit<StudyEntry, 'id' | 'createdAt'>) => {
    if (!user) return;

    // Validate input with Zod
    const validation = safeValidateInput(studyEntrySchema, entry);
    if (!validation.success) {
      console.error('Study entry validation failed:', validation.error);
      return;
    }

    const validatedData = validation.data!;

    const { data, error } = await supabase
      .from('study_entries')
      .insert({
        user_id: user.id,
        exam_id: validatedData.examId,
        category_id: validatedData.categoryId,
        description: validatedData.description,
        quantity: validatedData.quantity,
        marks_obtained: validatedData.marks?.obtained || null,
        marks_total: validatedData.marks?.total || null,
        date: validatedData.date,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding study entry:', error);
      return;
    }

    const newEntry: StudyEntry = {
      id: data.id,
      examId: data.exam_id,
      categoryId: data.category_id,
      description: data.description,
      quantity: Number(data.quantity),
      marks: data.marks_obtained !== null && data.marks_total !== null
        ? { obtained: Number(data.marks_obtained), total: Number(data.marks_total) }
        : undefined,
      date: data.date,
      createdAt: data.created_at,
    };

    setStudyEntries(prev => [newEntry, ...prev]);

    // Update category progress
    const category = exams.flatMap(e => e.categories).find(c => c.id === entry.categoryId);
    if (category) {
      const newCompletedValue = category.completedValue + entry.quantity;
      await supabase
        .from('categories')
        .update({ completed_value: newCompletedValue })
        .eq('id', entry.categoryId);

      setExams(prev => prev.map(exam => {
        if (exam.id === entry.examId) {
          return {
            ...exam,
            categories: exam.categories.map(cat => {
              if (cat.id === entry.categoryId) {
                return { ...cat, completedValue: newCompletedValue };
              }
              return cat;
            })
          };
        }
        return exam;
      }));
    }

    // Update daily target progress
    const today = new Date().toISOString().split('T')[0];
    if (entry.date === today) {
      const existingTarget = dailyTargets.find(
        t => t.examId === entry.examId && t.categoryId === entry.categoryId && t.date === today
      );
      if (existingTarget) {
        const newCompletedValue = existingTarget.completedValue + entry.quantity;
        await supabase
          .from('daily_targets')
          .update({ completed_value: newCompletedValue })
          .eq('id', existingTarget.id);

        setDailyTargets(prev => prev.map(t =>
          t.id === existingTarget.id
            ? { ...t, completedValue: newCompletedValue }
            : t
        ));
      }
    }
  };

  const deleteStudyEntry = async (id: string) => {
    if (!user) return;

    const entry = studyEntries.find(e => e.id === id);
    if (!entry) return;

    const { error } = await supabase
      .from('study_entries')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting study entry:', error);
      return;
    }

    // Subtract from category progress
    const category = exams.flatMap(e => e.categories).find(c => c.id === entry.categoryId);
    if (category) {
      const newCompletedValue = Math.max(0, category.completedValue - entry.quantity);
      await supabase
        .from('categories')
        .update({ completed_value: newCompletedValue })
        .eq('id', entry.categoryId);

      setExams(prev => prev.map(exam => {
        if (exam.id === entry.examId) {
          return {
            ...exam,
            categories: exam.categories.map(cat => {
              if (cat.id === entry.categoryId) {
                return { ...cat, completedValue: newCompletedValue };
              }
              return cat;
            })
          };
        }
        return exam;
      }));
    }

    setStudyEntries(prev => prev.filter(e => e.id !== id));
  };

  // Daily target operations
  const setDailyTarget = async (examId: string, categoryId: string, targetValue: number) => {
    if (!user) return;

    // Validate input with Zod
    const validation = safeValidateInput(dailyTargetSchema, { examId, categoryId, targetValue });
    if (!validation.success) {
      console.error('Daily target validation failed:', validation.error);
      return;
    }

    const validatedData = validation.data!;

    const today = new Date().toISOString().split('T')[0];
    const existingTarget = dailyTargets.find(
      t => t.examId === validatedData.examId && t.categoryId === validatedData.categoryId && t.date === today
    );

    if (existingTarget) {
      const { error } = await supabase
        .from('daily_targets')
        .update({ target_value: validatedData.targetValue })
        .eq('id', existingTarget.id);

      if (error) {
        console.error('Error updating daily target:', error);
        return;
      }

      setDailyTargets(prev => prev.map(t =>
        t.id === existingTarget.id ? { ...t, targetValue: validatedData.targetValue } : t
      ));
    } else {
      const { data, error } = await supabase
        .from('daily_targets')
        .insert({
          user_id: user.id,
          exam_id: validatedData.examId,
          category_id: validatedData.categoryId,
          target_value: validatedData.targetValue,
          completed_value: 0,
          date: today,
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating daily target:', error);
        return;
      }

      const newTarget: DailyTarget = {
        id: data.id,
        examId: data.exam_id,
        categoryId: data.category_id,
        targetValue: Number(data.target_value),
        completedValue: Number(data.completed_value),
        date: data.date,
      };

      setDailyTargets(prev => [...prev, newTarget]);
    }
  };

  const getDailyTargets = (date?: string): DailyTarget[] => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return dailyTargets.filter(t => t.date === targetDate);
  };

  // Statistics (these remain as local calculations)
  const getExamProgress = (examId: string): number => {
    const exam = exams.find(e => e.id === examId);
    if (!exam || exam.categories.length === 0) return 0;

    const totalProgress = exam.categories.reduce((sum, cat) => {
      return sum + calculateProgress(cat.completedValue, cat.targetValue);
    }, 0);

    return Math.round(totalProgress / exam.categories.length);
  };

  const getCategoryProgress = (examId: string, categoryId: string): number => {
    const exam = exams.find(e => e.id === examId);
    if (!exam) return 0;

    const category = exam.categories.find(c => c.id === categoryId);
    if (!category) return 0;

    return calculateProgress(category.completedValue, category.targetValue);
  };

  const getOverallProgress = (): number => {
    if (exams.length === 0) return 0;

    const totalProgress = exams.reduce((sum, exam) => {
      return sum + getExamProgress(exam.id);
    }, 0);

    return Math.round(totalProgress / exams.length);
  };

  const getTodayEntries = (): StudyEntry[] => {
    const today = new Date().toISOString().split('T')[0];
    return studyEntries.filter(entry => entry.date === today);
  };

  const getStats = (): ProgressStats => {
    const todayEntries = getTodayEntries();

    return {
      totalExams: exams.length,
      totalCategories: exams.reduce((sum, exam) => sum + exam.categories.length, 0),
      totalEntries: studyEntries.length,
      overallProgress: getOverallProgress(),
      todayProgress: todayEntries.length,
      streak: 0, // TODO: Calculate study streak
    };
  };

  return (
    <AppContext.Provider value={{
      exams,
      studyEntries,
      dailyTargets,
      loading,
      addExam,
      updateExam,
      deleteExam,
      addCategory,
      updateCategory,
      deleteCategory,
      addStudyEntry,
      deleteStudyEntry,
      setDailyTarget,
      getDailyTargets,
      getExamProgress,
      getCategoryProgress,
      getOverallProgress,
      getTodayEntries,
      getStats,
      theme,
      toggleTheme,
      refreshData,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
