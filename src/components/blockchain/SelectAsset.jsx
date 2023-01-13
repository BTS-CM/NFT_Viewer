
import { useEffect, useState } from 'react';
import { Button, Group, Box, Text, Divider, SimpleGrid, Loader, Col, Paper } from '@mantine/core';
import { appStore, beetStore, translationStore } from '../../lib/states';
import Accounts from "./Accounts";

export default function SelectAsset(properties) {
  const t= translationStore((state) => state.t);
  let setAsset = appStore((state) => state.setAsset);
  let setMode = appStore((state) => state.setMode);
  let changeURL = appStore((state) => state.changeURL);

  let fetchIssuedAssets = appStore((state) => state.fetchIssuedAssets);
  let clearAssets = appStore((state) => state.clearAssets);
  let assets = appStore((state) => state.assets);
  let reset = beetStore((state) => state.reset);
  let back = appStore((state) => state.back);

  let account = appStore((state) => state.account);
  const [tries, setTries] = useState(0);

  function increaseTries() {
    let newTries = tries + 1;
    clearAssets();
    setTries(newTries);
  }

  function goBack() {
    reset();
    back();
    setMode();
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

          <Button
            variant="outline"
            sx={{marginTop: '15px', marginRight: '5px'}}
            onClick={() => {
              increaseTries()
            }}
          >
            {t('blockchain:selectAsset.refresh')}
          </Button>
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
