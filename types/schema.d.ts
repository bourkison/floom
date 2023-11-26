import {MergeDeep} from 'type-fest';

import {Database as DatabaseGenerated} from '@/types/database-generated';
import {Gender} from '@/types';

type NonNullVProducts = MergeDeep<
    DatabaseGenerated['public']['Views']['v_products']['Row'],
    {
        brand: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['brand']
        >;
        colors: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['colors']
        >;
        created_at: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['created_at']
        >;
        deleted: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['deleted']
        >;
        gender: Gender;
        id: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['id']
        >;
        images: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['images']
        >;
        in_stock: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['in_stock']
        >;
        link: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['link']
        >;
        name: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['name']
        >;
        price: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['number']
        >;
        sale_price: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['sale_price']
        >;
        saved: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['saved']
        >;
        updated_at: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['updated_at']
        >;
        vendor_product_id: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['vendor_product_id']
        >;
        description: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['description']
        >;
        product_type: NonNullable<
            DatabaseGenerated['public']['Views']['v_products']['Row']['product_type']
        >;
    }
>;

type NonNullVSaves = MergeDeep<
    DatabaseGenerated['public']['Views']['v_products']['Row'],
    {
        brand: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['brand']
        >;
        colors: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['colors']
        >;
        created_at: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['created_at']
        >;
        deleted: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['deleted']
        >;
        gender: Gender;
        id: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['id']
        >;
        images: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['images']
        >;
        in_stock: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['in_stock']
        >;
        link: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['link']
        >;
        name: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['name']
        >;
        price: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['number']
        >;
        sale_price: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['sale_price']
        >;
        saved: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['saved']
        >;
        updated_at: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['updated_at']
        >;
        vendor_product_id: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['vendor_product_id']
        >;
        description: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['description']
        >;
        product_type: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['product_type']
        >;
        product_id: NonNullable<
            DatabaseGenerated['public']['Views']['v_saves']['Row']['product_id']
        >;
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
                v_saves: {
                    Row: NonNullVSaves;
                };
            };
        };
    }
>;
