import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, Types, FilterQuery} from 'mongoose';

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

    const excludeDeleted =
        event.queryStringParameters.excludeDeleted === 'true' || false;
    const excludeSaved =
        event.queryStringParameters.excludeSaved === 'true' || false;
    const ordered = event.queryStringParameters.ordered === 'true' || false;

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

        let excludedProductsArr: Types.ObjectId[] = [];
        console.log('TEST');
        if (excludeDeleted) {
            excludedProductsArr = [
                ...excludedProductsArr,
                ...user.deletedProducts,
            ];
        }

        if (excludeSaved) {
            excludedProductsArr = [
                ...excludedProductsArr,
                ...user.likedProducts,
            ];
        }

        let query: FilterQuery<ProductType> = {
            _id: {
                $nin: excludedProductsArr,
            },
        };

        if (startAt && ordered) {
            query._id = {
                ...query._id,
                $lt: new Types.ObjectId(startAt),
            };
        }

        const products = ordered
            ? await Product.find(query).sort({_id: -1}).limit(loadAmount)
            : await Product.aggregate([
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

const querySavedOrDeletedProduct = async (
    event: APIGatewayEvent,
    type: 'saved' | 'deleted',
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
        // Change aggregation to $likedProducts or $deletedProducts based on
        // If we're palling saved or deleted.
        let aggregation =
            type === 'saved'
                ? {
                      likedProducts: {
                          $slice: loadAmount,
                      },
                      __length: {
                          $size: '$likedProducts',
                      },
                  }
                : {
                      deletedProducts: {
                          $slice: loadAmount,
                      },
                      __length: {
                          $size: '$deletedProducts',
                      },
                  };

        const {likedProducts, __length, deletedProducts} = (
            await User.findOne({email: email}, aggregation)
        ).toObject<{
            likedProducts?: Types.ObjectId[];
            deletedProducts?: Types.ObjectId[];
            __length: number;
            __startAtIndex?: number;
        }>();

        productIds = type === 'saved' ? likedProducts : deletedProducts;
        arrLength = __length;
        arrStartAtIndex = 0;
    } else {
        // Change aggregation to $likedProducts or $deletedProducts based on
        // If we're palling saved or deleted.

        // First aggregation is getting our startAtIndex, and the length of the entire array.
        let firstAggregation =
            type === 'saved'
                ? {
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
                  }
                : {
                      $addFields: {
                          __length: {
                              $size: '$deletedProducts',
                          },
                          __startAtIndex: {
                              $indexOfArray: [
                                  '$deletedProducts',
                                  new Types.ObjectId(startAt),
                              ],
                          },
                      },
                  };

        // Second aggregation is slicing the actual relevant data.
        let secondAggregation =
            type === 'saved'
                ? {
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
                  }
                : {
                      $project: {
                          deletedProducts: {
                              $slice: [
                                  '$deletedProducts',
                                  {
                                      $add: ['$__startAtIndex', 1],
                                  },
                                  loadAmount,
                              ],
                          },
                          __length: 1,
                          __startAtIndex: 1,
                      },
                  };

        const mongoResponse = (
            await User.aggregate<{
                likedProducts?: Types.ObjectId[];
                deletedProducts?: Types.ObjectId[];
                __length: number;
                __startAtIndex?: number;
            }>([{$match: {email: email}}, firstAggregation, secondAggregation])
        )[0];

        productIds =
            type === 'saved'
                ? mongoResponse.likedProducts
                : mongoResponse.deletedProducts;
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
    // In order to maintain order.
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
                if (type === 'saved' || type === 'deleted') {
                    response = await querySavedOrDeletedProduct(event, type);
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
