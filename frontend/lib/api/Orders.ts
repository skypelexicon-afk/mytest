import { fetchApi } from '@/lib/doFetch';
import { Order } from '../types/orderType';


export const getAllOrders = async (): Promise<{ orders: Order[]; total: number }> => {
    try {
        const res = await fetchApi.get('api/orders/orders') as { orders: Order[] };
        const orders = res.orders as Order[];
        return {
            orders,
            total: orders.length
        };
    } catch (error) {
        console.error('Error fetching orders:', error);
        throw error;
    }
};