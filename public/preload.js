// All of the Node.js APIs are available in the preload process.
// It has the same sandbox as a Chrome extension.
const { contextBridge, ipcRenderer } = require("electron");
const Socket = require("simple-websocket")
const config = require("../src/config/config.json");
const {Apis} = require("bitsharesjs-ws");
const { TransactionBuilder } = require('bitsharesjs');

// Note: Changes to this file will require a build before electron:start works

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
 * Submit request to BEET to purchase an NFT
 * @param {BeetConnection} connection 
 * @param {String} wsURL 
 * @param {String} sellerAccount 
 * @param {Integer} amountToSell 
 * @param {String} soldAsset 
 * @param {Integer} amountToBuy 
 * @param {String} boughtAsset 
 * @returns {Object}
 */
async function _purchaseNFT(
    connection,
    wsURL,
    sellerAccount,
    amountToSell,
    soldAsset,
    amountToBuy,
    boughtAsset
) {
    return new Promise(async (resolve, reject) => {
        let TXBuilder = connection.inject(TransactionBuilder, {sign: true, broadcast: true});

        try {
          await Apis.instance(
              wsURL,
              true,
              10000,
              {enableCrypto: false, enableOrders: true},
              (error) => console.log(error),
          ).init_promise;
        } catch (error) {
          console.log(`api instance: ${error}`);
          return reject();
        }
    
        let tr = new TXBuilder();
    
        let currentDate = new Date();
        let currentMonth = currentDate.getMonth(); // for example, 2021
        currentDate.setMonth(currentMonth + 1);
    
        tr.add_type_operation(
          "limit_order_create",
          {
              fee: {
                  amount: 0,
                  asset_id: "1.3.0"
              },
              seller: sellerAccount,
              amount_to_sell: {
                amount: amountToSell,
                asset_id: soldAsset
              },
              min_to_receive: {
                amount: amountToBuy,
                asset_id: boughtAsset
              },
              fill_or_kill: false,
              expiration: currentDate
          }
        );
    
        try {
          await tr.set_required_fees();
        } catch (error) {
          console.error(error);
          return reject();
        }
    
        try {
          await tr.update_head_block();
        } catch (error) {
          console.error(error);
          return reject();
        }
    
        try {
          await tr.set_expire_seconds(2630000); // 1 month exipiry
        } catch (error) {
          console.error(error);
          return reject();
        }
        
        try {
          tr.add_signer("inject_wif");
        } catch (error) {
          console.error(error);
          return reject();
        }
    
        let result;
        try {
          result = await tr.broadcast();
        } catch (error) {
          console.error(error);
          return reject();
        }
    
        console.log(result);
        return resolve(result);
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
        purchaseNFT: async (
            connection,
            wsURL,
            sellerAccount,
            amountToSell,
            soldAsset,
            amountToBuy,
            boughtAsset
        ) => {
            return _purchaseNFT(
                connection,
                wsURL,
                sellerAccount,
                amountToSell,
                soldAsset,
                amountToBuy,
                boughtAsset
            );
        },
        openURL: async (target) => {
            return _openURL(target);
        },
        openDEX: async (args) => {
            return _openDEX(args);
        }
    }
);