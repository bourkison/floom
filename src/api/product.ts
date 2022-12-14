import {fetchJwtToken, API_NAME} from '@/api/utility';
import {API} from 'aws-amplify';
import {
    GetProductParams,
    Product as ProductType,
    QueryProductParams,
    QueryProductResponse,
} from '@/types/product';

export async function queryProduct(
    input: QueryProductParams,
): Promise<QueryProductResponse> {
    const path = '/product';
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    console.log(await fetchJwtToken());

    const data = await API.get(API_NAME, path, init);

    let response: ProductType[] = [];

    console.log('RESPONSE:', data.data.length, data.__loaded);

    for (let i = 0; i < data.data.length; i++) {
        response.push({
            name: data.data[i].name,
            images: data.data[i].images,
            price: {
                amount: data.data[i].price.amount,
                saleAmount: data.data[i].price.saleAmount,
                currency: data.data[i].price.currency,
            },
            link: data.data[i].link,
            _id: data.data[i]._id,
            colors: data.data[i].colors,
            categories: data.data[i].categories,
            gender: data.data[i].gender,
            brand: data.data[i].brand,
            vendorProductId: data.data[i].vendorProductId,
            inStock: data.data[i].inStock,
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
        price: {
            amount: data.data.price.amount,
            saleAmount: data.data.price.saleAmount,
            currency: data.data.price.currency,
        },
        link: data.data.link,
        _id: data.data._id,
        colors: data.data.colors,
        categories: data.data.categories,
        gender: data.data.gender,
        brand: data.data.brand,
        vendorProductId: data.data.vendorProductId,
        inStock: data.data.inStock,
    };
}
