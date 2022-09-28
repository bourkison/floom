"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
/*
    To allow this function to connect to RDS:
    https://github.com/aws-amplify/amplify-cli/issues/32#issuecomment-656122079
*/
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const pg_1 = require("pg");
let client;
exports.handler = async (event) => {
    // @ts-ignore
    const { Parameters } = await new aws_sdk_1.default.SSM()
        .getParameters({
        Names: ['PGPASSWORD'].map(secretName => process.env[secretName]),
        WithDecryption: true,
    })
        .promise();
    const PGPASSWORD = Parameters[0].Value;
    if (!client) {
        client = new pg_1.Client({
            user: process.env['PGUSER'],
            host: process.env['PGHOST'],
            database: process.env['PGDATABASE'],
            port: parseInt(process.env['PGPORT']),
            password: PGPASSWORD,
        });
        console.log('Connecting...');
        await client.connect();
        console.log('Connected');
    }
    const userObj = {
        name: event.request.userAttributes.name,
        gender: event.request.userAttributes.gender,
        dob: new Date(event.request.userAttributes.birthdate),
        email: event.request.userAttributes.email,
        country: event.request.userAttributes.locale,
        created_at: new Date(),
        updated_at: new Date(),
    };
    const queryString = `
        INSERT INTO users (email, name, gender, dob, country, created_at, updated_at)
        VALUES
        ('${userObj.email}', '${userObj.name}', '${userObj.gender}', to_timestamp(${userObj.dob.getTime() / 1000}), '${userObj.country}', to_timestamp(${userObj.created_at.getTime() / 1000}), to_timestamp(${userObj.updated_at.getTime() / 1000}))
    `;
    console.log('Querying DB with', queryString);
    await client.query(queryString);
    console.log('Queried.');
    return event;
};
