import config from '../config/config.json';
import {Apis} from "bitsharesjs-ws";
import { appStore, assetStore, nonNFTStore } from './states';
import { sliceIntoChunks } from './common';

const _nodes = {
    BTS: config.bitshares.nodeList.map(node => node.url),
    BTS_TEST: config.bitshares_testnet.nodeList.map(node => node.url)
};

/**
 * Test the wss nodes, return latencies and fastest url.
 * @returns {Promise}
 */
async function testNodes(target, itr = 0) {
    return new Promise(async (resolve, reject) => {
        let urlPromises = _nodes[target].map(url => window.electron.testConnection(url, itr > 0 ? itr * 3000 : 3000))
        return Promise.all(urlPromises)
        .then((validNodes) => {
            let filteredNodes = validNodes.filter(x => x);
            if (filteredNodes.length) {
                let sortedNodes = filteredNodes.sort((a, b) => a.lag - b.lag).map(node => node.url);
                return resolve(sortedNodes);
            } else {
                if (itr > 2) {
                    console.error("No valid BTS WSS connections established; Please check your internet connection.")
                    return reject();
                }
                console.log("Couldn't establish network connections; trying again with greater timeout durations. Apologies for the delay.")
                return resolve(testNodes(target, itr + 1));
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
 * @returns {Array}
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

            if (!asset.options.description.includes('nft_object')) {
                return false;
            }

            let desc;
            try {
                desc = JSON.parse(asset.options.description);
            } catch (error) {
                console.log({error});
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
 * @returns {Array}
 */
 async function fetchAssets(node, asset_ids, nonNFT = false) {
    return new Promise(async (resolve, reject) => {
        try {
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`FetchAssets: Closed connection to: ${node}`);
            }).init_promise;
        } catch (error) {
            console.log(error);
            return reject('Invalid node');
        }

        let chunks = sliceIntoChunks(asset_ids, 100);
        let chunkResponses = [];
        for (let i = 0; i < chunks.length; i++) {
            let response;
            try {
                response = await lookup_asset_symbols(Apis, chunks[i], nonNFT);
            } catch (error) {
                console.log(error);
                return reject('Invalid asset ');
            }

            if (response && response.length) {
                chunkResponses = chunkResponses.concat(response);
            }
        }

        try {
            await Apis.close(); // forcibly close the API instance
        } catch (error) {
            console.log(error);
        }

        return resolve(chunkResponses);
    });
}

/**
 * Fetch the user's NFT balances from the blockchain
 * @param {String} node 
 * @param {String} accountID
 * @param {Array} cachedAssets
 * @param {Array} nonNFTs
 * @returns {Array}
 */
async function fetchUserNFTBalances(node, accountID, cachedAssets, nonNFTs) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`FetchNFTBalanceS: Closed connection to: ${node}`);
            }).init_promise;
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

        const assetIDs = balanceResult
                            .filter((asset) => parseInt(asset.amount, 10) > 0) // filter out zero balances including those in limit orders
                            .filter((asset) => !nonNFTs.includes(asset.asset_id)) // filter out non-NFT assets
                            .map(asset => asset.asset_id);

        if (!assetIDs || !assetIDs.length) {
            return resolve([]);
        }

        const requestedCachedAssets = cachedAssets.filter((asset) => {
            return assetIDs.includes(asset.id);
        });

        if (requestedCachedAssets.length === assetIDs.length) {
            console.log(`Resolved ${requestedCachedAssets.length} NFT balance assets from cache`);
            return resolve(requestedCachedAssets);
        }

        const missingAssetIDs = assetIDs.filter((id) => !requestedCachedAssets.find((asset) => asset.id === id));

        let chunks = sliceIntoChunks(missingAssetIDs, 100);
        let chunkResponses = [];
        for (let i = 0; i < chunks.length; i++) {
            let response;
            try {
                response = await lookup_asset_symbols(Apis, chunks[i]);
            } catch (error) {
                console.log(error);
                continue;
            }

            if (response && response.length) {
                chunkResponses = chunkResponses.concat(response);
            }
        }

        try {
            await Apis.close(); // forcibly close the API instance
        } catch (error) {
            console.log(error);
        }

        const finalAssets = requestedCachedAssets.concat(chunkResponses);
        const changeAssets = assetStore.getState().changeAssets;
        const environment = appStore.getState().environment;
        if (finalAssets.filter((finalAsset) => cachedAssets.find((cachedAsset) => cachedAsset.id === finalAsset.id)).length) {
            // FinalAssets has new data to cache
            changeAssets(environment, cachedAssets.concat(finalAssets)); // caching the NFT assets
        }

        const changeNonNFTs = nonNFTStore.getState().changeNonNFTs;
        const responseIDs = chunkResponses.map(asset => asset.id);
        const nonNFTAssetIDs = nonNFTs.concat(
            missingAssetIDs.filter((id) => !responseIDs.includes(id))
        );
        changeNonNFTs(environment, nonNFTAssetIDs); // caching the non-NFT asset IDs

        console.log(`Fetched ${missingAssetIDs.length} NFT balance assets from blockchain`);
        return resolve(finalAssets);
    });
}

/**
 * Fetch any NFTs the user has created
 * @param {String} node
 * @param {String} accountID
 * @param {Array} cachedAssets 
 * @param {Array} nonNFTs
 * @returns {Array}
 */
async function fetchIssuedAssets(node, accountID, cachedAssets, nonNFTs) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`FetchIssued: Closed connection to: ${node}`);
            }).init_promise;
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
            return reject(error);
        }

        if (!fullAccounts.length || !fullAccounts[0].length) {
            console.log("Couldn't find account");
            return reject(new Error("Couldn't find account"));            
        }

        let accountAssets = fullAccounts[0][1].assets;

        if (!accountAssets || !accountAssets.length) {
            console.log("No issued NFT assets found");
            return resolve([]);
        }


        const requestedAssetIDs = accountAssets.filter((assetID) => !nonNFTs.includes(assetID));
        const requestedCachedAssets = cachedAssets.filter((asset) => requestedAssetIDs.includes(asset.id));

        if (requestedCachedAssets.length === requestedAssetIDs.length) {
            console.log("Resolved issued NFT assets from cache");
            return resolve(requestedCachedAssets);
        }

        const remainingAssetIds = requestedAssetIDs.filter((id) => !cachedAssets.find((asset) => asset.id === id));

        let chunks = sliceIntoChunks(remainingAssetIds, 100);
        let chunkResponses = [];
        for (let i = 0; i < chunks.length; i++) {
            let response;
            try {
                response = await lookup_asset_symbols(Apis, chunks[i]);
            } catch (error) {
                console.log(error);
                continue;
            }

            if (response && response.length) {
                chunkResponses = chunkResponses.concat(response);
            }
        }

        try {
            await Apis.close(); // forcibly close the API instance
        } catch (error) {
            console.log(error);
        }
        
        const changeAssets = assetStore.getState().changeAssets;
        const environment = appStore.getState().environment;
        const finalAssets = cachedAssets.concat(chunkResponses);
        changeAssets(environment, finalAssets); // caching NFT data

        const changeNonNFTs = nonNFTStore.getState().changeNonNFTs;
        const responseIDs = chunkResponses.map(asset => asset.id);
        const nonNFTAssetIDs = nonNFTs.concat(
            remainingAssetIds.filter((id) => !responseIDs.includes(id))
        );
        changeNonNFTs(environment, nonNFTAssetIDs); // caching the non-NFT asset IDs

        return resolve(finalAssets);
    });
}

/**
 * Retrieve the object contents
 * @param {String} node 
 * @param {String} objectID 
 * @returns {Array}
 */
async function fetchObject(node, objectID) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`fetchObject: Closed connection to: ${node}`);
            }).init_promise;
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

        try {
            await Apis.close(); // forcibly close the API instance
        } catch (error) {
            console.log(error);
        }

        return resolve(object);
    });
}

/**
 * Search for an account, given 1.2.x or an account name.
 * @param {String} node 
 * @param {String} search_string
 * @returns 
 */
 async function accountSearch(node, search_string) {
    return new Promise(async (resolve, reject) => {

        try {
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`Closed connection to: ${node}`);
            }).init_promise;
        } catch (error) {
            console.log(error);
            let changeURL = appStore.getState().changeURL;
            changeURL();
            let nodes = appStore.getState().nodes;
            return accountSearch(nodes[0], search_string);
            //return reject();
        }

        let object;
        try {
            object = await Apis.instance().db_api().exec("get_accounts", [[search_string]])
        } catch (error) {
            console.log(error);
            return reject(error);
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
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`DynamicData: Closed connection to: ${node}`);
            }).init_promise;
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
            try {
                await Apis.close(); // forcibly close the API instance
            } catch (error) {
                console.log(error);
            }

            return reject(new Error('Missing objects'));
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

        try {
            await Apis.close(); // forcibly close the API instance
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
            await Apis.instance(node, true, 4000, undefined, () => {
                console.log(`OrderBook: Closed connection to: ${node}`);
            }).init_promise;
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

        try {
            await Apis.close(); // forcibly close the API instance
        } catch (error) {
            console.log(error);
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
    fetchOrderBook,
    accountSearch
};