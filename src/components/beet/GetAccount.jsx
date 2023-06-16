/* eslint-disable max-len */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Title,
  Text,
  SimpleGrid,
  Badge,
  Card,
  Radio,
  Table,
  Button,
  ScrollArea,
  Center,
  Group,
  Tooltip,
  Accordion,
  NumberInput,
  JsonInput,
  Loader,
  TextInput,
  ActionIcon,
} from '@mantine/core';
import { Apis } from "bitsharesjs-ws";

import {
  appStore, beetStore
} from "../../lib/states";
import AccountSearch from "../blockchain/AccountSearch";
import Connect from "./Connect";
import BeetLink from "./BeetLink";

function sliceIntoChunks(arr, size) {
  const chunks = [];
  for (let i = 0; i < arr.length; i += size) {
    const chunk = arr.slice(i, i + size);
    chunks.push(chunk);
  }
  return chunks;
}

/**
 * Convert the token's blockchain representation into a human readable quantity
 * @param {Float} satoshis
 * @param {Number} precision
 * @returns {Number}
 */
function humanReadableFloat(satoshis, precision) {
  return parseFloat((satoshis / 10 ** precision).toFixed(precision));
}

/**
 * Convert human readable quantity into the token's blockchain representation
 * @param {Float} satoshis
 * @param {Number} precision
 * @returns {Number}
 */
function blockchainFloat(satoshis, precision) {
  return satoshis * 10 ** precision;
}

/**
 * Retrieve the details of an asset from the blockchain
 * @param {String} node
 * @param {String} searchInput
 * @param {String} env
 * @returns {Object}
 */
async function getAsset(node, searchInput, env) {
  try {
    await Apis.instance(node, true).init_promise;
  } catch (error) {
    console.log(error);
    const { changeURL } = appStore.getState();
    changeURL(env);
    return;
  }

  let symbols;
  try {
    symbols = await Apis.instance()
      .db_api()
      .exec('lookup_asset_symbols', [[searchInput]]);
  } catch (error) {
    console.log(error);
    return;
  }

  const filteredSymbols = symbols.filter((x) => x !== null);
  if (!filteredSymbols || !filteredSymbols.length) {
    console.log("No results");
    return;
  }

  return filteredSymbols[0];
}

export default function GetAccount(properties) {
  const { t, i18n } = useTranslation();
  const { beetOnly } = properties;
  const { env } = properties;
  const { basic } = properties;

  const setConnection = beetStore((state) => state.setConnection);
  const setAuthenticated = beetStore((state) => state.setAuthenticated);

  // for beet use
  const connection = beetStore((state) => state.connection);
  const isLinked = beetStore((state) => state.isLinked);
  const identity = beetStore((state) => state.identity);
  const [accountMethod, setAccountMethod] = useState();

  const account = appStore((state) => state.account);

  let assetName = "";
  let titleName = "token";
  let relevantChain = "";

  if (env === 'bitshares') {
    assetName = "BTS";
    relevantChain = 'BTS';
    titleName = "Bitshares";
  } else {
    assetName = "TEST";
    relevantChain = 'BTS_TEST';
    titleName = "Bitshares (Testnet)";
  }

  return (
    <Card shadow={basic ? "" : "md"} radius="md" padding="sm">
      <Title order={4} align="center">
        {
          !accountMethod
            ? t("getAccount:title", {chain: titleName})
            : null
        }
      </Title>
      <Text size="lg" align="center">
        {
          !accountMethod
            ? t("getAccount:subtitle")
            : null
        }
      </Text>
      {
        !account && !accountMethod && !beetOnly
          ? (
            <Center>
              <Group mt="sm">
                <Button
                  compact
                  onClick={() => setAccountMethod("SEARCH")}
                >
                  {t("getAccount:search")}
                </Button>
                <Button
                  compact
                  onClick={() => setAccountMethod("BEET")}
                >
                  {t("getAccount:beet")}
                </Button>
              </Group>
            </Center>
          )
          : null
      }

      {
        !account && accountMethod === "SEARCH"
          ? (
            <>
              <AccountSearch env={env || params.env} />
              <Center>
                <Button onClick={() => setAccountMethod()}>
                  {t('beet:beetlink.backButton')}
                </Button>
              </Center>
            </>
          )
          : null
      }

      {
        !identity && (beetOnly || accountMethod === "BEET")
          ? (
          <>
            {
              !connection
                ? (
                  <span>
                    <Connect relevantChain={relevantChain} />
                  </span>
                )
                : null
            }
            {
              connection && !isLinked
                ? (
                  <span>
                    <Text size="md">
                      {t('beet:accountMode.linkPrompt')}
                    </Text>
                    <BeetLink env={relevantChain} />
                  </span>
                )
                : null
            }

            {
              !beetOnly
                ? (
                  <Center>
                    <Button
                      onClick={() => {
                        setAccountMethod();
                        setConnection();
                        setAuthenticated();
                      }}
                    >
                      Go back
                    </Button>
                  </Center>
                )
                : null
            }
          </>
          )
          : null
      }
    </Card>
  );
}
