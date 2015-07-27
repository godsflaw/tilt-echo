#!/usr/bin/env node

var noble          = require('noble');
var bleno          = require('bleno');
var PrimaryService = bleno.PrimaryService;
var Characteristic = bleno.Characteristic;

var nearby_campaign_advertiser_manager_service_UUID =
    'a7e6817278094367aa52b8b63adf5e37';
var nearby_campaign_advertiser_manager_characteristic_UUID =
    'a28a102255d547ee898d1c6ff0c9a113';

var current_echo;

function echo_tilt(campaign) {
    var characteristic = new Characteristic({
        uuid: nearby_campaign_advertiser_manager_characteristic_UUID,
        properties    : [ 'read' ],
        onReadRequest : function(offset, callback) {
            if (offset > campaign.length) {
                return callback(Characteristic.RESULT_INVALID_OFFSET, null);
            } else if (offset === 0) {
                return callback(Characteristic.RESULT_SUCCESS, campaign);
            } else {
                var data = campaign.slice(offset);
                return callback(Characteristic.RESULT_SUCCESS, data);
            }
        },
    });

    var service = new PrimaryService({
        uuid            : nearby_campaign_advertiser_manager_service_UUID,
        characteristics : [ characteristic ],
    });

    bleno.on('advertisingStart', function(error) {
        console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));
        if (!error) { bleno.setServices([ service ]); }
    });

console.log("BROADCAST: " + campaign.toString());
    bleno.startAdvertising('echo', [ service.uuid ]);
}

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([nearby_campaign_advertiser_manager_service_UUID]);
    } else {
        noble.stopScanning();
    }
});

noble.on('discover', function(peripheral) {
    var cUUIDs = [nearby_campaign_advertiser_manager_characteristic_UUID];
    peripheral.connect(function(error) {
        if (error) { console.log(error); }
        peripheral.discoverSomeServicesAndCharacteristics([], cUUIDs,
            function(error, services, characteristics) {
                characteristics[0].read(function(error, data) {
                    if (error)        { console.log(error); }
                    if (current_echo) { clearInterval(current_echo); }
                    if (data) {
                        peripheral.disconnect(function(error) {
                            noble.stopScanning();
                            console.log("DO TEH ECHO");
                            //current_echo = setInterval(echo_tilt, 1000, data);
                            echo_tilt(data);
                        });
                    }
                });
            }
        );
    });
});
