const { device, ID } = require('./bootstrap');
const { SU } = require('./function/SU');
const { SF } = require('./function/SF');
const { AC } = require('./function/AC');

let step = 0;

device
    .on('connect', () => {
        console.log('connect to AWS successfully'.blue);

        exec();
    });

function exec () {
    switch (step) {
        case 0:
            console.log("step 0");
        
            step = 1;
            setTimeout(() => {
                exec();
            }, 1000)
            break
        case 1:
            console.log("step 1");

            SF(device, ID);
            
            step = 2;
            setTimeout(() => {
                exec();
            }, 1000)
            break
        case 2:
            console.log("step 2")

            AC(device, ID);
            
            step = 3;
            setTimeout(() => {
                exec();
            }, 1000)
            break
        case 3:
            console.log("step 3");

            SU(device, ID);

            step = 0;
            setTimeout(() => {
                exec();
            }, 1000);
            break
        default: 
            setTimeout(() => {
                process.exit(0);
            }, 0)
            break
    }
}