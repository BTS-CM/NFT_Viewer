import { useEffect, useState } from 'react';
import { Button, Box, Text, Loader, Col, Paper, SimpleGrid } from '@mantine/core';
import { appStore, beetStore, translationStore } from '../../lib/states';

import Accounts from "./Accounts";

export default function Portfolio(properties) {
  const t= translationStore((state) => state.t);
  let environment = appStore((state) => state.environment);
  let assets = appStore((state) => state.assets);
  let account = appStore((state) => state.account);

  let setAsset = appStore((state) => state.setAsset);
  let fetchNFTBalances = appStore((state) => state.fetchNFTBalances);
  let goBack = appStore((state) => state.back);
  let clearAssets = appStore((state) => state.clearAssets);

  let resetConnection = beetStore((state) => state.reset);

  const [tries, setTries] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  function back() {
    goBack();
    resetConnection();
  }

  function increaseTries() {
    let newTries = tries + 1;
    clearAssets();
    setTries(newTries);
  }

  function chosenAsset(item) {
    setAsset(item);
  }
  
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

  let topText;
  if (!account) {
    topText = <Accounts />
  } else if (inProgress || !assets) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                  {t('blockchain:portfolio.checkingAccount', {environment: environment !== 'production' ? 'testnet' : ''})}
                </Text>
              </span>;
  } else if (!assets.length) {
    topText = <span>
                <Text size="sm" weight={600}>
                  {t('blockchain:portfolio.emptyPortfolio')}
                </Text>
              </span>;
  } else {
    topText = <span>
                <Text size="sm" weight={600}>
                  {t('blockchain:portfolio.header')}
                </Text>
                <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
                  {
                    assets.map(asset => {
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
                  }
                </SimpleGrid>
              </span>
  }

  let tryAgain;
  if (assets) {
    tryAgain = <span>
                  <Button
                    sx={{marginTop: '15px', marginRight: '5px'}}
                    onClick={() => {
                      increaseTries()
                    }}
                  >
                    {t('blockchain:portfolio.refresh')}
                  </Button>
                </span>;
  }

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }
          {
            tryAgain
          }
          <Button
            variant="light"
            sx={{marginTop: '15px'}}
            onClick={() => {
              back()
            }}
          >
            {t('blockchain:portfolio.back')}
          </Button>
        </Box>
      </Paper>
    </Col>
  );
}
