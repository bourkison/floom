export type Json = string;

export interface Database {
    public: {
        Tables: {
            deletes: {
                Row: {
                    created_at: string | null;
                    id: number;
                    product_id: number;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: number;
                    product_id: number;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: number;
                    product_id?: number;
                    user_id?: string;
                };
            };
            products: {
                Row: {
                    brand: string;
                    categories: string[];
                    colors: string[];
                    created_at: string;
                    gender: string;
                    id: number;
                    images: string[];
                    in_stock: boolean;
                    link: string;
                    name: string;
                    price: number;
                    sale_price: number;
                    updated_at: string;
                    vendor_product_id: string;
                };
                Insert: {
                    brand: string;
                    categories: string[];
                    colors: string[];
                    created_at?: string;
                    gender: string;
                    id?: number;
                    images: string[];
                    in_stock: boolean;
                    link: string;
                    name: string;
                    price: number;
                    sale_price: number;
                    updated_at?: string;
                    vendor_product_id: string;
                };
                Update: {
                    brand?: string;
                    categories?: string[];
                    colors?: string[];
                    created_at?: string;
                    gender?: string;
                    id?: number;
                    images?: string[];
                    in_stock?: boolean;
                    link?: string;
                    name?: string;
                    price?: number;
                    sale_price?: number;
                    updated_at?: string;
                    vendor_product_id?: string;
                };
            };
            saves: {
                Row: {
                    created_at: string | null;
                    id: number;
                    product_id: number;
                    user_id: string;
                };
                Insert: {
                    created_at?: string | null;
                    id?: number;
                    product_id: number;
                    user_id: string;
                };
                Update: {
                    created_at?: string | null;
                    id?: number;
                    product_id?: number;
                    user_id?: string;
                };
            };
            users: {
                Row: {
                    country: string;
                    created_at: string | null;
                    currency: string;
                    email: string;
                    gender: string;
                    id: string;
                };
                Insert: {
                    country: string;
                    created_at?: string | null;
                    currency: string;
                    email: string;
                    gender: string;
                    id: string;
                };
                Update: {
                    country?: string;
                    created_at?: string | null;
                    currency?: string;
                    email?: string;
                    gender?: string;
                    id?: string;
                };
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            [_ in never]: never;
        };
        Enums: {
            [_ in never]: never;
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
}
