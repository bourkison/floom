import {fetchJwtToken, API_NAME} from '@/api/utility';
import {API} from 'aws-amplify';
import {
    GetProductParams,
    Product as ProductType,
    QueryProductParams,
} from '@/types/product';

type ProductExample = {
    title: string;
    price: number;
};

type QueryExample<T> = T extends 'unsaved'
    ? ProductExample[]
    : T extends 'saved'
    ? string[]
    : never;

export async function queryDb<T extends 'saved' | 'unsaved'>(
    type: T,
): Promise<QueryExample<T>> {
    // Get correct DB URL based on type input.
    let dbUrl: string;
    if (type === 'saved') {
        dbUrl = 'DATABASEURL/saved';
    } else {
        dbUrl = 'DATABASEURL/unsaved';
    }

    // Fetch data from the database.
    const r = await fetch(dbUrl);
    const dbResult = JSON.parse(await r.json());

    // Structure the data correctly to be in line with the types.
    if (type === 'saved') {
        let response: string[] = dbResult.data;
        return response;
    } else {
        let response: ProductExample[] = dbResult.data;
        return response;
    }
}

type QueryResponse<T> = T extends 'unsaved'
    ? ProductType[]
    : T extends 'saved'
    ? string[]
    : never;

// export async function queryProduct<T extends 'saved' | 'unsaved'>(
//     type: T,
//     input: GetProductParams,
// ): Promise<QueryResponse<T>> {
//     const path = '/product';
//     let init = input.init;
//     init.headers = init.headers || {};
//     init.headers.Authorization =
//         init.headers.Authorization || (await fetchJwtToken());

//     init.queryStringParameters = init.queryStringParameters || {};
//     init.queryStringParameters.type = type;

//     const data = await API.get(API_NAME, path, init).catch(err => {
//         console.error(err);
//         throw err;
//     });

//      if (data.success)

//     if (type === 'unsaved') {
//         let response: ProductType[] = [];

//         for (let i = 0; i < data.data.length; i++) {
//             response.push({
//                 title: data.data[i].title,
//                 imageLink: data.data[i].imageLink,
//                 price: data.data[i].price,
//                 link: data.data[i].link,
//                 _id: data.data[i]._id,
//             });
//         }

//         return response;
//     } else {
//         let response: string[] = [];
//         response = data.data;
//         return response;
//     }
// }

export async function querySavedProduct(
    input: QueryProductParams,
): Promise<string[]> {
    const path = '/product';
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

    const data = await API.get(API_NAME, path, init).catch(err => {
        console.error(err);
        throw err;
    });

    let response: string[] = data.data;
    return response;
}

export async function queryUnsavedProduct(
    input: QueryProductParams,
): Promise<ProductType[]> {
    const path = '/product';
    let init = input.init;
    init.headers = init.headers || {};
    init.headers.Authorization =
        init.headers.Authorization || (await fetchJwtToken());

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

    return response;
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
