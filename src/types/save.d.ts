// API
export type CreateSaveParams = {
    productId: string;
    init: CreateSaveInit;
};

export type CreateSaveInit = {
    headers?: {
        Authorization?: string;
    };
    queryStringParameters: {
        type: 'save' | 'delete';
    };
};
