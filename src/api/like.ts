import {fetchJwtToken, API_NAME} from '@/api/utility';
import {CreateLikeParams} from '@/types/like';
import {API} from 'aws-amplify';

export async function createLike(input: CreateLikeParams): Promise<void> {
    const path = '/like/' + input.productId;
    console.log('CREATING LIKE:', path);

    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    const data = await API.post(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    if (!data.success) {
        console.warn('Unsuccessful like:', data.message);
    }
    console.log('LIKE CREATED');
}

export async function createDelete(input: CreateLikeParams): Promise<void> {
    const path = '/like/' + input.productId;

    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    const data = await API.post(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    if (!data.success) {
        console.warn('Unsuccessful like:', data.message);
    }
}
