// types/interaction.ts
export type Interaction = {
    id: string;
    customer_id: string;
    customer_name: string;
    type: string;
    title: string;
    notes: string;
    outcome: string;
    follow_up_required: boolean;
    created_at: string;
    interaction_index: number;
};
