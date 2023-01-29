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
    MAX_LOCAL_DELETED_PRODUCTS,
    MAX_LOCAL_SAVED_PRODUCTS,
    SAVED_STORED_PRODUCTS_AMOUNT,
} from '@/constants';
import {alreadyExists, buildInitWithFilters, filtersApplied} from '@/services';

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
        filters: {
            gender: [] as string[],
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
            gender: [] as string[],
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
            gender: [] as string[],
            category: [] as string[],
            color: [] as string[],
            searchText: '',
        },
    },
    animation: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
    action: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
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

            if (input.filtered) {
                init = buildInitWithFilters(
                    init,
                    'unsaved',
                    state.product.unsaved.filters,
                );
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
            const excludedSaved = state.product.unsaved.filters.excludeSaved
                ? JSON.parse(
                      (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) ||
                          '[]',
                  )
                : [];

            const excludedDeleted = state.product.unsaved.filters.excludeDeleted
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
                        filteredGenders: state.product.unsaved.filters.gender,
                        filteredCategories:
                            state.product.unsaved.filters.category,
                        filteredColors: state.product.unsaved.filters.color,
                        loadAmount: 5,
                        query: state.product.unsaved.filters.searchText,
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
            let currentSavedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );

            let currentDeletedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );

            // Remove from deleted if there.
            let deletedIndex = currentDeletedProducts.findIndex(
                i => i === p._id,
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
            if (currentSavedProducts.includes(p._id)) {
                return;
            }

            currentSavedProducts.unshift(p._id);

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
            let currentDeletedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );

            let currentSavedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );

            // Remove from saved if there.
            let savedIndex = currentSavedProducts.findIndex(i => i === p._id);
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
            if (currentDeletedProducts.includes(p._id)) {
                return;
            }

            currentDeletedProducts.unshift(p._id);

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
        }
    },
);

export const DELETE_SAVED_PRODUCT = createAsyncThunk<void, ProductType>(
    'product/DELETE_SAVED_PRODUCT',
    async (product, {getState}) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            await deleteSaveOrDelete({
                productId: product._id,
                init: {queryStringParameters: {type: 'save'}},
            });
        } else {
            let currentSavedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );

            const index = currentSavedProducts.findIndex(
                p => p === product._id,
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
        }
    },
);

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

            if (input.filtered) {
                init = buildInitWithFilters(
                    init,
                    'saved',
                    state.product.saved.filters,
                );
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
            const productIds: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );

            try {
                const products = await getPublicProduct({
                    init: {
                        body: {
                            products: productIds,
                            filteredGenders: state.product.saved.filters.gender,
                            filteredCategories:
                                state.product.saved.filters.category,
                            filteredColors: state.product.saved.filters.color,
                            query: state.product.saved.filters.searchText,
                        },
                    },
                    type: 'saved',
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

            if (input.filtered) {
                init = buildInitWithFilters(
                    init,
                    'deleted',
                    state.product.deleted.filters,
                );
            }

            try {
                return await queryProduct({
                    init,
                });
            } catch (err: any) {
                return rejectWithValue({
                    message: err?.message || undefined,
                    code: err?.response?.status || undefined,
                });
            }
        } else {
            const productIds: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );

            try {
                const products = await getPublicProduct({
                    init: {
                        body: {
                            products: productIds,
                            filteredGenders:
                                state.product.deleted.filters.gender,
                            filteredCategories:
                                state.product.deleted.filters.category,
                            filteredColors: state.product.deleted.filters.color,
                            query: state.product.deleted.filters.searchText,
                        },
                    },
                    type: 'deleted',
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

export const DELETE_DELETED_PRODUCT = createAsyncThunk<void, ProductType>(
    'product/DELETE_DELETED_PRODUCT',
    async (product, {getState}) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            await deleteSaveOrDelete({
                productId: product._id,
                init: {queryStringParameters: {type: 'delete'}},
            });
        } else {
            let currentDeletedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_DELETED_PRODUCTS)) ||
                    '[]',
            );

            const index = currentDeletedProducts.findIndex(
                p => p === product._id,
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
        }
    },
);

export const DELETE_ALL_DELETED_PRODUCTS = createAsyncThunk<void, undefined>(
    'product/DELETE_ALL_DELETED_PRODUCTS',
    async (_, {getState}) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            await deleteAllDeletes({
                init: {queryStringParameters: {deleteAll: 'true'}},
            });
        } else {
            await AsyncStorage.setItem(LOCAL_KEY_DELETED_PRODUCTS, '[]');
        }
    },
);

// Async thunk in order to get access to gender in user slice.
export const CLEAR_FILTERS = createAsyncThunk<
    string,
    {obj: 'saved' | 'unsaved' | 'deleted'}
>('product/CLEAR_FILTERS', async (_, {getState}) => {
    const state = getState() as RootState;
    const g = state.user.docData?.gender;

    if (g === 'male') {
        return 'Male';
    } else if (g === 'female') {
        return 'Female';
    }

    return '';
});

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
                obj: 'unsaved' | 'saved' | 'deleted';
            }>,
        ) {
            // Push to relevant filter if exists, other wise exclude it.
            if (action.payload.type === 'gender') {
                if (
                    !state[action.payload.obj].filters.gender.includes(
                        action.payload.item,
                    )
                ) {
                    state[action.payload.obj].filters.gender = [
                        ...state[action.payload.obj].filters.gender,
                        action.payload.item,
                    ];
                } else {
                    state[action.payload.obj].filters.gender = state[
                        action.payload.obj
                    ].filters.gender.filter(i => i !== action.payload.item);
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
        UPDATE_SEARCH_FILTER(
            state,
            action: PayloadAction<{
                obj: 'saved' | 'unsaved' | 'deleted';
                pl: string;
            }>,
        ) {
            state[action.payload.obj].filters.searchText = action.payload.pl;
        },
        TOGGLE_EXCLUDE(state, action: PayloadAction<'deleted' | 'saved'>) {
            if (action.payload === 'saved') {
                state.unsaved.filters.excludeSaved =
                    !state.unsaved.filters.excludeSaved;
            } else if (action.payload === 'deleted') {
                state.unsaved.filters.excludeDeleted =
                    !state.unsaved.filters.excludeDeleted;
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
        RESET_PRODUCT_SLICE(state) {
            state.saved = {
                products: [],
                isLoading: false,
                moreToLoad: true,
                isLoadingMore: false,
                filters: {
                    gender: [],
                    category: [],
                    color: [],
                    searchText: '',
                },
            };

            state.unsaved = {
                products: [],
                isLoading: false,
                moreToLoad: true,
                isLoadingMore: false,
                filters: {
                    gender: [],
                    category: [],
                    color: [],
                    searchText: '',
                    excludeDeleted: true,
                    excludeSaved: true,
                },
            };

            state.deleted = {
                products: [],
                isLoading: false,
                moreToLoad: true,
                isLoadingMore: false,
                filters: {
                    gender: [],
                    category: [],
                    color: [],
                    searchText: '',
                },
            };

            state.animation = 'idle';
            state.action = 'idle';
        },
    },
    extraReducers: builder => {
        builder
            .addCase(SAVE_PRODUCT.pending, (state, action) => {
                state.animation = 'idle';
                state.action = 'idle';

                // Slice from unsaved if they are the same.
                if (state.unsaved.products[0]?._id === action.meta.arg._id) {
                    state.unsaved.products = state.unsaved.products.slice(1);
                }

                // Unshift into saved if not saved from API response, and not already in our array (to avoid duplicates), and no filters applied.
                if (
                    !action.meta.arg.saved &&
                    !alreadyExists(action.meta.arg._id, state.saved.products) &&
                    !filtersApplied(state.saved.filters)
                ) {
                    state.saved.products.unshift({
                        ...action.meta.arg,
                        deleted: false,
                        saved: true,
                    });

                    // Ensure we don't overload on memory by only storing SAVED_STORED_PRODUCTS_AMOUNT of products.
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

                // Slice from unsaved if they are the same.
                if (state.unsaved.products[0]?._id === action.meta.arg._id) {
                    state.unsaved.products = state.unsaved.products.slice(1);
                }

                // Unshift into saved if not saved from API response, and not already in our array (to avoid duplicates).
                if (
                    !action.meta.arg.deleted &&
                    !alreadyExists(action.meta.arg._id, state.deleted.products)
                ) {
                    state.deleted.products.unshift({
                        ...action.meta.arg,
                        saved: false,
                        deleted: true,
                    });

                    // Ensure we don't overload on memory by only storing DELETED_STORED_PRODUCTS_AMOUNT of products.
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
                    // Only add to local state if doesn't already exist (to avoid duplicactes).
                    for (let i = 0; i < action.payload.products.length; i++) {
                        if (
                            !alreadyExists(
                                action.payload.products[i]._id,
                                state.unsaved.products,
                            )
                        ) {
                            state.unsaved.products = [
                                ...state.unsaved.products,
                                action.payload.products[i],
                            ];
                        }
                    }
                } else {
                    state.unsaved.products = action.payload.products;
                }

                state.unsaved.isLoading = false;
                state.unsaved.isLoadingMore = false;
                state.unsaved.moreToLoad = action.payload.__moreToLoad;
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
                    // Only add to local state if doesn't already exist (to avoid duplicactes).
                    for (let i = 0; i < action.payload.products.length; i++) {
                        if (
                            !alreadyExists(
                                action.payload.products[i]._id,
                                state.saved.products,
                            )
                        ) {
                            state.saved.products = [
                                ...state.saved.products,
                                action.payload.products[i],
                            ];
                        }
                    }
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
            .addCase(
                LOAD_DELETED_PRODUCTS.rejected,
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
                        state.deleted.products = [];
                    }

                    state.deleted.isLoading = false;
                    state.deleted.isLoadingMore = false;
                    state.deleted.moreToLoad = false;
                },
            )
            .addCase(LOAD_DELETED_PRODUCTS.fulfilled, (state, action) => {
                if (action.meta.arg.loadType === 'more') {
                    // Only add to local state if doesn't already exist (to avoid duplicactes).
                    for (let i = 0; i < action.payload.products.length; i++) {
                        if (
                            !alreadyExists(
                                action.payload.products[i]._id,
                                state.deleted.products,
                            )
                        ) {
                            state.deleted.products = [
                                ...state.deleted.products,
                                action.payload.products[i],
                            ];
                        }
                    }
                } else {
                    state.deleted.products = action.payload.products;
                }

                state.deleted.isLoading = false;
                state.deleted.isLoadingMore = false;
                state.deleted.moreToLoad = action.payload.__moreToLoad;
            })
            .addCase(DELETE_SAVED_PRODUCT.pending, (state, action) => {
                const index = state.saved.products.findIndex(
                    x => x._id === action.meta.arg._id,
                );
                if (index > -1) {
                    state.saved.products = [
                        ...state.saved.products.slice(0, index),
                        ...state.saved.products.slice(index + 1),
                    ];
                }
            })
            .addCase(DELETE_SAVED_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.error('Delete saved product rejected');
            })
            .addCase(DELETE_DELETED_PRODUCT.pending, (state, action) => {
                const index = state.deleted.products.findIndex(
                    x => x._id === action.meta.arg._id,
                );

                if (index > -1) {
                    state.deleted.products = [
                        ...state.deleted.products.slice(0, index),
                        ...state.deleted.products.slice(index + 1),
                    ];
                }
            })
            .addCase(DELETE_DELETED_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.error('Delete deleted product rejected');
            })
            .addCase(DELETE_ALL_DELETED_PRODUCTS.fulfilled, state => {
                state.deleted.products = [];
            })
            .addCase(CLEAR_FILTERS.fulfilled, (state, action) => {
                state[action.meta.arg.obj].filters.category = [];
                state[action.meta.arg.obj].filters.color = [];
                state[action.meta.arg.obj].filters.searchText = '';

                if (action.meta.arg.obj === 'unsaved' && action.payload) {
                    state.unsaved.filters.gender = [action.payload];
                } else {
                    state[action.meta.arg.obj].filters.gender = [];
                }

                if (action.meta.arg.obj === 'unsaved') {
                    state.unsaved.filters.excludeDeleted = true;
                    state.unsaved.filters.excludeSaved = true;
                }
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
    RESET_PRODUCT_SLICE,
} = productSlice.actions;
export default productSlice.reducer;
