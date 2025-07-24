export type RecurringFrequency = 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type RecurringPayment = {
    // UUID
    id: string;

    // Discriminator for money flow
    type: 'income' | 'expense';

    // E.g. "legal services", "equipment" 
    category: string;

    // Human-readable purpose
    description: string;

    // Stored as string to match Supabase decimal type
    amount: string;

    // How often the payment recurs
    frequency: RecurringFrequency;

    // When to start the recurring payments (ISO 8601 string)
    start_date: string;

    // Optional end date (ISO 8601 string or null for indefinite)
    end_date: string | null;

    // Day of month for monthly/quarterly/yearly (1-31, null for other frequencies)
    day_of_month: number | null;

    // Day of week for weekly (0-6, 0=Sunday, null for other frequencies)
    day_of_week: number | null;

    // Whether this recurring payment is currently active
    is_active: boolean;

    // When this recurring payment was created
    created_at: string;

    // When this recurring payment was last updated
    updated_at: string;

    // UUID of the user who created this
    created_by: string;

    // Optional customer linkage
    customer_id: string | null;
    customer_name: string | null;

    // Optional interaction linkage
    interaction_id: string | null;
    interaction_title: string | null;
    interaction_outcome: string | null;

    // When the next payment should be processed
    next_payment_date: string;

    // How many payments have been processed so far
    payments_processed: number;

    // Optional limit on number of payments (null for unlimited)
    payment_limit: number | null;
};

export type RecurringPaymentCreateRequest = {
    type: 'income' | 'expense';
    category: string;
    description: string;
    amount: string;
    frequency: RecurringFrequency;
    start_date: string;
    end_date?: string | null;
    day_of_month?: number | null;
    day_of_week?: number | null;
    customer_id?: string | null;
    interaction_id?: string | null;
    payment_limit?: number | null;
};

export type RecurringPaymentUpdateRequest = Partial<RecurringPaymentCreateRequest> & {
    id: string;
    is_active?: boolean;
};