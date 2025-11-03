export interface Order {
    id: number;
    transaction_id: string;
    user_id: number;
    course_id: number;
    status: string;
    order_amount: number;
    tax_amount: number;
    discount_amount: number;
    net_amount: number;
    created_at: string;
    updated_at: string;
}