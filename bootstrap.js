// import dot env file
require('dotenv').config()

// import colors
const colors = require("colors");

// import net
module.exports.net = require("net");

module.exports.HOST = process.env.HOST;
module.exports.PORT = process.env.PORT;

// import awsIOt
const awsIot = require('aws-iot-device-sdk');

module.exports.device = awsIot.device({
    keyPath: './Certificate/7642696795-private.pem.key',
    certPath: './Certificate/7642696795-certificate.pem.crt',
    caPath: './Certificate/rootCA.pem',
    clientId: process.env.CLIENTID,
    host: process.env.ENDPOINT
});

// serial Number
module.exports.ID = process.env.ID;

// redis cache settings
module.exports.redis = require("redis");

// UUID
module.exports.uuidV1 = require('uuid/v1');
