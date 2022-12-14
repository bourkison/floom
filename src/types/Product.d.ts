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
