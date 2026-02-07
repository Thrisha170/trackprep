import { z } from 'zod';
import { TargetType } from '@/types';

/**
 * Validation schemas for all user inputs in the TrackPrep application.
 * Using Zod for comprehensive input validation to prevent injection attacks
 * and ensure data integrity.
 */

// Common validation patterns
const trimmedString = z.string().trim();
const nonEmptyTrimmedString = trimmedString.min(1, 'This field is required');

// Exam validation schema
export const examSchema = z.object({
  name: nonEmptyTrimmedString
    .max(200, 'Exam name must be 200 characters or less'),
  description: trimmedString
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .transform(val => val === '' ? undefined : val),
  targetDate: z.string()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), 'Invalid date format')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

export type ExamInput = z.infer<typeof examSchema>;

// Target type enum schema
const targetTypeSchema = z.enum(['time', 'tasks', 'units', 'scores'] as const);

// Category validation schema
export const categorySchema = z.object({
  name: nonEmptyTrimmedString
    .max(100, 'Category name must be 100 characters or less'),
  targetType: targetTypeSchema,
  targetValue: z.number()
    .min(0, 'Target value must be 0 or greater')
    .max(1000000, 'Target value is too large'),
  unit: trimmedString
    .max(50, 'Unit must be 50 characters or less')
    .optional()
    .transform(val => val === '' ? undefined : val),
  color: z.string()
    .max(50, 'Color value is too long')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

export type CategoryInput = z.infer<typeof categorySchema>;

// Study entry validation schema
export const studyEntrySchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  categoryId: z.string().uuid('Invalid category ID'),
  description: nonEmptyTrimmedString
    .max(500, 'Description must be 500 characters or less'),
  quantity: z.number()
    .int('Quantity must be a whole number')
    .min(1, 'Quantity must be at least 1')
    .max(10000, 'Quantity is too large'),
  date: z.string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format'),
  marks: z.object({
    obtained: z.number().min(0, 'Marks obtained must be 0 or greater').max(100000, 'Marks value is too large'),
    total: z.number().min(1, 'Total marks must be at least 1').max(100000, 'Marks value is too large'),
  }).optional().refine(
    marks => !marks || marks.obtained <= marks.total,
    'Obtained marks cannot exceed total marks'
  ),
});

export type StudyEntryInput = z.infer<typeof studyEntrySchema>;

// Daily target validation schema
export const dailyTargetSchema = z.object({
  examId: z.string().uuid('Invalid exam ID'),
  categoryId: z.string().uuid('Invalid category ID'),
  targetValue: z.number()
    .min(0, 'Target value must be 0 or greater')
    .max(10000, 'Target value is too large'),
});

export type DailyTargetInput = z.infer<typeof dailyTargetSchema>;

// Exam update schema (all fields optional except what's being updated)
export const examUpdateSchema = z.object({
  name: nonEmptyTrimmedString
    .max(200, 'Exam name must be 200 characters or less')
    .optional(),
  description: trimmedString
    .max(1000, 'Description must be 1000 characters or less')
    .optional()
    .transform(val => val === '' ? undefined : val),
  targetDate: z.string()
    .refine(val => !val || /^\d{4}-\d{2}-\d{2}$/.test(val), 'Invalid date format')
    .optional()
    .transform(val => val === '' ? undefined : val),
});

export type ExamUpdateInput = z.infer<typeof examUpdateSchema>;

// Category update schema
export const categoryUpdateSchema = z.object({
  name: nonEmptyTrimmedString
    .max(100, 'Category name must be 100 characters or less')
    .optional(),
  targetType: targetTypeSchema.optional(),
  targetValue: z.number()
    .min(0, 'Target value must be 0 or greater')
    .max(1000000, 'Target value is too large')
    .optional(),
  completedValue: z.number()
    .min(0, 'Completed value must be 0 or greater')
    .optional(),
  unit: trimmedString
    .max(50, 'Unit must be 50 characters or less')
    .optional(),
  color: z.string()
    .max(50, 'Color value is too long')
    .optional()
    .nullable(),
});

export type CategoryUpdateInput = z.infer<typeof categoryUpdateSchema>;

/**
 * Validates input against a schema and returns the validated data or throws an error
 */
export function validateInput<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    throw new Error(`Validation failed: ${errors}`);
  }
  return result.data;
}

/**
 * Validates input and returns result object with success/error status
 */
export function safeValidateInput<T>(schema: z.ZodSchema<T>, data: unknown): {
  success: boolean;
  data?: T;
  error?: string;
} {
  const result = schema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => e.message).join(', ');
    return { success: false, error: errors };
  }
  return { success: true, data: result.data };
}
