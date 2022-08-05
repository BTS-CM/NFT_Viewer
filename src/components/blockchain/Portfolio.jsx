import { useEffect, useState } from 'react';
import { Button, Box, Text, Loader, Col, Paper } from '@mantine/core';
import { appStore } from '../../lib/states';

export default function Portfolio(properties) {
  const userID = properties.userID;

  let environment = appStore((state) => state.environment);
  let target = environment === 'production' ? 'BTS' : 'BTS_TEST';

  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);

  let nodes = appStore((state) => state.nodes);
  let setNodes = appStore((state) => state.setNodes);

  const [balances, setBalances] = useState();
  const [tries, setTries] = useState(0);
  
  function back() {
    setMode();
  }

  function increaseTries() {
    let newTries = tries + 1;
    setBalances();
    setTries(newTries);
  }

  function chosenAsset(item) {
    setAsset(item);
  }
  
  async function fetchBalances() {
    if (nodes && nodes.length) {
      window.electron.fetchUserBalances(nodes[0].url, userID).then(userBalances => {       
        setBalances(userBalances);
      })
      .catch((error) => {
        console.log(error);
      })
    }
  }

  useEffect(() => {
    async function fetchNodes() {
      if (!nodes) {
        window.electron.testConnections(target).then(res => {
          setNodes(res.nodes);
        }).then(() => {
          return fetchBalances();
        })
      } else {
        return fetchBalances();
      }
    }
    fetchNodes();
  }, [tries]);
  
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
