import axios from 'axios';
import {ProductType} from './types';

const NUM_REQS_PER_SECOND = 1;
const PAGINATION_AMOUNT = 30;

const NUM_LOADS = 10;

export default async function (HM_API_KEY: string) {
    let products: ProductType[] = [];

    const formatGender = (input: string) => {
        if (input === 'Men') {
            return 'male';
        } else if (input === 'Ladies') {
            return 'female';
        }

        return null;
    };

    const responses = await new Promise<any[]>(resolve => {
        let promises = [];
        let amountCalled = 0;

        const interval = setInterval(async () => {
            if (amountCalled < NUM_LOADS) {
                for (let j = 0; j < NUM_REQS_PER_SECOND; j++) {
                    promises.push(
                        axios(
                            'https://apidojo-hm-hennes-mauritz-v1.p.rapidapi.com/products/list',
                            {
                                method: 'GET',
                                headers: {
                                    'X-RapidAPI-Key': HM_API_KEY,
                                    'X-RapidAPI-Host':
                                        'apidojo-hm-hennes-mauritz-v1.p.rapidapi.com',
                                },
                                params: {
                                    country: 'us',
                                    lang: 'en',
                                    currentpage: `${
                                        j + amountCalled * NUM_REQS_PER_SECOND
                                    }`,
                                    pagesize: `${PAGINATION_AMOUNT}`,
                                },
                            },
                        ),
                    );
                }

                amountCalled++;
            } else {
                const data = await Promise.allSettled(promises);
                clearInterval(interval);
                resolve(data);
            }
        }, 1000);
    });

    for (let i = 0; i < responses.length; i++) {
        if (responses[i].status === 'fulfilled') {
            // @ts-ignore
            const response = responses[i].value;
            console.log('Promise fulfilled');

            for (let j = 0; j < response.data.results.length; j++) {
                const product = response.data.results[j];

                if (formatGender(product.categoryName)) {
                    const p = {
                        name: product.name,
                        price: [
                            {
                                amount: product.price.value,
                                saleAmount: product.whitePrice.value,
                                currency: product.price.currencyIso,
                            },
                        ],
                        link: response.data.baseUrl + product.linkPdp,
                        images: product.galleryImages.map((i: any) => i.url),
                        colors: product.articleColorNames.map((c: string) =>
                            c.toLowerCase(),
                        ),
                        gender: formatGender(product.categoryName),
                        categories: product.categories.map((c: string) =>
                            c.toLowerCase(),
                        ),
                        brand: 'H&M',
                        vendorProductId: product.code,
                        inStock: product.stock.stockLevel >= 1,
                        description: 'This is a test description.',
                        availableCountries: ['us', 'gb'],
                    };
                    products.push(p);
                    console.log('Product pushed:', p);
                } else {
                    console.log('Gender not formatted');
                }
            }
        } else {
            // @ts-ignore
            console.log('Promise unfulfilled', responses[i].reason);
        }
    }

    return products;
}
