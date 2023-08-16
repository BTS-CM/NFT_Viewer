import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Text, SimpleGrid, Title, Group, Paper, Box, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HiOutlineHome, HiArrowNarrowLeft, HiOutlineRefresh } from "react-icons/hi";
import {
  HiOutlineWallet,
} from "react-icons/hi2";
import { TbHeart, TbHeartBroken } from 'react-icons/tb';

import { appStore, beetStore, tempStore, favouritesStore } from '../lib/states';

import Loading from "../components/setup/Loading";
import Environment from "../components/setup/Environment";
import Offline from "../components/setup/Offline";
import GetAccount from "../components/beet/GetAccount";


export default function Issuer(properties) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const { env, id } = params;

  let environment = appStore((state) => state.environment);
  let nodes = appStore((state) => state.nodes);
  let setEnvironment = appStore((state) => state.setEnvironment);
  let changeURL = appStore((state) => state.changeURL);

  let assets = tempStore((state) => state.assets);
  let account = tempStore((state) => state.account);
  let resetTemp = tempStore((state) => state.reset);
  let setAccount = tempStore((state) => state.setAccount);

  let resetBeet = beetStore((state => state.reset));

  let setAsset = tempStore((state) => state.setAsset);
  let clearAssets = tempStore((state) => state.clearAssets);
  const fetchIssuedAssets = tempStore((state) => state.fetchIssuedAssets);

  const favourites = favouritesStore((state) => state.favourites);
  const removeFavourite = favouritesStore((state) => state.removeFavourite);
  const addFavouriteAccount = favouritesStore((state) => state.addFavouriteAccount);

  const [tries, setTries] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    resetTemp();
    resetBeet();

    if (env) {
      setEnvironment(env);
    } else {
      setEnvironment();
    }
    if (id) {
      setAccount(id);
    }
  }, []);

  function increaseTries() {
    let newTries = tries + 1;
    clearAssets();
    setTries(newTries);
  }
  
  useEffect(() => {
    async function fetchBalance() {
      setInProgress(true);

      setTimeout(() => {
        setInProgress(false);
        return;
      }, 10000);

      try {
        fetchIssuedAssets(account);
      } catch (error) {
        console.log(error);
        if (error && error.includes("connection is dead")) {
          changeURL();
        }
      }

      setInProgress(false);
    }
    if (account) {
      fetchBalance()
    }
  }, [tries, account]);

  const [memorizedAssets, setMemorizedAssets] = useState([]);
  useEffect(() => {
    if (!assets || !assets.length || !environment) {
      setMemorizedAssets([]);
      return;
    }

    setMemorizedAssets(assets.map(asset => {
      return <Button
                compact
                sx={{margin: '2px'}}
                variant="outline"
                key={`button.${asset.id}`}
                onClick={() => {
                  setAsset(asset);
                  navigate(`/NFT/${environment}/${asset.symbol}`);
                }}
              >
                {asset.symbol}: {asset.id}
              </Button>
    }));
  }, [assets]);

  const [favAccountItr, setFavAccountItr] = useState(0);
  const favAccountButton = useMemo(() => {
    if (!account || !environment || !favourites) {
      return null;
    }
    return favourites && favourites.length && favourites.find(f => (f.id === account))
      ? <Button
          leftIcon={<TbHeartBroken />}
          variant="outline"
          compact
          mt="xs"
          onClick={() => {
            setFavAccountItr(favAccountItr + 1);
            removeFavourite(account);
          }}
        >
          {t('nft:accountFavourite.remove')}
        </Button>
      : <Button
          leftIcon={<TbHeart />}
          variant="outline"
          compact
          mt="xs"
          onClick={() => {
            setFavAccountItr(favAccountItr + 1);
            addFavouriteAccount(nodes[environment][0], environment, account);
          }}
        >
          {t('nft:accountFavourite.save')}
        </Button>
  }, [account, favourites, favAccountItr]);

  const homeButton = <Link style={{ textDecoration: 'none' }} to="/">
                      <Button
                        compact
                        sx={{ margin: '2px' }}
                        variant="outline"
                        leftIcon={<HiOutlineHome />}
                      >
                        {t("app:menu.home")}
                      </Button>
                    </Link>;

  if (!environment) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:issuer.environment')}
        </Title>
        <Environment />
        {homeButton}
      </>
    );
  }

  const backOne = <Button
                    mt="sm"
                    compact
                    variant="outline"
                    onClick={() => {
                      setEnvironment();
                    }}
                    leftIcon={<HiArrowNarrowLeft />}
                  >
                    {t('setup:accountMode.back')}
                  </Button>;

  if (!nodes || !nodes[environment] || !nodes[environment].length) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:issuer.offline')}
        </Title>
        <Offline />
        <Center>
          <Group>
            {homeButton}
            {backOne}
          </Group>
        </Center>
      </>
    );
  }

  if (!account) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:issuer.account')}
        </Title>
        <GetAccount basic token={environment} env={environment} />
        <Center>
          <Group>
            {homeButton}
            {backOne}
          </Group>
        </Center>
      </>
    );
  }

  const portfolioButton = <Link style={{ textDecoration: 'none' }} to={`/portfolio/${environment}/${account}`}>
                            <Button
                              mt="sm"
                              compact
                              variant="outline"
                              leftIcon={<HiOutlineWallet />}
                            >
                              {t("blockchain:portfolio.button")}
                            </Button>
                          </Link>;

  const backTwo = <Button
                    mt="sm"
                    compact
                    variant="outline"
                    onClick={() => {
                      setEnvironment();
                      resetTemp();
                    }}
                    leftIcon={<HiArrowNarrowLeft />}
                  >
                    {t('setup:accountMode.back')}
                  </Button>;
  const refreshButton = <Button
                          variant="outline"
                          mt="sm"
                          compact
                          onClick={() => {
                            increaseTries()
                          }}
                          leftIcon={<HiOutlineRefresh />}
                        >
                          {t('blockchain:issuer.refresh')}
                        </Button>;

  if (inProgress || !assets) {
    return (
      <>
        <Loading />
        <Text size="sm" weight={600}>
          {t('blockchain:issuer.checkingAccount', {environment: environment !== 'bitshares' ? 'testnet' : ''})}
        </Text>
        <Center>
          <Group>
            {homeButton}
            {portfolioButton}
            {refreshButton}
            {backTwo}
          </Group>
        </Center>
      </>
    )
  }

  if (assets && !assets.length) {
    return (
      <>
        <Text size="sm" weight={600}>
          {t('blockchain:issuer.empty', {environment: environment !== 'bitshares' ? 'testnet' : ''})}
        </Text>
        <Center>
          <Group>
            {homeButton}
            {backTwo}
            {portfolioButton}
            {refreshButton}
          </Group>
        </Center>
      </>
    );
  }

  return (
    <>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          <Text size="sm" weight={600}>
            {t('blockchain:issuer.header', {environment: environment !== 'bitshares' ? 'testnet' : ''})}
          </Text>
          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {
              memorizedAssets
            }
          </SimpleGrid>
          <Center>
            <Group>
              {favAccountButton}
              {refreshButton}
            </Group>
          </Center>
        </Box>
      </Paper>
      <Center>
        <Group>
          {homeButton}
          {portfolioButton}
          {backTwo}
        </Group>
      </Center>
    </>
  );
}
