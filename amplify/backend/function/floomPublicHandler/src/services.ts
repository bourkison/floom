import {APIGatewayEvent} from 'aws-lambda';
import {FilterQuery} from 'mongoose';
import {ProductType} from './types';

export function buildQueryWithFilters(
    initialQuery: FilterQuery<ProductType>,
    event: APIGatewayEvent,
): FilterQuery<ProductType> {
    let query = initialQuery;

    // Get relevant filters and convert to lower case.
    const filteredGenders: string[] = JSON.parse(event.body)?.filteredGenders
        ? JSON.parse(event.body).filteredGenders.map((g: string) =>
              g.toLowerCase(),
          )
        : [];

    const filteredCategories: string[] = JSON.parse(event.body)
        ?.filteredCategories
        ? JSON.parse(event.body).filteredCategories.map((c: string) =>
              c.toLowerCase(),
          )
        : [];

    const filteredColors: string[] = JSON.parse(event.body)?.filteredColors
        ? JSON.parse(event.body).filteredColors.map((c: string) =>
              c.toLowerCase(),
          )
        : [];

    const searchText: string = JSON.parse(event.body)?.query || '';

    if (filteredGenders.length) {
        const regex = new RegExp(
            filteredGenders.map(g => `^${g}$`).join('|'),
            'gi',
        );
        query = {
            ...query,
            gender: {
                $regex: regex,
            },
        };
    }

    if (filteredCategories.length) {
        query = {
            ...query,
            categories: {
                $in: filteredCategories,
            },
        };
    }

    if (filteredColors.length) {
        const regex = new RegExp(filteredColors.join('|'), 'gi');

        query = {
            ...query,
            colors: {
                $regex: regex,
            },
        };
    }

    if (searchText) {
        query = {
            ...query,
            $text: {
                $search: searchText,
            },
        };
    }

    return query;
}
