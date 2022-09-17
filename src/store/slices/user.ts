import {getUser} from '@/api/user';
import {UserDocData} from '@/types/user';
import {
    createEntityAdapter,
    createSlice,
    createAsyncThunk,
} from '@reduxjs/toolkit';
import {Auth} from 'aws-amplify';

const userAdapter = createEntityAdapter();

const initialState = userAdapter.getInitialState({
    loggedIn: false,
    docData: null as UserDocData | null,
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
});

export const FETCH_USER = createAsyncThunk(
    'user/FETCH_USER',
    async (): Promise<UserDocData> => {
        console.log('Fetching user.');
        await Auth.currentSession();

        const username = (await Auth.currentUserInfo()).username;
        return await getUser({username: username, init: {}});
    },
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {},
    extraReducers: builder => {
        builder
            .addCase(FETCH_USER.pending, state => {
                state.status = 'loading';
            })
            .addCase(FETCH_USER.fulfilled, (state, action) => {
                state.loggedIn = true;
                state.docData = action.payload;
                state.status = 'succeeded';
            })
            .addCase(FETCH_USER.rejected, state => {
                state.loggedIn = false;
                state.docData = null;
                state.status = 'idle';
            });
    },
});

export default userSlice.reducer;
