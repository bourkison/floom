const mongoose = require('mongoose');
let conn = null;

module.exports = async uri => {
    if (conn === null) {
        conn = mongoose.createConnection(uri).asPromise();
    }

    await conn;

    // Close the Mongoose connection, when receiving SIGINT
    process.on('SIGINT', () => {
        mongoose.connection.close(() => {
            console.log('Force to close the MongoDB connection after SIGINT');
            process.exit(0);
        });
    });

    return conn;
};
