#!/usr/bin/env node

var child_process  = require('child_process');
var noble          = require('noble');
//var bleno          = require('bleno');
//var PrimaryService = bleno.PrimaryService;
//var Characteristic = bleno.Characteristic;

var nearby_campaign_advertiser_manager_service_UUID =
    'a7e6817278094367aa52b8b63adf5e37';
var nearby_campaign_advertiser_manager_characteristic_UUID =
    'a28a102255d547ee898d1c6ff0c9a113';

var tilts = {};
var _advertising = false;

//function echo_tilt() {
//    if (_advertising) {
//        bleno.stopAdvertising(function() {
//            _advertising = false;
//            discover_tilt();
//        });
//    } else {
//        var service = _build_service();
//
//        bleno.startAdvertising('echo', [ service.uuid ], function(error) {
//            if (!error) {
//                _advertising = true;
//                bleno.setServices([ service ]);
//            }
//        });
//    }
//}
//
//function _build_service() {
//    var characteristics = [];
//
//    for (var uuid in tilts) {
//        var tilt = tilts[uuid];
//        var on_read = function(tilt) {
//            return function(offset, callback) {
//                if (offset > tilt.length) {
//                    return callback(Characteristic.RESULT_INVALID_OFFSET, null);
//                } else if (offset === 0) {
//                    return callback(Characteristic.RESULT_SUCCESS, tilt);
//                } else {
//                    var data = tilt.slice(offset);
//                    return callback(Characteristic.RESULT_SUCCESS, data);
//                }
//            };
//        };
//        characteristics.push(new Characteristic({
//            uuid: nearby_campaign_advertiser_manager_characteristic_UUID,
//            properties    : [ 'read' ],
//            onReadRequest : on_read(tilts[uuid]),
//        }));
//    }
//
//    return new PrimaryService({
//        uuid            : nearby_campaign_advertiser_manager_service_UUID,
//        characteristics : characteristics,
//    });
//}
//
//bleno.on('stateChange', function(state) {
//  console.log('on -> stateChange: ' + state + ', address = ' + bleno.address);
//
//    if (state === 'poweredOn') {
//          var data = new Buffer('CMP291377C6156111E58839727F642C73ED');
//          tilts[data.toString()] = data;
//          echo_tilt();
//    } else {
//          bleno.stopAdvertising();
//    }
//});

function discover_tilt() {
    noble.on('discover', function(peripheral) {
        var cUUIDs = [nearby_campaign_advertiser_manager_characteristic_UUID];
        peripheral.connect(function(error) {
            if (error) { console.log(error); }
            peripheral.discoverSomeServicesAndCharacteristics([], cUUIDs,
                function(error, services, characteristics) {
                    characteristics.forEach(function(characteristic) {
                        characteristic.read(function(error, data) {
                            if (error) {
                                console.log(error);
                            }
                            if (data) {
                                peripheral.disconnect(function(error) {
                                    noble.stopScanning();
                                    //tilts[data.toString()] = data;
                                    //echo_tilt();
                                    // hax for now
                                    child_process.exec(
                                        './bcast.arm ' + data.toString()
                                    );
                                });
                            }
                        });
                    });
                }
            );
        });
    });

    noble.startScanning([nearby_campaign_advertiser_manager_service_UUID]);
}

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        discover_tilt();
    }
});
