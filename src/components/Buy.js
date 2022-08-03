import { useState } from 'react';
import { TextInput, Checkbox, Button, Box, Text, Divider, Col, Paper, Group, Tooltip, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TransactionBuilder } from 'bitsharesjs';
import { Apis } from "bitsharesjs-ws";

export default function Buy(properties) {
  const connection = properties.connection;
  const asset = properties.asset;
  
  const [inProgress, setInProgress] = useState(false);
  const [bought, setBought] = useState(false);

  const setAsset = properties.setAsset;
  const setMode = properties.setMode;

  const environment = properties.environment;
  const wsURL = properties.wsURL;
  const nodes = properties.nodes;
  const setNodes = properties.setNodes;
  const setProdConnection = properties.setProdConnection;
  const setTestnetConnection = properties.setTestnetConnection;

  function back() {
    setMode();
  }

  function changeURL() {
    let nodesToChange = nodes;
    nodesToChange.push(nodesToChange.shift()); // Moving misbehaving node to end
    setNodes(nodesToChange);
    console.log(`Setting new node connection to: ${nodesToChange[0]}`)
    if (environment === 'production') {
      setProdConnection(nodesToChange[0]);
    } else {
      setTestnetConnection(nodesToChange[0]);
    }
  }

  function attemptPurchase() {
    console.log('Attempting to purchase NFT');
  }

  let response;
  if (inProgress) {
    response = <span>
                  <Loader variant="dots" />
                  <Text size="md">
                    Waiting on user response from BEET client
                  </Text>
              </span>;
  } else if (bought) {
    response = <span>
                    <Text size="md">
                      Successfully purchased the NFT {''} for {''}.
                    </Text>
                    <Button
                      onClick={() => {
                        back()
                      }}
                    >
                      Back
                    </Button>
                </span>;
  } else {
    response = <span>
                  <Text size="md">
                    Instruct BEET to purchase the NFT {''} for {''}?
                  </Text>
                  <Button
                    onClick={() => {
                      attemptPurchase()
                    }}
                  >
                    Yes
                  </Button>  
                  <Button
                    onClick={() => {
                      back()
                    }}
                  >
                    No
                  </Button>
                </span>;
  }
  
  return <Col span={12} key="Top">
          <Paper sx={{padding: '5px'}} shadow="xs">
            {response}
          </Paper>
        </Col>;
}
