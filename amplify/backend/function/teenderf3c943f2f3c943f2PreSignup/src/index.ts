import aws from 'aws-sdk';
import {PreSignUpTriggerEvent} from 'aws-lambda';
const MongooseModels = require('/opt/nodejs/models');

let MONGODB_URI: string;

type TUser = {
    name: string;
    email: string;
    gender: 'male' | 'female' | 'other';
    dob: Date;
    country: string;
};

exports.handler = async (
    event: PreSignUpTriggerEvent,
): Promise<PreSignUpTriggerEvent> => {
    // @ts-ignore
    const {Parameters} = await new aws.SSM()
        .getParameters({
            Names: ['MONGODB_URI'].map(secretName => process.env[secretName]),
            WithDecryption: true,
        })
        .promise();

    // @ts-ignore
    MONGODB_URI = Parameters[0].Value;

    const User = await MongooseModels().User(MONGODB_URI);
    const userObj: TUser = {
        name: event.request.userAttributes.name,
        gender: event.request.userAttributes.gender as
            | 'male'
            | 'female'
            | 'other',
        dob: new Date(event.request.userAttributes.birthdate),
        email: event.request.userAttributes.email,
        country: event.request.userAttributes.locale,
    };
    const user = new User(userObj);

    console.log('new user created v2:', userObj);

    await user.save();
    return event;
};
