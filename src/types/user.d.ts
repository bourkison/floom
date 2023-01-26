import {COUNTRIES} from '@/constants/countries';

export type UserDocData = {
    email: string;
    name: string;
    gender: 'male' | 'female' | 'other';
    dob: Date;
    country: keyof typeof COUNTRIES;
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
        user: {
            email: string;
            name: string;
            gender: 'male' | 'female' | 'other';
            dob: string;
            country: keyof typeof COUNTRIES;
        };
    };
};
