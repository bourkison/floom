export type Product = {
    _id: string;
    title: string;
    price: number;
    imageLink: string[];
    link: string;
};

// API
export type QueryProductParams = {
    init: QueryProductInit;
};

export type QueryProductInit = {
    headers?: {
        Authorization?: string;
    };
    queryStringParameters?: {
        loadAmount?: number;
        type?: 'saved' | 'unsaved';
        startAt?: string;
    };
};

export type GetProductParams = {
    init: GetProductInit;
    productId: string;
};

export type GetProductInit = {
    headers?: {
        Authorization?: string;
    };
};
