# Ingics BLE-GW Demo Board
> Dashboard application for Ingics BLEGW demostration or testing

![](../assets/screenshot-gwcfg.png)
![](../assets/screenshot-beacons.png)

## Installation

Linux:

The application will be released in appImage (https://appimage.org/) format for Linux, you can simply execute the file from console or desktop GUI. The application will be tested on Ubuntu 18.04.

Windows:

The application will be released as a portable app file (without installer) for Windows. The application will be tested on Windows 10.

## Usage

### Using M2M
iGS03:
- Mode: M2M Server
- Port: (any avaiable port number)

APP Gateway:
- Mode: M2M
- Name: (any string as gateway name)
- Port: (same port number as iGS03)

### Using MQTT
iGS03:
- Mode: MQTT Client
- Host: test.mosquitto.org (or any broker support open autherticate)
- Port: 2883 (or port number served by the broker)
- Publish Topic: (any topic string for identify the device)

APP Gateway:
- Mode: M2M
- Name: (any string as gateway name)
- Host: test.mosquitto.org (same as iGS03 setting)
- Port: 2883 (same as iGS03 setting)
- Topic: (same as iGS03 setting)

### Activate Connection
- Click gateway card for activate gateway (broker) connection
- Logs button for switch to log browser
- Beacon button for switch to beacon browser
    - support rssi filter
    - support test search (filter)

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
