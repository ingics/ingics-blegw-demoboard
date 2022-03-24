# Ingics BLE-GW Demo Board
> Dashboard application for Ingics BLEGW demostration or testing

## Installation

Linux:

The application will be released in appImage (https://appimage.org/) format for Linux, you can download the file from release page, make it executable and run it directly. The application has been tested on Ubuntu 20.04.

Windows:

The application will be released as a portable app file (without installer) for Windows 10.

## Usage

### Configurations
Need to configure iGS03X and APP's connection.
![](../assets/screenshot-configurations.png) 

### Using M2M
iGS03:
- Mode: M2M Server
- Port: (any avaiable port number)

APP Configuration:
- Mode: M2M (TCP Client)
- Port: (same port number as iGS03)

### Using MQTT
System architecture of using MQTT broker.
![](../assets/mqtt-arch.png)

iGS03:
- Mode: MQTT Client
- Host: test.mosquitto.org (or any broker support open autherticate)
- Port: 2883 (or port number served by the broker)
- Publish Topic: (any topic string for identify the device)

APP Configuration:
- Mode: MQTT Client
- Host: test.mosquitto.org (same as iGS03 setting)
- Port: 2883 (same as iGS03 setting)
- Topic: (same as iGS03 setting)

### Dashboard
After connected, # of Messages and # of Beacons will display on dashboard.
![](../assets/screenshot-dashboard.png) 

### Browse Messages
Click on the panel of "# of Messages" on dashboard.
![](../assets/screenshot-logs.png) 

Click on a raw message to display the parsed result.
![](../assets/screenshot-log-parser.png) 

### Browse Beacons
Click on the panel of "# of Beacons" on dashboard.
![](../assets/screenshot-beacons.png)

Click the RSSI icon in detail view to display the RSSI chart of the beacon.
![](../assets/screenshot-rssi-chart.png)

## Development Setup

### Install the dependencies
```bash
npm install
```

### Install quasar
```bash
npm install -g @quasar/cli
```

### Start the app in development mode (hot-code reloading, error reporting, etc.)
```bash
quasar dev -m electron
```
or
```bash
npm run serve
```

### Build the app for production
```bash
quasar build -m electron
```
or 
```bash
npm run build
```

### Customize the configuration
See [Configuring quasar.conf.js](https://quasar.dev/quasar-cli/quasar-conf-js).
