import {fetchJwtToken, API_NAME} from '@/api/utility';
import {API} from 'aws-amplify';
import {
    GetProductParams,
    Product as ProductType,
    QueryProductParams,
} from '@/types/product';

export async function queryProduct(
    type: 'saved',
    input: QueryProductParams,
): Promise<string[]>;
export async function queryProduct(
    type: 'unsaved',
    input: QueryProductParams,
): Promise<ProductType[]>;
export async function queryProduct(
    type: 'saved' | 'unsaved',
    input: QueryProductParams,
): Promise<string[] | ProductType[]> {
    const path = '/product';
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    init.queryStringParameters = init.queryStringParameters || {};
    init.queryStringParameters.type = type;

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    if (type === 'unsaved') {
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

        return response;
    } else {
        let response: string[] = [];
        response = data.data;
        return response;
    }
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
