import { useEffect, useState } from 'react';
import { Button, Box, Text, Col, Group, Paper } from '@mantine/core';
import { appStore } from '../../lib/states';

export default function Mode(properties) {
  const setMode = appStore((state) => state.setMode); 
  const setNodes = appStore((state) => state.setNodes);
  const nodes = appStore((state) => state.nodes);

  let backCallback = properties.backCallback;

  useEffect(() => {
    setNodes();
  }, []);

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          <span>
            <Text size="md">
              What do you want to do?
            </Text>

            <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px', marginLeft: '5px'}}
                onClick={() => {
                  setMode('search');
                }}
              >
                Search for NFT
              </Button>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px'}}
                onClick={() => {
                  setMode('lookup');
                }}
              >
                Lookup an account's NFTs
              </Button>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px'}}
                onClick={() => {
                  setMode('featured');
                }}
              >
                View featured
              </Button>
            </Group>

            <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
              <Button
                variant="light"
                onClick={() => {
                  backCallback()
                }}
              >
                Back
              </Button>
            </Group>
          </span>
        </Box>
      </Paper>
    </Col>
  );
}
