import {
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

import {Database} from '@/types/schema';

type UserData = Database['public']['Tables']['users']['Row'];

interface IRootInitialState {
    loggedIn: boolean;
    isGuest: boolean;
    userData: null | UserData;
}

interface GuestInitialState extends IRootInitialState {
    isGuest: true;
    userData: null;
}

interface LoggedInInitialState extends IRootInitialState {
    loggedIn: true;
    isGuest: false;
    userData: UserData;
}

interface LoggedOutInitialState extends IRootInitialState {
    loggedIn: false;
    isGuest: false;
    userData: null;
}

type TInitialState =
    | GuestInitialState
    | LoggedInInitialState
    | LoggedOutInitialState;

const userAdapter = createEntityAdapter();

const initialState = userAdapter.getInitialState<TInitialState>({
    loggedIn: false,
    isGuest: false,
    userData: null,
});

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        login(state, action: PayloadAction<UserData>) {
            state.loggedIn = true;
            state.isGuest = false;
            state.userData = action.payload;
        },
        loginAsGuest(state) {
            state.loggedIn = true;
            state.isGuest = true;
            state.userData = null;
        },
        logout(state) {
            state.loggedIn = false;
            state.isGuest = false;
            state.userData = null;
        },
    },
});

export const {login, logout} = userSlice.actions;
export default userSlice.reducer;
