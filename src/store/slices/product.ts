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

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    products: [] as ProductType[],
    savedProducts: [] as ProductType[],
    moreSavedToLoad: true,
    animation: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
});

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
    QueryProductInit['queryStringParameters']
>(
    'product/LOAD_SAVED_PRODUCTS',
    async (
        input = {
            loadAmount: 5,
            type: 'saved',
        },
    ) => {
        let init: QueryProductInit = {
            queryStringParameters: input,
        };

        return await queryProduct({
            init,
        });
    },
);

export const LOAD_MORE_SAVED_PRODUCTS = createAsyncThunk<
    QueryProductResponse,
    QueryProductInit['queryStringParameters'],
    {state: RootState}
>(
    'product/LOAD_MORE_SAVED_PRODUCTS',
    async (
        input = {
            loadAmount: 5,
            type: 'saved',
        },
        {getState},
    ) => {
        let init: QueryProductInit = {
            queryStringParameters: input,
        };

        if (!input.startAt) {
            const state = getState();
            input.startAt =
                state.product.savedProducts[
                    state.product.savedProducts.length - 1
                ]._id;
        }

        return await queryProduct({
            init,
        });
    },
);

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        PUSH_PRODUCTS(state, action: PayloadAction<ProductType[]>) {
            state.products = [...state.products, ...action.payload];
        },
        COMMENCE_ANIMATE(
            state,
            action: PayloadAction<'idle' | 'save' | 'buy' | 'delete'>,
        ) {
            state.animation = action.payload;
        },
    },
    extraReducers: builder => {
        builder
            .addCase(SAVE_PRODUCT.pending, state => {
                state.animation = 'idle';
                state.products = state.products.slice(1);
            })
            .addCase(SAVE_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Like product rejected');
            })
            .addCase(DELETE_PRODUCT.pending, state => {
                state.animation = 'idle';
                state.products = state.products.slice(1);
            })
            .addCase(DELETE_PRODUCT.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Delete product rejected');
            })
            .addCase(LOAD_SAVED_PRODUCTS.fulfilled, (state, action) => {
                console.log(
                    'LOADING SAVED PRODUCTS:',
                    action.payload.products.length,
                    action.payload.__moreToLoad,
                );
                state.savedProducts = action.payload.products;
                state.moreSavedToLoad = action.payload.__moreToLoad;
            })
            .addCase(LOAD_SAVED_PRODUCTS.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Get product rejected');
            })
            .addCase(LOAD_MORE_SAVED_PRODUCTS.fulfilled, (state, action) => {
                state.savedProducts = [
                    ...state.savedProducts,
                    ...action.payload.products,
                ];
                state.moreSavedToLoad = action.payload.__moreToLoad;
            })
            .addCase(LOAD_MORE_SAVED_PRODUCTS.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Load more saved rejected');
            })
            .addCase(DELETE_SAVED_PRODUCT.pending, (state, action) => {
                state.savedProducts = [
                    ...state.savedProducts.slice(0, action.meta.arg.index),
                    ...state.savedProducts.slice(action.meta.arg.index + 1),
                ];
            })
            .addCase(DELETE_SAVED_PRODUCT.fulfilled, state => {
                console.log('Deleted saved product');
            })
            .addCase(DELETE_SAVED_PRODUCT.rejected, state => {
                // TODO: Handle rejections.
                console.log('Delete saved product rejected');
            });
    },
});

export const {PUSH_PRODUCTS, COMMENCE_ANIMATE} = productSlice.actions;
export default productSlice.reducer;
