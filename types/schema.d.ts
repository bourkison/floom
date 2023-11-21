import {MergeDeep} from 'type-fest';

import {Database as DatabaseGenerated} from '@/types/database-generated';
import {Gender} from '@/types';

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
        };
    }
>;
