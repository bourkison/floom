import {APIGatewayEvent} from 'aws-lambda';
import {FilterQuery} from 'mongoose';
import {ProductType} from './types';

export function buildQueryWithFilters(
    initialQuery: FilterQuery<ProductType>,
    event: APIGatewayEvent,
): FilterQuery<ProductType> {
    let query = initialQuery;

    // Get relevant filters and convert to lower case.
    const filteredGenders: string[] = event.queryStringParameters
        .filteredGenders
        ? event.queryStringParameters.filteredGenders
              .split(',')
              .map(g => g.toLowerCase().trim())
        : [];

    const filteredCategories: string[] = event.queryStringParameters
        .filteredCategories
        ? event.queryStringParameters.filteredCategories
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const filteredColors: string[] = event.queryStringParameters.filteredColors
        ? event.queryStringParameters.filteredColors
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const searchText: string = event.queryStringParameters.query || '';

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

export function checkIfFiltered(event: APIGatewayEvent) {
    // Get relevant filters and convert to lower case.
    const filteredGenders: string[] = event.queryStringParameters
        .filteredGenders
        ? event.queryStringParameters.filteredGenders
              .split(',')
              .map(g => g.toLowerCase().trim())
        : [];

    const filteredCategories: string[] = event.queryStringParameters
        .filteredCategories
        ? event.queryStringParameters.filteredCategories
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const filteredColors: string[] = event.queryStringParameters.filteredColors
        ? event.queryStringParameters.filteredColors
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const searchText: string = event.queryStringParameters.query || '';

    return (
        filteredGenders.length ||
        filteredCategories.length ||
        filteredColors.length ||
        searchText
    );
}
