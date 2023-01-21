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
import {createSaveOrDelete, deleteSaveOrDelete} from '@/api/save';
import {queryProduct} from '@/api/product';
import {RootState} from '@/store';
import {getPublicProduct, queryPublicProduct} from '@/api/public';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {LOCAL_KEY_SAVED_PRODUCTS} from '@/constants';

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
    animation: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
    action: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
    filters: {
        gender: ['Unisex'] as string[],
        category: [] as string[],
        color: [] as string[],
        searchText: '',
        excludeDeleted: true,
        excludeSaved: true,
    },
});

export const LOAD_UNSAVED_PRODUCTS = createAsyncThunk<
    QueryProductResponse,
    LoadProductsParams
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
        {getState},
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

            return await queryProduct({
                init,
            });
        } else {
            const excludedSaved = state.product.filters.excludeSaved
                ? JSON.parse(
                      (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) ||
                          '[]',
                  )
                : [];

            return await queryPublicProduct({
                init: {
                    body: {
                        excludedProducts: excludedSaved,
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

export const SAVE_PRODUCT = createAsyncThunk<void, string>(
    'product/SAVE_PRODUCT',
    async (_id, {getState}) => {
        const state = getState() as RootState;

        if (!state.user.isGuest) {
            await createSaveOrDelete({
                productId: _id,
                init: {queryStringParameters: {type: 'save'}},
            });
        } else {
            const currentSavedProducts: string[] = JSON.parse(
                (await AsyncStorage.getItem(LOCAL_KEY_SAVED_PRODUCTS)) || '[]',
            );
            currentSavedProducts.push(_id);
            await AsyncStorage.setItem(
                LOCAL_KEY_SAVED_PRODUCTS,
                JSON.stringify(currentSavedProducts),
            );
        }
    },
);

export const DELETE_PRODUCT = createAsyncThunk<void, string>(
    'product/DELETE_PRODUCT',
    async _id => {
        await createSaveOrDelete({
            productId: _id,
            init: {queryStringParameters: {type: 'delete'}},
        });
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

            console.log('PRODUCT IDS:', productIds);

            try {
                const products = await getPublicProduct({
                    init: {
                        body: {products: productIds},
                    },
                });

                console.log('PRODUCTS:', products);

                return {
                    products,
                    __moreToLoad: false,
                    __loaded: products.length,
                    __totalLength: products.length,
                };
            } catch (err: any) {
                console.log('ERROR:', err);
                return rejectWithValue({
                    message: err.message || undefined,
                    code: err?.response?.status || undefined,
                });
            }
        }
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
            .addCase(SAVE_PRODUCT.pending, state => {
                state.animation = 'idle';
                state.unsaved.products = state.unsaved.products.slice(1);
            })
            .addCase(SAVE_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Like product rejected');
            })
            .addCase(DELETE_PRODUCT.pending, state => {
                state.animation = 'idle';
                state.unsaved.products = state.unsaved.products.slice(1);
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
            .addCase(DELETE_SAVED_PRODUCT.pending, (state, action) => {
                state.saved.products = [
                    ...state.saved.products.slice(0, action.meta.arg.index),
                    ...state.saved.products.slice(action.meta.arg.index + 1),
                ];
            })
            .addCase(DELETE_SAVED_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.log('Delete saved product rejected');
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
