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

const productAdapter = createEntityAdapter();

type LoadProductsParams = {
    queryStringParameters: QueryProductInit['queryStringParameters'];
    initialLoad: boolean;
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
    LoadProductsParams
>(
    'product/LOAD_UNSAVED_PRODUCTS',
    async (
        input = {
            queryStringParameters: {
                loadAmount: 10,
                type: 'unsaved',
            },
            initialLoad: true,
        },
    ) => {
        let init: QueryProductInit = {
            queryStringParameters: input.queryStringParameters,
        };

        return await queryProduct({
            init,
        });
    },
);

export const SAVE_PRODUCT = createAsyncThunk<void, string>(
    'product/SAVE_PRODUCT',
    async _id => {
        await createSaveOrDelete({
            productId: _id,
            init: {queryStringParameters: {type: 'save'}},
        });
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

export const LOAD_SAVED_PRODUCTS = createAsyncThunk<
    QueryProductResponse,
    LoadProductsParams
>(
    'product/LOAD_SAVED_PRODUCTS',
    async (
        input = {
            queryStringParameters: {
                loadAmount: 25,
                type: 'saved',
            },
            initialLoad: true,
        },
    ) => {
        let init: QueryProductInit = {
            queryStringParameters: input.queryStringParameters,
        };

        return await queryProduct({
            init,
        });
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
                if (action.meta.arg.initialLoad) {
                    state.unsaved.isLoading = true;
                } else {
                    state.unsaved.isLoadingMore = true;
                }
            })
            .addCase(LOAD_UNSAVED_PRODUCTS.fulfilled, (state, action) => {
                state.unsaved.products = [
                    ...state.unsaved.products,
                    ...action.payload.products,
                ];
                state.unsaved.isLoading = false;
                state.unsaved.isLoadingMore = false;
                state.unsaved.moreToLoad = action.payload.__moreToLoad;
            })
            .addCase(LOAD_SAVED_PRODUCTS.pending, (state, action) => {
                if (action.meta.arg.initialLoad) {
                    state.saved.isLoading = true;
                } else {
                    state.saved.isLoadingMore = true;
                }
            })
            .addCase(LOAD_SAVED_PRODUCTS.fulfilled, (state, action) => {
                state.saved.products = [
                    ...state.saved.products,
                    ...action.payload.products,
                ];
                state.saved.isLoading = false;
                state.saved.isLoadingMore = false;
                state.saved.moreToLoad = action.payload.__moreToLoad;
            })
            .addCase(LOAD_SAVED_PRODUCTS.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Get product rejected');
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

export const {COMMENCE_ANIMATE, TOGGLE_FILTER, TOGGLE_EXCLUDE, BUY_PRODUCT} =
    productSlice.actions;
export default productSlice.reducer;
