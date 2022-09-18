import {Auth} from 'aws-amplify';

export async function fetchJwtToken(): Promise<string> {
    try {
        return (
            'Bearer ' + (await Auth.currentSession()).getIdToken().getJwtToken()
        );
    } catch (err) {
        console.error('Error getting jwtToken', err);
        return '';
    }
}

export const API_NAME = 'teenderapi';
