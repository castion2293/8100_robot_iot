const { net, HOST, PORT, redis, uuidV1 } = require('../bootstrap');

cache = redis.createClient();

cache.on("error", function (err) {
    console.log("Error " + err);
});

let client = null;

module.exports.AC = (device, ID, data) => {
    console.log("AC")
   
    // cache.get("alarm_flag", (err, reply) => {
    //     //console.log(Boolean(reply));

    //     if (Boolean(reply)) {
    //         //client = new net.Socket();

    //         // client.connect(PORT, HOST, () => {
    //         //     console.log("TCP Connection opened successfully!".green);

    //             client.write("AC\r");

    //             client.on("data", data => {

    //                 // closeTCP(); 

    //                 setTimeout(() => {
    //                     client.write("OK\r");
    //                 }, 50)

                    let iot_data = dataToJSONFormat(data);
                    
                    console.log(iot_data);

                    if (iot_data.ALARM_NUM > 0) {

                        cache.get('alarm_send', (err, reply) => {
                            console.log(reply);

                            if (!Boolean(reply)) {
                                cache.set('alarm_send', Boolean(true));
                                cache.expire('alarm_send', 60);
                                
                                device.publish('Robot/alarm', JSON.stringify({ ID: uuidV1(), ROBOT_ID: parseInt(ID), DATETIME: new Date(Date.now()).toString(), data: iot_data }));
                            } else {
                                console.log("wait 60 sec");
                            }
                        });
                    } 
    //             });
    //         //});
    //     }
    // });
}

function dataToJSONFormat(data) {
    let data_string = bin2string(data).replace("FL,", "").replace(new RegExp("\r", 'g'), ",").replace("\u001a\u0003", "");
    let data_array = data_string.split(',');

    let alarm_num = data_array.shift();
    data_array.pop();

    let data_json = { ALARM: []};
   
    data_json['ALARM_NUM'] = alarm_num;

    for (i = 0; i < data_array.length; i = i + 3) {
        let alarm_code = data_array[i];
        let alarm_name = data_array[i + 1];
        
        let alarm_datatime_array = data_array[i + 2].split(' ');
        let alarm_date = alarm_datatime_array[0];
        let alarm_time = alarm_datatime_array[1];

        // ignore 008-017 Safety SW On alarm
        if (alarm_code == '008-017') {
            data_json['ALARM_NUM']--;
            continue;
        }

        data_json['ALARM'].push({
            ALARM_CODE : alarm_code,
            ALARM_NAME : alarm_name,
            ALARM_DATE : alarm_date,
            ALARM_TIME : alarm_time
        });
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