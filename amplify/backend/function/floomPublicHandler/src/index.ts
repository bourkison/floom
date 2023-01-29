import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, FilterQuery, Types} from 'mongoose';
import {getFeaturedProduct} from './featured';
import {ProductType} from './types';

const queryProducts = async (
    event: APIGatewayEvent,
    MONGODB_URI: string,
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
            const regex = new RegExp(
                filteredGenders.map(g => `^${g}$`).join('|'),
                'gi',
            );
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

const getProducts = async (
    event: APIGatewayEvent,
    MONGODB_URI: string,
): Promise<APIGatewayProxyResult> => {
    const productIds: string[] = JSON.parse(event.body)?.products || [];

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

    if (!productIds.length) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'No products provided',
            }),
        };
    }

    try {
        const products = await Product.find({
            _id: {
                $in: productIds.map(id => new Types.ObjectId(id)),
            },
        }).lean();

        if (!products.length) {
            response = {
                statusCode: 404,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Products not found',
                }),
            };
        }

        response = {
            statusCode: 200,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: true,
                data: products.sort(
                    (a, b) =>
                        productIds.indexOf(a._id.toString()) -
                        productIds.indexOf(b._id.toString()),
                ),
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

    const MONGODB_URI = Parameters[0].Value;

    let response: APIGatewayProxyResult;

    switch (JSON.parse(event.body)?.method || '') {
        case 'QUERY_PRODUCTS':
            response = await queryProducts(event, MONGODB_URI);
            break;
        case 'GET_PRODUCTS':
            response = await getProducts(event, MONGODB_URI);
            break;
        case 'FEATURED':
            response = await getFeaturedProduct(event, MONGODB_URI);
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
            break;
    }

    return response;
};
