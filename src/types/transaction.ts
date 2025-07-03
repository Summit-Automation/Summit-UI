export type Transaction = {
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

    // Origin of the entry
    source: 'manual' | 'ai_agent' | 'import';

    // ISO 8601 string with timezone (e.g. '2025-06-19T19:40:56.125769+00')
    timestamp: string;

    // UUID of the user or null if system-generated
    uploaded_by: string | null;

    customer_id: string | null;

    customer_name: string | null;

    interaction_id: string | null;

    interaction_title: string | null;

    interaction_outcome: string | null;


};
