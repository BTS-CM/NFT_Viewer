import { useEffect, useState } from 'react';
import { Button, Group, Container, Box, Text, Divider, Loader, Col, Paper, Checkbox } from '@mantine/core';
import { connect, checkBeet } from 'beet-js';
import { appStore, beetStore } from '../../lib/states';
import { useTimeout } from '@mantine/hooks';

export default function Connect(properties) {
  let setConnection = beetStore((state) => state.setConnection);
  let setAuthenticated = beetStore((state) => state.setAuthenticated); 
  let setMode = appStore((state) => state.setMode);
  
  const [inProgress, setInProgress] = useState(false);

  function back() {
    setMode();
  }

  function beetDownload() {
    window.electron.openURL('github');
  }

  async function connectToBeet() {
    setInProgress(true);

    setTimeout(() => {
      setInProgress(false);
      return;
    }, 3000);
    
    let beetOnline;
    try {
      beetOnline = await checkBeet(true);
    } catch (error) {
      console.log(error);
    }

    if (!beetOnline) {
      setInProgress(false);
      return;
    }

    let connected;
    try {
      connected = await connect(
        "NFT Issuance tool",
        "Application",
        "localhost"
      );
    } catch (error) {
      console.error(error)
    }

    setInProgress(false);

    if (!connected) {
      console.error("Couldn't connect to Beet");
      setConnection();
      setAuthenticated();
      return;
    }

    //console.log(connected.inject())
    
    setConnection(connected);
    setAuthenticated(connected.authenticated);
  }



  let response;
  if (inProgress === false) {
    response = [<Col span={12} key="connect">
                  <Paper padding="sm" shadow="xs">
                    <Box mx="auto" sx={{padding: '10px', paddingTop: '10px'}}>
                      <Text size="md">
                        This tool is designed for use with the Bitshares BEET Wallet.
                      </Text>
                      <Text size="md">
                        Launch and unlock it, then click the connect button below to proceed.
                      </Text>
                      <Button
                        sx={{marginTop: '15px', marginRight: '5px'}}
                        onClick={() => {
                          connectToBeet()
                        }}
                      >
                        Connect to Beet
                      </Button>
                      <Button
                        onClick={() => {
                          back()
                        }}
                      >
                        Go back
                      </Button> 
                    </Box>
                  </Paper>
                </Col>,
                <Col span={12} key="download">
                  <Paper padding="sm" shadow="xs">
                    <Box mx="auto" sx={{padding: '10px', paddingTop: '10px'}}>
                      <Text size="md">
                        Don't yet have the Bitshares BEET wallet installed? Follow the link below.
                      </Text>
                      <Text size="md">
                        Once installed, create a wallet and proceed to connect above.
                      </Text>
                      <Button
                        sx={{marginTop: '15px', marginRight: '5px'}}
                        onClick={() => {
                          beetDownload()
                        }}
                      >
                        Download BEET
                      </Button>
                    </Box>
                  </Paper>
                </Col>];
  } else {
    response = <Box mx="auto" sx={{padding: '10px'}}>
                  <span>
                    <Loader variant="dots" />
                    <Text size="md">
                      Connecting to BEET
                    </Text>
                  </span>
                </Box>;
    
  }
  
  return (response);
}
