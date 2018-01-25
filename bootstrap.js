// import colors
const colors = require("colors");

// import net
module.exports.net = require("net");

module.exports.HOST = "192.168.0.124";
module.exports.PORT = 1000;

// import awsIOt
const awsIot = require('aws-iot-device-sdk');

module.exports.device = awsIot.device({
    keyPath: './Certificate/7642696795-private.pem.key',
    certPath: './Certificate/7642696795-certificate.pem.crt',
    caPath: './Certificate/rootCA.pem',
    clientId: 'MyIOT',
    host: 'a16bto0un00zjd.iot.ap-northeast-1.amazonaws.com'
});

// serial Number
module.exports.ID = 88273;
