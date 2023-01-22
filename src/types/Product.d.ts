export type Product = {
    _id: string;
    name: string;
    price: {
        amount: number;
        saleAmount: number;
        currency: string;
    };
    link: string;
    images: string[];
    colors: string[];
    categories: string[];
    gender: string;
    brand: string;
    vendorProductId: string;
    inStock: boolean;
    description: string;
    saved: boolean;
    deleted: boolean;
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
        type?: 'saved' | 'unsaved' | 'deleted';
        startAt?: string;
        excludeDeleted?: boolean;
        excludeSaved?: boolean;
        filteredGenders?: string;
        filteredCategories?: string;
        filteredColors?: string;
        query?: string;
        reversed?: boolean;
        ordered?: boolean;
    };
};

export type QueryPublicProductParams = {
    init: QueryPublicProductInit;
};

export type QueryPublicProductInit = {
    body: {
        method?: 'QUERY_PRODUCTS';
        excludedProducts: string[];
        filteredGenders: string[];
        filteredCategories: string[];
        filteredColors: string[];
        loadAmount: number;
    };
};

export type GetPublicProductParams = {
    init: GetPublicProductInit;
};

export type GetPublicProductInit = {
    body: {
        method?: 'GET_PRODUCTS';
        products: string[];
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
