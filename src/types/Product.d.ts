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

export type QueryProductResponse = {
    products: Product[];
    __moreToLoad: boolean;
    __totalLength: number | 'unknown';
    __loaded: number;
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
