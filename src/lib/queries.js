import config from '../config/config.json';
//import TransactionBuilder from "bitsharesjs";
import Apis from "bitsharesjs-ws";
  
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
 * Fetch asset info for multiple assets
 * @param {String} node
 * @param {Array} asset_ids 
 */
 async function fetchAssets(node, asset_ids) {
    return new Promise(async (resolve, reject) => {
        try {
            await Apis.instance(node, true).init_promise;
        } catch (error) {
            console.log(error);
            return reject();
        }

        let featuredAssets;
        try {
            featuredAssets = await Apis.instance().db_api().exec( "lookup_asset_symbols", [ asset_ids ]);
        } catch (error) {
            console.log(error);
            return reject();
        }

        return resolve(featuredAssets);
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

        let balanceSymbols;
        try {
            balanceSymbols = await Apis.instance().db_api().exec( "lookup_asset_symbols", [ balanceResult.map(balance => balance.asset_id) ]);
        } catch (error) {
            console.log(error);
            return reject();
        }

        let filteredAssets = balanceSymbols.filter(asset => {
            let desc = JSON.parse(asset.options.description);
            return desc.nft_object ? true : false;
        })

        return  resolve(filteredAssets);
    });
}

/**
 * Fetch any NFTs the user has created
 * @param {String} accountID 
 */
async function fetchIssuedAssets(accountID) {
    return new Promise(async (resolve, reject) => {
        try {
            await Apis.instance(wsURL, true).init_promise;
        } catch (error) {
            console.log(error);
            return reject();
        }

        let fullAccounts;
        try {
            fullAccounts = await Apis.instance().db_api().exec("get_full_accounts", [[accountID], true])
        } catch (error) {
            console.log(error);
            return reject();
        }

        let accountAssets = fullAccounts[0][1].assets;

        let assetsDetails;
        try {
            assetsDetails = await Apis.instance().db_api().exec("get_assets", [accountAssets, true])
        } catch (error) {
            console.log(error);
            return reject();
        }

        let filteredAssets = assetsDetails.filter(asset => {
            let desc = JSON.parse(asset.options.description);
            return desc.nft_object ? true : false;
        })

        return  resolve(filteredAssets);
    });
}

export {
    testNodes,
    fetchUserNFTBalances,
    fetchIssuedAssets,
    fetchAssets
};