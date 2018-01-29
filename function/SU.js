const { net, HOST, PORT, redis } = require('../bootstrap');

cache = redis.createClient();

cache.on("error", function (err) {
    console.log("Error " + err);
});

let client = null;

module.exports.SU = (device, ID) => {
    client = new net.Socket();

    client.connect(PORT, HOST, () => {
        console.log("TCP Connection opened successfully!".green);
        
        client.write("SU\r");

        client.on("data", data => {
            let iot_data = dataToJSONFormat(data);

            console.log(iot_data);

            closeTCP();    

            device.publish('Robot/status_topic', JSON.stringify({ID: parseInt(ID), DATETIME: new Date(Date.now()).toString(), data: iot_data}));
        });
    });

    client.on('error', (err) => {
        console.log("Error: "+err.message);
    });
}

function dataToJSONFormat(data) {
    let data_string = bin2string(data).replace("FL,", "").replace(new RegExp(":", 'g'), ",").replace(new RegExp(" ", 'g'), ",").replace("\u001a\u0003", "");
                
    let data_array = data_string.split(",");
    let data_json = {}

    for (i = 0; i < data_array.length; i = i + 2) {
        data_json[ data_array[i] ] = data_array[i + 1]
    }

    return data_json;
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