var request = require('superagent');

var API_URL     = process.env.RANCHER_URL,
    API_KEY     = process.env.RANCHER_KEY,
    API_SECRET  = process.env.RANCHER_SECRET;

var args = process.argv.slice(2);
if(args.length < 3) {
    console.error('At least 3 arguments are required: deploy.js environmentId serviceID dockerImage');
    return;
}

var environmentId = args[0],
    service = args[1],
    image = args[2];

if(service.indexOf('id:') === 0) {
    deploy(environmentId, service.substr(3), image);
} else {
    findServiceByName(environmentId, service, function(data) {
        if(!data || data.type != 'service') {
            console.error('ERROR: Service named "' + service + '" could not be found/fetched');
            return;
        }
        deploy(environmentId, data.id, image);
    });
}

function deploy(environmentId, serviceId, image) {
    getService(environmentId, serviceId, function(data) {
        if(!data || data.type != 'service') {
            console.error('ERROR: Service #' + serviceId + ' could not be found/fetched');
            return;
        }
        var launchConfig = data.launchConfig;
        launchConfig.imageUuid = 'docker:' + image;
        upgradeService(environmentId, serviceId, launchConfig, function(response) {
            if(response && response.status == 'success') {
                console.info('Upgrade of ' + response.service.type + ' "' + response.service.name + '" to image "' + response.service.launchConfig.imageUuid.substr(7) + '"');
            } else {
                console.error('Service Upgrade failed', response);
            }
        });
    });
}

function getService(environmentId, serviceId, callback) {
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
            var data = res.body;
            callback(data);
        });
}

function findServiceByName(environmentId, name, callback) {
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
            var data = res.body;
            callback(data.data.length > 0 ? data.data[0] : null);
        });
}

function upgradeService(environmentId, serviceId, launchConfig, callback) {
    request
        .post(API_URL + '/projects/' + environmentId + '/services/' + serviceId + '?action=upgrade')
        .auth(API_KEY, API_SECRET)
        .set('Accept', 'application/json')
        .set('Content-Type', 'application/json')
        .send({
            "inServiceStrategy": {
                "batchSize": 3,
                "intervalMillis": 2000,
                "startFirst": true,
                "launchConfig": launchConfig
            }
        })
        .end(function(err, res) {
            if(err) {
                console.error('ERROR: upgradeService', err, res);
                callback(null);
                return;
            }
            var data = res.body;
            console.info('triggered upgrade of service "' + data.name +  '"');
            checkUpgradeStatus(environmentId, serviceId, callback, 5, 600);
        });
}

function checkUpgradeStatus(environmentId, serviceId, callback, intervalSecs, timeoutSecs) {
    if(intervalSecs > timeoutSecs) {
        // trigger cancelupgrade && rollback
        completeUpgrade(environmentId, serviceId, function(data) {
            completeUpgrade(environmentId, serviceId, function(data) {
                callback({status: 'error', message: 'timeout', service: data});
            }, 'rollback');
        }, 'cancelupgrade');
    }
    var timeout = setTimeout(function() {
        console.info(' ...checking status of upgrade process for service ' + serviceId + '...');
        getService(environmentId, serviceId, function(data) {
            if(data && (data.state = 'upgraded'|| data.state == 'active') && data.transitioning == 'no') {
                if(data.state = 'upgraded') {
                    // trigger finish upgrade
                    completeUpgrade(environmentId, serviceId, function(data) {
                        callback({status: 'success', message: 'upgrade successful', service: data});
                    });
                } else {
                    callback({status: 'success', message: 'upgrade successful', service: data});
                }
            } else {
                checkUpgradeStatus(environmentId, serviceId, callback, intervalSecs, timeoutSecs-intervalSecs);
            }
        });
    }, intervalSecs*1000);
}

function completeUpgrade(environmentId, serviceId, callback, action) {
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
