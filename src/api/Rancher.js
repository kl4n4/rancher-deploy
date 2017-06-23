"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var node_fetch_1 = require("node-fetch");
var Rancher = (function () {
    function Rancher(apiUrl, apiKey, apiSecret) {
        this.apiUrl = apiUrl;
        this.apiKey = apiKey;
        this.apiSecret = apiSecret;
    }
    Rancher.prototype.deploy = function (environmentId, serviceId, image) {
        return this.findServiceByName(environmentId, serviceId);
    };
    Rancher.prototype.findServiceByName = function (environmentId, name) {
        var promise = node_fetch_1.default(this.apiUrl + '/projects/' + environmentId + '/services/?name=' + name, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'Authorization': 'Basic ' + new Buffer(this.apiKey + ':' + this.apiSecret).toString('base64'),
            },
        }).then(function (res) {
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
    };
    return Rancher;
}());
exports.Rancher = Rancher;
exports.default = Rancher;
