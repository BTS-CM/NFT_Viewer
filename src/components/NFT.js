import { useState } from 'react';
import { TextInput, Checkbox, Button, Box, Text, Divider, Col, Paper, Group, Tooltip, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { TransactionBuilder } from 'bitsharesjs';
import { Apis } from "bitsharesjs-ws";

export default function NFT(properties) {
  const connection = properties.connection;
  const asset = properties.asset;
  
  const [inProgress, setInProgress] = useState(false);

  const setAsset = properties.setAsset;
  const setMode = properties.setMode;

  const environment = properties.environment;
  const wsURL = properties.wsURL;
  const nodes = properties.nodes;
  const setNodes = properties.setNodes;
  const setProdConnection = properties.setProdConnection;
  const setTestnetConnection = properties.setTestnetConnection;

  function back() {
    setAsset();
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

  return (
    !inProgress
    ? [
        <Col span={12} key="Top">
          <Paper sx={{padding: '5px'}} shadow="xs">

              <Button
                onClick={() => {
                  back()
                }}
              >
                Go back
              </Button>   
          </Paper>
        </Col>
    ]
  : <Col span={12} key="Top">
      <Paper sx={{padding: '5px'}} shadow="xs">
          <Text size="md">
            Couldn't load NFT
          </Text>
      </Paper>
    </Col>
  )

}
