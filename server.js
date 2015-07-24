#!/usr/bin/env node

var noble = require('noble');

noble.on('stateChange', function(state) {
  if (state === 'poweredOn') {
    noble.startScanning(['a7e6817278094367aa52b8b63adf5e37'], false);
  } else {
    noble.stopScanning();
  }
});

noble.on('discover', function(peripheral) {
    var cUUIDs = ['a28a102255d547ee898d1c6ff0c9a113'];
    peripheral.connect(function(error) {
        if (error) { console.log(error); }
        peripheral.discoverSomeServicesAndCharacteristics([], cUUIDs,
            function(error, services, characteristics) {
                characteristics[0].read(function(error, data) {
                    if (error) { console.log(error); }
                    console.log(data);
                    console.log(data.toString());
                });
            }
        );
    });
});
