-- Create exams table
CREATE TABLE public.exams (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  target_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create categories table
CREATE TABLE public.categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  target_type TEXT NOT NULL CHECK (target_type IN ('time', 'tasks', 'units', 'scores')),
  target_value NUMERIC NOT NULL DEFAULT 0 CHECK (target_value >= 0),
  completed_value NUMERIC NOT NULL DEFAULT 0 CHECK (completed_value >= 0),
  unit TEXT NOT NULL DEFAULT 'hours',
  color TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create study_entries table
CREATE TABLE public.study_entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL CHECK (quantity > 0),
  marks_obtained NUMERIC,
  marks_total NUMERIC,
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create daily_targets table
CREATE TABLE public.daily_targets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  exam_id UUID NOT NULL REFERENCES public.exams(id) ON DELETE CASCADE,
  category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  target_value NUMERIC NOT NULL CHECK (target_value >= 0),
  completed_value NUMERIC NOT NULL DEFAULT 0 CHECK (completed_value >= 0),
  date DATE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE (user_id, exam_id, category_id, date)
);

-- Enable Row Level Security on all tables
ALTER TABLE public.exams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.study_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_targets ENABLE ROW LEVEL SECURITY;

-- RLS Policies for exams table
CREATE POLICY "Users can view their own exams"
  ON public.exams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own exams"
  ON public.exams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own exams"
  ON public.exams FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own exams"
  ON public.exams FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for categories table
CREATE POLICY "Users can view their own categories"
  ON public.categories FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own categories"
  ON public.categories FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own categories"
  ON public.categories FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own categories"
  ON public.categories FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for study_entries table
CREATE POLICY "Users can view their own study entries"
  ON public.study_entries FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own study entries"
  ON public.study_entries FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own study entries"
  ON public.study_entries FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own study entries"
  ON public.study_entries FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for daily_targets table
CREATE POLICY "Users can view their own daily targets"
  ON public.daily_targets FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own daily targets"
  ON public.daily_targets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own daily targets"
  ON public.daily_targets FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own daily targets"
  ON public.daily_targets FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX idx_exams_user_id ON public.exams(user_id);
CREATE INDEX idx_categories_exam_id ON public.categories(exam_id);
CREATE INDEX idx_categories_user_id ON public.categories(user_id);
CREATE INDEX idx_study_entries_exam_id ON public.study_entries(exam_id);
CREATE INDEX idx_study_entries_category_id ON public.study_entries(category_id);
CREATE INDEX idx_study_entries_user_id ON public.study_entries(user_id);
CREATE INDEX idx_study_entries_date ON public.study_entries(date);
CREATE INDEX idx_daily_targets_user_id ON public.daily_targets(user_id);
CREATE INDEX idx_daily_targets_date ON public.daily_targets(date);