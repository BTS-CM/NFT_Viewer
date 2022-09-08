import { useEffect, useState } from 'react';
import { Button, Box, Text, Loader, Col, Paper, SimpleGrid } from '@mantine/core';
import { appStore } from '../../lib/states';

export default function Portfolio(properties) {
  const userID = properties.userID;

  let environment = appStore((state) => state.environment);

  let assets = appStore((state) => state.assets);
  let setAsset = appStore((state) => state.setAsset);
  let fetchNFTBalances = appStore((state) => state.fetchNFTBalances);
  let goBack = appStore((state) => state.back);
  let clearAssets = appStore((state) => state.clearAssets);

  const [tries, setTries] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  function back() {
    goBack();
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
        fetchNFTBalances(userID);
      } catch (error) {
        console.log(error);
      }

      setInProgress(false);
    }
    fetchBalance()
  }, [tries]);

  let topText;
  if (inProgress || !assets) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                    Checking your Bitshares {environment !== 'production' ? 'testnet' : null} account...
                </Text>
              </span>;
  } else if (!assets.length) {
    topText = <span>
                <Text size="sm" weight={600}>
                    You don't seem to have any NFTs in your portfolio yet.
                </Text>
              </span>;
  } else {
    topText = <span>
                <Text size="sm" weight={600}>
                    Your portfolio contains the following NFTs
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
                    Refresh portfolio
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
            sx={{marginTop: '15px'}}
            onClick={() => {
              back()
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Col>
  );
}
