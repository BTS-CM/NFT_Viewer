import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Button, Text, SimpleGrid, Title, Group, Paper, Box, Center } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { HiOutlineHome, HiArrowNarrowLeft, HiOutlineRefresh } from "react-icons/hi";
import { TbHeart, TbHeartBroken, TbUser } from 'react-icons/tb';

import { appStore, beetStore, tempStore, favouritesStore } from '../lib/states';

import Loading from "../components/setup/Loading";
import Environment from "../components/setup/Environment";
import Offline from "../components/setup/Offline";
import GetAccount from "../components/beet/GetAccount";


export default function Portfolio(properties) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { env, id } = params; 

  let environment = appStore((state) => state.environment);
  let nodes = appStore((state) => state.nodes);
  let setEnvironment = appStore((state) => state.setEnvironment);

  let assets = tempStore((state) => state.assets);
  let account = tempStore((state) => state.account);
  let setAccount = tempStore((state) => state.setAccount);
  let resetTemp = tempStore((state) => state.reset);
  let resetBeet = beetStore((state => state.reset));

  let setAsset = tempStore((state) => state.setAsset);
  let fetchNFTBalances = tempStore((state) => state.fetchNFTBalances);
  let clearAssets = tempStore((state) => state.clearAssets);

  const favourites = favouritesStore((state) => state.favourites);
  const removeFavourite = favouritesStore((state) => state.removeFavourite);
  const addFavouriteAccount = favouritesStore((state) => state.addFavouriteAccount);

  const [tries, setTries] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  function increaseTries() {
    let newTries = tries + 1;
    clearAssets();
    setTries(newTries);
  }

  useEffect(() => {
    resetTemp();
    resetBeet();

    if (env && id) {
      setEnvironment(env);
      setAccount(id);
    } else {
      setEnvironment();
    }
  }, []);
  
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

  useEffect(() => {
    async function fetchBalance() {
      setInProgress(true);

      setTimeout(() => {
        setInProgress(false);
        return;
      }, 10000);

      try {
        fetchNFTBalances(account);
      } catch (error) {
        console.log(error);
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
    if (assets && assets.length) {
      setMemorizedAssets(assets.map(asset => {
        return (
          <Button
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
        );
      }));
    }
  }, [assets]);

  const homeButton = <Link style={{ textDecoration: 'none' }} to="/">
                      <Button
                        mt="sm"
                        compact
                        variant="outline"
                        leftIcon={<HiOutlineHome />}
                      >
                        {t("app:menu.home")}
                      </Button>
                    </Link>;

  const backOne = <>
    <Button
      mt="sm"
      compact
      variant="outline"
      onClick={() => {
        setEnvironment();
      }}
      leftIcon={<HiArrowNarrowLeft />}
    >
      {t('setup:accountMode.back')}
    </Button>
  </>;

  if (!environment) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:portfolio.environment')}
        </Title>
        <Environment />
        {homeButton}
      </>
    );
  }

  if (!nodes || !nodes[environment] || !nodes[environment].length) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:portfolio.offline')}
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
          {t('headers:portfolio.account')}
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

  const backTwo = <>
    <Button
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
    </Button>
  </>;

  if (inProgress) {
    return (
      <>
        <Paper padding="sm" shadow="xs">
          <Box mx="auto" sx={{padding: '10px'}}>
            <Loading />
            <Text size="sm" weight={600}>
              {t('blockchain:portfolio.checkingAccount', {environment: environment !== 'bitshares' ? 'testnet' : ''})}
            </Text>
          </Box>
        </Paper>
        <Center>
          <Group>
            {homeButton}
            {backTwo}
          </Group>
        </Center>
      </>
    )
  }

  if (!inProgress && !assets) {
    return (
      <>
        <Paper padding="sm" shadow="xs">
          <Box mx="auto" sx={{padding: '10px'}}>
            <Loading />
            <Text size="sm" weight={600}>
              {t('blockchain:portfolio.error')}
            </Text>
            <Button
              variant="outline"
              compact
              onClick={() => {
                increaseTries()
              }}
              leftIcon={<HiOutlineRefresh />}
            >
              {t('blockchain:portfolio.retry')}
            </Button>
          </Box>
        </Paper>
        <Center>
          <Group>
            {homeButton}
            {backTwo}
          </Group>
        </Center>
      </>
    )
  }

  const twoButtons = <>
    <Link style={{ textDecoration: 'none' }} to={`/issuer/${environment}/${account}`}>
      <Button
        mt="sm"
        compact
        variant="outline"
        leftIcon={<TbUser />}
      >
        {t("blockchain:portfolio.issuer")}
      </Button>
    </Link>
    <Button
      variant="outline"
      mt="sm"
      compact
      onClick={() => {
        increaseTries()
      }}
      leftIcon={<HiOutlineRefresh />}
    >
      {t('blockchain:portfolio.refresh')}
    </Button>
  </>;

  if (!memorizedAssets || !memorizedAssets.length) {
    return (
      <>
        <Paper padding="sm" shadow="xs">
          <Box mx="auto" sx={{padding: '10px'}}>
            <Text size="sm" weight={600}>
              {t('blockchain:portfolio.emptyPortfolio')}
            </Text>
          </Box>
        </Paper>
        
        <Center>
          <Group>
            {homeButton}
            {backTwo}
            {twoButtons}
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
            {t('blockchain:portfolio.header')}
          </Text>
          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {memorizedAssets}
          </SimpleGrid>
          <Center>
            <Group>
              {favAccountButton}
              {twoButtons}
            </Group>
          </Center>
        </Box>
      </Paper>
      <Center>
        <Group>
            {homeButton}
            {backTwo}
        </Group>
      </Center>
    </>
  );
}
