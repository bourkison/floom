import {configureStore} from '@reduxjs/toolkit';
import productReducer from '@/store/slices/product';
import userReducer from '@/store/slices/user';

const store = configureStore({
    reducer: {
        product: productReducer,
        user: userReducer,
    },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
// Inferred type.
export type AppDispatch = typeof store.dispatch;

export default store;
