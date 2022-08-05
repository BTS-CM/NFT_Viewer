import { useEffect, useState } from 'react';
import { Button, Text, Col, Paper, Group, Tooltip, Loader, SimpleGrid } from '@mantine/core';
import { appStore, beetStore } from '../../lib/states';

import config from "../../config/config.json";

export default function Featured(properties) {
  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);
  let featuredAssets = appStore((state) => state.featuredAssets);
  let setFeaturedAssets = appStore((state) => state.setFeaturedAssets);

  let environment = appStore((state) => state.environment);
  let target = environment === 'production' ? 'BTS' : 'BTS_TEST';

  let nodes = appStore((state) => state.nodes);
  let setNodes = appStore((state) => state.setNodes);

  const [assets, setAssets] = useState();
  const [inProgress, setInProgress] = useState(false);

  function back() {
    setMode();
  }

  function selectAsset(item) {
    setAsset(item)
  }

  async function getFeaturedAssets() {
    return new Promise(async (resolve, reject) => {
      let refNodes = appStore.getState().nodes;
      if (!refNodes) {
        console.log('no nodes');
        return resolve();
      }
      let featuredIDs = config[target].featured.map(nft => nft.id);

      setTimeout(() => {
        setInProgress(false);
        return resolve();
      }, 10000);

      window.electron.fetchAssets(refNodes[0], featuredIDs).then(featuredAssets => {
        let filteredAssets = featuredAssets.filter(asset => {
          let desc = JSON.parse(asset.options.description);
          return desc.nft_object ? true : false;
        })
        
        setAssets(filteredAssets);
        setFeaturedAssets(filteredAssets);
        setInProgress(false);
        return resolve();
      })
      .catch((error) => {
        console.log(error);
        setInProgress(false);
        return resolve();
      })
    });
  }

  useEffect(() => {
    async function fetchNodes() {
      setInProgress(true);
      if (featuredAssets && featuredAssets.length) {
        setAssets(featuredAssets);
        setInProgress(false);
        return;
      }

      if (!nodes) {
        return window.electron.testConnections(target).then(res => {
          setNodes(res);
        }).then(() => {
          return getFeaturedAssets();
        })
      } else {
        return getFeaturedAssets();
      }
    }
    fetchNodes();
  }, []);

  let response;
  if (inProgress) {
    response = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                    Fetching featured assets
                </Text>
              </span>;
  } else if (assets && !assets.length) {
    response = <span>
                <Text size="sm" weight={600}>
                    An error was encountered
                </Text>
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
