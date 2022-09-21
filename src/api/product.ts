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

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    let response: ProductType[] = [];

    for (let i = 0; i < data.data.length; i++) {
        response.push({
            title: data.data[i].title,
            imageLink: data.data[i].imageLink,
            price: data.data[i].price,
            link: data.data[i].link,
            _id: data.data[i]._id,
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
        title: data.data.title,
        imageLink: data.data.imageLink,
        price: data.data.price,
        link: data.data.link,
        _id: data.data._id,
    };
}
