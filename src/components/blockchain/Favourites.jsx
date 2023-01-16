
import React, { useEffect, useState } from 'react';
import { Button, Group, Box, Text, Divider, SimpleGrid, Loader, Col, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { IconUser, IconPhotoHeart } from '@tabler/icons';

import { fetchObject } from '../../lib/queries';

import { appStore, beetStore, favouritesStore } from '../../lib/states';

export default function Favourites(properties) {
  const { t, i18n } = useTranslation();
  let setAsset = appStore((state) => state.setAsset);
  let setMode = appStore((state) => state.setMode);
  let setAccount = appStore((state) => state.setAccount);
  let nodes = appStore((state) => state.nodes);
  let favourites = favouritesStore((state) => state.favourites);
  let removeFavourite = favouritesStore((state) => state.removeFavourite);
  let environment = appStore((state) => state.environment);
  const relevantChain = environment === 'production' ? 'BTS' : 'BTS_TEST';

  const [inProgress, setInProgress] = useState(false);

  function goBack() {
    setMode();
  }

  /**
   * User has selected a favourite Bitshares asset
   * @param {String} assetID
   */
  async function chosenAsset(assetID) {
    setInProgress(true);
    if (!assetID.includes('1.3.')) {
      console.log('invalid ID');
      setInProgress(false);
      return;
    }
    console.log('chosen favourite' + assetID);

    let searchResult;
    try {
      searchResult = await fetchObject(nodes[0], assetID);
    } catch (error) {
      console.log(error);
      setInProgress(false);
      return;
    }

    if (!searchResult || !searchResult.length) {
      console.log({msg: "Couldn't find account", account});
      setInProgress(false);
      return;
    }

    setAsset(searchResult[0]);
    setInProgress(false);
    setMode();
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
    setMode('lookup');
  }

  let topText = !favourites || !favourites.length || !favourites.filter(fav => fav.chain === relevantChain).length
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
                    </span>;


  let assetList = favourites && favourites.length
                    ? favourites
                        .filter(fav => fav.chain === relevantChain)
                        .filter(fav => fav.id.includes('1.3.'))
                        .map(favourite => {
                          return <Button
                                    compact
                                    leftIcon={<IconPhotoHeart />}
                                    sx={{margin: '2px'}}
                                    variant="outline"
                                    key={`button.${favourite.id}`}
                                    onClick={() => {
                                      chosenAsset(favourite.id);
                                    }}
                                  >
                                    {favourite.name}: {favourite.id}
                                  </Button>
                        })
                    : null;
  
  let accountList = favourites && favourites.length
                      ? favourites
                          .filter(fav => fav.chain === relevantChain)
                          .filter(fav => fav.id.includes('1.2.'))
                          .map(favourite => {
                            return <span>
                                    <Button
                                      compact
                                      leftIcon={<IconUser />}
                                      sx={{margin: '2px'}}
                                      variant="outline"
                                      key={`button.${favourite.id}`}
                                      onClick={() => {
                                        chosenAccount(favourite.id)
                                      }}
                                    >
                                      {favourite.name}: {favourite.id}
                                    </Button>
                                  </span>
                          })
                      : null;

  if (inProgress) {
    return (
      <Col span={12}>
        <Paper padding="sm" shadow="xs">
          <Box mx="auto" sx={{padding: '10px'}}>
            <Loader size="lg" />
          </Box>
        </Paper>
      </Col>
    );
  }

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }
          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {
              accountList
            }
            {
              assetList
            }
          </SimpleGrid>
          <Button
            variant="light"
            sx={{marginTop: '15px'}}
            onClick={() => {
              goBack()
            }}
          >
            {t('blockchain:selectAsset.back')}
          </Button>
        </Box>
      </Paper>
    </Col>
  );
}
