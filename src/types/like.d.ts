// API
export type CreateLikeParams = {
    productId: string;
    init: CreateProductInit;
};

export type CreateProductInit = {
    headers?: {
        Authorization?: string;
    };
    queryStringParameters: {
        type: 'like' | 'delete';
    };
};
