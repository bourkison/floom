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
    isGuest: false,
    loggedIn: false,
    docData: null as UserDocData | null,
    status: 'idle' as 'idle' | 'loading' | 'succeeded' | 'failed',
});

export const FETCH_USER = createAsyncThunk(
    'user/FETCH_USER',
    async (): Promise<UserDocData> => {
        await Auth.currentSession();

        const username = (await Auth.currentUserInfo()).username;
        return await getUser({username: username, init: {}});
    },
);

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        CONTINUE_AS_GUEST(state) {
            state.isGuest = true;
            state.loggedIn = true;
            state.status = 'succeeded';
        },
    },
    extraReducers: builder => {
        builder
            .addCase(FETCH_USER.pending, state => {
                console.log('Fetching user.');
                state.status = 'loading';
            })
            .addCase(FETCH_USER.fulfilled, (state, action) => {
                console.log('User logged in.');
                state.loggedIn = true;
                state.docData = action.payload;
                state.status = 'succeeded';
            })
            .addCase(FETCH_USER.rejected, state => {
                console.log('Fetch user rejected, user logged out.');
                state.loggedIn = false;
                state.docData = null;
                state.status = 'failed';
            });
    },
});

export const {CONTINUE_AS_GUEST} = userSlice.actions;
export default userSlice.reducer;
