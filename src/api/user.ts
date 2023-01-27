import {fetchJwtToken, API_NAME} from '@/api/utility';
import {GetUserParams, UpdateUserParams, UserDocData} from '@/types/user';
import {API} from 'aws-amplify';
import dayjs from 'dayjs';

export async function getUser(input: GetUserParams): Promise<UserDocData> {
    const path = '/user/' + input.username;

    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    return {
        email: data.data.email,
        name: data.data.name,
        gender: data.data.gender,
        dob: dayjs(data.data.dob).format('YYYY-MM-DD'),
        country: data.data.country,
        currency: data.data.currency,
    };
}

export async function updateUser(input: UpdateUserParams) {
    const path = '/user';

    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    await API.put(API_NAME, path, init);
}
