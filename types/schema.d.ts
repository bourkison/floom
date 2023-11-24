import {MergeDeep} from 'type-fest';

import {Database as DatabaseGenerated} from '@/types/database-generated';
import {Gender} from '@/types';

// Merge "View" Rows with "Table" Rows to remove nulls
type NonNullDatabase = MergeDeep<
    DatabaseGenerated,
    {
        public: {
            Views: {
                v_products: {
                    Row: DatabaseGenerated['public']['Tables']['products']['Row'];
                };
            };
        };
    }
>;

export type Database = MergeDeep<
    NonNullDatabase,
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
                    Row: {saved: boolean};
                };
            };
        };
    }
>;
