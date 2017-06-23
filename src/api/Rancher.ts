import fetch from 'node-fetch';

export interface RancherServiceInfo {
    id: string,
    type: string,
}

export class Rancher {
    constructor(private apiUrl:string, private apiKey:string, private apiSecret:string) {}

    public deploy(environmentId:string, serviceId:string, image:string): Promise<any> {
        return this.findServiceByName(environmentId, serviceId);
    }

    public findServiceByName(environmentId:string, name:string): Promise<RancherServiceInfo> {
        const promise = fetch(
            this.apiUrl + '/projects/' + environmentId + '/services/?name=' + name, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': 'Basic ' + new Buffer(this.apiKey + ':' + this.apiSecret).toString('base64'),
                },
            }).then( (res) => {
                return res.json();
            });
        return promise;
        
        // request
        //     .get(API_URL + '/projects/' + environmentId + '/services/?name=' + name)
        //     .auth(API_KEY, API_SECRET)
        //     .set('Accept', 'application/json')
        //     .set('Content-Type', 'application/json')
        //     .end(function(err, res) {
        //         if(err) {
        //             console.error('ERROR: findServiceByName', err, res);
        //             callback(null);
        //             return;
        //         }
        //         let data = res.body;
        //         callback(data.data.length > 0 ? data.data[0] : null);
        //     });
    }

/*
    public deploy(environmentId, serviceId, image) {
        this.getService(environmentId, serviceId, function(data) {
            if(!data || data.type != 'service') {
                console.error('ERROR: Service #' + serviceId + ' could not be found/fetched');
                return;
            }
            let launchConfig = data.launchConfig;
            launchConfig.imageUuid = 'docker:' + image;
            this.upgradeService(environmentId, serviceId, launchConfig, function(response) {
                if(response && response.status == 'success') {
                    console.info('Upgrade of ' + response.service.type + ' "' + response.service.name + '" to image "' + response.service.launchConfig.imageUuid.substr(7) + '"');
                } else {
                    console.error('Service Upgrade failed', response);
                }
            });
        });
    }

    private getService(environmentId, serviceId, callback) {
        request
            .get(API_URL + '/projects/' + environmentId + '/services/' + serviceId)
            .auth(API_KEY, API_SECRET)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, res) {
                if(err) {
                    console.error('ERROR: getService', err, res);
                    callback(null);
                    return;
                }
                let data = res.body;
                callback(data);
            });
    }

    private findServiceByName(environmentId, name, callback) {
        request
            .get(API_URL + '/projects/' + environmentId + '/services/?name=' + name)
            .auth(API_KEY, API_SECRET)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, res) {
                if(err) {
                    console.error('ERROR: findServiceByName', err, res);
                    callback(null);
                    return;
                }
                let data = res.body;
                callback(data.data.length > 0 ? data.data[0] : null);
            });
    }

    private upgradeService(environmentId, serviceId, launchConfig, callback) {
        request
            .post(API_URL + '/projects/' + environmentId + '/services/' + serviceId + '?action=upgrade')
            .auth(API_KEY, API_SECRET)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .send({
                "inServiceStrategy": {
                    "batchSize": BATCH_SIZE,
                    "intervalMillis": 2000,
                    "startFirst": START_FIRST,
                    "launchConfig": launchConfig
                }
            })
            .end(function(err, res) {
                if(err) {
                    console.error('ERROR: upgradeService', err, res);
                    callback(null);
                    return;
                }
                let data = res.body;
                console.info('triggered upgrade of service "' + data.name +  '"');
                checkUpgradeStatus(environmentId, serviceId, callback, 5, 600);
            });
    }

    private checkUpgradeStatus(environmentId, serviceId, callback, intervalSecs, timeoutSecs) {
        if(intervalSecs > timeoutSecs) {
            // trigger cancelupgrade && rollback
            this.completeUpgrade(environmentId, serviceId, function(data) {
               this. completeUpgrade(environmentId, serviceId, function(data) {
                    callback({status: 'error', message: 'timeout', service: data});
                }, 'rollback');
            }, 'cancelupgrade');
        }
        let timeout = setTimeout(function() {
            console.info(' ...checking status of upgrade process for service ' + serviceId + '...');
            this.getService(environmentId, serviceId, function(data) {
                if(data && (data.state = 'upgraded'|| data.state == 'active') && data.transitioning == 'no') {
                    if(data.state = 'upgraded') {
                        // trigger finish upgrade
                        this.completeUpgrade(environmentId, serviceId, function(data) {
                            callback({status: 'success', message: 'upgrade successful', service: data});
                        });
                    } else {
                        callback({status: 'success', message: 'upgrade successful', service: data});
                    }
                } else {
                    this.checkUpgradeStatus(environmentId, serviceId, callback, intervalSecs, timeoutSecs-intervalSecs);
                }
            });
        }, intervalSecs*1000);
    }

    private completeUpgrade(environmentId, serviceId, callback, action) {
        action = action || 'finishupgrade'
        request
            .post(API_URL + '/projects/' + environmentId + '/services/' + serviceId + '?action=' + action)
            .auth(API_KEY, API_SECRET)
            .set('Accept', 'application/json')
            .set('Content-Type', 'application/json')
            .end(function(err, res) {
                if(err) {
                    console.error('ERROR: completeUpgrade', err, res);
                    callback(null);
                    return;
                }
                callback(res.body);
            });
    }
*/
}

export default Rancher;
