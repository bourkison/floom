import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, FilterQuery} from 'mongoose';
let MONGODB_URI: string;

type ProductType = {
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
    description: string;
};

const queryProducts = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const excludedProducts: string[] =
        JSON.parse(event.body)?.excludedProducts || [];

    const loadAmount: number = parseInt(
        JSON.parse(event.body)?.loadAmount || 5,
    );
    // Get relevant filters and convert to lower case.
    const filteredGenders: string[] = JSON.parse(event.body)?.filteredGenders
        ? JSON.parse(event.body).filteredGenders.map((g: string) =>
              g.toLowerCase(),
          )
        : [];

    const filteredCategories: string[] = JSON.parse(event.body)
        ?.filteredCategories
        ? JSON.parse(event.body).filteredCategories.map((c: string) =>
              c.toLowerCase(),
          )
        : [];

    const filteredColors: string[] = JSON.parse(event.body)?.filteredColors
        ? JSON.parse(event.body).filteredColors.map((c: string) =>
              c.toLowerCase(),
          )
        : [];

    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    console.log('TEST');

    try {
        // Build out filtered query.
        let query: FilterQuery<ProductType> = {
            _id: {
                $nin: excludedProducts,
            },
        };

        if (filteredGenders.length) {
            const regex = new RegExp(filteredGenders.join('|'), 'gi');
            query = {
                ...query,
                gender: {
                    $regex: regex,
                },
            };
        }

        if (filteredCategories.length) {
            query = {
                ...query,
                categories: {
                    $in: filteredCategories,
                },
            };
        }

        if (filteredColors.length) {
            query = {
                ...query,
                colors: {
                    $in: filteredColors,
                },
            };
        }

        const products = await Product.aggregate([
            {$match: query},
            {$sample: {size: loadAmount}},
        ]);

        if (!products || !products.length) {
            response = {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'No products found',
                }),
            };

            return response;
        }

        // If we have loaded less than we wanted, we know that
        // we have loaded everything and there is nothing more to load.
        const moreToLoad = !(products.length < loadAmount);

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                data: products,
                __totalLength: 'unknown',
                __moreToLoad: moreToLoad,
                __loaded: products.length,
            }),
        };

        return response;
    } catch (err) {
        // TODO: Handle error and return appropriate response.
        console.error(err);
        return response;
    }
};

/**
 * @type {import('@types/aws-lambda').APIGatewayProxyHandler}
 */
exports.handler = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    MONGODB_URI = Parameters[0].Value;

    let response: APIGatewayProxyResult;

    switch (JSON.parse(event.body)?.method || '') {
        case 'QUERY_PRODUCTS':
            response = await queryProducts(event);
            break;
        default:
            response = {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Unrecognised method in body',
                }),
            };
    }

    return response;
};
