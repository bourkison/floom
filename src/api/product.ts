import {fetchJwtToken, API_NAME} from '@/api/utility';
import {API} from 'aws-amplify';
import {
    GetProductParams,
    Product as ProductType,
    QueryProductParams,
    QueryProductResponse,
    GetFeaturedProductParams,
    GetFeaturedProductResponse,
} from '@/types/product';

export async function queryProduct(
    input: QueryProductParams,
): Promise<QueryProductResponse> {
    const path = '/product';
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    const data = await API.get(API_NAME, path, init);

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
            availableCountries: data.data[i].availableCountries,
            link: data.data[i].link,
            _id: data.data[i]._id,
            colors: data.data[i].colors,
            categories: data.data[i].categories,
            gender: data.data[i].gender,
            brand: data.data[i].brand,
            vendorProductId: data.data[i].vendorProductId,
            inStock: data.data[i].inStock,
            description: data.data[i].description || '',
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

export async function getProduct(
    input: GetProductParams,
): Promise<ProductType> {
    const path = '/product/' + input.productId;
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    if (!data.success) {
        console.error(data.message);
        throw new Error(data.message);
    }

    return {
        name: data.data.name,
        images: data.data.images,
        price: data.data.price.map((p: any) => {
            return {
                currency: p.currency,
                amount: p.amount,
                saleAmount: p.saleAmount,
            };
        }),
        availableCountries: data.data.availableCountries,
        link: data.data.link,
        _id: data.data._id,
        colors: data.data.colors,
        categories: data.data.categories,
        gender: data.data.gender,
        brand: data.data.brand,
        vendorProductId: data.data.vendorProductId,
        inStock: data.data.inStock,
        description: data.data.description,
        saved: data.data.saved,
        deleted: data.data.deleted,
    };
}

export async function getFeaturedProduct(
    input: GetFeaturedProductParams,
): Promise<GetFeaturedProductResponse> {
    const path = '/public';

    const data = await API.post(API_NAME, path, input.init).catch(err => {
        console.error(err);
        throw err;
    });

    if (!data.success) {
        console.error(data.message);
        throw new Error(data.message);
    }

    return {
        product: {
            name: data.data.name,
            images: data.data.images,
            price: data.data.price.map((p: any) => {
                return {
                    currency: p.currency,
                    amount: p.amount,
                    saleAmount: p.saleAmount,
                };
            }),
            availableCountries: data.data.availableCountries,
            link: data.data.link,
            _id: data.data._id,
            colors: data.data.colors,
            categories: data.data.categories,
            gender: data.data.gender,
            brand: data.data.brand,
            vendorProductId: data.data.vendorProductId,
            inStock: data.data.inStock,
            description: data.data.description,
            saved: false,
            deleted: false,
        },
        type: data.type,
        filter: data.filter,
    };
}
