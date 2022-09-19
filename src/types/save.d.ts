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

export type DeleteSaveParams = {
    productId: string;
    init: DeleteSaveInit;
};

export type DeleteSaveInit = {
    headers?: {
        Authorization?: string;
    };
    queryStringParameters: {
        type: 'save' | 'delete';
    };
};
