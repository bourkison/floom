import {Types} from 'mongoose';

export type ProductType = {
    _id: Types.ObjectId;
    name: string;
    price: {
        amount: number;
        saleAmount: number;
        currency: string;
    }[];
    link: string;
    images: string[];
    colors: string[];
    categories: string[];
    gender: string;
    brand: string;
    vendorProductId: string;
    inStock: boolean;
    description: string;
    likedCount: number;
    deletedCount: number;
    rnd: number;
    availableCountries: string[];
};
