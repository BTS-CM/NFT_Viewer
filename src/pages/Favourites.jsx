
import React, { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Group, Box, Text, SimpleGrid, Title, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { TbUser, TbPhotoHeart } from 'react-icons/tb';

import {
  HiOutlineHome,
  HiArrowNarrowLeft,
  HiOutlineRefresh,
  HiOutlineCake,
} from "react-icons/hi";

import { appStore, favouritesStore, tempStore } from '../lib/states';
import Loading from '../components/setup/Loading';
import Environment from '../components/setup/Environment';

export default function Favourites(properties) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  let setAsset = tempStore((state) => state.setAsset);
  let setAccount = tempStore((state) => state.setAccount);
  const resetTemp = tempStore((state) => state.reset);

  let nodes = appStore((state) => state.nodes);
  let environment = appStore((state) => state.environment);
  let setEnvironment = appStore((state) => state.setEnvironment);

  let favourites = favouritesStore((state) => state.favourites);
  const relevantFavourites = useMemo(() => {
    if (!environment || !favourites || !favourites.length) {
      return [];
    }
    
    return favourites.filter((fav) => 
      fav.chain === (environment === 'bitshares' ? 'BTS' : 'BTS_TEST')
    );
  }, [favourites, environment]);

  const [inProgress, setInProgress] = useState(false);

  useEffect(() => {
    resetTemp();
    setEnvironment();
  }, []);

  /**
   * User has selected a favourite Bitshares asset
   * @param {Object} thisAsset
   */
  async function chosenAsset(thisAsset) {
    setInProgress(true);
    if (!thisAsset.id.includes('1.3.')) {
      console.log('invalid ID');
      setInProgress(false);
      return;
    }

    let searchResult;
    try {
      searchResult = await window.electron.fetchObject(nodes[environment][0], thisAsset.id);
    } catch (error) {
      console.log(error);
      setInProgress(false);
      return;
    }

    if (!searchResult || !searchResult.length) {
      setInProgress(false);
      return;
    }

    setAsset(searchResult[0]);
    navigate(`/NFT/${environment}/${thisAsset.symbol}`)
    setInProgress(false);
  }

  /**
   * User has selected a favourite Bitshares account
   * @param {String} accountID 
   */
  function chosenAccount(accountID) {
    if (!accountID.includes('1.2.')) {
      console.log('invalid ID');
      return;
    }
    console.log('chosen account' + accountID);
    setAccount(accountID);
  }

  const topText = useMemo(() => {
    return !relevantFavourites || !relevantFavourites.length
      ? <span>
          <Text size="md">
            {t('blockchain:favourites.noFavourites')}
          </Text>
          <Text size="sm" weight={600}>
            {t('blockchain:favourites.noFavouritesDesc')}
          </Text>
        </span>
      : <span>
          <Text size="md">
            {t('blockchain:favourites.selection')}
          </Text>
        </span>
  }, [relevantFavourites]);

  const assetList = useMemo(() => {
    return relevantFavourites && relevantFavourites.length
      ? relevantFavourites
          .filter(fav => fav.id.includes('1.3.'))
          .map(favourite => {
            return <Button
                      compact
                      leftIcon={<TbPhotoHeart />}
                      variant="outline"
                      key={`button.${favourite.id}`}
                      onClick={() => {
                        chosenAsset(favourite);
                      }}
                    >
                      {favourite.name}: {favourite.id}
                    </Button>
          })
      : null
  }, [relevantFavourites]);
  
  const accountList = useMemo(() => {
    return relevantFavourites && relevantFavourites.length
    ? relevantFavourites
        .filter(fav => fav.id.includes('1.2.'))
        .map(favourite => {
          return <Link to={`/issuer/${environment}/${favourite.id}`} style={{ textDecoration: 'none' }} key={`button.${favourite.id}`}>
                  <Button
                    compact
                    leftIcon={<TbUser />}
                    variant="outline"
                    onClick={() => {
                      chosenAccount(favourite.id)
                    }}
                  >
                    {favourite.name}: {favourite.id}
                  </Button>
                </Link>
        })
    : null;
  }, [relevantFavourites]);

  const homeButton = <Link style={{ textDecoration: 'none' }} to="/">
                      <Button
                        variant="outline"
                        compact
                        leftIcon={<HiOutlineHome />}
                      >
                        {t("app:menu.home")}
                      </Button>
                    </Link>;

  if (!environment) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:favourites.environment')}
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
          </Group>
        </Center>
      </>
    );
  }

  if (inProgress) {
    return (
      <Loading />
    );
  }

  return (
    <>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }
          {
            accountList && accountList.length
              ?  <>
                  <Text size="md" mt="sm">
                    {t("blockchain:favourites.favAccounts")}
                  </Text>
                  <SimpleGrid cols={3}>
                    {
                      accountList
                    }
                  </SimpleGrid>
                </>
              : null
          }
          {
            assetList && assetList.length
              ?  <>
                  <Text size="md" mt="sm">
                    {t("blockchain:favourites.favAssets")}
                  </Text>
                  <SimpleGrid cols={3}>
                    {
                      assetList
                    }
                  </SimpleGrid>
                </>
              : null
          }
          <Button
            compact
            mt="sm"
            sx={{ margin: '2px' }}
            variant="outline"
            onClick={() => {
              resetTemp();
              setEnvironment();
            }}
          >
            {t("setup:mode.back")}
          </Button>
        </Box>
      </Paper>
      <Group position="center" mt="sm">
        <Link style={{ textDecoration: 'none' }} to={`/featured/${environment}`}>
          <Button leftIcon={<HiOutlineCake />} compact variant="outline">
            {t("app:menu.featured")}
          </Button>
        </Link>
        {homeButton}
      </Group>
    </>
  );
}
