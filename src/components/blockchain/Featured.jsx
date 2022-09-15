import { useEffect, useState } from 'react';
import { Button, Text, Col, Paper, Group, Tooltip, Loader, SimpleGrid } from '@mantine/core';
import { appStore } from '../../lib/states';

import config from "../../config/config.json";

export default function Featured(properties) {
  let environment = appStore((state) => state.environment);
  let target = environment === 'production' ? 'BTS' : 'BTS_TEST';
  let assets = appStore((state) => state.assets);

  let setAsset = appStore((state) => state.setAsset);
  let fetchAssets = appStore((state) => state.fetchAssets);
  let setMode = appStore((state) => state.setMode);
  let clearAssets = appStore((state) => state.clearAssets);

  const [inProgress, setInProgress] = useState(false);
  const [increment, setIncrement] = useState(0);

  function back() {
    setMode();
    clearAssets();
  }

  function selectAsset(item) {
    setAsset(item)
  }

  function refresh() {
    clearAssets();
    setIncrement(increment + 1);
  }

  useEffect(() => {
    async function fetchData() {
      if (assets) {
        setInProgress(false);
        return;
      }
  
      setInProgress(true);
  
      setTimeout(() => {
        setInProgress(false);
        return;
      }, 3500);
  
      try {
        await fetchAssets(config[target].featured.map(nft => nft.id))
      } catch (error) {
        console.log(error);
      }
  
      setInProgress(false);
    }
    fetchData();
  }, [increment, assets]);

  let response;
  if (inProgress) {
    response = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                    Fetching featured assets
                </Text>
              </span>;
  } else if (!assets || assets && !assets.length) {
    response = <span>
                <Text size="sm" weight={600}>
                  An issue was encountered whilst fetching featured assets, please try again.
                </Text>
                <Button onClick={() => refresh()}>
                  Try again
                </Button>
                <br/>
              </span>;
  } else if (assets && assets.length) {
    response = <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
                  {
                    assets && assets.length
                      ? assets.map(item => {
                          return <Button
                                    compact
                                    sx={{margin: '2px'}}
                                    variant="outline"
                                    key={`button.${item.id}`}
                                    onClick={() => {
                                      // TODO: Check this value
                                      selectAsset(item)
                                    }}
                                  >
                                    {item.symbol}: {item.id}
                                  </Button>
                        })
                      : null
                  }
                </SimpleGrid>;
  }

  return <Col span={12} key="Top">
            <Paper sx={{padding: '5px'}} shadow="xs">
                <Text size="md">
                  Featured NFTs
                </Text>
                { response }
                <br/>
                <Button
                  onClick={() => {
                    back()
                  }}
                >
                  Go back
                </Button>   
            </Paper>
          </Col>;

}
