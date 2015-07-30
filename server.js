#!/usr/local/bin/node

var child_process  = require('child_process');
var noble          = require('noble');

var nearby_campaign_advertiser_manager_service_UUID =
    'a7e6817278094367aa52b8b63adf5e37';
var nearby_campaign_advertiser_manager_characteristic_UUID =
    'a28a102255d547ee898d1c6ff0c9a113';

noble.on('discover', function(peripheral) {
    var cUUIDs = [nearby_campaign_advertiser_manager_characteristic_UUID];
    peripheral.connect(function(error) {
        if (error) { console.log(error); }
        peripheral.discoverSomeServicesAndCharacteristics([], cUUIDs,
            function(error, services, characteristics) {
                characteristics.forEach(function(characteristic) {
                    characteristic.read(function(error, data) {
                        if (error) { console.log(error); }
                        if (data)  {
                            peripheral.disconnect(function(error) {
                                noble.stopScanning();
                                var advertise = function() {
                                    child_process.exec(
                                        '/srv/tilt-echo/advertise.js ' +
                                        data.toString(),
                                        { timeout : 60000 },
                                        function (error, stdout, stderr) {
                                            advertise();
                                        }
                                    );
                                }
                                advertise();
                            });
                        }
                    });
                });
            }
        );
    });
});

noble.on('stateChange', function(state) {
    if (state === 'poweredOn') {
        noble.startScanning([nearby_campaign_advertiser_manager_service_UUID]);
    } else {
        noble.stopScanning();
    }
});
