import { useState } from 'react';
import { Button, Text, Col, Paper, Loader } from '@mantine/core';
import { appStore } from '../../lib/states';
import { purchaseNFT } from '../../lib/broadcasts';

export default function Buy(properties) {
  const userID = properties.userID;
  const connection = properties.connection;
  const asset = properties.asset;

  let nodes = appStore((state) => state.nodes);
  let setMode = appStore((state) => state.setMode);

  const [inProgress, setInProgress] = useState(false);
  const [bought, setBought] = useState(false);

  function back() {
    setMode();
  }

  let asset_order_book = appStore((state) => state.asset_order_book);
  let bids = asset_order_book ? asset_order_book.bids : null;
  let soldAsset = asset_order_book ? asset_order_book.quote : null;
  let boughtAsset = asset_order_book ? asset_order_book.base : null;
  let amountToBuy = bids ? bids[0].base : null;
  let amountToSell = bids ? bids[0].quote : null;

  async function attemptPurchase() {
    setInProgress(true);
    console.log('Attempting to purchase NFT');

    if (!bids || !bids.length) {
      return;
    }

    let bidResult;
    return purchaseNFT(
      connection,
      nodes[0],
      userID,
      amountToSell,
      soldAsset,
      amountToBuy,
      boughtAsset
    ).then((res) => {
      setBought(bidResult);
      setInProgress(false);
    }).catch((error) => {
      console.log(error);
      setInProgress(false);
    })

  }

  let response;
  if (!asset_order_book) {
    response = <span>
                  <Text size="md">
                    This NFT is not currently for sale.
                  </Text>
                  <Button
                    onClick={() => {
                      back()
                    }}
                  >
                    Back
                  </Button>
                </span>;
  } else if (inProgress) {
    response = <span>
                  <Loader variant="dots" />
                  <Text size="md">
                    Waiting on user response from BEET client
                  </Text>
              </span>;
  } else if (bought) {
    response = <span>
                    <Text size="md">
                      Successfully broadcast a buy limit order for the NFT "{boughtAsset}" in return for {amountToSell ?? '???'} {soldAsset ?? '???'}.
                    </Text>
                    <Button
                      onClick={() => {
                        back()
                      }}
                    >
                      Back
                    </Button>
                </span>;
  } else {
    response = <span>
                  <Text size="md">
                    Instruct BEET to purchase the NFT "{boughtAsset}" for {amountToSell ?? '???'} {soldAsset ?? '???'}?
                  </Text>
                  <Button
                    sx={{marginRight: '5px'}}
                    onClick={() => {
                      attemptPurchase()
                    }}
                  >
                    Yes
                  </Button>  
                  <Button
                    onClick={() => {
                      back()
                    }}
                  >
                    No
                  </Button>
                </span>;
  }
  
  return <Col span={12} key="Top">
          <Paper sx={{padding: '5px'}} shadow="xs">
            {response}
          </Paper>
        </Col>;
}
