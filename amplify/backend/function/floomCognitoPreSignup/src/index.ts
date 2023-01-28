import aws from 'aws-sdk';
import {PreSignUpTriggerHandler} from 'aws-lambda';
import {Model} from 'mongoose';
// @ts-ignore
import MongooseModels from '/opt/nodejs/models';

type TUser = {
    name: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    dob: Date;
    country: string;
    currency: string;
};

const handler: PreSignUpTriggerHandler = async (event, context, callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    const MONGODB_URI = Parameters[0].Value;

    const User: Model<TUser> = await MongooseModels().User(MONGODB_URI);

    const userObj: TUser = {
        name: event.request.userAttributes.name,
        gender: event.request.userAttributes.gender as
            | 'male'
            | 'female'
            | 'other',
        dob: new Date(event.request.userAttributes.birthdate),
        email: event.request.userAttributes.email,
        country: event.request.userAttributes.locale,
        currency: event.request.userAttributes['custom:currency'],
    };

    const user = new User(userObj);

    await user.validate().catch(err => {
        callback(err, event);
    });

    callback(null, event);
};

exports.handler = handler;
