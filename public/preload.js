// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");
const Socket = require("simple-websocket")
// Note: Changes to this file will require a build before electron:start works
//const {useSWR} = require('swr');
const fetcher = (url) => fetch(url, {method: "GET", mode: "cors"}).then((res) => res.json())

/**
 * Test a wss url for successful connection.
 * @param {String} url
 * @returns {Object}
 */
 async function _testConnection(url) {
    return new Promise(async (resolve, reject) => {
        let before = new Date();
        let beforeTS = before.getTime();
        let connected;

        let socket = new Socket(url);
            socket.on('connect', () => {
            connected = true;
            socket.destroy();
        });

        socket.on('error', (error) => {
            socket.destroy();
        });

        socket.on('close', () => {
            if (connected) {
                let now = new Date();
                let nowTS = now.getTime();
                return resolve({ url: url, lag: nowTS - beforeTS });
            } else {
                return resolve(null);
            }
        });
    });
}

async function _openURL(target) {
    ipcRenderer.send('openURL', target);
}

async function _openDEX(args) {
    ipcRenderer.send('openDEX', args);
}

contextBridge.exposeInMainWorld(
    "electron",
    {
        testConnection: async (url) => {
            return _testConnection(url);
        },
        openURL: async (target) => {
            return _openURL(target);
        },
        openDEX: async (args) => {
            return _openDEX(args);
        }
    }
);