const { net, HOST, PORT } = require('../bootstrap');

// redis cache settings
var redis = require("redis");
cache = redis.createClient();

cache.on("error", function (err) {
    console.log("Error " + err);
});

let client = null;

module.exports.AC = (device, ID) => {

    cache.get("alarm_flag", function (err, reply) {
        if (reply) {
            client = new net.Socket();

            client.connect(PORT, HOST, () => {
                console.log("TCP Connection opened successfully!".green);

                client.write("AC\r");

                client.on("data", data => {
                    console.log(bin2string(data));

                    closeTCP(); 
                });
            });
        }
    });

    // client = new net.Socket();

    // client.connect(PORT, HOST, () => {
    //     console.log("TCP Connection opened successfully!".green);

    //     client.write("AC\r");

    //     client.on("data", data => {
    //         console.log(bin2string(data));

    //         closeTCP(); 
    //     });
    // });
}

function closeTCP() {
    client.write("OK");
                    
    client.destroy();
    console.log("Connection closed successfully!".yellow);
}

function bin2string(array){
	var result = "";
	for(var i = 0; i < array.length; ++i){
		result+= (String.fromCharCode(array[i]));
	}
	return result;
}