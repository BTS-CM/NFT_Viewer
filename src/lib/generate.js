/* eslint-disable consistent-return */
import { TransactionBuilder } from 'bitsharesjs';

/**
 * Generate QR code contents for purchasing an NFT
 * @param {String} opType 
 * @param {Array} opContents 
 * @returns {Object}
 */
async function generateQRContents(opType, opContents) {
  return new Promise(async (resolve, reject) => {
    let tr = new TransactionBuilder();

    for (let i = 0; i < opContents.length; i++) {
      tr.add_type_operation(opType, opContents[i]);
    }

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

export {
  generateQRContents
};
