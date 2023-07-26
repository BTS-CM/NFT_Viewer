
import React, { useEffect, useState } from 'react';
import { Button, Group, Box, Text, Divider, SimpleGrid, Loader, Col, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { HiArrowNarrowLeft, HiOutlineRefresh } from "react-icons/hi";

import { appStore, beetStore, tempStore } from '../../lib/states';
import Accounts from "./Accounts";

export default function SelectAsset(properties) {
  const { t, i18n } = useTranslation();
  let changeURL = appStore((state) => state.changeURL);

  const fetchIssuedAssets = tempStore((state) => state.fetchIssuedAssets);
  const clearAssets = tempStore((state) => state.clearAssets);
  const setAsset = tempStore((state) => state.setAsset);
  const account = tempStore((state) => state.account);

  let reset = beetStore((state) => state.reset);
  let back = appStore((state) => state.back);

  const [tries, setTries] = useState(0);

  function increaseTries() {
    let newTries = tries + 1;
    clearAssets();
    setTries(newTries);
  }

  function goBack() {
    reset();
    back();
    clearAssets();
  }

  /**
   * User has selected an asset to edit
   * @param {Object} asset 
   */
  function chosenAsset(asset) {
    setAsset(asset);    
  }

  useEffect(() => {
    async function issuedAssets() {
      try {
        await fetchIssuedAssets(account);
      } catch (error) {
        console.log(error);
        changeURL();
        return;
      }
    }
    issuedAssets();
  }, [account, tries]);

  let topText;
  if (!account) {
    topText = <span>
                <Text size="lg">
                  {t('blockchain:selectAsset.lookup')}
                </Text>
                <Accounts />
              </span>;
  } else if (!assets) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="md">
                  {t('blockchain:selectAsset.fetching')}
                </Text>
              </span>;
  } else if (!assets.length) {
    topText = <span>
                <Text size="md">
                  {t('blockchain:selectAsset.noResultsHeader')}
                </Text>
                <Text size="sm" weight={600}>
                  {t('blockchain:selectAsset.noResultsDesc')}
                </Text>
                <Text size="sm" weight={500}>
                  {t('blockchain:selectAsset.notice')}
                </Text>
              </span>
  } else {
    topText = <span>
                <Text size="md">
                  {t('blockchain:selectAsset.selection')}
                </Text>
              </span>
  }

  let buttonList = assets
                    ? assets.map(asset => {
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
          
          <Center>
            <Group>
              <Button
                variant="outline"
                compact
                sx={{marginTop: '15px', marginRight: '5px'}}
                onClick={() => {
                  increaseTries()
                }}
                leftIcon={<HiOutlineRefresh />}
              >
                {t('blockchain:selectAsset.refresh')}
              </Button>
              <Button
                variant="outline"
                compact
                sx={{marginTop: '15px'}}
                onClick={() => {
                  goBack()
                }}
                leftIcon={<HiArrowNarrowLeft />}
              >
                {t('blockchain:selectAsset.back')}
              </Button>
            </Group>
          </Center>
        </Box>
      </Paper>
    </Col>
  );
}
