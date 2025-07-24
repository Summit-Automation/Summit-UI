export interface InventoryItem {
    id: string;
    user_id: string;
    organization_id?: string;
    
    // Basic item information
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    
    // Categorization
    category: string;
    subcategory?: string;
    location?: string;
    
    // Inventory tracking
    current_quantity: number;
    minimum_threshold: number;
    maximum_capacity?: number;
    unit_of_measurement: string;
    
    // Financial information
    unit_cost: number;
    unit_price: number;
    supplier?: string;
    supplier_contact?: string;
    
    // Status and metadata
    status: 'active' | 'discontinued' | 'out_of_stock';
    notes?: string;
    
    // Automation and tracking fields
    last_counted_at?: string;
    last_updated_by?: string;
    auto_reorder_enabled: boolean;
    reorder_point?: number;
    reorder_quantity?: number;
    
    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface InventoryTransaction {
    id: string;
    item_id: string;
    user_id: string;
    organization_id?: string;
    
    // Transaction details
    transaction_type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'return';
    quantity_change: number;
    quantity_before: number;
    quantity_after: number;
    
    // Reference information
    reference_number?: string;
    reason: string;
    customer_id?: string;
    supplier_reference?: string;
    
    // Location and automation
    location_from?: string;
    location_to?: string;
    scanned_by?: string;
    automation_source: string;
    
    // Financial impact
    unit_cost?: number;
    total_cost?: number;
    
    // Metadata
    notes?: string;
    created_at: string;
    processed_by?: string;
}

export interface InventoryAlert {
    id: string;
    item_id: string;
    user_id: string;
    organization_id?: string;
    
    alert_type: 'low_stock' | 'out_of_stock' | 'overstock' | 'expiry_warning';
    status: 'active' | 'acknowledged' | 'resolved';
    
    message: string;
    priority: 'low' | 'medium' | 'high' | 'critical';
    
    // Automation fields
    auto_generated: boolean;
    threshold_value?: number;
    current_value?: number;
    
    // Timestamps
    created_at: string;
    acknowledged_at?: string;
    resolved_at?: string;
    acknowledged_by?: string;
    
    // Related data for display
    item_name?: string;
}

export interface InventoryLocation {
    id: string;
    user_id: string;
    organization_id?: string;
    
    name: string;
    code?: string;
    description?: string;
    location_type: 'warehouse' | 'shelf' | 'bin' | 'room' | 'zone';
    
    parent_location_id?: string;
    capacity?: number;
    
    created_at: string;
    updated_at: string;
}

export interface InventorySummary {
    total_items: number;
    total_value: number;
    low_stock_items: number;
    out_of_stock_items: number;
    categories: number;
    recent_transactions: number;
    active_alerts: number;
    critical_alerts: number;
}

export interface CreateInventoryItemRequest {
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    category: string;
    subcategory?: string;
    location?: string;
    current_quantity: number;
    minimum_threshold: number;
    maximum_capacity?: number;
    unit_of_measurement: string;
    unit_cost: number;
    unit_price: number;
    supplier?: string;
    supplier_contact?: string;
    notes?: string;
    auto_reorder_enabled?: boolean;
    reorder_point?: number;
    reorder_quantity?: number;
}

export interface UpdateInventoryItemRequest extends Partial<CreateInventoryItemRequest> {
    id: string;
}

export interface CreateTransactionRequest {
    item_id: string;
    transaction_type: 'stock_in' | 'stock_out' | 'adjustment' | 'transfer' | 'return';
    quantity_change: number;
    reason: string;
    reference_number?: string;
    customer_id?: string;
    supplier_reference?: string;
    location_from?: string;
    location_to?: string;
    unit_cost?: number;
    notes?: string;
    automation_source?: string;
}

export interface InventoryFilters {
    search?: string;
    category?: string;
    status?: 'active' | 'discontinued' | 'out_of_stock';
    location?: string;
    low_stock_only?: boolean;
    out_of_stock_only?: boolean;
}

export interface InventoryStats {
    items_by_category: Array<{ category: string; count: number; value: number }>;
    stock_levels: Array<{ name: string; current: number; minimum: number; status: string }>;
    value_by_category: Array<{ category: string; value: number }>;
    recent_transactions: InventoryTransaction[];
    alerts_by_priority: Array<{ priority: string; count: number }>;
}