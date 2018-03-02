const { device, ID, net, HOST, PORT, redis } = require('./bootstrap');
const { SU } = require('./function/SU');
const { SF } = require('./function/SF');
const { AC } = require('./function/AC');

let step = 0;
let command;

client = new net.Socket();

cache = redis.createClient();

cache.on("error", function (err) {
    console.log("Error " + err);
});

device
    .on('connect', () => {
        console.log('connect to AWS successfully'.blue);

        client.connect(PORT, HOST, () => {
            console.log("TCP Connection opened successfully!".green);
        
            exec();
        });

        client.on("data", data => {

            if (command === "SF") {
                SF(device, ID, data);
            }
            else if (command === "AC") {
                AC(device, ID, data);
            } else if (command === "SU") {
                SU(device, ID, data);
            }

            setTimeout(() => {
                client.write("OK\r");
            }, 50)
        });

        client.on('error', (err) => {
            console.log("Error: "+err.message);
        });
    });

function exec () {
    switch (step) {
        case 0:
            console.log("step 0");
            
            step = 1;
            setTimeout(() => {
                exec();
            }, 500)
            break
        case 1:
            console.log("step 1");

            command = "SF";
            // SF(device, ID, client);
            client.write("SF\r");
            
            step = 2;

            setTimeout(() => {
                exec();
            }, 500)
            break
        case 2:
            console.log("step 2")

            command = "AC";
            // AC(device, ID, client);

            cache.get("alarm_flag", (err, reply) => {
                if (Boolean(reply)) {
                    client.write("AC\r");
                }
            });
            
            step = 3;
            setTimeout(() => {
                exec();
            }, 500)
            break
        case 3:
            console.log("step 3");

            command = "SU";
            //SU(device, ID, client);
            client.write("SU\r");

            step = 0;
            setTimeout(() => {
                exec();
            }, 500);
            break
        default: 
            setTimeout(() => {
                process.exit(0);
            }, 0)
            break
    }
}

function bin2string(array){
	var result = "";
	for(var i = 0; i < array.length; ++i){
		result+= (String.fromCharCode(array[i]));
	}
	return result;
}