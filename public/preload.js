// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { 
    ipcRenderer
} = require("electron");
const Socket = require("simple-websocket")

// Note: Changes to this file will require a build before electron:start works

/**
 * Call an async function with a maximum time limit (in milliseconds) for the timeout
 * @param {Promise} asyncPromise An asynchronous promise to resolve
 * @param {number} timeLimit Time limit to attempt function in milliseconds
 * @returns {Promise | undefined} Resolved promise for async function call, or an error if time limit reached
 */
 const asyncCallWithTimeout = async (asyncPromise, timeLimit) => {
    let timeoutHandle;

    const timeoutPromise = new Promise((_resolve, reject) => {
        timeoutHandle = setTimeout(
            () => _resolve(null),
            timeLimit
        );
    });

    return Promise.race([asyncPromise, timeoutPromise]).then(result => {
        clearTimeout(timeoutHandle);
        return result;
    })
}

/**
 * Test a wss url for successful connection.
 * @param {String} url
 * @returns {Object}
 */
 async function _testConnection(url) {
    return new Promise(async (resolve, reject) => {
        let before = new Date();
        let beforeTS = before.getTime();
        let closing;

        /**
         * Exiting the url connection
         * @param {Boolean} connected 
         * @param {WebSocket} socket 
         * @returns 
         */
        function _exitTest(connected, socket) {
            if (closing || !connected && !socket) {
                return;
            }

            if (socket) {
                socket.destroy();
            }

            closing = true;
            if (!connected) {
                return resolve(null);
            }

            let now = new Date();
            let nowTS = now.getTime();
            return resolve({ url: url, lag: nowTS - beforeTS });
        }

        let socket = new Socket(url);

        socket.on('connect', () => {
            return _exitTest(true, socket);
        });

        socket.on('error', (error) => {
            return _exitTest(false, socket);
        });

        socket.on('close', () => {
            return _exitTest();
        });
    });
}

async function _openURL(target) {
    ipcRenderer.send('openURL', target);
}

async function _openDEX(args) {
    ipcRenderer.send('openDEX', args);
}

window.electron = {
    testConnection: async (url, timeout) => {
        return await asyncCallWithTimeout(_testConnection(url), timeout ?? 3000);
    },
    openURL: async (target) => {
        return _openURL(target);
    },
    openDEX: async (args) => {
        return _openDEX(args);
    },
    fetchLocales: () => {
        const translations = {};
        const languages = ['en','da', 'de', 'et', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'th'];
        const pages = [
            'beet',
            'blockchain',
            'nft',
            'setup'
        ];
        languages.forEach((language) => {
            const localPages = {};
            pages.forEach((page) => {
                const pageContents = require(`./locales/${language}/${page}.json`);
                localPages[page] = pageContents;
            });
            translations[language] = localPages;
        });
        return translations;
    }
}

/*
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
*/