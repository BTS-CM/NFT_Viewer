import { useEffect, useState } from 'react';
import { Button, Text, Col, Paper, Group, Tooltip, Loader, SimpleGrid } from '@mantine/core';
import { Apis } from "bitsharesjs-ws";

import config from "../config/config.json";

export default function Featured(properties) {
  const setAsset = properties.setAsset;
  const setMode = properties.setMode;

  const environment = properties.environment;
  const setNodes = properties.setNodes;
  const setProdConnection = properties.setProdConnection;
  const setTestnetConnection = properties.setTestnetConnection;

  const [assets, setAssets] = useState();
  function back() {
    setMode();
  }

  function selectAsset(item) {
    setAsset(item)
  }

  useEffect(() => {
    async function fetchAsset() {

      let target = environment === 'production' ? 'BTS' : 'BTS_TEST';
      window.electron.testConnections(target).then(async (res) => {
        let fastestNode = res.node;
        setNodes(res.latencies);

        if (environment === 'production') {
          setProdConnection(fastestNode);
        } else {
          setTestnetConnection(fastestNode);
        }

        try {
          await Apis.instance(fastestNode, true).init_promise;
        } catch (error) {
          console.log(error);
          return;
        }
        
        let featuredIDs = config[environment === 'production' ? 'BTS' : 'BTS_TEST'].featured.map(nft => nft.id);

        let featuredAssets;
        try {
          featuredAssets = await Apis.instance().db_api().exec( "lookup_asset_symbols", [ featuredIDs ]);
        } catch (error) {
          console.log(error);
          return;
        }

        let filteredAssets = featuredAssets.filter(asset => {
          let desc = JSON.parse(asset.options.description);
          return desc.nft_object ? true : false;
        })
        
        setAssets(filteredAssets.length ? filteredAssets : []);
      })
    }
    fetchAsset();
  }, []);

  let response;
  if (!assets) {
    response = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                    Fetching featured assets
                </Text>
              </span>;
  } else if (!assets.length) {
    response = <span>
                <Text size="sm" weight={600}>
                    An error was encountered
                </Text>
              </span>;
  } else {
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
