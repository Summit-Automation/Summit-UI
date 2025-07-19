export type MileageEntry = {
    id: string;
    date: string;
    start_location: string | null;
    end_location: string | null;
    purpose: string;
    miles: number;
    is_business: boolean;
    customer_id: string | null;
    customer_name: string | null;
    notes: string | null;
    created_at: string;
    updated_at: string;
    user_id: string;
};