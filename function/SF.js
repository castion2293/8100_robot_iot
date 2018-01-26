const { net, HOST, PORT } = require('../bootstrap');

// redis cache settings
var redis = require("redis");
cache = redis.createClient();

cache.on("error", function (err) {
    console.log("Error " + err);
});

let client = null;

module.exports.SF = (device, ID) => {
    client = new net.Socket();
    
    client.connect(PORT, HOST, () => {
        console.log("TCP Connection opened successfully!".green);

        client.write("SF\r");

        client.on("data", data => {

            // for(var i = 0; i < data.length; ++i){
            //     console.log("[" + i + "]:   " + dec2bin(data[i]));
            // }

            // console.log("[109]:   " + dec2bin(data[109]));
            // console.log("[110]:   " + dec2bin(data[110]));

            let alarm_flag = dec2bin(data[109]).split('')[2];

            closeTCP(); 

            if (alarm_flag == 1) {
                cache.set("alarm_flag", true)
            } else {
                cache.set("alarm_flag", false)
            }
        });
    });

    client.on('error', (err) => {
        console.log("Error: "+err.message);
    });
}

function closeTCP() {
    client.write("OK");
                    
    client.destroy();
    console.log("Connection closed successfully!".yellow);
}

function dec2bin(n){
    if (n < 0 || n > 255 || n % 1 !== 0) {
        throw new Error(n + " does not fit in a byte");
    }
    return ("000000000" + n.toString(2)).substr(-8)
}