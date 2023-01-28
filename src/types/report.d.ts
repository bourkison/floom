import {REPORT_TYPES} from '@/constants';

export type CreateReportParams = {
    init: CreateReportInit;
    productId: string;
};

export type CreateReportInit = {
    headers?: {
        Authorization?: string;
    };
    body: {
        type: typeof REPORT_TYPES[number]['id'];
        message: string;
    };
};
