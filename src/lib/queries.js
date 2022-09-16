import config from '../config/config.json';
import {Apis} from "bitsharesjs-ws";
import { appStore } from './states';

/**
 * Test the wss nodes, return latencies and fastest url.
 * @returns {Promise}
 */
async function testNodes(target) {
    return new Promise(async (resolve, reject) => {
        let urls = config[target].nodeList.map(node => node.url);

        return Promise.all(urls.map(url => window.electron.testConnection(url)))
        .then((validNodes) => {
            let filteredNodes = validNodes.filter(x => x);
            if (filteredNodes.length) {
                let sortedNodes = filteredNodes.sort((a, b) => a.lag - b.lag);
                return resolve(sortedNodes.map(node => node.url));
            } else {
                console.error("No valid BTS WSS connections established; Please check your internet connection.")
                return reject();
            }
        })
        .catch(error => {
            console.log(error);
        })
    });
}

/**
 * Lookup asset details, return NFTs
 * @param {Apis} api 
 * @param {Array} asset_ids 
 * @param {Boolean} nonNFT 
 */
async function lookup_asset_symbols(api, asset_ids, nonNFT = false) {
    return new Promise(async (resolve, reject) => {
        let symbols;
        try {
            symbols = await api.instance().db_api().exec( "lookup_asset_symbols", [asset_ids]);
        } catch (error) {
            console.log(error);
            return reject();
        }

        symbols = symbols.filter(x => x !== null);
        if (!symbols || !symbols.length) {
            return resolve([]);
        }

        if (nonNFT) {
            return resolve(symbols);
        }

        let filteredAssets = symbols.filter(asset => {
            if (!asset.options || !asset.options.description || !asset.options.description.length) {
                return false;
            }
            let desc;
            try {
                desc = JSON.parse(asset.options.description);
            } catch (error) {
                console.log(error);
                return false;
            }

            return desc.nft_object ? true : false;
        })

        return resolve(filteredAssets);
    });
}

/**
 * Fetch asset info for multiple assets
 * @param {String} node
 * @param {Array} asset_ids 
 * @param {Boolean} nonNFT 
 */
 async function fetchAssets(node, asset_ids, nonNFT = false) {
    return new Promise(async (resolve, reject) => {
        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            return reject();
        }

        let response;
        try {
            response = await lookup_asset_symbols(Apis, asset_ids, nonNFT);
        } catch (error) {
            console.log(error);
            return reject();
        }

        return resolve(response);
    });
}

/**
 * Fetch the user's NFT balances from the blockchain
 * @param {String} node 
 * @param {String} accountID 
 */
async function fetchUserNFTBalances(node, accountID) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            return reject();
        }

        let balanceResult;
        try {
            balanceResult = await Apis.instance().db_api().exec("get_account_balances", [accountID, []]);
        } catch (error) {
            console.log(error);
            return reject();
        }

        let response;
        try {
            response = await lookup_asset_symbols(Apis, balanceResult.map(asset => asset.asset_id));
        } catch (error) {
            console.log(error);
            return reject();
        }

        return resolve(response);
    });
}

/**
 * Fetch any NFTs the user has created
 * @param {String} accountID 
 */
async function fetchIssuedAssets(node, accountID) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            return reject();
        }

        let fullAccounts;
        try {
            fullAccounts = await Apis.instance().db_api().exec("get_full_accounts", [[accountID], true])
        } catch (error) {
            console.log(error);
            return reject();
        }

        if (!fullAccounts.length || !fullAccounts[0].length) {
            console.log({fullAccounts})
            return reject();            
        }

        let accountAssets = fullAccounts[0][1].assets;
        let response;
        try {
            response = await lookup_asset_symbols(Apis, accountAssets);
        } catch (error) {
            console.log(error);
            return reject();
        }

        return resolve(response);
    });
}

/**
 * Retrieve the object contents
 * @param {String} node 
 * @param {String} objectID 
 * @returns 
 */
async function fetchObject(node, objectID) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            return reject();
        }

        let object;
        try {
            object = await Apis.instance().db_api().exec("get_objects", [[objectID]])
        } catch (error) {
            console.log(error);
            return reject();
        }

        return resolve(object);
    });
}

/**
 * Retrieve the object contents
 * @param {String} node 
 * @param {Object} asset
 * @returns 
 */
 async function fetchDynamicData(node, asset) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            return reject();
        }

        const issuerID = asset.issuer;
        let issuerObject;
        try {
            issuerObject = await Apis.instance().db_api().exec("get_objects", [[issuerID]])
        } catch (error) {
            console.log(error);
        }

        const dynamicDataID = asset ? asset.dynamic_asset_data_id : null;
        let dynamicData;
        try {
            dynamicData = await Apis.instance().db_api().exec("get_objects", [[dynamicDataID]])
        } catch (error) {
            console.log(error);
        }

        if (!issuerObject || !dynamicData) {
            console.log('Missing objects')
            return reject();
        }

        const base = asset.symbol;
        const quote = JSON.parse(asset.options.description).market ?? 'BTS';
        const limit = 10;

        let order_book;
        try {
            order_book = await Apis.instance().db_api().exec("get_order_book", [base, quote, limit])
        } catch (error) {
            console.log(error);
        }

        return resolve({
            issuer: issuerObject && issuerObject.length ? issuerObject[0].name : '???',
            quantity: dynamicData && dynamicData.length ? dynamicData[0].current_supply : '???',
            order_book: order_book
        });
    });
}

/**
 * Fetch the orderbook for an NFT
 * @param {String} node 
 * @param {String} base 
 * @param {String} quote 
 * @param {Integer} limit 
 * @returns 
 */
async function fetchOrderBook(node, base, quote, limit) {
    return new Promise(async (resolve, reject) => {
        
        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            return reject();
        }

        let orderBook;
        try {
            orderBook = await Apis.instance().db_api().exec("get_order_book", [[base, quote, limit]])
        } catch (error) {
            console.log(error);
            return reject();
        }

        return resolve(orderBook);
    });
}


export {
    testNodes,
    fetchUserNFTBalances,
    fetchIssuedAssets,
    fetchAssets,
    fetchObject,
    fetchDynamicData,
    fetchOrderBook
};