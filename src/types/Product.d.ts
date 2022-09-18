export type Product = {
    _id: string;
    title: string;
    price: number;
    imageLink: string[];
    link: string;
};

// API
export type GetProductParams = {
    init: GetProductInit;
};

export type GetProductInit = {
    headers?: {
        Authorization?: string;
    };
    queryStringParameters?: {
        loadAmount?: number;
    };
};
