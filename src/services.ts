import {Product as ProductType, QueryProductInit} from '@/types/product';
import {RootState} from './store';
import {CURRENCIES} from '@/constants/countries';

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

export const stringifyColors = (colors: string[]): string => {
    return colors
        .map(color => {
            return capitaliseString(color);
        })
        .join(', ');
};

export const alreadyExists = (id: string, array: ProductType[]): boolean => {
    for (let i = 0; i < array.length; i++) {
        if (id === array[i]._id) {
            return true;
        }
    }

    return false;
};

export const formatPrice = (price: ProductType['price']): string => {
    return (
        CURRENCIES[price[0].currency].symbol +
        (Math.round(price[0].saleAmount * 100) / 100).toFixed(2)
    );
};

type FiltersType = 'saved' | 'unsaved' | 'deleted';

export function buildInitWithFilters<T extends FiltersType>(
    init: QueryProductInit,
    type: T,
    filters: RootState['product'][T]['filters'],
): QueryProductInit {
    let response = init;

    if (type === 'unsaved') {
        response.queryStringParameters = response.queryStringParameters || {
            loadAmount: 10,
            type: 'unsaved',
        };

        // @ts-ignore
        response.queryStringParameters.excludeDeleted = filters.excludeDeleted;
        // @ts-ignore
        response.queryStringParameters.excludeSaved = filters.excludeSaved;

        // If not excluding deleted or saved, order products to avoid duplication.
        // @ts-ignore
        if (!filters.excludeDeleted || !filters.excludeSaved) {
            response.queryStringParameters.ordered = true;
        }
    }

    if (filters.gender.length) {
        response.queryStringParameters = {
            ...response.queryStringParameters,
            filteredGenders: filters.gender.join(','),
        };
    }

    if (filters.color.length) {
        response.queryStringParameters = {
            ...response.queryStringParameters,
            filteredColors: filters.color.join(','),
        };
    }

    if (filters.category.length) {
        response.queryStringParameters = {
            ...response.queryStringParameters,
            filteredCategories: filters.category.join(','),
        };
    }

    if (filters.searchText) {
        response.queryStringParameters = {
            ...response.queryStringParameters,
            query: filters.searchText,
        };
    }

    return response;
}

export function filtersApplied(
    filters: RootState['product']['saved']['filters'],
) {
    if (
        filters.category.length ||
        filters.color.length ||
        filters.gender.length ||
        filters.searchText
    ) {
        return true;
    }

    return false;
}
