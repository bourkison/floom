import {Auth} from 'aws-amplify';

export async function fetchJwtToken(): Promise<string> {
    try {
        return (await Auth.currentSession()).getIdToken().getJwtToken();
    } catch (err) {
        console.error('Error getting jwtToken', err);
        return '';
    }
}

// TODO: Update API Name.
export const API_NAME = 'projectburnapi';
