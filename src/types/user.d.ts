export type UserDocData = {
    email: string;
    name: string;
    gender: string;
    dob: Date;
    country: string;
    likedProducts: string[];
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
