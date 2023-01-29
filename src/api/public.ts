import {API_NAME} from '@/api/utility';
import {API} from 'aws-amplify';
import {
    Product as ProductType,
    QueryProductResponse,
    QueryPublicProductParams,
    GetPublicProductParams,
} from '@/types/product';

export async function queryPublicProduct(
    input: QueryPublicProductParams,
): Promise<QueryProductResponse> {
    const path = '/public';

    input.init.body.method = 'QUERY_PRODUCTS';

    const data = await API.post(API_NAME, path, input.init);

    let response: ProductType[] = [];

    for (let i = 0; i < data.data.length; i++) {
        response.push({
            name: data.data[i].name,
            images: data.data[i].images,
            price: data.data[i].price.map((p: any) => {
                return {
                    currency: p.currency,
                    amount: p.amount,
                    saleAmount: p.saleAmount,
                };
            }),
            link: data.data[i].link,
            _id: data.data[i]._id,
            colors: data.data[i].colors,
            categories: data.data[i].categories,
            gender: data.data[i].gender,
            brand: data.data[i].brand,
            vendorProductId: data.data[i].vendorProductId,
            inStock: data.data[i].inStock,
            description: data.data[i].description || '',
            availableCountries: data.data[i].availableCountries,
            saved: data.data[i].saved,
            deleted: data.data[i].deleted,
        });
    }

    return {
        products: response,
        __loaded: data.__loaded,
        __moreToLoad: data.__moreToLoad,
        __totalLength: data.__totalLength,
    };
}

export async function getPublicProduct(
    input: GetPublicProductParams,
): Promise<ProductType[]> {
    const path = '/public';

    input.init.body.method = 'GET_PRODUCTS';

    const data = await API.post(API_NAME, path, input.init);

    let response: ProductType[] = [];

    for (let i = 0; i < data.data.length; i++) {
        response.push({
            name: data.data[i].name,
            images: data.data[i].images,
            price: data.data[i].price.map((p: any) => {
                return {
                    currency: p.currency,
                    amount: p.amount,
                    saleAmount: p.saleAmount,
                };
            }),
            link: data.data[i].link,
            _id: data.data[i]._id,
            colors: data.data[i].colors,
            categories: data.data[i].categories,
            gender: data.data[i].gender,
            brand: data.data[i].brand,
            vendorProductId: data.data[i].vendorProductId,
            inStock: data.data[i].inStock,
            description: data.data[i].description || '',
            availableCountries: data.data[i].availableCountries,
            saved: data.data[i].saved,
            deleted: data.data[i].deleted,
        });
    }

    return response;
}
