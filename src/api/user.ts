import {fetchJwtToken, API_NAME} from '@/api/utility';
import {GetUserParams, UserDocData} from '@/types/user';
import {API} from 'aws-amplify';

export async function getUser(input: GetUserParams): Promise<UserDocData> {
    const path = '/user/' + input.username;

    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    console.log('CALLING API:', API_NAME, path, init);

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err.message);
        throw err;
    });

    console.log('RESPONSE:', data);

    return {
        email: data.data.email,
        name: data.data.name,
        gender: data.data.gender,
        dob: new Date(data.data.dob),
        country: data.data.country,
    };
}
