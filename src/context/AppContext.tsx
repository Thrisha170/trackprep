import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Exam, Category, StudyEntry, DailyTarget, ProgressStats, calculateProgress } from '@/types';

// Simple ID generator (no external dependency needed)
const generateId = (): string => {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
};

interface AppContextType {
  // Data
  exams: Exam[];
  studyEntries: StudyEntry[];
  dailyTargets: DailyTarget[];
  
  // Exam operations
  addExam: (name: string, description?: string, targetDate?: string) => Exam;
  updateExam: (id: string, updates: Partial<Exam>) => void;
  deleteExam: (id: string) => void;
  
  // Category operations
  addCategory: (examId: string, category: Omit<Category, 'id' | 'examId' | 'completedValue'>) => void;
  updateCategory: (examId: string, categoryId: string, updates: Partial<Category>) => void;
  deleteCategory: (examId: string, categoryId: string) => void;
  
  // Study entry operations
  addStudyEntry: (entry: Omit<StudyEntry, 'id' | 'createdAt'>) => void;
  deleteStudyEntry: (id: string) => void;
  
  // Daily target operations
  setDailyTarget: (examId: string, categoryId: string, targetValue: number) => void;
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
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Storage keys
const STORAGE_KEYS = {
  exams: 'trackprep_exams',
  entries: 'trackprep_entries',
  dailyTargets: 'trackprep_daily_targets',
  theme: 'trackprep_theme',
};

// Load from localStorage
const loadFromStorage = <T,>(key: string, defaultValue: T): T => {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : defaultValue;
  } catch {
    return defaultValue;
  }
};

// Save to localStorage
const saveToStorage = <T,>(key: string, value: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed to save to storage:', e);
  }
};

export function AppProvider({ children }: { children: ReactNode }) {
  const [exams, setExams] = useState<Exam[]>(() => loadFromStorage(STORAGE_KEYS.exams, []));
  const [studyEntries, setStudyEntries] = useState<StudyEntry[]>(() => loadFromStorage(STORAGE_KEYS.entries, []));
  const [dailyTargets, setDailyTargets] = useState<DailyTarget[]>(() => loadFromStorage(STORAGE_KEYS.dailyTargets, []));
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadFromStorage(STORAGE_KEYS.theme, 'light'));

  // Persist data to localStorage
  useEffect(() => {
    saveToStorage(STORAGE_KEYS.exams, exams);
  }, [exams]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.entries, studyEntries);
  }, [studyEntries]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.dailyTargets, dailyTargets);
  }, [dailyTargets]);

  useEffect(() => {
    saveToStorage(STORAGE_KEYS.theme, theme);
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);

  // Initialize theme on mount
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  // Exam operations
  const addExam = (name: string, description?: string, targetDate?: string): Exam => {
    const newExam: Exam = {
      id: generateId(),
      name,
      description,
      targetDate,
      createdAt: new Date().toISOString(),
      categories: [],
    };
    setExams(prev => [...prev, newExam]);
    return newExam;
  };

  const updateExam = (id: string, updates: Partial<Exam>) => {
    setExams(prev => prev.map(exam => 
      exam.id === id ? { ...exam, ...updates } : exam
    ));
  };

  const deleteExam = (id: string) => {
    setExams(prev => prev.filter(exam => exam.id !== id));
    setStudyEntries(prev => prev.filter(entry => entry.examId !== id));
    setDailyTargets(prev => prev.filter(target => target.examId !== id));
  };

  // Category operations
  const addCategory = (examId: string, category: Omit<Category, 'id' | 'examId' | 'completedValue'>) => {
    const newCategory: Category = {
      ...category,
      id: generateId(),
      examId,
      completedValue: 0,
    };
    setExams(prev => prev.map(exam => 
      exam.id === examId 
        ? { ...exam, categories: [...exam.categories, newCategory] }
        : exam
    ));
  };

  const updateCategory = (examId: string, categoryId: string, updates: Partial<Category>) => {
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

  const deleteCategory = (examId: string, categoryId: string) => {
    setExams(prev => prev.map(exam => 
      exam.id === examId 
        ? { ...exam, categories: exam.categories.filter(cat => cat.id !== categoryId) }
        : exam
    ));
    setStudyEntries(prev => prev.filter(entry => entry.categoryId !== categoryId));
    setDailyTargets(prev => prev.filter(target => target.categoryId !== categoryId));
  };

  // Study entry operations
  const addStudyEntry = (entry: Omit<StudyEntry, 'id' | 'createdAt'>) => {
    const newEntry: StudyEntry = {
      ...entry,
      id: generateId(),
      createdAt: new Date().toISOString(),
    };
    
    setStudyEntries(prev => [...prev, newEntry]);
    
    // Update category progress
    setExams(prev => prev.map(exam => {
      if (exam.id === entry.examId) {
        return {
          ...exam,
          categories: exam.categories.map(cat => {
            if (cat.id === entry.categoryId) {
              return { ...cat, completedValue: cat.completedValue + entry.quantity };
            }
            return cat;
          })
        };
      }
      return exam;
    }));

    // Update daily target progress
    const today = new Date().toISOString().split('T')[0];
    if (entry.date === today) {
      setDailyTargets(prev => {
        const existingTarget = prev.find(
          t => t.examId === entry.examId && t.categoryId === entry.categoryId && t.date === today
        );
        if (existingTarget) {
          return prev.map(t => 
            t.id === existingTarget.id 
              ? { ...t, completedValue: t.completedValue + entry.quantity }
              : t
          );
        }
        return prev;
      });
    }
  };

  const deleteStudyEntry = (id: string) => {
    const entry = studyEntries.find(e => e.id === id);
    if (!entry) return;

    // Subtract from category progress
    setExams(prev => prev.map(exam => {
      if (exam.id === entry.examId) {
        return {
          ...exam,
          categories: exam.categories.map(cat => {
            if (cat.id === entry.categoryId) {
              return { ...cat, completedValue: Math.max(0, cat.completedValue - entry.quantity) };
            }
            return cat;
          })
        };
      }
      return exam;
    }));

    setStudyEntries(prev => prev.filter(e => e.id !== id));
  };

  // Daily target operations
  const setDailyTarget = (examId: string, categoryId: string, targetValue: number) => {
    const today = new Date().toISOString().split('T')[0];
    
    setDailyTargets(prev => {
      const existingIndex = prev.findIndex(
        t => t.examId === examId && t.categoryId === categoryId && t.date === today
      );
      
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = { ...updated[existingIndex], targetValue };
        return updated;
      }
      
      return [...prev, {
        id: generateId(),
        examId,
        categoryId,
        targetValue,
        completedValue: 0,
        date: today,
      }];
    });
  };

  const getDailyTargets = (date?: string): DailyTarget[] => {
    const targetDate = date || new Date().toISOString().split('T')[0];
    return dailyTargets.filter(t => t.date === targetDate);
  };

  // Statistics
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
