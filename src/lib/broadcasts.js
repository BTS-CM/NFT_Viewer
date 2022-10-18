import {Apis} from "bitsharesjs-ws";
import { TransactionBuilder } from 'bitsharesjs';
import { appStore } from './states';
import { fetchAssets } from './queries';
import config from '../config/config.json';

/**
 * Generate QR code contents for purchasing an NFT
 * @param {String} wsURL 
 * @param {String} sellerAccount 
 * @param {Integer} amountToSell 
 * @param {String} soldAsset 
 * @param {Integer} amountToBuy 
 * @param {String} boughtAsset 
 * @returns {Object}
 */
async function generateQRContents(
  wsURL,
  sellerAccount,
  amountToSell,
  soldAsset,
  amountToBuy,
  boughtAsset
) {
  return new Promise(async (resolve, reject) => {
    let soldAssetDetails;
    try {
      soldAssetDetails = await fetchAssets(wsURL, [soldAsset], true);
    } catch (error) {
      console.log(error);
      return reject(error);
    }

    let boughtAssetDetails;
    try {
      boughtAssetDetails = await fetchAssets(wsURL, [boughtAsset], true);
    } catch (error) {
      console.log(error);
      return reject(error);
    }

    if (!soldAssetDetails && !boughtAssetDetails) {
      console.log('Missing asset details')
      return reject('Missing asset details');
    }

    let tr = new TransactionBuilder();

    let currentDate = new Date();
    currentDate.setHours(currentDate.getHours() + 24);

    tr.add_type_operation(
      "limit_order_create",
      {
          fee: {
              amount: 0,
              asset_id: "1.3.0"
          },
          seller: sellerAccount,
          amount_to_sell: {
            amount: amountToSell * Math.pow(10, soldAssetDetails[0].precision),
            asset_id: soldAssetDetails[0].id
          },
          min_to_receive: {
            amount: amountToBuy * Math.pow(10, boughtAssetDetails[0].precision),
            asset_id: boughtAssetDetails[0].id
          },
          fill_or_kill: false,
          expiration: currentDate
      }
    );

    try {
      await tr.set_required_fees();
    } catch (error) {
      console.error(error);
      return reject(error);
    }

    try {
      await tr.update_head_block();
    } catch (error) {
      console.error(error);
      return reject(error);
    }

    try {
      await tr.set_expire_seconds(4000);
    } catch (error) {
      console.error(error);
      return reject(error);
    }
    
    return resolve(tr.toObject());
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
 async function purchaseNFT(
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

        let soldAssetDetails;
        try {
          soldAssetDetails = await fetchAssets(wsURL, [soldAsset], true);
        } catch (error) {
          console.log(error);
          return reject();
        }

        let boughtAssetDetails;
        try {
          boughtAssetDetails = await fetchAssets(wsURL, [boughtAsset], true);
        } catch (error) {
          console.log(error);
          return reject();
        }

        if (!soldAssetDetails && !boughtAssetDetails) {
          console.log('Missing asset details')
          return reject();
        }

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
        currentDate.setHours(currentDate.getHours() + 24);
    
        tr.add_type_operation(
          "limit_order_create",
          {
              fee: {
                  amount: 0,
                  asset_id: "1.3.0"
              },
              seller: sellerAccount,
              amount_to_sell: {
                amount: amountToSell * Math.pow(10, soldAssetDetails[0].precision),
                asset_id: soldAssetDetails[0].id
              },
              min_to_receive: {
                amount: amountToBuy * Math.pow(10, boughtAssetDetails[0].precision),
                asset_id: boughtAssetDetails[0].id
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
          await tr.set_expire_seconds(4000);
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

export {
  generateQRContents,
  purchaseNFT
};