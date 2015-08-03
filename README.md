# softap-setup-js
Spark SoftAP Setup for JavaScript

## NOTES about HTTP
Branch "HTTP" tweaked this package by Emily Rose to use the HTTP API now available on the Photon. (Firmware branch photon_043).

The example "basic-setup.js" will connect my Photon to the WiFi... however it is broken in the two following ways:

1. The Photon does not respond to the connect-ap request. It simply begins going through the connection process, and lets the request time out.
2. The LED turns RED and blinks a few times after receiving the connect-ap command. The Photon then restarts and goes through it's usual connection process.

Any help with the code would be appreciated. (Note I'd like restrict package use to those that can be run from the Browser using Browserify and/or Webpack).


## Installation

```
npm install softap-setup
```

## Configuration

Configuration options are specified in the following three ways:

1. Defaults loaded from config/defaults.json
2. SOFTAP_* environment variables specified
3. Options object provided during instantiation


### Configuration File

The file located at `config/defaults.json` contains the most common SoftAP settings.
If you wish to override these settings, please see below for usage information on environment variables and the options object.


### Environment Variables

Defining either of the following environment variables will override defaults.json:

* SOFTAP_HOST (defaults to 192.168.0.1)
* SOFTAP_PORT (defaults to 5609)


###  Options Object

When instantiating a SoftAPSetup object, simply provide an options object with values for the keys you would like to override.

### Defaults

```
{
	"host": "192.168.0.1",
	"port": "5609",
	"keep_alive": true,
	"timeout": 10000,
	"no_delay": true
}
```

## Usage

### Obtaining Device Information

You may often find it necessary to query the ID and claim status of your device. This is accomplished with a single method: `deviceInfo`. This method takes a single argument, which should be a reference to a callback function with the standard Node.js callback signature (example below).

#### Example:
```js
var SoftAPSetup = require('softap-setup');
var sap = new SoftAPSetup();

sap.deviceInfo(callback);
function callback(err, dat) {
	if (err) { throw err; }
	console.log("Device ID: %s, claimed: %s", dat.id, dat.claimed ? "yes" : "no");
};
```
The above code will attempt to retrieve the device information from the device (assuming the system running this code is connected to the device in SoftAP mode), with the default configuration (192.168.0.1:5609). When the underlying request is successfully fulfilled, the callback is called with no error parameter (null), and a result object containing the `id` of the device as a string of hex, as well as the `claimed` status as a boolean value, like so:

```json
{ "id": "STRINGOFHEXREPRESENTINGYOURDEVICEIDHERE", "claimed": false }
```

### Obtaining the Device's Public Key

The public key must be obtained from the device before it can be successfully configured. This is due to the fact that the public key is used to encrypt the passphrase for any AP that is configured to use security (see below). If you do not already know the public key of the device, you may request it from the device with the following command:

#### Example
```js
var sap = new SoftAPSetup();
sap.publicKey(callback);
function callback(err, dat) {
	if (err) { throw err; }
	console.log(dat);
};
```

### Scanning for Nearby Access Points

While connected to the device in SoftAP mode, it is possible to request a list of access points that have been detected in the area. This is done by way of the `scan` command. This command is one of the few commands that will typically take more than a few hundred milliseconds to complete. When executed, the device will listen for access points which are broadcasting their SSID. Important to note here is that it's not possible to detect networks which don't broadcast their SSID. You can still configure a non-broadcast network manually (see below).

### Example

```js
var sap = new SoftAPSetup();
sap.scan(callback);
function callback(err, dat) {
	if(err) { throw err; }
	console.log("Networks Identified:");
	console.log(dat);
};
```

### Configuring the Device for a Selected Access Point

The following code snippet will store the provided details on the device, and cause it to attempt to connect to the AP you specify. If it is unsuccessful; it will return to SoftAP mode shortly thereafter, so you may reconnect to it and try again.

#### Example
```js
var sap = new SoftAPSetup();
sap.configure({
	ssid: "<NETWORK NAME>",
	security: "<SECURITY TYPE (see below)>",
	password: "[PASSWORD]",
	channel: "<CHANNEL>"
}, callback);
```

### Connecting to a Previously Configured Access Point

Once you have successfully issued a `configure` command, it's now only a matter of giving the device the go-ahead to actually connect. As you may have guessed, this is done via the `connect` command. It takes only a callback parameter, and will always execute "successfully". Since there is no way to verify that the provided configuration is correct until a connection attempt is made; you will need to verify that the device is able to successfully connect to the cloud (most likely via an API request to the cloud to check for the presence of the device ID that was just configured).

### Example
```js
var sap = new SoftAPSetup();
sap.connect(callback);
function callback(err, dat) {
	console.log("Device is attempting to connect to the AP...");
};
```

### Wireless Security Types

Valid security types are as follows:

1. "open" or "none" - no security
2. "wep_psk" - WEP pre-shared key
3. "wep_shared" - Open WEP
4. "wpa_tkip" — WPA with TKIP
5. "wpa_aes" — WPA with AES
6. "wpa2_tkip" - WPA2 with TKIP
7. "wpa2_aes" — WPA2 with AES
8. "wpa2_mixed" — WPA2 AES & TKIP

## Notes

### AP Password Security

It's worth noting that this library uses the public key of the device to encrypt any AP passwords that are sent when configuring and connecting your device. 

