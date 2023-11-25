import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {AuthError, PostgrestError} from '@supabase/supabase-js';

import {
    LOCAL_KEY_DELETED_PRODUCTS,
    LOCAL_KEY_SAVED_PRODUCTS,
    MAX_LOCAL_DELETED_PRODUCTS,
    MAX_LOCAL_SAVED_PRODUCTS,
} from '@/constants';
import {alreadyExists, applyProductFilters} from '@/services';
import {supabase} from '@/services/supabase';
import {RootState} from '@/store';
import {Gender} from '@/types';
import {Database} from '@/types/schema';

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
    let query = supabase.from('v_products').select();

    if (state.user.isGuest) {
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
        const {data, error} = await applyProductFilters(query, {
            gender: state.product.unsaved.filters.gender,
            category: state.product.unsaved.filters.category,
            searchText: state.product.unsaved.filters.searchText,
            color: state.product.unsaved.filters.color,
            excludeDeleted: state.product.unsaved.filters.excludeDeleted,
            excludeSaved: state.product.unsaved.filters.excludeSaved,
        });

        if (error) {
            return rejectWithValue(error);
        }

        return data;
    }
});

export const loadSavedProducts = createAsyncThunk<
    Database['public']['Views']['v_products']['Row'][],
    void,
    {rejectValue: PostgrestError}
>('product/loadSavedProducts', async (_, {getState, rejectWithValue}) => {
    const state = getState() as RootState;

    let query = supabase.from('v_products').select();
    query = applyProductFilters(query, state.product.saved.filters);

    if (state.user.isGuest) {
        const savedProducts = JSON.parse(
            (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
        );

        const {data, error} = await query.in('id', savedProducts);

        if (error) {
            return rejectWithValue(error);
        }

        return data;
    } else {
        const {data, error} = await query.eq('saved', true);

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
>('product/loadSavedProducts', async (_, {getState, rejectWithValue}) => {
    const state = getState() as RootState;

    let query = supabase.from('v_products').select();
    query = applyProductFilters(query, state.product.saved.filters);

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

export const saveProduct = createAsyncThunk<
    void,
    number,
    {rejectValue: PostgrestError | AuthError}
>('product/saveProduct', async (productId, {getState, rejectWithValue}) => {
    const state = getState() as RootState;

    if (state.user.isGuest) {
        let currentSavedProducts: string[] = JSON.parse(
            (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
        );

        let currentDeletedProducts: string[] = JSON.parse(
            (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) || '[]',
        );

        // Remove from deleted if there.
        const deletedIndex = currentDeletedProducts.findIndex(
            i => i === productId.toString(),
        );
        if (deletedIndex > -1) {
            currentDeletedProducts = [
                ...currentDeletedProducts.slice(0, deletedIndex),
                ...currentDeletedProducts.slice(deletedIndex + 1),
            ];

            await AsyncStorage.setItem(
                LOCAL_KEY_DELETED_PRODUCTS,
                JSON.stringify(currentDeletedProducts),
            );
        }

        // Add to saved if not there already.
        if (currentSavedProducts.includes(productId.toString())) {
            return;
        }

        currentSavedProducts.unshift(productId.toString());

        if (currentSavedProducts.length > MAX_LOCAL_SAVED_PRODUCTS) {
            currentSavedProducts = currentSavedProducts.slice(
                0,
                MAX_LOCAL_SAVED_PRODUCTS,
            );

            // TODO: Display warning to user announcing they have gone over their deleted amount
        }

        await AsyncStorage.setItem(
            LOCAL_KEY_SAVED_PRODUCTS,
            JSON.stringify(currentSavedProducts),
        );
    } else {
        const {data: userData, error: userError} =
            await supabase.auth.getUser();

        if (userError) {
            return rejectWithValue(userError);
        }

        const {error} = await supabase
            .from('saves')
            .insert({product_id: productId, user_id: userData.user.id});

        if (error) {
            return rejectWithValue(error);
        }
    }
});

export const deleteSavedProduct = createAsyncThunk<
    void,
    number,
    {rejectValue: PostgrestError | AuthError}
>(
    'product/deleteSavedProduct',
    async (productId, {getState, rejectWithValue}) => {
        const state = getState() as RootState;

        if (state.user.isGuest) {
            let currentSavedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );

            const index = currentSavedProducts.findIndex(
                p => p === productId.toString(),
            );

            if (index > -1) {
                currentSavedProducts = [
                    ...currentSavedProducts.slice(0, index),
                    ...currentSavedProducts.slice(index + 1),
                ];

                await AsyncStorage.setItem(
                    LOCAL_KEY_SAVED_PRODUCTS,
                    JSON.stringify(currentSavedProducts),
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
                .from('saves')
                .delete()
                .eq('product_id', productId)
                .eq('user_id', userData.user.id);

            if (error) {
                return rejectWithValue(error);
            }
        }
    },
);

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
        buyProduct(state) {
            state.animation = 'idle';
        },
        clearFilters(
            state,
            action: PayloadAction<{
                filterType: 'saved' | 'unsaved' | 'deleted';
                gender: Gender;
            }>,
        ) {
            if (action.payload.filterType === 'saved') {
                state.saved.filters.category = [];
                state.saved.filters.color = [];
                state.saved.filters.searchText = '';
                state.saved.filters.gender = action.payload.gender;
            } else if (action.payload.filterType === 'unsaved') {
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
        commenceAnimate(state, action: PayloadAction<AnimationState>) {
            state.animation = action.payload;
            state.action = action.payload;
        },
        setAction(state, action: PayloadAction<AnimationState>) {
            state.action = action.payload;
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
        toggleFilter(
            state,
            action: PayloadAction<{
                item: string;
                type: 'gender' | 'category' | 'color';
                obj: 'unsaved' | 'saved' | 'deleted';
            }>,
        ) {
            // Push to relevant filter if exists, other wise exclude it.
            if (action.payload.type === 'gender') {
                // TODO: Better typechecking for gender
                if (
                    action.payload.item === 'male' ||
                    action.payload.item === 'female' ||
                    action.payload.item === 'both'
                ) {
                    state[action.payload.obj].filters.gender =
                        action.payload.item;
                }
            } else if (action.payload.type === 'category') {
                if (
                    !state[action.payload.obj].filters.category.includes(
                        action.payload.item,
                    )
                ) {
                    state[action.payload.obj].filters.category = [
                        ...state[action.payload.obj].filters.category,
                        action.payload.item,
                    ];
                } else {
                    state[action.payload.obj].filters.category = state[
                        action.payload.obj
                    ].filters.category.filter(i => i !== action.payload.item);
                }
            } else if (action.payload.type === 'color') {
                if (
                    !state[action.payload.obj].filters.color.includes(
                        action.payload.item,
                    )
                ) {
                    state[action.payload.obj].filters.color = [
                        ...state[action.payload.obj].filters.color,
                        action.payload.item,
                    ];
                } else {
                    state[action.payload.obj].filters.color = state[
                        action.payload.obj
                    ].filters.color.filter(i => i !== action.payload.item);
                }
            }
        },
        updateSearchFilter(
            state,
            action: PayloadAction<{
                obj: 'saved' | 'unsaved' | 'deleted';
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
                console.log('LOADED', action.payload);

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
            .addCase(loadUnsavedProducts.rejected, (state, {meta, payload}) => {
                console.error('error loading', payload, meta);
            });
    },
});

export const {
    buyProduct,
    clearFilters,
    commenceAnimate,
    setAction,
    toggleExclude,
    toggleFilter,
    updateSearchFilter,
} = productSlice.actions;
export default productSlice.reducer;
