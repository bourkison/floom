import {COUNTRIES, CURRENCIES} from '@/constants/countries';

export type UserDocData = {
    email: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    dob: string;
    country: keyof typeof COUNTRIES;
    currency: keyof typeof CURRENCIES;
};

// API
export type GetUserParams = {
    username: string;
    init: GetUserInit;
};

export type GetUserInit = {
    headers?: {
        Authorization?: string;
    };
    queryStringParameters?: {
        view?: string;
    };
};

export type UpdateUserParams = {
    init: UpdateUserInit;
};

export type UpdateUserInit = {
    headers?: {
        Authorization?: string;
    };
    body: {
        user: UserDocData;
    };
};
