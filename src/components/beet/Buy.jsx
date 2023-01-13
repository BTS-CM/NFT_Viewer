import { useState } from 'react';
import { Button, Text, Col, Group, Loader } from '@mantine/core';
import { QRCode } from 'react-qrcode-logo';

import { appStore, beetStore, translationStore } from '../../lib/states';
import { generateQRContents, purchaseNFT } from '../../lib/broadcasts';

import Connect from "./Connect";
import BeetLink from "./BeetLink";
import AccountSearch from "../blockchain/AccountSearch";

export default function Buy(properties) {
  const t= translationStore((state) => state.t);
  let connection = beetStore((state) => state.connection);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let account = appStore((state) => state.account);

  let nodes = appStore((state) => state.nodes);
  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);
  let setNodes = appStore((state) => state.setNodes);

  const [inProgress, setInProgress] = useState(false);
  const [bought, setBought] = useState(false);
  const [chosen, setChosen] = useState();
  const [qrContents, setQRContents] = useState();

  function goToBalance() {
    setMode('balance');
    setAsset();
  }

  let asset_order_book = appStore((state) => state.asset_order_book);

  //let asks = asset_order_book ? asset_order_book.asks : null;
  let bids = asset_order_book ? asset_order_book.bids : null;
  let soldAsset = asset_order_book ? asset_order_book.quote : null;
  let boughtAsset = asset_order_book ? asset_order_book.base : null;

  let amountToBuy = bids && bids.length ? bids[0].base : null;
  let amountToSell = bids && bids.length ? bids[0].quote : null;

  /**
   * Attempt purchase via BEET multiwallet
   * @returns {Object}
   */
  async function attemptPurchase() {
    setInProgress(true);
    console.log('Attempting to purchase NFT');

    let userID = identity.requested.account.id;

    return purchaseNFT(
      connection,
      nodes[0],
      userID,
      amountToSell,
      soldAsset,
      amountToBuy,
      boughtAsset
    ).then((res) => {
      setBought(res);
      setInProgress(false);
    }).catch((error) => {
      console.log(error);
      setInProgress(false);
      setChosen();
    })

  }

  /**
   * Generate the QR code contents for purchasing this NFT
   * For 3rd party key managers to broadcast the operation to the blockchain
   * @returns {Object}
   */
  function generateContents() {
    setInProgress(true);
    console.log('Generating QR code');

    return generateQRContents(
      nodes[0],
      account,
      amountToSell,
      soldAsset,
      amountToBuy,
      boughtAsset
    ).then((res) => {
      setQRContents(res);
      setInProgress(false);
    }).catch((error) => {
      console.log(error);
      setInProgress(false);
      setChosen();
    })

  }

  function back() {
    setChosen();
    setBought(false);
    setInProgress(false);
    console.log('Going back')
  }

  let response;
  if (!bids || !bids.length) {
    response = <span>
                  <Text size="md">
                    {t('beet:buy.unavailable')}
                  </Text>
                </span>;
  } else if (!chosen) {
    response = <span>
                  <Text size="md">
                    {t('beet:buy.buyPrompt')}
                  </Text>
                  <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                    <Button
                      sx={{m: 0.25}}
                      variant="outline"
                      onClick={() => {
                        setChosen('BEET');
                      }}
                    >
                      {t('beet:buy.beetBuy')}
                    </Button>
                    <Button
                      sx={{m: 0.25}}
                      variant="outline"
                      onClick={() => {
                        setChosen('QR');
                      }}
                    >
                      {t('beet:buy.qrCodes')}
                    </Button>
                  </Group>
                </span>;
  } else if (chosen === "BEET") {
    if (!connection) {
      response = <span>
                  <Text size="md">
                    {t('beet:buy.beetConnect')}
                  </Text>
                  <Connect nftPage={true} backCallback={() => setChosen()} />
                </span>
    } else if (!isLinked) {
      response = <span>
                  <Text size="md">
                    {t('beet:buy.beetLink')}
                  </Text>
                  <BeetLink />
                </span>;
    } else if (inProgress) {
      response = <span>
                    <Loader variant="dots" />
                    <Text size="md">
                      {t('beet:buy.beetWait')}
                    </Text>
                </span>;
    } else if (bought) {
      response = <span>
                      <Text size="md">
                        {t('beet:buy.buySuccess', {boughtAsset, amountToSell, soldAsset})}
                      </Text>
                      <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                        <Button
                          variant="outline"
                          onClick={() => {
                            goToBalance();
                          }}
                        >
                          {t('beet:buy.viewPortfolio')}
                        </Button>
                        <Button
                          variant="light" 
                          onClick={() => {
                            back()
                          }}
                        >
                          {t('beet:buy.backButton')}
                        </Button>
                      </Group>
                  </span>;
    } else {
      response = <span>
                    <Text size="md">
                      {t('beet:buy.beetBuyPrompt')}
                    </Text>
                    <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                      <Button
                        sx={{marginRight: '5px'}}
                        onClick={() => {
                          attemptPurchase()
                        }}
                      >
                        {t('beet:buy.confirmPurchase')}
                      </Button>  
                      <Button
                      variant="light"
                        onClick={() => {
                          back()
                        }}
                      >
                        {t('beet:buy.rejectPurchase')}
                      </Button>
                    </Group>
                  </span>;
    }
  } else if (chosen === "QR") {
    if (!account) {
      response = <span>
                    <AccountSearch />
                    <Button
                      variant="light"
                      onClick={() => {
                        setChosen()
                      }}
                    >
                      {t('beet:buy.backButton')}
                    </Button>
                  </span>
    } else {
      if (!qrContents && !inProgress) {
        response = <span>
                    <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                      <Button
                        variant="outline"
                        onClick={() => {
                          generateContents()
                        }}
                      >
                        {t('beet:buy.generateQR')}
                      </Button>
                      <Button
                        variant="light"
                        onClick={() => {
                          setChosen()
                        }}
                      >
                        {t('beet:buy.backButton')}
                      </Button>
                    </Group>
                  </span>;
      } else if (qrContents) {
        response = <span>
                    <Text size="md">
                      {t('beet:buy.scanQR')}
                    </Text>
                    <QRCode
                      value={JSON.stringify(qrContents)}
                      ecLevel={"M"}
                      size={250}
                      quietZone={25}
                      qrStyle={"dots"}
                    />
                    <br/>
                    <Button
                      variant="light"
                      onClick={() => {
                        setChosen()
                      }}
                    >
                      {t('beet:buy.backButton')}
                    </Button>
                  </span>;
      } else if (inProgress) {
        response = <span>
                    <Text size="md">
                      {t('beet:buy.waitQR')}
                    </Text>
                    <Loader variant="dots" />
                  </span>;
      }
    }
  }
  
  return <Col span={12} key="Top">
            {response}
        </Col>;
}
