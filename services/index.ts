import {PostgrestFilterBuilder} from '@supabase/postgrest-js';

import {RootState} from '@/store';
import {Gender} from '@/types';
import {Database} from '@/types/schema';

type VProductsFilterBuilder = PostgrestFilterBuilder<
    Database['public'],
    Database['public']['Views']['v_products']['Row'],
    any
>;

type Filters = {
    gender: Gender;
    category: string[];
    color: string[];
    searchText: string;
    excludeSaved?: boolean;
    excludeDeleted?: boolean;
};

export function applyProductFilters(
    query: VProductsFilterBuilder,
    filters: Filters,
): VProductsFilterBuilder {
    if (filters.searchText) {
        query = query.textSearch(
            'name',
            `${filters.searchText.toLowerCase()}`,
            {
                type: 'websearch',
            },
        );
    }

    if (filters.category.length) {
        query = query.in('categories', filters.category);
    }

    if (filters.gender !== 'both') {
        query = query.eq('gender', filters.gender);
    }

    if (filters.excludeSaved) {
        query = query.neq('saved', true);
    }

    if (filters.excludeDeleted) {
        query = query.neq('deleted', true);
    }

    return query;
}

export const capitaliseString = (str: string): string => {
    const capitaliseFirstLetter = (s: string) => {
        if (s && s[0]) {
            return s[0].toUpperCase() + s.substring(1);
        }

        return s;
    };

    let output = capitaliseFirstLetter(str.toLowerCase());

    const delimiters = [' ', '/', '-', '&'];
    const excludedWords = ['the', 'a', 'and', 'with'];

    delimiters.forEach(d => {
        output = output
            .split(d)
            .map((o, i) => {
                if (i === 0) {
                    return o;
                }

                if (excludedWords.includes(o.toLowerCase())) {
                    return o.toLowerCase();
                }

                return capitaliseFirstLetter(o);
            })
            .join(d);
    });

    return output;
};

export const formatPrice = (price: number): string => {
    return `£${(price / 100).toFixed(2)}`;
};

export const alreadyExists = (
    productId: number,
    products: Database['public']['Views']['v_products']['Row'][],
): boolean => {
    for (let i = 0; i < products.length; i++) {
        if (products[i].id === productId) {
            return true;
        }
    }

    return false;
};

export const stringifyColors = (colors: string[]): string => {
    return colors
        .map(color => {
            return capitaliseString(color);
        })
        .join(', ');
};

export function filtersApplied(
    filters: RootState['product']['saved']['filters'],
) {
    if (
        filters.category.length ||
        filters.color.length ||
        filters.gender !== 'both' ||
        filters.searchText
    ) {
        return true;
    }

    return false;
}
