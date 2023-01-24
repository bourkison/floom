import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {
    Product as ProductType,
    QueryProductInit,
    QueryProductResponse,
} from '@/types/product';
import {
    createSaveOrDelete,
    deleteAllDeletes,
    deleteSaveOrDelete,
} from '@/api/save';
import {queryProduct} from '@/api/product';
import {RootState} from '@/store';
import {getPublicProduct, queryPublicProduct} from '@/api/public';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
    DELETED_STORED_PRODUCTS_AMOUNT,
    LOCAL_KEY_DELETED_PRODUCTS,
    LOCAL_KEY_SAVED_PRODUCTS,
    SAVED_STORED_PRODUCTS_AMOUNT,
} from '@/constants';

const productAdapter = createEntityAdapter();

type LoadProductsParams = {
    queryStringParameters: QueryProductInit['queryStringParameters'];
    loadType: 'initial' | 'refresh' | 'more';
    filtered?: boolean;
};

const initialState = productAdapter.getInitialState({
    saved: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
    },
    unsaved: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
    },
    deleted: {
        products: [] as ProductType[],
        isLoading: false,
        moreToLoad: true,
        isLoadingMore: false,
    },
    animation: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
    action: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
    filters: {
        gender: [] as string[],
        category: [] as string[],
        color: [] as string[],
        searchText: '',
        excludeDeleted: true,
        excludeSaved: true,
    },
});

export const LOAD_UNSAVED_PRODUCTS = createAsyncThunk<
    QueryProductResponse,
    LoadProductsParams,
    {rejectValue: RejectWithValueType}
>(
    'product/LOAD_UNSAVED_PRODUCTS',
    async (
        input = {
            queryStringParameters: {
                loadAmount: 10,
                type: 'unsaved',
            },
            loadType: 'initial',
            filtered: true,
        },
        {getState, rejectWithValue},
    ) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            let init: QueryProductInit = {
                queryStringParameters: input.queryStringParameters,
            };

            // Set filters in the request.
            if (input.filtered) {
                init.queryStringParameters = init.queryStringParameters || {
                    loadAmount: 10,
                    type: 'unsaved',
                };

                init.queryStringParameters.excludeDeleted =
                    state.product.filters.excludeDeleted;
                init.queryStringParameters.excludeSaved =
                    state.product.filters.excludeSaved;

                // If not excluding deleted or saved, order products to avoid duplication.
                if (
                    !state.product.filters.excludeDeleted ||
                    !state.product.filters.excludeSaved
                ) {
                    init.queryStringParameters.ordered = true;
                }

                if (state.product.filters.gender.length) {
                    init.queryStringParameters = {
                        ...init.queryStringParameters,
                        filteredGenders: state.product.filters.gender.join(','),
                    };
                }

                if (state.product.filters.color.length) {
                    init.queryStringParameters = {
                        ...init.queryStringParameters,
                        filteredColors: state.product.filters.color.join(','),
                    };
                }

                if (state.product.filters.category.length) {
                    init.queryStringParameters = {
                        ...init.queryStringParameters,
                        filteredCategories:
                            state.product.filters.category.join(','),
                    };
                }

                if (state.product.filters.searchText) {
                    init.queryStringParameters = {
                        ...init.queryStringParameters,
                        query: state.product.filters.searchText,
                    };
                }
            }

            try {
                return await queryProduct({
                    init,
                });
            } catch (err: any) {
                return rejectWithValue({
                    message: err.message || undefined,
                    code: err?.response?.status || undefined,
                });
            }
        } else {
            const excludedSaved = state.product.filters.excludeSaved
                ? JSON.parse(
                      (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) ||
                          '[]',
                  )
                : [];

            const excludedDeleted = state.product.filters.excludeDeleted
                ? JSON.parse(
                      (await AsyncStorage.getItem(
                          LOCAL_KEY_DELETED_PRODUCTS,
                      )) || '[]',
                  )
                : [];

            const productsToExclude = [...excludedSaved, ...excludedDeleted];

            return await queryPublicProduct({
                init: {
                    body: {
                        excludedProducts: productsToExclude,
                        filteredGenders: [],
                        filteredCategories: [],
                        filteredColors: [],
                        loadAmount: 5,
                    },
                },
            });
        }
    },
);

export const SAVE_PRODUCT = createAsyncThunk<void, ProductType>(
    'product/SAVE_PRODUCT',
    async (p, {getState}) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            await createSaveOrDelete({
                productId: p._id,
                init: {queryStringParameters: {type: 'save'}},
            });
        } else {
            const currentSavedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );
            currentSavedProducts.push(p._id);
            await AsyncStorage.setItem(
                LOCAL_KEY_SAVED_PRODUCTS,
                JSON.stringify(currentSavedProducts),
            );
        }
    },
);

export const DELETE_PRODUCT = createAsyncThunk<void, ProductType>(
    'product/DELETE_PRODUCT',
    async (p, {getState}) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            await createSaveOrDelete({
                productId: p._id,
                init: {queryStringParameters: {type: 'delete'}},
            });
        } else {
            const currentDeletedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );
            currentDeletedProducts.push(p._id);
            await AsyncStorage.setItem(
                LOCAL_KEY_DELETED_PRODUCTS,
                JSON.stringify(currentDeletedProducts),
            );
        }
    },
);

export const DELETE_SAVED_PRODUCT = createAsyncThunk<
    void,
    {_id: string; index: number}
>('product/DELETE_SAVED_PRODUCT', async input => {
    await deleteSaveOrDelete({
        productId: input._id,
        init: {queryStringParameters: {type: 'save'}},
    });
});

type RejectWithValueType = {
    message?: string;
    code?: number;
};

export const LOAD_SAVED_PRODUCTS = createAsyncThunk<
    QueryProductResponse,
    LoadProductsParams,
    {rejectValue: RejectWithValueType}
>(
    'product/LOAD_SAVED_PRODUCTS',
    async (
        input = {
            queryStringParameters: {
                loadAmount: 25,
                type: 'saved',
            },
            loadType: 'initial',
        },
        {rejectWithValue, getState},
    ) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            let init: QueryProductInit = {
                queryStringParameters: input.queryStringParameters,
            };

            try {
                return await queryProduct({
                    init,
                });
            } catch (err: any) {
                return rejectWithValue({
                    message: err.message || undefined,
                    code: err?.response?.status || undefined,
                });
            }
        } else {
            const productIds: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );

            try {
                const products = await getPublicProduct({
                    init: {
                        body: {products: productIds},
                    },
                });

                return {
                    products,
                    __moreToLoad: false,
                    __loaded: products.length,
                    __totalLength: products.length,
                };
            } catch (err: any) {
                return rejectWithValue({
                    message: err.message || undefined,
                    code: err?.response?.status || undefined,
                });
            }
        }
    },
);

export const LOAD_DELETED_PRODUCTS = createAsyncThunk<
    QueryProductResponse,
    LoadProductsParams,
    {rejectValue: RejectWithValueType}
>(
    'product/LOAD_DELETED_PRODUCTS',
    async (
        input = {
            queryStringParameters: {
                loadAmount: 25,
                type: 'deleted',
            },
            loadType: 'initial',
        },
        {rejectWithValue, getState},
    ) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            let init: QueryProductInit = {
                queryStringParameters: input.queryStringParameters,
            };

            return await queryProduct({
                init,
            });
        } else {
            const productIds: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );

            try {
                const products = await getPublicProduct({
                    init: {
                        body: {products: productIds},
                    },
                });

                return {
                    products,
                    __moreToLoad: false,
                    __loaded: products.length,
                    __totalLength: products.length,
                };
            } catch (err: any) {
                return rejectWithValue({
                    message: err.message || undefined,
                    code: err?.response?.status || undefined,
                });
            }
        }
    },
);

export const DELETE_DELETED_PRODUCT = createAsyncThunk<
    void,
    {_id: string; index: number}
>('product/DELETE_DELETED_PRODUCT', async input => {
    await deleteSaveOrDelete({
        productId: input._id,
        init: {queryStringParameters: {type: 'delete'}},
    });
});

export const DELETE_ALL_DELETED_PRODUCTS = createAsyncThunk<void, undefined>(
    'product/DELETE_ALL_DELETED_PRODUCTS',
    async () => {
        await deleteAllDeletes({
            init: {queryStringParameters: {deleteAll: 'true'}},
        });
    },
);

// Async thunk in order to get access to gender in user slice.
export const CLEAR_FILTERS = createAsyncThunk<string, undefined>(
    'product/CLEAR_FILTERS',
    async (_, {getState}) => {
        const state = getState() as RootState;
        const g = state.user.docData?.gender;

        if (g === 'male') {
            return 'Male';
        } else if (g === 'female') {
            return 'Female';
        }

        return '';
    },
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        COMMENCE_ANIMATE(
            state,
            action: PayloadAction<'idle' | 'save' | 'buy' | 'delete'>,
        ) {
            state.animation = action.payload;
            state.action = action.payload;
        },
        TOGGLE_FILTER(
            state,
            action: PayloadAction<{
                item: string;
                type: 'gender' | 'category' | 'color';
            }>,
        ) {
            // Push to relevant filter if exists, other wise exclude it.
            if (action.payload.type === 'gender') {
                if (!state.filters.gender.includes(action.payload.item)) {
                    state.filters.gender = [
                        ...state.filters.gender,
                        action.payload.item,
                    ];
                } else {
                    state.filters.gender = state.filters.gender.filter(
                        i => i !== action.payload.item,
                    );
                }
            } else if (action.payload.type === 'category') {
                if (!state.filters.category.includes(action.payload.item)) {
                    state.filters.category = [
                        ...state.filters.category,
                        action.payload.item,
                    ];
                } else {
                    state.filters.category = state.filters.category.filter(
                        i => i !== action.payload.item,
                    );
                }
            } else if (action.payload.type === 'color') {
                if (!state.filters.color.includes(action.payload.item)) {
                    state.filters.color = [
                        ...state.filters.color,
                        action.payload.item,
                    ];
                } else {
                    state.filters.color = state.filters.color.filter(
                        i => i !== action.payload.item,
                    );
                }
            }
        },
        UPDATE_SEARCH_FILTER(state, action: PayloadAction<string>) {
            console.log('Slice:', action.payload);
            state.filters.searchText = action.payload;
        },
        TOGGLE_EXCLUDE(state, action: PayloadAction<'deleted' | 'saved'>) {
            if (action.payload === 'saved') {
                state.filters.excludeSaved = !state.filters.excludeSaved;
            } else if (action.payload === 'deleted') {
                state.filters.excludeDeleted = !state.filters.excludeDeleted;
            }
        },
        BUY_PRODUCT(state) {
            state.animation = 'idle';
        },
        SET_ACTION(
            state,
            action: PayloadAction<'idle' | 'save' | 'buy' | 'delete'>,
        ) {
            state.action = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(SAVE_PRODUCT.pending, (state, action) => {
                state.animation = 'idle';
                state.unsaved.products = state.unsaved.products.slice(1);

                if (!action.meta.arg.saved) {
                    state.saved.products.unshift({
                        ...action.meta.arg,
                        deleted: false,
                        saved: true,
                    });

                    if (
                        state.saved.products.length >
                        SAVED_STORED_PRODUCTS_AMOUNT
                    ) {
                        state.saved.products = state.saved.products.slice(
                            0,
                            SAVED_STORED_PRODUCTS_AMOUNT,
                        );
                        state.saved.moreToLoad = true;
                    }
                }

                if (action.meta.arg.deleted) {
                    state.deleted.products = state.deleted.products.filter(
                        p => p._id !== action.meta.arg._id,
                    );
                }
            })
            .addCase(SAVE_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Like product rejected');
            })
            .addCase(DELETE_PRODUCT.pending, (state, action) => {
                state.animation = 'idle';
                state.unsaved.products = state.unsaved.products.slice(1);
                state.deleted.products.unshift({
                    ...action.meta.arg,
                    saved: false,
                    deleted: true,
                });

                if (!action.meta.arg.deleted) {
                    if (
                        state.deleted.products.length >
                        DELETED_STORED_PRODUCTS_AMOUNT
                    ) {
                        state.deleted.products = state.deleted.products.slice(
                            0,
                            DELETED_STORED_PRODUCTS_AMOUNT,
                        );

                        state.deleted.moreToLoad = true;
                    }
                }

                if (action.meta.arg.saved) {
                    state.saved.products = state.saved.products.filter(
                        p => p._id !== action.meta.arg._id,
                    );
                }
            })
            .addCase(DELETE_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Delete product rejected');
            })
            .addCase(LOAD_UNSAVED_PRODUCTS.pending, (state, action) => {
                if (action.meta.arg.loadType === 'initial') {
                    state.unsaved.isLoading = true;
                } else if (action.meta.arg.loadType === 'more') {
                    state.unsaved.isLoadingMore = true;
                }
            })
            .addCase(LOAD_UNSAVED_PRODUCTS.fulfilled, (state, action) => {
                if (action.meta.arg.loadType === 'more') {
                    state.unsaved.products = [
                        ...state.unsaved.products,
                        ...action.payload.products,
                    ];
                } else {
                    state.unsaved.products = action.payload.products;
                }

                state.unsaved.isLoading = false;
                state.unsaved.isLoadingMore = false;
                state.unsaved.moreToLoad = action.payload.__moreToLoad;
                console.log(state.unsaved.moreToLoad);
            })
            .addCase(
                LOAD_UNSAVED_PRODUCTS.rejected,
                (state, {meta, payload}) => {
                    // TODO: Handle rejections.
                    // If initial load or refresh and 404
                    if (
                        (meta.arg.loadType === 'initial' ||
                            meta.arg.loadType === 'refresh') &&
                        meta.rejectedWithValue &&
                        payload &&
                        payload.code &&
                        payload.code === 404
                    ) {
                        state.unsaved.products = [];
                    }

                    state.unsaved.isLoading = false;
                    state.unsaved.isLoadingMore = false;
                    state.unsaved.moreToLoad = false;
                },
            )
            .addCase(LOAD_SAVED_PRODUCTS.pending, (state, action) => {
                if (action.meta.arg.loadType === 'initial') {
                    state.saved.isLoading = true;
                } else if (action.meta.arg.loadType === 'more') {
                    state.saved.isLoadingMore = true;
                }
            })
            .addCase(LOAD_SAVED_PRODUCTS.fulfilled, (state, action) => {
                if (action.meta.arg.loadType === 'more') {
                    state.saved.products = [
                        ...state.saved.products,
                        ...action.payload.products,
                    ];
                } else {
                    state.saved.products = action.payload.products;
                }

                state.saved.isLoading = false;
                state.saved.isLoadingMore = false;
                state.saved.moreToLoad = action.payload.__moreToLoad;
            })
            .addCase(LOAD_SAVED_PRODUCTS.rejected, (state, {meta, payload}) => {
                // TODO: Handle rejections.
                // If initial load or refresh and 404
                if (
                    (meta.arg.loadType === 'initial' ||
                        meta.arg.loadType === 'refresh') &&
                    meta.rejectedWithValue &&
                    payload &&
                    payload.code &&
                    payload.code === 404
                ) {
                    state.saved.products = [];
                }

                state.saved.isLoading = false;
                state.saved.isLoadingMore = false;
                state.saved.moreToLoad = false;
            })
            .addCase(LOAD_DELETED_PRODUCTS.pending, (state, action) => {
                if (action.meta.arg.loadType === 'initial') {
                    state.deleted.isLoading = true;
                } else if (action.meta.arg.loadType === 'more') {
                    state.deleted.isLoadingMore = true;
                }
            })
            .addCase(LOAD_DELETED_PRODUCTS.fulfilled, (state, action) => {
                if (action.meta.arg.loadType === 'more') {
                    state.deleted.products = [
                        ...state.deleted.products,
                        ...action.payload.products,
                    ];
                } else {
                    state.deleted.products = action.payload.products;
                }

                state.deleted.isLoading = false;
                state.deleted.isLoadingMore = false;
                state.deleted.moreToLoad = action.payload.__moreToLoad;
            })
            .addCase(DELETE_SAVED_PRODUCT.pending, (state, action) => {
                state.saved.products = [
                    ...state.saved.products.slice(0, action.meta.arg.index),
                    ...state.saved.products.slice(action.meta.arg.index + 1),
                ];
            })
            .addCase(DELETE_SAVED_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.log('Delete saved product rejected');
            })
            .addCase(DELETE_DELETED_PRODUCT.pending, (state, action) => {
                state.deleted.products = [
                    ...state.deleted.products.slice(0, action.meta.arg.index),
                    ...state.deleted.products.slice(action.meta.arg.index + 1),
                ];
            })
            .addCase(DELETE_DELETED_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.log('Delete deleted product rejected');
            })
            .addCase(DELETE_ALL_DELETED_PRODUCTS.pending, () => {
                console.log('Deleting all products');
            })
            .addCase(DELETE_ALL_DELETED_PRODUCTS.fulfilled, state => {
                state.deleted.products = [];
            })
            .addCase(CLEAR_FILTERS.fulfilled, (state, action) => {
                state.filters.gender = action.payload ? [action.payload] : [];
                state.filters.category = [];
                state.filters.color = [];
                state.filters.searchText = '';
                state.filters.excludeDeleted = true;
                state.filters.excludeSaved = true;

                console.log('FILTERS:', state.filters);
            });
    },
});

export const {
    COMMENCE_ANIMATE,
    TOGGLE_FILTER,
    TOGGLE_EXCLUDE,
    UPDATE_SEARCH_FILTER,
    BUY_PRODUCT,
    SET_ACTION,
} = productSlice.actions;
export default productSlice.reducer;
