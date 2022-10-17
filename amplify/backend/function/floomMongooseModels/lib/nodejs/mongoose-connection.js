"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
let conn = null;
async function default_1(uri) {
    if (conn === null) {
        conn = mongoose_1.default.createConnection(uri).asPromise();
    }
    // Close the Mongoose connection, when receiving SIGINT
    process.on('SIGINT', () => {
        mongoose_1.default.connection.close(() => {
            console.log('Force to close the MongoDB connection after SIGINT');
            process.exit(0);
        });
    });
    return await conn;
}
exports.default = default_1;
