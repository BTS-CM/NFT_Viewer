
import { useEffect, useState } from 'react';
import { Button, Group, Box, Text, Divider, SimpleGrid, Loader, Col, Paper } from '@mantine/core';
//import { Apis } from "bitsharesjs-ws";
import { appStore, beetStore } from '../../lib/states';

export default function SelectAsset(properties) {
  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);

  let nodes = appStore((state) => state.nodes);
  let setNodes = appStore((state) => state.setNodes);
  let environment = appStore((state) => state.environment);
  let target = environment === 'production' ? 'BTS' : 'BTS_TEST';

  const userID = properties.userID;

  const [issuedAssets, setIssuedAssets] = useState();
  const [tries, setTries] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  function increaseTries() {
    let newTries = tries + 1;
    setIssuedAssets();
    setTries(newTries);
  }

  /**
   * User has selected an asset to edit
   * @param {Object} asset 
   */
  function chosenAsset(asset) {
    /*
    let description = JSON.parse(asset.options.description);

    let output;
    if (description.nft_object.media_png_multihashes || description.nft_object.media_PNG_multihashes) {
      let hashes = description.nft_object.media_png_multihashes ?? description.nft_object.media_PNG_multihashes;
      output = hashes.map(value => { return {url: value.url, type: 'PNG'}});
    } else if (description.nft_object.media_gif_multihashes || description.nft_object.media_GIF_multihashes) {
      let hashes = description.nft_object.media_png_multihashes ?? description.nft_object.media_PNG_multihashes;
      output = hashes.map(value => { return {url: value.url, type: 'GIF'}});
    } else if (description.nft_object.media_jpeg_multihash || description.nft_object.media_JPEG_multihash) {
      let hashes = description.nft_object.media_jpeg_multihash ?? description.nft_object.media_JPEG_multihash;
      output = hashes.map(value => { return {url: value.url, type: 'JPEG'}});
    }
    
    setImages(output);
    */

    setAsset(asset);    
  }

  useEffect(() => {
    async function fetchAssets() {
      fetchIssuedAssets(userID)
    }
    fetchAssets();
  }, []);

  let topText;
  if (!issuedAssets) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="md">
                  Retrieving info on your Bitshares account
                </Text>
              </span>;
  } else if (!issuedAssets.length) {
    topText = <span>
                <Text size="md">
                  Nothing to edit
                </Text>
                <Text size="sm" weight={600}>
                  This Bitshares account hasn't issued any NFTs on the BTS DEX.
                </Text>
                <Text size="sm" weight={600}>
                  You can either create a new NFT or switch Bitshares account.
                </Text>
                <Text size="sm" weight={600}>
                  Note: Buying and owning an NFT on the BTS DEX doesn't automatically grant you NFT editing rights.
                </Text>
              </span>
              
  } else {
    topText = <span>
                <Text size="md">
                  Select the NFT you wish to edit
                </Text>
              </span>
  }

  let buttonList = issuedAssets
                    ? issuedAssets.map(asset => {
                        return <Button
                                  compact
                                  sx={{margin: '2px'}}
                                  variant="outline"
                                  key={`button.${asset.id}`}
                                  onClick={() => {
                                    chosenAsset(asset)
                                  }}
                                >
                                  {asset.symbol}: {asset.id}
                                </Button>
                      })
                    : null;

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }
          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {
              buttonList
            }
          </SimpleGrid>

          <Button
            sx={{marginTop: '15px', marginRight: '5px'}}
            onClick={() => {
              increaseTries()
            }}
          >
            Refresh
          </Button>
          <Button
            sx={{marginTop: '15px'}}
            onClick={() => {
              setMode()
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Col>
  );
}
