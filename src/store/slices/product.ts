import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {Product as ProductType} from '@/types/product';
import {createSaveOrDelete, deleteSaveOrDelete} from '@/api/save';
import {getProduct, queryProduct} from '@/api/product';

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    products: [] as ProductType[],
    savedProducts: [] as ProductType[],
    animation: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
});

export const SAVE_PRODUCT = createAsyncThunk(
    'product/SAVE_PRODUCT',
    async (_id: string) => {
        await createSaveOrDelete({
            productId: _id,
            init: {queryStringParameters: {type: 'save'}},
        });
    },
);

export const DELETE_PRODUCT = createAsyncThunk(
    'product/DELETE_PRODUCT',
    async (_id: string) => {
        await createSaveOrDelete({
            productId: _id,
            init: {queryStringParameters: {type: 'delete'}},
        });
    },
);

export const DELETE_SAVED_PRODUCT = createAsyncThunk(
    'product/DELETE_SAVED_PRODUCT',
    async (input: {_id: string; index: number}) => {
        await deleteSaveOrDelete({
            productId: input._id,
            init: {queryStringParameters: {type: 'save'}},
        });
    },
);

export const LOAD_SAVED_PRODUCTS = createAsyncThunk(
    'product/LOAD_SAVED_PRODUCTS',
    async (loadAmount: number = 10): Promise<ProductType[]> => {
        const savedProductIds = await queryProduct('saved', {
            init: {
                queryStringParameters: {loadAmount: loadAmount, type: 'saved'},
            },
        });

        let promises = [];
        for (let i = 0; i < savedProductIds.length; i++) {
            promises.push(
                getProduct({init: {}, productId: savedProductIds[i]}),
            );
        }

        return await Promise.all(promises);
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
                state.savedProducts = action.payload;
            })
            .addCase(LOAD_SAVED_PRODUCTS.rejected, () => {
                // TODO: Handle rejections.
                console.warn('Get product rejected');
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
