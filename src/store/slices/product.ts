import {
    createEntityAdapter,
    createSlice,
    PayloadAction,
} from '@reduxjs/toolkit';
import {Product as ProductType} from '@/types/Product';

const productAdapter = createEntityAdapter();

const initialState = productAdapter.getInitialState({
    products: [] as ProductType[],
    isAnimatingSave: false,
});

const productSlice = createSlice({
    name: 'product',
    initialState,
    reducers: {
        SET_PRODUCTS(state, action: PayloadAction<ProductType[]>) {
            state.products = action.payload;
        },
        COMMENCE_SAVE_TOP_PRODUCT(state) {
            state.isAnimatingSave = true;
        },
        REMOVE_TOP_PRODUCT(state) {
            state.isAnimatingSave = false;
            state.products = state.products.slice(1, state.products.length);
        },
    },
});

export const {SET_PRODUCTS, COMMENCE_SAVE_TOP_PRODUCT, REMOVE_TOP_PRODUCT} =
    productSlice.actions;
export default productSlice.reducer;
