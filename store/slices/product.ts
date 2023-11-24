import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';

import {
    LOCAL_KEY_DELETED_PRODUCTS,
    LOCAL_KEY_SAVED_PRODUCTS,
} from '@/constants';
import {applyProductFilters} from '@/services';
import {supabase} from '@/services/supabase';
import {RootState} from '@/store';
import {Gender} from '@/types';
import {Database} from '@/types/schema';
import {PostgrestError} from '@supabase/supabase-js';

type ProductType = Database['public']['Views']['v_products']['Row'];
type AnimationState = 'idle' | 'save' | 'buy' | 'delete';

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    saved: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
        filters: {
            gender: 'both' as Gender,
            category: [] as string[],
            color: [] as string[],
            searchText: '',
        },
    },
    unsaved: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
        filters: {
            gender: 'both' as Gender,
            category: [] as string[],
            color: [] as string[],
            searchText: '',
            excludeDeleted: true,
            excludeSaved: true,
        },
    },
    deleted: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
        filters: {
            gender: 'both' as Gender,
            category: [] as string[],
            color: [] as string[],
            searchText: '',
        },
    },
    animation: 'idle' as AnimationState,
    action: 'idle' as AnimationState,
});

export const loadUnsavedProducts = createAsyncThunk<
    Database['public']['Views']['v_products']['Row'][],
    void,
    {rejectValue: PostgrestError}
>('product/loadUnsavedProducts', async (_, {getState, rejectWithValue}) => {
    const state = getState() as RootState;

    if (state.user.isGuest) {
        // If user is a guest, exclude products within query itself.
        let query = supabase.from('v_products').select();

        query = applyProductFilters(query, {
            gender: state.product.unsaved.filters.gender,
            category: state.product.unsaved.filters.category,
            searchText: state.product.unsaved.filters.searchText,
            color: state.product.unsaved.filters.color,
        });

        const excludeSaved = state.product.unsaved.filters.excludeSaved
            ? JSON.parse(
                  (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) ||
                      '[]',
              )
            : [];

        const excludeDeleted = state.product.unsaved.filters.excludeDeleted
            ? JSON.parse(
                  (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                      '[]',
              )
            : [];

        const productsToExclude = [...excludeSaved, ...excludeDeleted];

        const {data, error} = await query.not(
            'id',
            'in',
            productsToExclude.join(','),
        );

        if (error) {
            return rejectWithValue(error);
        }

        return data;
    } else {
        // Else call the rpc function, which will pull from DB to exclude.
        let query = supabase.rpc('exclude_products', {
            exclude_deleted: state.product.unsaved.filters.excludeDeleted,
            exclude_saved: state.product.unsaved.filters.excludeSaved,
        });

        query = applyProductFilters(query, {
            gender: state.product.unsaved.filters.gender,
            category: state.product.unsaved.filters.category,
            searchText: state.product.unsaved.filters.searchText,
            color: state.product.unsaved.filters.color,
        });

        const {data, error} = await query;

        if (error) {
            return rejectWithValue(error);
        }

        return data;
    }
});

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        commenceAnimate(state, action: PayloadAction<AnimationState>) {
            state.animation = action.payload;
            state.action = action.payload;
        },
    },
    extraReducers(builder) {
        builder
            .addCase(loadUnsavedProducts.pending, state => {
                state.unsaved.isLoading = true;
                console.log('LOADING');
            })
            .addCase(loadUnsavedProducts.fulfilled, (state, action) => {
                state.unsaved.isLoading = false;
                console.log('LOADED', action.payload);
            });
    },
});

export const {commenceAnimate} = productSlice.actions;
export default productSlice.reducer;
