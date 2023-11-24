import {MergeDeep} from 'type-fest';

import {Database as DatabaseGenerated} from '@/types/database-generated';
import {Gender} from '@/types';

type NonNullVProducts = MergeDeep<
    DatabaseGenerated['public']['Views']['v_products']['Row'],
    {
        brand: string;
        categories: string[];
        colors: string[];
        created_at: string;
        deleted: boolean;
        gender: Gender;
        id: number;
        images: string[];
        in_stock: boolean;
        link: string;
        name: string;
        price: number;
        sale_price: number;
        saved: boolean;
        updated_at: string;
        vendor_product_id: string;
    }
>;

export type Database = MergeDeep<
    DatabaseGenerated,
    {
        public: {
            Tables: {
                users: {
                    Row: {gender: Gender};
                    Insert: {gender: Gender};
                    Update: {gender?: Gender};
                };
            };
            Views: {
                v_products: {
                    Row: NonNullVProducts;
                };
            };
            Functions: {
                exclude_products: {
                    Returns: NonNullVProducts[];
                };
            };
        };
    }
>;
