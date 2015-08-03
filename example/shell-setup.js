
var SoftAPSetup = require('../index');
var config = require('../config');
var path = require('path');


// Globals
var sap = new SoftAPSetup();
var APs;


// Callbacks
var scan_cb = function(err, dat){
  
  if (err) {throw err;}
  
  console.log('found:');
  APs = dat['scans'];
  console.log(dat);
};


// Executed on load
console.log('Scanning APs...');
sap.scan(scan_cb);
