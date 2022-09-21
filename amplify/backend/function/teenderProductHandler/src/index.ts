import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, Types, FilterQuery} from 'mongoose';

let MONGODB_URI: string;

type ProductType = {
    _id: Types.ObjectId;
    title: string;
    price: number;
    link: string;
    imageLink: string[];
    createdAt: Date;
    updatedAt: Date;
};

type UserType = {
    _id: Types.ObjectId;
    email: string;
    name: string;
    gender: string;
    dob: Date;
    country: string;
    likedProducts: Types.ObjectId[];
    deletedProducts: Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
};

const queryUnsavedProduct = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const email = event.requestContext?.authorizer?.claims?.email || undefined;
    const loadAmount = parseInt(event.queryStringParameters.loadAmount) || 5;
    const startAt = event.queryStringParameters.startAt || '';

    const Product: Model<ProductType> = await MongooseModels().Product(
        MONGODB_URI,
    );
    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);

    let response: APIGatewayProxyResult = {
        statusCode: 500,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: false}),
    };

    try {
        const user = (
            await User.findOne(
                {email},
                {email: 1, likedProducts: 1, deletedProducts: 1},
            )
        ).toObject();

        if (!user) {
            response = {
                statusCode: 403,
                headers: {
                    'Access-Control-Allow-Headers': '*',
                    'Access-Control-Allow-Origin': '*',
                },
                body: JSON.stringify({success: false, message: 'Unknown user'}),
            };
        }

        const excludedProductsArr = [
            ...user.likedProducts,
            ...user.deletedProducts,
        ];

        let query: FilterQuery<ProductType> = {
            _id: {
                $nin: excludedProductsArr,
            },
        };

        if (startAt) {
            query._id = {
                ...query._id,
                $lt: new Types.ObjectId(startAt),
            };
        }

        const products = await Product.find(query)
            .sort({_id: -1})
            .limit(loadAmount);

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
        const moreToLoad = products.length < loadAmount;

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

const querySavedProduct = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const email = event.requestContext?.authorizer?.claims?.email || undefined;
    const loadAmount = parseInt(event.queryStringParameters.loadAmount) || 5;
    const startAt = event.queryStringParameters.startAt || '';

    const User: Model<UserType> = await MongooseModels().User(MONGODB_URI);
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

    if (!email) {
        response = {
            statusCode: 403,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'Not logged in'}),
        };
        return response;
    }

    let productIds: Types.ObjectId[];
    let arrLength: number;
    let arrStartAtIndex: number;

    if (!startAt) {
        const {likedProducts, __length} = (
            await User.findOne(
                {email: email},
                {
                    likedProducts: {
                        $slice: loadAmount,
                    },
                    __length: {
                        $size: '$likedProducts',
                    },
                },
            )
        ).toObject<{
            likedProducts: Types.ObjectId[];
            __length: number;
            __startAtIndex?: number;
        }>();

        productIds = likedProducts;
        arrLength = __length;
        arrStartAtIndex = 0;
    } else {
        const mongoResponse = (
            await User.aggregate<{
                likedProducts: Types.ObjectId[];
                __length: number;
                __startAtIndex?: number;
            }>([
                {$match: {email: email}},
                {
                    $addFields: {
                        __length: {
                            $size: '$likedProducts',
                        },
                        __startAtIndex: {
                            $indexOfArray: [
                                '$likedProducts',
                                new Types.ObjectId(startAt),
                            ],
                        },
                    },
                },
                {
                    $project: {
                        likedProducts: {
                            $slice: [
                                '$likedProducts',
                                {
                                    $add: ['$__startAtIndex', 1],
                                },
                                loadAmount,
                            ],
                        },
                        __length: 1,
                        __startAtIndex: 1,
                    },
                },
            ])
        )[0];

        console.log('MONGO RESPONSE:', mongoResponse);

        productIds = mongoResponse.likedProducts;
        arrLength = mongoResponse.__length;
        arrStartAtIndex = mongoResponse.__startAtIndex;
    }

    if (!productIds || !productIds.length) {
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

    // Have to sort the products in how they are retrieved from the User
    // In order to allow for pagination.
    // https://stackoverflow.com/questions/22797768/does-mongodbs-in-clause-guarantee-order
    const products = await Product.aggregate<ProductType>([
        {
            $match: {
                _id: {
                    $in: productIds,
                },
            },
        },
        {
            $addFields: {
                __order: {
                    $indexOfArray: [productIds, '$_id'],
                },
            },
        },
        {
            $sort: {
                __order: 1,
            },
        },
    ]);

    if (!products || !products.length) {
        response = {
            statusCode: 500,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: 'Error getting products',
            }),
        };

        return response;
    }

    // If number of previously loaded (arrStartAt + 1) + number loaded
    // is equal to total length, we know we have loaded everything, hence no more to load
    const moreToLoad = !(arrStartAtIndex + 1 + products.length >= arrLength);

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            success: true,
            data: products,
            __totalLength: arrLength,
            __moreToLoad: moreToLoad,
            __loaded: products.length,
        }),
    };

    return response;
};

const getProduct = async (
    event: APIGatewayEvent,
): Promise<APIGatewayProxyResult> => {
    const _id = event.pathParameters.proxy;

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

    const product = (await Product.findById(_id)).toObject();

    if (!product) {
        response = {
            statusCode: 404,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({success: false, message: 'No product found'}),
        };
        return response;
    }

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({success: true, data: product}),
    };

    return response;
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

    switch (event.httpMethod) {
        case 'GET':
            const proxy = event.pathParameters?.proxy || '';
            if (proxy) {
                response = await getProduct(event);
            } else {
                const type = event.queryStringParameters.type || 'unsaved';
                if (type === 'saved') {
                    response = await querySavedProduct(event);
                } else if (type === 'unsaved') {
                    response = await queryUnsavedProduct(event);
                } else {
                    response = {
                        statusCode: 400,
                        headers: {
                            'Access-Control-Allow-Origin': '*',
                            'Access-Control-Allow-Headers': '*',
                        },
                        body: JSON.stringify({
                            success: false,
                            message: 'Unknown GET type',
                        }),
                    };
                }
            }
            break;
        default:
            response = {
                statusCode: 400,
                headers: {
                    'Access-Control-Allow-Origin': '*',
                    'Access-Control-Allow-Headers': '*',
                },
                body: JSON.stringify({
                    success: false,
                    message: 'Unknown HTTP method',
                }),
            };
            break;
    }

    return response;
};
