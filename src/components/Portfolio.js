import { useEffect, useState } from 'react';
import { Button, Box, Text, Loader, Col, Paper } from '@mantine/core';
import { Apis } from "bitsharesjs-ws";
import SelectAsset from './SelectAsset';

export default function Portfolio(properties) {
  const userID = properties.userID;
  const nodes = properties.nodes;
  const environment = properties.environment;

  const setNodes = properties.setNodes;
  const setAsset = properties.setAsset;
  const setProdConnection = properties.setProdConnection;
  const setTestnetConnection = properties.setTestnetConnection;
  const setConnection = properties.setConnection;

  const [balances, setBalances] = useState();
  const [tries, setTries] = useState(0);
  
  function back() {
    setNodes();
    setProdConnection();
    setTestnetConnection();
    setConnection();
  }

  function increaseTries() {
    let newTries = tries + 1;
    setBalances();
    setTries(newTries);
  }

  function chosenAsset(item) {
    setAsset(item)
  }

  function changeURL() {
    let nodesToChange = nodes;
    nodesToChange.push(nodesToChange.shift()); // Moving misbehaving node to end
    setNodes(nodesToChange);

    if (environment === 'production') {
      setProdConnection(nodesToChange[0]);
    } else {
      setTestnetConnection(nodesToChange[0]);
    }
  }
  
  useEffect(() => {
    async function fetchBalances() {

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
          changeURL();
          return;
        }
        
        let balanceResult;
        try {
          balanceResult = await Apis.instance().db_api().exec("get_account_balances", [userID, []]);
        } catch (error) {
          console.log(error);
          return;
        }
        
        let balanceSymbols;
        try {
          balanceSymbols = await Apis.instance().db_api().exec( "lookup_asset_symbols", [ balanceResult.map(balance => balance.asset_id) ]);
        } catch (error) {
          console.log(error);
          return;
        }

        let filteredAssets = balanceSymbols.filter(asset => {
          let desc = JSON.parse(asset.options.description);
          return desc.nft_object ? true : false;
        })
        
        setBalances(filteredAssets.length ? filteredAssets : []);
      })
    }
    fetchBalances();
  }, [userID, tries]);
  
  let topText;
  if (!nodes) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                    Finding the fastest node to connect to...
                </Text>
              </span>;
  } else if (!balances) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="sm" weight={600}>
                    Checking your Bitshares account...
                </Text>
              </span>;
  } else if (!balances.length) {
    topText = <span>
                <Loader variant="dots" />
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
                    balances.map(asset => {
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
  if (nodes && balances) {
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
