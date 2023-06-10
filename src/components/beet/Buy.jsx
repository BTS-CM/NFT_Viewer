import React, { useState, useEffect } from 'react';
import { Button, Text, Col, Group, Loader, Accordion, JsonInput, } from '@mantine/core';
import { QRCode } from 'react-qrcode-logo';
import { useTranslation } from 'react-i18next';

import { appStore, beetStore } from '../../lib/states';
import { generateQRContents, purchaseNFT } from '../../lib/broadcasts';
import { generateDeepLink } from '../../lib/generate';
import { fetchAssets } from '../../lib/queries';

import Connect from "./Connect";
import BeetLink from "./BeetLink";
import AccountSearch from "../blockchain/AccountSearch";

export default function Buy(properties) {
  const { t, i18n } = useTranslation();
  let connection = beetStore((state) => state.connection);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let account = appStore((state) => state.account);

  let nodes = appStore((state) => state.nodes);
  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);
  let setAccount = appStore((state) => state.setAccount);
  let environment = appStore((state) => state.environment);

  const [inProgress, setInProgress] = useState(false);
  const [bought, setBought] = useState(false);
  const [chosen, setChosen] = useState();
  const [qrContents, setQRContents] = useState();
  const [localData, setLocalData] = useState();
  const [deepLinkItr, setDeepLinkItr] = useState(0);
  const [tx, setTX] = useState();

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

  useEffect(() => {
    async function fetchData() {
      console.log('fetchData')
      setInProgress(true);

      let soldAssetDetails;
      try {
        soldAssetDetails = await fetchAssets(nodes[0], [soldAsset], true);
      } catch (error) {
        console.log(error);
        setInProgress(false);
        return;
      }

      console.log({soldAssetDetails})
  
      let boughtAssetDetails;
      try {
        boughtAssetDetails = await fetchAssets(nodes[0], [boughtAsset], true);
      } catch (error) {
        console.log(error);
        setInProgress(false);
        return;
      }

      console.log({boughtAssetDetails})

      let currentDate = new Date();
      currentDate.setHours(currentDate.getHours() + 24);

      const ops = [{
          fee: {
              amount: 0,
              asset_id: "1.3.0"
          },
          seller: account,
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
      }]

      setTX(ops);
      console.log({ops})

      let payload;
      try {
        payload = await generateDeepLink(
          'airdrop',
          environment === "production" ? "BTS" : "BTS_TEST",
          nodes[0],
          'limit_order_create',
          ops
        );
      } catch (error) {
        console.log(error);
        setInProgress(false);
        return;
      }

      if (payload && payload.length) {
        setLocalData(payload);
      }

      setInProgress(false);
    }

    if (deepLinkItr && deepLinkItr > 0) {
      fetchData();
    }
  }, [deepLinkItr]);

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
                        setChosen('local');
                      }}
                    >
                      {t('beet:buy.local')}
                    </Button>
                    <Button
                      sx={{m: 0.25}}
                      variant="outline"
                      onClick={() => {
                        setChosen('deepLink');
                      }}
                    >
                      {t('beet:buy.deepLink')}
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
  } else if (chosen && !account) {
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
                        setAccount()
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
                      setAccount()
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
  } else if (chosen === "local") {
    if (!localData && !inProgress) {
      response = (
        <>
          <Text>{t("beet:buy.method")}</Text>
          <Text m="sm" fz="xs">
            {t("beet:buy.preStep1")}
            <br />
            {t("beet:buy.preStep2")}
            <br />
            {t("beet:buy.preStep3")}
          </Text>
          <Button
            mt="md"
            variant="outline"
            onClick={() => setDeepLinkItr(deepLinkItr + 1)}
          >
            {t("beet:buy.generate")}
          </Button>
          <Button
            mt="md"
            ml="sm"
            variant="outline"
            onClick={() => {
              setChosen()
              setAccount()
            }}
          >
            {t('beet:buy.backButton')}
          </Button>
        </>
      )
    } else if (inProgress) {
      response = <Loader size="xs" variant="dots" />
    } else if (localData && !inProgress) {
      response = (
        <>
          <Text>{t("beet:buy.confirmation")}</Text>
          <Text fz="xs">
            {t("beet:buy.download1")}
            <br />
            {t("beet:buy.download2")}
            <br />
            {t("beet:buy.download3")}
          </Text>
  
          <a
            href={`data:text/json;charset=utf-8,${localData}`}
            download={`buy.json`}
            target="_blank"
            rel="noreferrer"
          >
            <Button mt="md" variant="outline">
              {t("beet:buy.downloadButton")}
            </Button>
          </a>
          <Button
            mt="md"
            ml="sm"
            variant="outline"
            onClick={() => {
              setChosen()
              setAccount()
            }}
          >
            {t('beet:buy.backButton')}
          </Button>

          <Accordion mt="xs">
            <Accordion.Item key="json" value="operation_json">
              <Accordion.Control>
                {t("beet:buy.viewJSON")}
              </Accordion.Control>
              <Accordion.Panel style={{ backgroundColor: '#FAFAFA' }}>
                <JsonInput
                  placeholder="Textarea will autosize to fit the content"
                  defaultValue={JSON.stringify(tx)}
                  validationError="Invalid JSON"
                  formatOnBlur
                  autosize
                  minRows={4}
                  maxRows={15}
                />
              </Accordion.Panel>
            </Accordion.Item>
          </Accordion>
        </>
      )
    }
  } else if (chosen === "deepLink") {
    if (!localData) {
      response = (
        <>
          <Text>{t("beet:buy.noDL.title")}</Text>
          <Text m="sm" fz="xs">
            1. {t("beet:buy.noDL.step1")}
            <br />
            2. {t("beet:buy.noDL.step2")}
            <br />
            3. {t("beet:buy.noDL.step3")}
          </Text>
          <Button
            m="xs"
            onClick={() => setDeepLinkItr(deepLinkItr + 1)}
          >
            {t("beet:buy.noDL.btn")}
          </Button>
        </>
      );
    } else {
      response = (
        <>
          <Text>{t("beet:buy.DL.title")}</Text>
          <Text fz="xs">
            1. {t("beet:buy.DL.step1")}
            <br />
            2. {t("beet:buy.DL.step2")}
            <br />
            3. {t("beet:buy.DL.step3")}
          </Text>
          <a href={`rawbeet://api?chain=${environment === "production" ? "BTS" : "BTS_TEST"}&request=${localData}`}>
            <Button m="xs">
              {t("beet:buy.DL.beetBTN")}
            </Button>
          </a>
          <Button
            m="xs"
            onClick={() => {
              setChosen()
              setAccount()
            }}
          >
            {t("beet:buy.DL.back")}
          </Button>
        </>
      )
    }
  }
  
  return <Col span={12} key="Top">
            {response}
        </Col>;
}
