/* eslint-disable max-len */
/* eslint-disable react/jsx-one-expression-per-line */
import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Title,
  Text,
  Card,
  Button,
  Center,
  Group,
} from '@mantine/core';

import { HiArrowNarrowLeft } from "react-icons/hi";

import {
  beetStore, tempStore
} from "../../lib/states";
import AccountSearch from "../blockchain/AccountSearch";
import Connect from "./Connect";
import BeetLink from "./BeetLink";

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

  const account = tempStore((state) => state.account);
  const setAccount = tempStore((state) => state.setAccount);

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

  useEffect(() => {
    if (!account && identity && identity.requested.account && identity.requested.account.id) {
      setAccount(identity.requested.account.id);
    }
  }, [account, identity]);

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
                <Button
                  variant='light'
                  leftIcon={<HiArrowNarrowLeft />}
                  onClick={() => setAccountMethod()}
                >
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
