import aws from 'aws-sdk';
import {APIGatewayEvent, APIGatewayProxyResult} from 'aws-lambda';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';
import {Model, Types, FilterQuery, PipelineStage} from 'mongoose';

let MONGODB_URI: string;

const MAX_LOAD_AMOUNT = 50;

type ProductType = {
    _id: Types.ObjectId;
    name: string;
    price: {
        amount: number;
        saleAmount: number;
        currency: string;
    }[];
    link: string;
    images: string[];
    colors: string[];
    categories: string[];
    gender: string;
    brand: string;
    vendorProductId: string;
    inStock: boolean;
    description: string;
    rnd: number;
    availableCountries: string[];
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

    // Get relevant filters and convert to lower case.
    const filteredGenders: string[] = event.queryStringParameters
        .filteredGenders
        ? event.queryStringParameters.filteredGenders
              .split(',')
              .map(g => g.toLowerCase().trim())
        : [];

    const filteredCategories: string[] = event.queryStringParameters
        .filteredCategories
        ? event.queryStringParameters.filteredCategories
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const filteredColors: string[] = event.queryStringParameters.filteredColors
        ? event.queryStringParameters.filteredColors
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const searchText: string = event.queryStringParameters.query || '';

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

    if (loadAmount > MAX_LOAD_AMOUNT) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Max load amount is ${MAX_LOAD_AMOUNT}`,
            }),
        };

        return response;
    }

    if (loadAmount <= 0) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Load amount is 0 or less`,
            }),
        };

        return response;
    }

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

            return response;
        }

        let excludedProductsArr: Types.ObjectId[] = [];

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

        // Build out filtered query.
        let query: FilterQuery<ProductType> = {
            _id: {
                $nin: excludedProductsArr,
            },
        };

        if (startAt && ordered) {
            const {rnd} = (
                await Product.findById(new Types.ObjectId(startAt))
            ).toObject();

            query = {
                ...query,
                _id: {
                    ...query._id,
                    $lt: new Types.ObjectId(startAt),
                },
                rnd: {
                    $lt: rnd,
                },
            };
        }

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
            const regex = new RegExp(filteredColors.join('|'), 'gi');

            query = {
                ...query,
                colors: {
                    $regex: regex,
                },
            };
        }

        if (searchText) {
            query = {
                ...query,
                $text: {
                    $search: searchText,
                },
            };
        }

        const products = ordered
            ? await Product.find<ProductType>(query, {
                  _id: 1,
                  name: 1,
                  vendorProductId: 1,
                  brand: 1,
                  categories: 1,
                  colors: 1,
                  gender: 1,
                  images: 1,
                  inStock: 1,
                  link: 1,
                  price: 1,
                  availableCountries: 1,
              })
                  .sort({rnd: -1, _id: -1})
                  .limit(loadAmount)
            : await Product.aggregate<ProductType>([
                  {$match: query},
                  {$sample: {size: loadAmount}},
                  {
                      $project: {
                          _id: 1,
                          name: 1,
                          vendorProductId: 1,
                          brand: 1,
                          categories: 1,
                          colors: 1,
                          gender: 1,
                          images: 1,
                          inStock: 1,
                          link: 1,
                          price: 1,
                          availableCountries: 1,
                      },
                  },
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
                data: products.map(p => {
                    return {
                        ...p,
                        saved: !excludeSaved
                            ? user.likedProducts.includes(p._id)
                            : false,
                        deleted: !excludeDeleted
                            ? user.deletedProducts.includes(p._id)
                            : false,
                    };
                }),
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
    const reversed = event.queryStringParameters.reversed === 'true' || false;

    // Get relevant filters and convert to lower case.
    const filteredGenders: string[] = event.queryStringParameters
        .filteredGenders
        ? event.queryStringParameters.filteredGenders
              .split(',')
              .map(g => g.toLowerCase().trim())
        : [];

    const filteredCategories: string[] = event.queryStringParameters
        .filteredCategories
        ? event.queryStringParameters.filteredCategories
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const filteredColors: string[] = event.queryStringParameters.filteredColors
        ? event.queryStringParameters.filteredColors
              .split(',')
              .map(c => c.toLowerCase().trim())
        : [];

    const searchText: string = event.queryStringParameters.query || '';

    const isFiltered =
        filteredGenders.length ||
        filteredCategories.length ||
        filteredColors.length ||
        searchText
            ? true
            : false;

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

    if (loadAmount > MAX_LOAD_AMOUNT) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Max load amount is ${MAX_LOAD_AMOUNT}`,
            }),
        };

        return response;
    }

    if (loadAmount <= 0) {
        response = {
            statusCode: 400,
            headers: {
                'Access-Control-Allow-Headers': '*',
                'Access-Control-Allow-Origin': '*',
            },
            body: JSON.stringify({
                success: false,
                message: `Load amount is 0 or less`,
            }),
        };

        return response;
    }

    let productIds: Types.ObjectId[];
    let arrLength: number;
    let arrStartAtIndex: number;

    if (isFiltered) {
        // If any filters, pull all productIds from user, and we will filter/limit when pulling from products.
        let aggregation =
            type === 'saved'
                ? {
                      likedProducts: 1,
                      __length: {
                          $size: '$likedProducts',
                      },
                  }
                : {
                      deletedProducts: 1,
                      __length: {
                          $size: '$likedProducts',
                      },
                  };

        const {likedProducts, __length, deletedProducts} = (
            await User.findOne({email}, aggregation)
        ).toObject<{
            likedProducts?: Types.ObjectId[];
            deletedProducts?: Types.ObjectId[];
            __length: number;
            __startAtIndex?: number;
        }>();

        productIds = type === 'saved' ? likedProducts : deletedProducts;
    } else if (!startAt) {
        // Change aggregation to $likedProducts or $deletedProducts based on
        // If we're palling saved or deleted.
        let aggregation =
            type === 'saved'
                ? {
                      likedProducts: {
                          $slice: !reversed ? loadAmount : -loadAmount,
                      },
                      __length: {
                          $size: '$likedProducts',
                      },
                  }
                : {
                      deletedProducts: {
                          $slice: !reversed ? loadAmount : -loadAmount,
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
        arrStartAtIndex = !reversed ? -1 : arrLength;
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
        let secondAggregation: any;
        if (!reversed) {
            secondAggregation =
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
        } else {
            /*
             * Below aggregation based on below function to return reversed array
             * though $slice has slightly different behaviour to .slice():
             * (arr, index, amount) => {
             *   let start = index - amount;
             *
             *   if (start < 0) {
             *       start = 0;
             *   }
             *
             *   return arr.slice(start, index)
             * }
             */
            secondAggregation =
                type === 'saved'
                    ? {
                          $project: {
                              likedProducts: {
                                  $slice: [
                                      '$likedProducts',
                                      {
                                          $max: [
                                              {
                                                  $subtract: [
                                                      '$__startAtIndex',
                                                      loadAmount,
                                                  ],
                                              },
                                              0,
                                          ],
                                      },
                                      {
                                          $cond: [
                                              {
                                                  $lt: [
                                                      {
                                                          $subtract: [
                                                              '$__startAtIndex',
                                                              loadAmount,
                                                          ],
                                                      },
                                                      0,
                                                  ],
                                              },
                                              '$__startAtIndex',
                                              loadAmount,
                                          ],
                                      },
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
                                          $max: [
                                              {
                                                  $subtract: [
                                                      '$__startAtIndex',
                                                      loadAmount,
                                                  ],
                                              },
                                              0,
                                          ],
                                      },
                                      {
                                          $cond: [
                                              {
                                                  $lt: [
                                                      {
                                                          $subtract: [
                                                              '$__startAtIndex',
                                                              loadAmount,
                                                          ],
                                                      },
                                                      0,
                                                  ],
                                              },
                                              '$__startAtIndex',
                                              loadAmount,
                                          ],
                                      },
                                  ],
                              },
                              __length: 1,
                              __startAtIndex: 1,
                          },
                      };
        }

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

    if (reversed) {
        productIds.reverse();
    }

    let matchQuery: FilterQuery<ProductType> = {
        _id: {
            $in: productIds,
        },
    };

    if (filteredGenders.length) {
        const regex = new RegExp(
            filteredGenders.map(g => `^${g}$`).join('|'),
            'gi',
        );
        matchQuery = {
            ...matchQuery,
            gender: {
                $regex: regex,
            },
        };
    }

    if (filteredCategories.length) {
        matchQuery = {
            ...matchQuery,
            categories: {
                $in: filteredCategories,
            },
        };
    }

    if (filteredColors.length) {
        const regex = new RegExp(filteredColors.join('|'), 'gi');

        matchQuery = {
            ...matchQuery,
            colors: {
                $regex: regex,
            },
        };
    }

    if (searchText) {
        matchQuery = {
            ...matchQuery,
            $text: {
                $search: searchText,
            },
        };
    }

    let aggregationArr: PipelineStage[] = [
        {$match: matchQuery},
        // Have to sort the products in how they are retrieved from the User
        // In order to maintain order.
        // https://stackoverflow.com/questions/22797768/does-mongodbs-in-clause-guarantee-order
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
        {
            $project: {
                _id: 1,
                name: 1,
                vendorProductId: 1,
                brand: 1,
                categories: 1,
                colors: 1,
                gender: 1,
                images: 1,
                inStock: 1,
                link: 1,
                price: 1,
            },
        },
    ];

    let products: ProductType[] = [];
    let moreToLoad: boolean;

    if (isFiltered) {
        let resultsPipeline: PipelineStage.FacetPipelineStage[] = [];
        let index = -1;

        if (startAt) {
            index = productIds.findIndex(id => startAt === id.toString());
            resultsPipeline.push({$skip: index + 1});
        }

        resultsPipeline.push({
            $limit: loadAmount,
        });

        aggregationArr.push({
            $facet: {
                count: [
                    {
                        $count: '__length',
                    },
                ],
                results: resultsPipeline,
            },
        });

        const res = (
            await Product.aggregate<{
                results: ProductType[];
                count: {__length: number};
            }>(aggregationArr)
        )[0];

        products = res.results;
        arrLength = res.count[0].__length;
        moreToLoad = index + 1 + products.length < arrLength;
    } else {
        products = await Product.aggregate<ProductType>(aggregationArr);

        /*
         * Non-reversed logic:
         *   If number of previously loaded (arrStartAt + 1) + number loaded on this load
         *   is equal to total array length, we know we have loaded everything, hence no more to load.
         */
        moreToLoad = !reversed
            ? !(arrStartAtIndex + 1 + products.length >= arrLength)
            : arrStartAtIndex - loadAmount > 0;
    }

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

    response = {
        statusCode: 200,
        headers: {
            'Access-Control-Allow-Headers': '*',
            'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify({
            success: true,
            data: products.map(product => {
                return {
                    ...product,
                    saved: type === 'saved',
                    deleted: type === 'deleted',
                };
            }),
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
