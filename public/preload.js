// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { 
    ipcRenderer,
    contextBridge
} = require("electron");

// Note: Changes to this file will require a build before electron:start works

async function _openURL(target) {
    ipcRenderer.send('openURL', target);
}

async function _openDEX(args) {
    ipcRenderer.send('openDEX', args);
}

// Expose only the necessary APIs to the renderer process using context bridge
contextBridge.exposeInMainWorld('electron', {
    openURL: async (target) => {
        return _openURL(target);
    },
    openDEX: async (args) => {
        return _openDEX(args);
    },
    getUUID: async () => {
        return await ipcRenderer.invoke('getUUID');
    },
    fetchUserNFTBalances: async (node, accountID, cachedAssets, nonNFTs) => {
        return await ipcRenderer.invoke('fetchUserNFTBalances', node, accountID, cachedAssets, nonNFTs);
    },
    fetchIssuedAssets: async (node, accountID, cachedAssets, nonNFTs) => {
        return await ipcRenderer.invoke('fetchIssuedAssets', node, accountID, cachedAssets, nonNFTs);
    },
    fetchAssets: async (node, asset_ids, nonNFT = false) => {
        return await ipcRenderer.invoke('fetchAssets', node, asset_ids, nonNFT);
    },
    fetchObject: async (node, objectID) => {
        return await ipcRenderer.invoke('fetchObject', node, objectID);
    },
    fetchDynamicData: async (node, asset) => {
        return await ipcRenderer.invoke('fetchDynamicData', node, asset);
    },
    fetchOrderBook: async (node, base, quote, limit) => {
        return await ipcRenderer.invoke('fetchOrderBook', node, base, quote, limit);
    },
    accountSearch: async (node, search_string) => {
        return await ipcRenderer.invoke('accountSearch', node, search_string);
    },
    checkBeet: async (enableSSL) => {
        return await ipcRenderer.invoke('checkBeet', enableSSL);
    },
    connect: async (appName, browser, origin, existingBeetConnection, identity) => {
        return await ipcRenderer.invoke('connect', appName, browser, origin, existingBeetConnection, identity);
    },
    link: async (chain, beetConnection) => {
        return await ipcRenderer.invoke('link', chain, beetConnection);
    },
    beetBroadcast: async (
        chain,
        node,
        opType,
        operations,
        identity
      ) => {
        return await ipcRenderer.invoke(
            'beetBroadcast',
            chain,
            node,
            opType,
            operations,
            identity
        );
    },
    generateDeepLink: async (appName, chain, node, opType, operations)=> {
        return await ipcRenderer.invoke('generateDeepLink', appName, chain, node, opType, operations);
    }
});
