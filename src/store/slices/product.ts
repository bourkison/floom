import {
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {Product as ProductType} from '@/types/product';

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    products: [] as ProductType[],
    animation: 'idle' as 'idle' | 'save' | 'buy' | 'delete',
});

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
        REMOVE_TOP_PRODUCT(state) {
            state.animation = 'idle';
            state.products = state.products.slice(1, state.products.length);
        },
    },
});

export const {SET_PRODUCTS, REMOVE_TOP_PRODUCT, COMMENCE_ANIMATE} =
    productSlice.actions;
export default productSlice.reducer;
