import { useEffect, useState } from 'react';
import { Button, Box, Text, Loader, Col, Paper } from '@mantine/core';
import { link } from 'beet-js';
import { appStore, beetStore } from '../../lib/states';

export default function BeetLink(properties) {

  const connection = properties.connection;

  let setMode = appStore((state) => state.setMode);
  let setIsLinked = beetStore((state) => state.setIsLinked);
  let setIdentity = beetStore((state) => state.setIdentity);
  let setAuthenticated = beetStore((state) => state.setAuthenticated); 
  let setConnection = beetStore((state) => state.setConnection);

  const [inProgress, setInProgress] = useState(false);

  function back() {
    setConnection();
    setAuthenticated();
    setMode();
  }

  /*
   * After connection attempt to link app to Beet client
   */
  async function _linkToBeet(target = "BTS") {
    if (!connection) {
      console.log("Missing Beet connection");
      return;
    }
    
    setInProgress(true);
    let linkAttempt;
    try {
      linkAttempt = await link(target, connection);
    } catch (error) {
      console.error(error)
      setInProgress(false);
      return;
    }

    if (!connection.identity) {
      console.log("Link rejected");
      setInProgress(false);
      return;
    }

    console.log('Successfully linked');
    
    setIsLinked(true);
    setInProgress(false);
    setIdentity(connection.identity);
  }
  
  let linkContents = inProgress === false
  ? <span>
      <Text size="md">
        Connected to Beet wallet successfully.
      </Text>
      <Text size="md">
        Proceed with linking this app to your Beet wallet below.
      </Text>
      <Button
        sx={{marginTop: '15px', marginRight: '5px'}}
        onClick={() => {
          _linkToBeet('BTS')
        }}
      >
        Link to BEET
      </Button>
    </span>
  : <span>
      <Loader variant="dots" />
      <Text size="md">
        Waiting on response from BEET prompt
      </Text>
    </span>;

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {linkContents}
          <Button
            sx={{marginTop: '15px', marginRight: '5px'}}
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
