import { app, BrowserWindow, nativeTheme, ipcMain } from 'electron'
import net from 'net'
import path from 'path'
import mqtt from 'mqtt'
import readline from 'readline'

try {
    if (process.platform === 'win32' && nativeTheme.shouldUseDarkColors === true) {
        require('fs').unlinkSync(require('path').join(app.getPath('userData'), 'DevTools Extensions'))
    }
} catch (_) { }

/**
 * Set `__statics` path to static files in production;
 * The reason we are setting it here is that the path needs to be evaluated at runtime
 */
if (process.env.PROD) {
    global.__statics = require('path').join(__dirname, 'statics').replace(/\\/g, '\\\\')
}

let mainWindow

function createWindow () {
    /**
   * Initial window options
   */
    mainWindow = new BrowserWindow({
        width: 1000,
        height: 600,
        useContentSize: true,
        webPreferences: {
            // we enable contextIsolation (Electron 12+ has it enabled by default anyway)
            contextIsolation: true,
            // we use a new way to reference the preload script
            // (it's going to be needed, so add it and create the file if it's not there already)
            preload: path.resolve(__dirname, process.env.QUASAR_ELECTRON_PRELOAD)
        },
        icon: app.isPackaged ? require('path').join(process.resourcesPath, 'icon.png') : require('path').join(__dirname, '../icons/icon.png')
    })

    // mainWindow.removeMenu()
    mainWindow.loadURL(process.env.APP_URL)

    mainWindow.on('closed', () => {
        mainWindow = null
    })

    if (process.env.DEBUGGING) {
    // if on DEV or Production with debug enabled
        mainWindow.webContents.openDevTools()
    } else {
    // we're on production; no access to devtools pls
        mainWindow.webContents.on('devtools-opened', () => {
            mainWindow.webContents.closeDevTools()
        })
    }
}

// try to disable http cache
app.commandLine.appendSwitch('disable-http-cache')

let socket = null

function m2mConnect (_event, { host, port }) {
    socket = new net.Socket()
    socket.on('connect', () => {
        console.log('m2m-client', 'on connect')
        const rl = readline.createInterface({ input: socket })
        rl.on('line', line => {
            console.log('m2m-client', 'line', line.trim())
            mainWindow.webContents.send('m2m-line', line.trim())
        })
        mainWindow.webContents.send('m2m-connect')
    })
    socket.on('end', () => {
        console.log('m2m-client', 'on end')
        socket = null
        mainWindow.webContents.send('m2m-end')
    })
    socket.on('close', () => {
        console.log('m2m-client', 'on close')
        socket = null
        mainWindow.webContents.send('m2m-close')
    })
    socket.on('timeout', () => {
        console.log('m2m-client', 'on timeout')
        socket.end()
        socket = null
        mainWindow.webContents.send('m2m-error', 'timeout')
    })
    socket.on('error', (e) => {
        console.log('m2m-client', 'on error', e.toString())
        socket.end()
        socket = null
        mainWindow.webContents.send('m2m-error', e.toString())
    })

    console.log('m2m-client', 'connect')
    socket.connect(port, host)
}

function m2mDisconnect (_event) {
    console.log('m2m-client', 'close connection')
    if (socket) {
        socket.end()
    }
}

let client = null

function mqttConnect (_event, { host, port, topic }) {
    console.log('mqtt-client', 'connect', host, port, topic)
    client = mqtt.connect({ host, port })
    client.on('connect', function (connack) {
        console.log('mqtt-client', 'on connect', connack)
        client.subscribe(topic)
        mainWindow.webContents.send('mqtt-connect')
    })
    client.on('message', function (_topic, payload) {
        // console.log('mqtt-client', 'on message', payload.toString())
        mainWindow.webContents.send('mqtt-message', payload.toString())
    })
    client.on('close', function () {
        console.log('mqtt-client', 'on close')
        client = null
        mainWindow.webContents.send('mqtt-close')
    })
    client.on('end', function () {
        console.log('mqtt-client', 'on end')
        client = null
        mainWindow.webContents.send('mqtt-end')
    })
    client.on('error', function (error) {
        console.log('mqtt-client', 'on error', error.toString())
        client.end()
        mainWindow.webContents.send('mqtt-error', error.toString())
    })
}

function mqttDisconnect (_event) {
    console.log('mqtt-client', 'close connection')
    if (client) {
        client.end()
    }
}

app.on('ready', () => {
    ipcMain.on('m2m-connect', m2mConnect)
    ipcMain.on('m2m-disconnect', m2mDisconnect)
    ipcMain.on('mqtt-connect', mqttConnect)
    ipcMain.on('mqtt-disconnect', mqttDisconnect)
    createWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})
