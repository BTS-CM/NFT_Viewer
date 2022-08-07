/**
 * Given an NFT_Object detect the type and urls
 * @param {Object} nft_object 
 * @returns 
 */
function getImage(nft_object) {
    return new Promise(async (resolve, reject) => {
        if (nft_object.media_png || nft_object.image_png) {
            let image = nft_object.media_png || nft_object.image_png;
            return resolve(["data:image/png;base64," + image]);
        } else if (nft_object.media_gif || nft_object.media_GIF || nft_object.image_GIF || nft_object.image_gif) {
            let image = nft_object.media_gif || nft_object.media_GIF || nft_object.image_GIF || nft_object.image_gif;
            return resolve(["data:image/gif;base64," + image]);
        } else if (nft_object.media_jpeg || nft_object.image_jpeg) {
            let image = nft_object.media_jpeg || nft_object.image_jpeg;
            return resolve(["data:image/jpeg;base64," + image]);
        } else if (nft_object.media_png_multihashes || nft_object.media_PNG_multihashes) {
            let multihashes = nft_object.media_png_multihashes || nft_object.media_PNG_multihashes
            return resolve(multihashes.map(image => image.url));
        } else if (nft_object.media_jpeg_multihashes || nft_object.media_JPEG_multihashes) {
            let multihashes = nft_object.media_jpeg_multihashes || nft_object.media_JPEG_multihashes
            return resolve(multihashes.map(image => image.url));
        } else if (nft_object.media_gif_multihashes || nft_object.media_GIF_multihashes) {
            let multihashes = nft_object.media_gif_multihashes || nft_object.media_GIF_multihashes
            return resolve(multihashes.map(image => image.url));
        } else if (nft_object.media_jpeg_multihash || nft_object.media_JPEG_multihash) {
            return resolve([nft_object.media_jpeg_multihash || nft_object.media_JPEG_multihash]);
        } else if (nft_object.media_gif_multihash || nft_object.media_GIF_multihash) {
            return resolve([nft_object.media_gif_multihash || nft_object.media_GIF_multihash]);
        } else if (nft_object.media_png_multihash || nft_object.media_PNG_multihash) {
            return resolve([nft_object.media_png_multihash || nft_object.media_PNG_multihash]);
        } else {
            console.log('Unsupported image type')
            return reject();
        }
    });
}


export {
    getImage
}
  