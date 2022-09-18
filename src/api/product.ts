import {fetchJwtToken, API_NAME} from '@/api/utility';
import {API} from 'aws-amplify';
import {Product as ProductType, GetProductParams} from '@/types/product';

export async function queryProduct(
    input: GetProductParams,
): Promise<ProductType[]> {
    const path = '/product';
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    console.log(init.headers.Authorization);

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    console.log('DATA RESPONSE:', data);

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
}
