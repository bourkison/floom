import {API_NAME, fetchJwtToken} from '@/api/utility';
import {CreateReportParams} from '@/types/report';
import {API} from 'aws-amplify';

export async function createReport(input: CreateReportParams): Promise<void> {
    const path = '/report/' + input.productId;

    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    await API.post(API_NAME, path, init);
}
