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

/**
 * Retrieve the holders of an NFT
 * @param {String} environment 
 * @param {String} asset_id 
 */
async function _fetchHolder (environment, asset_id) {
    return new Promise(async (resolve, reject) => {
        /*
        const { data, error } = useSWR(
            `https://${environment === "staging" ? `api.testnet` : `api`}.bitshares.ws/openexplorer/asset_holders?asset_id=${asset_id}&start=0&limit=1`,
            fetcher
        );
        */
        let url = `https://${environment === "staging" ? `api.testnet` : `api`}.bitshares.ws/openexplorer/asset_holders?asset_id=${asset_id}&start=0&limit=1`;
        console.log(url)
        let response;
        try {
            response = await fetcher(url);
        } catch (error) {
            console.log(error)
            return reject()
        }

        return resolve(response);
    });    
}

/**
 * Fetch a bitshares object
 * @param {String} object_id 
 */
async function _fetchObject (environment, object_id) {
    return new Promise(async (resolve, reject) => {
        /*
        const { data, error } = useSWR(
            `https://${environment === "staging" ? `api.testnet` : `api`}.bitshares.ws/openexplorer/object?object=${object_id}`,
            fetcher
        );
        */

        let url = `https://${environment === "staging" ? `api.testnet` : `api`}.bitshares.ws/openexplorer/object?object=${object_id}`;
        console.log(url)
        let response;
        try {
            response = await fetcher(url);
        } catch (error) {
            console.log(error)
            return reject()
        }

        return resolve(response);
    });
}


async function _openURL(target) {
    ipcRenderer.send('openURL', target);
}

contextBridge.exposeInMainWorld(
    "electron",
    {
        testConnection: async (url) => {
            return _testConnection(url);
        },
        fetchHolder: async (environment, asset_id) => {
            return _fetchHolder(environment, asset_id);
        },
        fetchObject: async (environment, object_id) => {
            return _fetchObject(environment, object_id);
        },
        openURL: async (target) => {
            return _openURL(target);
        }
    }
);