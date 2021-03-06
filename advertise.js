#!/usr/local/bin/node

var bleno          = require('bleno');
var PrimaryService = bleno.PrimaryService;
var Characteristic = bleno.Characteristic;

var nearby_campaign_advertiser_manager_service_UUID =
    'a7e6817278094367aa52b8b63adf5e37';
var nearby_campaign_advertiser_manager_characteristic_UUID =
    'a28a102255d547ee898d1c6ff0c9a113';

var tilts = {};

function echo_tilt() {
    var service = _build_service();

    bleno.startAdvertising('tilt_echo', [ service.uuid ], function(error) {
        if (!error) {
            _advertising = true;
            bleno.setServices([ service ]);
        }
    });
}

function _build_service() {
    var characteristics = [];

    for (var uuid in tilts) {
        var tilt = tilts[uuid];
        var on_read = function(tilt) {
            return function(offset, callback) {
                if (offset > tilt.length) {
                    return callback(Characteristic.RESULT_INVALID_OFFSET, null);
                } else if (offset === 0) {
                    return callback(Characteristic.RESULT_SUCCESS, tilt);
                } else {
                    var data = tilt.slice(offset);
                    return callback(Characteristic.RESULT_SUCCESS, data);
                }
            };
        };
        characteristics.push(new Characteristic({
            uuid: nearby_campaign_advertiser_manager_characteristic_UUID,
            properties    : [ 'read' ],
            onReadRequest : on_read(tilts[uuid]),
        }));
    }

    return new PrimaryService({
        uuid            : nearby_campaign_advertiser_manager_service_UUID,
        characteristics : characteristics,
    });
}

bleno.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        var data = new Buffer(process.argv[2]);
        tilts[data.toString()] = data;
        echo_tilt();
    } else {
        bleno.stopAdvertising();
    }
});
