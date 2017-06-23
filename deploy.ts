import { Rancher, RancherServiceInfo } from "./src/api/Rancher.js";

const args = process.argv.slice(2);
if(args.length < 3) {
    console.error('At least 3 arguments are required: deploy.js environmentId serviceID dockerImage');
    process.exit(1);
}
const environmentId = args[0],
    service = args[1],
    image = args[2];

const rancher = new Rancher(
    process.env.RANCHER_URL,
    process.env.RANCHER_KEY,
    process.env.RANCHER_SECRET,
)

rancher.deploy(environmentId, service, image).then((data:any) => {
    console.info(data.data);
});

// if(service.indexOf('id:') === 0) {
//     rancher.deploy(environmentId, service.substr(3), image);
// } else {
//     rancher.findServiceByName(environmentId, service).then((data:RancherServiceInfo) => {
//         if(!data || data.type != 'service') {
//             console.error('ERROR: Service named "' + service + '" could not be found/fetched');
//             process.exit(1);
//         }
//         rancher.deploy(environmentId, data.id, image);
//     });
// }
