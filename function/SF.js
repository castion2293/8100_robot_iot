const { net, HOST, PORT, redis } = require('../bootstrap');

cache = redis.createClient();

cache.on("error", function (err) {
    console.log("Error " + err);
});

module.exports.SF = (device, ID, data) => {
    if (data[109] != "undefined" && data[109] != null) {
        findALarm(data[109]);

        let iot_data = dataToJSONFormat(data);

        // check is it as same as last iot data, if not, publish the data to cloud
        cache.get("total_status_data", (err, reply) => {
            if (JSON.stringify(iot_data) != reply) {
                device.publish('Robot/total_status_topic', JSON.stringify({ID: parseInt(ID), DATETIME: new Date(Date.now()).toString(), data: iot_data}));
                cache.set("total_status_data", JSON.stringify(iot_data));
                console.log("Publishing Total Status Data...")
            }
        });

        let iot_coordinate_data = dataToCoordinateJSONFormat(data);

        // check is it as same as last iot data, if not, publish the data to cloud
        cache.get("coordinate_data", (err, reply) => {
            if (JSON.stringify(iot_coordinate_data) != reply) {
                device.publish('Robot/coordinate_topic', JSON.stringify({ID: parseInt(ID), DATETIME: new Date(Date.now()).toString(), data: iot_coordinate_data}));
                cache.set("coordinate_data", JSON.stringify(iot_coordinate_data));
                console.log("Publishing Coordinate Data...")
            }
        });
    }
}

function dataToJSONFormat(data) {
    let data_json = {}

    data_json['SERVO'] = findServo(data[3]);
    data_json['EMG'] = findEmg(data[4]);
    data_json['EXE_LINE'] = twoByteToDec(data[27], data[28]);
    data_json['ANA_LINE'] = twoByteToDec(data[29], data[30]);
    data_json['EXE_TASK'] = twoByteToDec(data[31], data[32]);
    data_json['ANA_TASK'] = twoByteToDec(data[33], data[34]);
    data_json['FREEHOLD'] = twoByteToDec(data[35], data[36]);
    data_json['COORDINATE'] = findCoordinate(data[38]);
    data_json['RATE'] = findRate(data[40]);
    data_json['MODE'] = findMode(data[42]);
    data_json['MASTER'] = findMaster(data[44]);

    data_json['DIN_1_16'] = toHEXArray(data[55], data[56]);
    data_json['DIN_17_32'] = toHEXArray(data[57], data[58]);
    data_json['DIN_33_48'] = toHEXArray(data[59], data[60]);
    data_json['DIN_49_64'] = toHEXArray(data[61], data[62]);
    data_json['DIN_101_116'] = toHEXArray(data[63], data[64]);
    data_json['DIN_117_132'] = toHEXArray(data[65], data[66]);
    data_json['DIN_133_148'] = toHEXArray(data[67], data[68]);
    data_json['DIN_149_164'] = toHEXArray(data[69], data[70]);
    data_json['DIN_201_216'] = toHEXArray(data[71], data[72]);
    data_json['DIN_217_232'] = toHEXArray(data[73], data[74]);
    data_json['DIN_233_248'] = toHEXArray(data[75], data[76]);
    data_json['DIN_249_264'] = toHEXArray(data[77], data[78]);
    
    data_json['DOUT_1_16'] = toHEXArray(data[87], data[88]);
    data_json['DOUT_17_32'] = toHEXArray(data[89], data[90]);
    data_json['DOUT_33_48'] = toHEXArray(data[91], data[92]);
    data_json['DOUT_49_64'] = toHEXArray(data[93], data[94]);
    data_json['DOUT_101_116'] = toHEXArray(data[95], data[96]);
    data_json['DOUT_117_132'] = toHEXArray(data[97], data[98]);
    data_json['DOUT_133_148'] = toHEXArray(data[99], data[100]);
    data_json['DOUT_149_164'] = toHEXArray(data[101], data[102]);
    data_json['DOUT_201_216'] = toHEXArray(data[103], data[104]);
    data_json['DOUT_217_232'] = toHEXArray(data[105], data[106]);
    data_json['DOUT_233_248'] = toHEXArray(data[107], data[108]);
    data_json['DOUT_249_264'] = toHEXArray(data[109], data[110]);

    return data_json;
}

function findALarm (byte) {
    let alarm_flag = dec2bin(byte).split('')[2];
    (alarm_flag == 1) ? cache.set("alarm_flag", true) : cache.set("alarm_flag", "");
}

function findServo (byte) {
    if (parseInt(byte) == 1) {
        return Boolean(true);
    } 
    return Boolean(false);
}

function findEmg (byte) {
    if (parseInt(byte) == 1) {
        return Boolean(true);
    } 
    return Boolean(false);
}

function twoByteToDec (...byte) {
    let num = (byte[0] & 0xFF) << 8 | (byte[1] & 0xFF);
    return parseInt(num);
}

function findCoordinate (byte) {
    let element = ['JOINT', 'TOOL', 'WORK', 'WORLD'];

    return element[parseInt(byte)];
}

function findRate (byte) {
    let element = ['LOW', 'MEDIUM', 'HIGH'];

    return element[parseInt(byte)];
}

function findMode (byte) {
    let element = ['JOG', 'INCHING', 'FREE'];

    return element[parseInt(byte)];
}

function findMaster (byte) {
    let element = ['TEACHING', 'INTERNAL', 'EXT (SIG)', 'EXT (HOST)'];

    return element[parseInt(byte)];
}

function toHEXArray (...byte) {
    let array1 = dec2bin(byte[0]).split('').reverse();
    let array2 = dec2bin(byte[1]).split('').reverse();

    let array_string =  array2.concat(array1);

    return array_string.map(e => {
        if (e == 1) {
            return Boolean(true);
        }

        return Boolean(false);
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

function dataToCoordinateJSONFormat(data) {
    let coordinate = findCoordiateData(data);

    let data_json = {}

    data_json['JOINT'] = coordinate.splice(0, 8);
    data_json['WORLD'] = coordinate.splice(0, 8);
    data_json['WORK'] = coordinate

    return data_json;
}

function findCoordiateData(data) {
    var buf = new ArrayBuffer(4); // Create a buffer
    var view = new DataView(buf); // Create a data view of it
    let cor = [];

    for (let i = 119; i <= 214; i = i + 4) {
        let dataSet =  [data[i], data[i + 1], data[i + 2], data[i + 3]];

        // set bytes
        dataSet.forEach(function (b, i) {
            view.setUint8(i, b);
        });

        // Read the bits as a float; note that by doing this, we're implicitly
        // converting it from a 32-bit float into JavaScript's native 64-bit double
        cor.push(precisionRound(view.getFloat32(0), 3));
    }

    return cor;
}

function precisionRound(number, precision) {
    var factor = Math.pow(10, precision);
    return Math.round(number * factor) / factor;
}

