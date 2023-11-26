import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {PostgrestError} from '@supabase/supabase-js';

import {
    CATEGORY_OPTIONS,
    COLOR_OPTIONS,
    LOCAL_KEY_DELETED_PRODUCTS,
    LOCAL_KEY_SAVED_PRODUCTS,
} from '@/constants';
import {alreadyExists, applyProductFilters} from '@/services';
import {supabase} from '@/services/supabase';
import {RootState} from '@/store';
import {Gender} from '@/types';
import {Database} from '@/types/schema';

type ProductType = Database['public']['Views']['v_products']['Row'];

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    unsaved: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
        filters: {
            gender: 'both' as Gender,
            category: [] as (typeof CATEGORY_OPTIONS)[number][],
            color: [] as (typeof COLOR_OPTIONS)[number][],
            brand: [] as {id: number; name: string}[],
            searchText: '',
            excludeDeleted: true,
            excludeSaved: true,
        },
    },
});

export const loadUnsavedProducts = createAsyncThunk<
    Database['public']['Views']['v_products']['Row'][],
    void,
    {rejectValue: PostgrestError}
>('product/loadUnsavedProducts', async (_, {getState, rejectWithValue}) => {
    const state = getState() as RootState;
    let query = supabase.from('v_products').select().limit(10);

    if (state.user.isGuest) {
        query = applyProductFilters(query, state.product.unsaved.filters);

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
        const {data, error} = await applyProductFilters(
            query,
            state.product.unsaved.filters,
        );

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
        clearFilters(
            state,
            action: PayloadAction<{
                gender: Gender;
            }>,
        ) {
            state.unsaved.filters.category = [];
            state.unsaved.filters.color = [];
            state.unsaved.filters.searchText = '';
            state.unsaved.filters.gender = action.payload.gender;
        },
        setGender(state, action: PayloadAction<Gender>) {
            state.unsaved.filters.gender = action.payload;
        },
        toggleExclude(state, action: PayloadAction<'deleted' | 'saved'>) {
            if (action.payload === 'saved') {
                state.unsaved.filters.excludeSaved =
                    !state.unsaved.filters.excludeSaved;
            } else if (action.payload === 'deleted') {
                state.unsaved.filters.excludeDeleted =
                    !state.unsaved.filters.excludeDeleted;
            }
        },
        toggleBrand(
            state,
            action: PayloadAction<{
                brand: {id: number; name: string};
            }>,
        ) {
            const index = state.unsaved.filters.brand.findIndex(
                brand => action.payload.brand.id === brand.id,
            );

            if (index < 0) {
                state.unsaved.filters.brand = [
                    ...state.unsaved.filters.brand,
                    action.payload.brand,
                ];
            } else {
                state.unsaved.filters.brand = [
                    ...state.unsaved.filters.brand.slice(0, index),
                    ...state.unsaved.filters.brand.slice(index + 1),
                ];
            }
        },
        toggleCategory(
            state,
            action: PayloadAction<{
                category: (typeof CATEGORY_OPTIONS)[number];
            }>,
        ) {
            const index = state.unsaved.filters.category.findIndex(
                category => action.payload.category.value === category.value,
            );

            if (index < 0) {
                state.unsaved.filters.category = [
                    ...state.unsaved.filters.category,
                    action.payload.category,
                ];
            } else {
                state.unsaved.filters.category = [
                    ...state.unsaved.filters.category.slice(0, index),
                    ...state.unsaved.filters.category.slice(index + 1),
                ];
            }
        },
        toggleColor(
            state,
            action: PayloadAction<{color: (typeof COLOR_OPTIONS)[number]}>,
        ) {
            const index = state.unsaved.filters.color.findIndex(
                color => action.payload.color.value === color.value,
            );

            if (index < 0) {
                state.unsaved.filters.color = [
                    ...state.unsaved.filters.color,
                    action.payload.color,
                ];
            } else {
                state.unsaved.filters.color = [
                    ...state.unsaved.filters.color.slice(0, index),
                    ...state.unsaved.filters.color.slice(index + 1),
                ];
            }
        },
        updateSearchFilter(state, action: PayloadAction<{pl: string}>) {
            state.unsaved.filters.searchText = action.payload.pl;
        },
        unshiftProducts(state) {
            state.unsaved.products = state.unsaved.products.slice(1);
        },
    },
    extraReducers(builder) {
        builder
            .addCase(loadUnsavedProducts.pending, state => {
                state.unsaved.isLoading = true;
            })
            .addCase(loadUnsavedProducts.fulfilled, (state, action) => {
                state.unsaved.isLoading = false;

                // Only add to local state if it doesn't already exist (to avoid duplicates).
                for (let i = 0; i < action.payload.length; i++) {
                    if (
                        !alreadyExists(
                            action.payload[i].id,
                            state.unsaved.products,
                        )
                    ) {
                        state.unsaved.products = [
                            ...state.unsaved.products,
                            action.payload[i],
                        ];
                    }
                }

                if (action.payload.length === 0) {
                    state.unsaved.moreToLoad = false;
                }
            })
            .addCase(loadUnsavedProducts.rejected, (_, {meta, payload}) => {
                console.error('error loading', payload, meta);
            });
    },
});

export const {
    clearFilters,
    setGender,
    toggleBrand,
    toggleCategory,
    toggleColor,
    toggleExclude,
    updateSearchFilter,
    unshiftProducts,
} = productSlice.actions;
export default productSlice.reducer;
