import { z } from 'zod';
import { 
  LEAD_STATUSES, 
  LEAD_PRIORITIES, 
  ACTIVITY_TYPES, 
  COMPANY_SIZES 
} from '@/types/leadgen';

// Common validation patterns
const uuidSchema = z.string().uuid('Invalid UUID format');
const emailSchema = z.string().email('Invalid email format').max(255, 'Email too long');
const phoneSchema = z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number format').optional();
const nonEmptyString = z.string().min(1, 'This field is required').max(1000, 'Text too long');
const optionalString = z.string().max(1000, 'Text too long').optional();
const positiveNumber = z.number().positive('Must be a positive number');
const nonNegativeNumber = z.number().min(0, 'Must be zero or positive');
const decimalString = z.string().regex(/^\d+(\.\d{1,2})?$/, 'Invalid decimal format');
const dateString = z.string().datetime('Invalid date format').optional();

// ===== TRANSACTION SCHEMAS =====
export const transactionTypeSchema = z.enum(['income', 'expense'], {
  message: 'Type must be either income or expense'
});

export const transactionSourceSchema = z.enum(['manual', 'ai_agent', 'import', 'recurring_payment'], {
  message: 'Invalid transaction source'
});

export const createTransactionSchema = z.object({
  type: transactionTypeSchema,
  category: nonEmptyString,
  description: nonEmptyString,
  amount: decimalString,
  customer_id: uuidSchema.optional(),
  interaction_id: uuidSchema.optional(),
});

export const updateTransactionSchema = z.object({
  id: uuidSchema,
  type: transactionTypeSchema.optional(),
  category: optionalString,
  description: optionalString,
  amount: decimalString.optional(),
  customer_id: uuidSchema.optional(),
  interaction_id: uuidSchema.optional(),
});

// ===== CUSTOMER SCHEMAS =====
export const customerStatusSchema = z.enum(['active', 'inactive', 'prospect', 'qualified'], {
  message: 'Invalid customer status'
});

export const createCustomerSchema = z.object({
  full_name: nonEmptyString,
  email: emailSchema,
  phone: phoneSchema,
  business: optionalString,
  status: customerStatusSchema,
});

export const updateCustomerSchema = z.object({
  id: uuidSchema,
  full_name: optionalString,
  email: emailSchema.optional(),
  phone: phoneSchema,
  business: optionalString,
  status: customerStatusSchema.optional(),
});

// ===== LEAD SCHEMAS =====
export const leadStatusSchema = z.enum(LEAD_STATUSES, {
  message: 'Invalid lead status'
});

export const leadPrioritySchema = z.enum(LEAD_PRIORITIES, {
  message: 'Invalid lead priority'
});

export const leadSourceSchema = z.enum(['manual', 'ai_agent'], {
  message: 'Lead source must be manual or ai_agent'
});

export const companySizeSchema = z.enum(COMPANY_SIZES, {
  message: 'Invalid company size'
});

export const createLeadSchema = z.object({
  first_name: nonEmptyString,
  last_name: nonEmptyString,
  email: emailSchema.optional(),
  phone: phoneSchema,
  company: optionalString,
  job_title: optionalString,
  source: leadSourceSchema,
  status: leadStatusSchema.optional(),
  priority: leadPrioritySchema.optional(),
  ai_agent_batch_id: uuidSchema.optional(),
  ai_confidence_score: z.number().min(0).max(100).optional(),
  ai_generated_notes: optionalString,
  score: nonNegativeNumber.optional(),
  is_qualified: z.boolean().optional(),
  qualified_at: dateString,
  address: optionalString,
  city: optionalString,
  state: optionalString,
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code format').optional(),
  country: z.string().length(2, 'Country must be 2-letter code').optional(),
  estimated_value: positiveNumber.optional(),
  expected_close_date: dateString,
  industry: optionalString,
  company_size: companySizeSchema.optional(),
  notes: optionalString,
  tags: z.array(z.string()).optional(),
});

export const updateLeadSchema = createLeadSchema.partial().extend({
  id: uuidSchema,
});

// ===== ACTIVITY SCHEMAS =====
export const activityTypeSchema = z.enum(ACTIVITY_TYPES, {
  message: 'Invalid activity type'
});

export const createActivitySchema = z.object({
  lead_id: uuidSchema,
  activity_type: activityTypeSchema,
  subject: nonEmptyString,
  description: optionalString,
  outcome: optionalString,
  scheduled_at: dateString,
  completed_at: dateString,
  is_completed: z.boolean().optional(),
  follow_up_date: dateString,
  follow_up_notes: optionalString,
});

// ===== RECURRING PAYMENT SCHEMAS =====
export const recurringFrequencySchema = z.enum(['daily', 'weekly', 'monthly', 'quarterly', 'yearly'], {
  message: 'Invalid frequency'
});

export const createRecurringPaymentSchema = z.object({
  type: transactionTypeSchema,
  category: nonEmptyString,
  description: nonEmptyString,
  amount: decimalString,
  frequency: recurringFrequencySchema,
  start_date: z.string().datetime('Invalid start date'),
  end_date: z.string().datetime('Invalid end date').optional(),
  day_of_month: z.number().min(1).max(31).optional(),
  day_of_week: z.number().min(0).max(6).optional(),
  customer_id: uuidSchema.optional(),
  interaction_id: uuidSchema.optional(),
  payment_limit: positiveNumber.optional(),
});

export const updateRecurringPaymentSchema = createRecurringPaymentSchema.partial().extend({
  id: uuidSchema,
});

// ===== INVENTORY SCHEMAS =====
export const inventoryStatusSchema = z.enum(['in_stock', 'low_stock', 'out_of_stock', 'discontinued'], {
  message: 'Invalid inventory status'
});

export const createInventoryItemSchema = z.object({
  name: nonEmptyString,
  description: optionalString,
  sku: z.string().min(1, 'SKU is required').max(50, 'SKU too long'),
  category: nonEmptyString,
  quantity: nonNegativeNumber,
  unit_price: decimalString,
  reorder_point: nonNegativeNumber.optional(),
  status: inventoryStatusSchema,
  location: optionalString,
});

export const updateInventoryItemSchema = createInventoryItemSchema.partial().extend({
  id: uuidSchema,
});

// ===== MILEAGE SCHEMAS =====
export const createMileageEntrySchema = z.object({
  date: z.string().datetime('Invalid date'),
  start_location: nonEmptyString,
  end_location: nonEmptyString,
  distance: positiveNumber,
  purpose: nonEmptyString,
  vehicle: optionalString,
  rate_per_mile: decimalString.optional(),
});

export const updateMileageEntrySchema = createMileageEntrySchema.partial().extend({
  id: uuidSchema,
});

// ===== INTERACTION SCHEMAS =====
export const interactionTypeSchema = z.enum(['call', 'email', 'meeting', 'service', 'support'], {
  message: 'Invalid interaction type'
});

export const interactionOutcomeSchema = z.enum(['successful', 'follow_up_needed', 'resolved', 'escalated'], {
  message: 'Invalid interaction outcome'
});

export const createInteractionSchema = z.object({
  customer_id: uuidSchema,
  type: interactionTypeSchema,
  title: nonEmptyString,
  description: optionalString,
  outcome: interactionOutcomeSchema.optional(),
  follow_up_date: dateString,
  priority: leadPrioritySchema.optional(),
});

export const updateInteractionSchema = createInteractionSchema.partial().extend({
  id: uuidSchema,
});

// ===== GIS PROPERTY SCHEMAS =====
export const createGISPropertySchema = z.object({
  parcel_id: nonEmptyString,
  address: nonEmptyString,
  city: nonEmptyString,
  state: z.string().length(2, 'State must be 2 characters'),
  zip_code: z.string().regex(/^\d{5}(-\d{4})?$/, 'Invalid ZIP code'),
  owner_name: optionalString,
  owner_address: optionalString,
  assessed_value: positiveNumber.optional(),
  market_value: positiveNumber.optional(),
  property_type: optionalString,
  acreage: positiveNumber.optional(),
  year_built: z.number().min(1800).max(new Date().getFullYear()).optional(),
});

// ===== EXPORT SCHEMAS =====
export const exportFormatSchema = z.enum(['csv', 'excel', 'pdf'], {
  message: 'Export format must be csv, excel, or pdf'
});

export const exportFilterSchema = z.object({
  start_date: dateString,
  end_date: dateString,
  categories: z.array(z.string()).optional(),
  types: z.array(transactionTypeSchema).optional(),
  format: exportFormatSchema,
});

// ===== PAGINATION SCHEMAS =====
export const paginationSchema = z.object({
  page: z.number().min(1, 'Page must be at least 1').optional(),
  limit: z.number().min(1).max(100, 'Limit must be between 1 and 100').optional(),
  sort_by: z.string().optional(),
  sort_order: z.enum(['asc', 'desc']).optional(),
});

// ===== SEARCH SCHEMAS =====
export const searchSchema = z.object({
  query: z.string().min(1, 'Search query is required').max(255, 'Query too long'),
  filters: z.record(z.string(), z.unknown()).optional(),
  ...paginationSchema.shape,
});

// ===== ID VALIDATION SCHEMAS =====
export const idSchema = z.object({
  id: uuidSchema,
});

export const multipleIdsSchema = z.object({
  ids: z.array(uuidSchema).min(1, 'At least one ID is required'),
});

// Type exports for use in service functions
export type CreateTransactionInput = z.infer<typeof createTransactionSchema>;
export type UpdateTransactionInput = z.infer<typeof updateTransactionSchema>;
export type CreateCustomerInput = z.infer<typeof createCustomerSchema>;
export type UpdateCustomerInput = z.infer<typeof updateCustomerSchema>;
export type CreateLeadInput = z.infer<typeof createLeadSchema>;
export type UpdateLeadInput = z.infer<typeof updateLeadSchema>;
export type CreateActivityInput = z.infer<typeof createActivitySchema>;
export type CreateRecurringPaymentInput = z.infer<typeof createRecurringPaymentSchema>;
export type UpdateRecurringPaymentInput = z.infer<typeof updateRecurringPaymentSchema>;
export type CreateInventoryItemInput = z.infer<typeof createInventoryItemSchema>;
export type UpdateInventoryItemInput = z.infer<typeof updateInventoryItemSchema>;
export type CreateMileageEntryInput = z.infer<typeof createMileageEntrySchema>;
export type UpdateMileageEntryInput = z.infer<typeof updateMileageEntrySchema>;
export type CreateInteractionInput = z.infer<typeof createInteractionSchema>;
export type UpdateInteractionInput = z.infer<typeof updateInteractionSchema>;
export type CreateGISPropertyInput = z.infer<typeof createGISPropertySchema>;
export type ExportFilterInput = z.infer<typeof exportFilterSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type SearchInput = z.infer<typeof searchSchema>;