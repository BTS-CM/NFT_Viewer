import { useState } from 'react';
import { TextInput, Checkbox, Button, Box, Text, Divider, Col, Paper, Group, Tooltip, Loader } from '@mantine/core';
import { useForm } from '@mantine/form';
import { appStore } from '../../lib/states';

export default function Buy(properties) {
  const connection = properties.connection;
  const asset = properties.asset;
  const userID = properties.userID;
  
  const [inProgress, setInProgress] = useState(false);
  const [bought, setBought] = useState(false);

  let setMode = appStore((state) => state.setMode);

  function back() {
    setMode();
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
