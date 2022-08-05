function getImage(nft_object) {
    let image;
    let imgURL;
    let fileType;

    if (!nft_object) {
        return {
            image: undefined,
            imgURL: undefined,
            fileType: undefined
        }
    }

    if (nft_object.media_png || nft_object.image_png) {
        image = nft_object.media_png || nft_object.image_png || undefined;
        imgURL = image
                ? "data:image/png;base64," + image
                : undefined;
        fileType = "png";
    } else if (nft_object.media_gif || nft_object.media_GIF || nft_object.image_GIF || nft_object.image_gif) {
        image = nft_object.media_gif || nft_object.media_GIF || nft_object.image_GIF || nft_object.image_gif || undefined;
        imgURL = image
                ? "data:image/gif;base64," + image
                : undefined;
        fileType = "gif";
    } else if (nft_object.media_jpeg || nft_object.image_jpeg) {
        image = nft_object.media_jpeg || nft_object.image_jpeg || undefined;
        imgURL = image
                ? "data:image/jpeg;base64," + image
                : undefined;
        fileType = "jpeg";
    } else if (nft_object.media_json) {
        image = nft_object.media_json;
        fileType = "objt";
    } else if (nft_object.media_gltf) {
        image = nft_object.media_gltf;
        fileType = "gltf";
    } else if (nft_object.media_jpeg_multihash) {
        image = `/images/${nft_object.symbol}/0.jpeg`;
        fileType = "jpeg";
    } else if (nft_object.media_gif_multihash) {
        image = `/images/${nft_object.symbol}/0.jpeg`;
        fileType = "gif";
    }

    return {
        image: image,
        imgURL: imgURL,
        fileType: fileType
    }
}


export {
    getImage
}
  