import {
    createAsyncThunk,
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {Product as ProductType} from '@/types/product';
import {createSaveOrDelete} from '@/api/save';

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    products: [] as ProductType[],
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

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        SET_PRODUCTS(state, action: PayloadAction<ProductType[]>) {
            state.products = action.payload;
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
                state.products = state.products.slice(1, state.products.length);
            })
            .addCase(SAVE_PRODUCT.rejected, () => {
                console.warn('Like product rejected');
            })
            .addCase(DELETE_PRODUCT.pending, state => {
                state.animation = 'idle';
                state.products = state.products.slice(1, state.products.length);
            })
            .addCase(DELETE_PRODUCT.rejected, () => {
                console.warn('Delete product rejected');
            });
    },
});

export const {SET_PRODUCTS, COMMENCE_ANIMATE} = productSlice.actions;
export default productSlice.reducer;
