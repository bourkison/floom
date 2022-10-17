export type ProductType = {
    name: string;
    price: {
        amount: number;
        saleAmount: number;
        currency: string;
    };
    link: string;
    images: string[];
    colors: string[];
    categories: string[];
    gender: string;
    brand: string;
    vendorProductId: string;
    inStock: boolean;
};
