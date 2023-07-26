/**
 * Given an NFT_Object detect the type and urls
 * @param {Object} nft_object
 * @returns
 */
function getImages(nft_object) {
    return new Promise(async (resolve, reject) => {
      if (!nft_object) {
        resolve([]);
        return;
    }

    const mediaKeys = Object.keys(nft_object)
        .filter((key) => key.includes("media_") || key.includes("image_"));
  
      const multihashKeys = Object.keys(nft_object)
        .filter((key) => (key.includes("media_") && key.includes("_multihashes")) || key.includes("_multihash"));

      let mediaContents = mediaKeys.map((key) => {
          const current = nft_object[key];
          const type = key.split("_")[1].toUpperCase();

          let splitKey = key.split("_");
          if (splitKey.length > 2 && splitKey[2].includes("es")) {
              // multihashes
              return current.map((image) => ({ url: image.url, type, ipfs: true }));
          }

          // single file
          return key.includes("multihash")
              ? {url: current, type, ipfs: true}
              : {url: `data:image/${type.toLocaleLowerCase()};base64,${current}`, type, ipfs: false}
      }).flat();

      const filteredImages = mediaContents.reduce((uniqueImages, currentImage) => {
        const isDuplicate = uniqueImages.some(image => image.url === currentImage.url);
        if (!isDuplicate) {
          uniqueImages.push(currentImage);
        }
        return uniqueImages;
      }, []);

      resolve(filteredImages);
    });
  }
  
  export { getImages };
  