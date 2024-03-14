/**
 * This file is used specifically for security reasons.
 * Here you can access Nodejs stuff and inject functionality into
 * the renderer thread (accessible there through the "window" object)
 *
 * WARNING!
 * If you import anything from node_modules, then make sure that the package is specified
 * in package.json > "dependencies" and NOT in "devDependencies"
 *
 * Example (injects window.myAPI.doAThing() into renderer thread):
 *
 *   const { contextBridge } = require('electron')
 *
 *   contextBridge.exposeInMainWorld('myAPI', {
 *     doAThing: () => {}
 *   })
 */
const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('m2m', {
    connect: (host, port) => ipcRenderer.send('m2m-connect', { host, port }),
    disconnect: () => ipcRenderer.send('m2m-disconnect'),
    onConnect: (callback) => ipcRenderer.on('m2m-connect', (_event) => callback()),
    onLine: (callback) => ipcRenderer.on('m2m-line', (_event, line) => callback(line)),
    onEnd: (callback) => ipcRenderer.on('m2m-end', (_event) => callback()),
    onClose: (callback) => ipcRenderer.on('m2m-close', (_event) => callback()),
    onError: (callback) => ipcRenderer.on('m2m-error', (_event, err) => callback(err))
})

contextBridge.exposeInMainWorld('mqtt', {
    connect: (host, port, topic) => ipcRenderer.send('mqtt-connect', { host, port, topic }),
    disconnect: () => ipcRenderer.send('mqtt-disconnect'),
    onConnect: (callback) => ipcRenderer.on('mqtt-connect', (_event) => callback()),
    onMessage: (callback) => ipcRenderer.on('mqtt-message', (_event, message) => callback(message)),
    onEnd: (callback) => ipcRenderer.on('mqtt-end', (_event) => callback()),
    onClose: (callback) => ipcRenderer.on('mqtt-close', (_event) => callback()),
    onError: (callback) => ipcRenderer.on('mqtt-error', (_event, err) => callback(err))
})
