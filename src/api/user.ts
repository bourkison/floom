import {fetchJwtToken, API_NAME} from '@/api/utility';
import {GetUserParams, UpdateUserParams, UserDocData} from '@/types/user';
import {API} from 'aws-amplify';

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
        dob: data.data.dob,
        country: data.data.country,
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
