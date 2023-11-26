import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {AuthError, PostgrestError} from '@supabase/supabase-js';

import {
    CATEGORY_OPTIONS,
    COLOR_OPTIONS,
    LOCAL_KEY_DELETED_PRODUCTS,
    LOCAL_KEY_SAVED_PRODUCTS,
    MAX_LOCAL_DELETED_PRODUCTS,
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
    deleted: {
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

export const loadDeletedProducts = createAsyncThunk<
    Database['public']['Views']['v_products']['Row'][],
    void,
    {rejectValue: PostgrestError}
>('product/loadDeletedProducts', async (_, {getState, rejectWithValue}) => {
    const state = getState() as RootState;

    let query = supabase.from('v_products').select();
    query = applyProductFilters(query, state.product.deleted.filters);

    if (state.user.isGuest) {
        const deletedProducts = JSON.parse(
            (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) || '[]',
        );

        const {data, error} = await query.in('id', deletedProducts);

        if (error) {
            return rejectWithValue(error);
        }

        return data;
    } else {
        const {data, error} = await query.eq('deleted', true);

        if (error) {
            return rejectWithValue(error);
        }

        return data;
    }
});

export const deleteProduct = createAsyncThunk<
    void,
    number,
    {rejectValue: PostgrestError | AuthError}
>('product/deleteProduct', async (productId, {getState, rejectWithValue}) => {
    const state = getState() as RootState;

    if (state.user.isGuest) {
        let currentDeletedProducts: string[] = JSON.parse(
            (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) || '[]',
        );

        let currentSavedProducts: string[] = JSON.parse(
            (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
        );

        // Remove from saved if there.
        const savedIndex = currentSavedProducts.findIndex(
            i => i === productId.toString(),
        );
        if (savedIndex > -1) {
            currentSavedProducts = [
                ...currentSavedProducts.slice(0, savedIndex),
                ...currentSavedProducts.slice(savedIndex + 1),
            ];

            await AsyncStorage.setItem(
                LOCAL_KEY_DELETED_PRODUCTS,
                JSON.stringify(currentSavedProducts),
            );
        }

        // Add to deleted if not there already.
        if (currentDeletedProducts.includes(productId.toString())) {
            return;
        }

        currentDeletedProducts.unshift(productId.toString());

        if (currentDeletedProducts.length > MAX_LOCAL_DELETED_PRODUCTS) {
            currentDeletedProducts = currentDeletedProducts.slice(
                0,
                MAX_LOCAL_DELETED_PRODUCTS,
            );

            // TODO: Display warning to user announcing they have gone over their deleted amount
        }

        await AsyncStorage.setItem(
            LOCAL_KEY_DELETED_PRODUCTS,
            JSON.stringify(currentDeletedProducts),
        );
    } else {
        const {data: userData, error: userError} =
            await supabase.auth.getUser();

        if (userError) {
            return rejectWithValue(userError);
        }

        const {error} = await supabase
            .from('deletes')
            .insert({product_id: productId, user_id: userData.user.id});

        if (error) {
            return rejectWithValue(error);
        }
    }
});

export const deleteDeletedProduct = createAsyncThunk<
    void,
    number,
    {rejectValue: PostgrestError | AuthError}
>(
    'product/deleteDeletedProduct',
    async (productId, {getState, rejectWithValue}) => {
        const state = getState() as RootState;

        if (state.user.isGuest) {
            let currentDeletedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );

            const index = currentDeletedProducts.findIndex(
                p => p === productId.toString(),
            );

            if (index > -1) {
                currentDeletedProducts = [
                    ...currentDeletedProducts.slice(0, index),
                    ...currentDeletedProducts.slice(index + 1),
                ];

                await AsyncStorage.setItem(
                    LOCAL_KEY_DELETED_PRODUCTS,
                    JSON.stringify(currentDeletedProducts),
                );
            } else {
                throw new Error('Product not found');
            }
        } else {
            const {data: userData, error: userError} =
                await supabase.auth.getUser();

            if (userError) {
                return rejectWithValue(userError);
            }

            const {error} = await supabase
                .from('deletes')
                .delete()
                .eq('product_id', productId)
                .eq('user_id', userData.user.id);

            if (error) {
                return rejectWithValue(error);
            }
        }
    },
);

export const deleteAllDeletedProducts = createAsyncThunk<
    void,
    void,
    {rejectValue: PostgrestError | AuthError}
>(
    'product/deleteAllDeletedProducts',
    async (_, {getState, rejectWithValue}) => {
        const state = getState() as RootState;

        if (state.user.isGuest) {
            await AsyncStorage.setItem(LOCAL_KEY_DELETED_PRODUCTS, '[]');
        } else {
            const {data: userData, error: userError} =
                await supabase.auth.getUser();

            if (userError) {
                return rejectWithValue(userError);
            }

            const {error} = await supabase
                .from('deletes')
                .delete()
                .eq('user_id', userData.user.id);

            if (error) {
                return rejectWithValue(error);
            }
        }
    },
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        clearFilters(
            state,
            action: PayloadAction<{
                filterType: 'unsaved' | 'deleted';
                gender: Gender;
            }>,
        ) {
            if (action.payload.filterType === 'unsaved') {
                state.unsaved.filters.category = [];
                state.unsaved.filters.color = [];
                state.unsaved.filters.searchText = '';
                state.unsaved.filters.gender = action.payload.gender;
            } else {
                state.deleted.filters.category = [];
                state.deleted.filters.color = [];
                state.deleted.filters.searchText = '';
                state.deleted.filters.gender = action.payload.gender;
            }
        },
        setGender(
            state,
            action: PayloadAction<{
                obj: 'unsaved' | 'deleted';
                gender: Gender;
            }>,
        ) {
            state[action.payload.obj].filters.gender = action.payload.gender;
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
                obj: 'unsaved' | 'deleted';
                brand: {id: number; name: string};
            }>,
        ) {
            const index = state[action.payload.obj].filters.brand.findIndex(
                brand => action.payload.brand.id === brand.id,
            );

            if (index < 0) {
                state[action.payload.obj].filters.brand = [
                    ...state[action.payload.obj].filters.brand,
                    action.payload.brand,
                ];
            } else {
                state[action.payload.obj].filters.brand = [
                    ...state[action.payload.obj].filters.brand.slice(0, index),
                    ...state[action.payload.obj].filters.brand.slice(index + 1),
                ];
            }
        },
        toggleCategory(
            state,
            action: PayloadAction<{
                obj: 'unsaved' | 'deleted';
                category: (typeof CATEGORY_OPTIONS)[number];
            }>,
        ) {
            const index = state[action.payload.obj].filters.category.findIndex(
                category => action.payload.category.value === category.value,
            );

            if (index < 0) {
                state[action.payload.obj].filters.category = [
                    ...state[action.payload.obj].filters.category,
                    action.payload.category,
                ];
            } else {
                state[action.payload.obj].filters.category = [
                    ...state[action.payload.obj].filters.category.slice(
                        0,
                        index,
                    ),
                    ...state[action.payload.obj].filters.category.slice(
                        index + 1,
                    ),
                ];
            }
        },
        toggleColor(
            state,
            action: PayloadAction<{
                obj: 'unsaved' | 'deleted';
                color: (typeof COLOR_OPTIONS)[number];
            }>,
        ) {
            const index = state[action.payload.obj].filters.color.findIndex(
                color => action.payload.color.value === color.value,
            );

            if (index < 0) {
                state[action.payload.obj].filters.color = [
                    ...state[action.payload.obj].filters.color,
                    action.payload.color,
                ];
            } else {
                state[action.payload.obj].filters.color = [
                    ...state[action.payload.obj].filters.color.slice(0, index),
                    ...state[action.payload.obj].filters.color.slice(index + 1),
                ];
            }
        },
        updateSearchFilter(
            state,
            action: PayloadAction<{
                obj: 'unsaved' | 'deleted';
                pl: string;
            }>,
        ) {
            state[action.payload.obj].filters.searchText = action.payload.pl;
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
            })
            .addCase(loadDeletedProducts.pending, state => {
                state.deleted.isLoading = true;
            })
            .addCase(loadDeletedProducts.fulfilled, (state, action) => {
                state.deleted.products = action.payload;
                state.deleted.isLoading = false;
                state.deleted.isLoadingMore = false;
                state.deleted.moreToLoad = false;
            })
            .addCase(deleteProduct.pending, (state, action) => {
                // Slice from unsaved if they are the same.
                if (state.unsaved.products[0]?.id === action.meta.arg) {
                    state.unsaved.products = state.unsaved.products.slice(1);
                }

                // // Unshift into saved if not saved from API response, and not already in our array (to avoid duplicates).
                // if (
                //     !action.meta.arg.deleted &&
                //     !alreadyExists(action.meta.arg._id, state.deleted.products)
                // ) {
                //     state.deleted.products.unshift({
                //         ...action.meta.arg,
                //         saved: false,
                //         deleted: true,
                //     });

                //     // Ensure we don't overload on memory by only storing DELETED_STORED_PRODUCTS_AMOUNT of products.
                //     if (
                //         state.deleted.products.length >
                //         DELETED_STORED_PRODUCTS_AMOUNT
                //     ) {
                //         state.deleted.products = state.deleted.products.slice(
                //             0,
                //             DELETED_STORED_PRODUCTS_AMOUNT,
                //         );

                //         state.deleted.moreToLoad = true;
                //     }
                // }

                // if (action.meta.arg.saved) {
                //     state.saved.products = state.saved.products.filter(
                //         p => p._id !== action.meta.arg._id,
                //     );
                // }
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
} = productSlice.actions;
export default productSlice.reducer;
