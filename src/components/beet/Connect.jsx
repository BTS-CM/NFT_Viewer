import React, { useState } from 'react';
import {
  Button,
  Box,
  ScrollArea,
  Text,
  Table,
  Loader,
  Col,
  Paper,
} from '@mantine/core';
import { appStore, beetStore, identitiesStore } from '../../lib/states';

export default function Connect(properties) {
  let lite = properties.lite ?? null;
  let nftPage = properties.nftPage ?? null;
  let backCallback = properties.backCallback ?? null;
  
  const connect = beetStore((state) => state.connect);
  const setIdentity = beetStore((state) => state.setIdentity);
  const setIsLinked = beetStore((state) => state.setIsLinked);

  const setMode = appStore((state) => state.setMode);
  const setAccount = appStore((state) => state.setAccount);

  const environment = appStore((state) => state.environment);
  const setEnvironment = appStore((state) => state.setEnvironment);

  const identities = identitiesStore((state) => state.identities);
  const setIdentities = identitiesStore((state) => state.setIdentities);
  const removeIdentity = identitiesStore((state) => state.removeIdentity);
  const removeConnection = identitiesStore((state) => state.removeConnection);

  const [inProgress, setInProgress] = useState(false);

  function back() {
    if (nftPage) {
      backCallback();
    } else {
      setMode();
      setEnvironment();
    }
    setIsLinked();
  }

  /**
   * Removing a previously linked identity from the identity store
   * @param {Object} rowIdentity
   */
  function remove(rowIdentity) {
    try {
      removeIdentity(rowIdentity.requested.account.id);
    } catch (error) {
      console.log(error);
    }

    try {
      removeConnection(rowIdentity.identityhash);
    } catch (error) {
      console.log(error);
    }
  }

  function beetDownload() {
    window.electron.openURL('github');
  }

  /**
   * Reconnect to Beet with chosen identity
   * @param {Object} identity
   */
  async function reconnect(identity) {
    setInProgress(true);

    setTimeout(() => {
      setInProgress(false);
      return;
    }, 5000);

    try {
      await connect(identity);
    } catch (error) {
      console.error(error);
      setInProgress(false);
      return;
    }

    setAccount(identity.account.id);
    setIsLinked(true);
    setIdentity(identity);
    setIdentities(identity);
    setInProgress(false);
  }

  /**
   * Connect to link
   */
  async function connectToBeet() {
    setInProgress(true);

    setTimeout(() => {
      setInProgress(false);
      return;
    }, 3000);

    try {
      await connect();
    } catch (error) {
      console.log(error);
      return;
    }

    console.log('connected');
    setInProgress(false);
  }

  const relevantChain = environment === 'production' ? 'BTS' : 'BTS_TEST';
  const relevantIdentities = identities.filter((x) => x.chain === relevantChain);

  const rows = relevantIdentities
    .map((row) => (
      <tr key={`${row.requested.account.name}_row`}>
        <td>
          <Button
            variant="light"
            sx={{ marginTop: '5px', marginRight: '5px' }}
            onClick={() => {
              reconnect(row);
            }}
          >
            {row.requested.account.name}
            {' '}
            (
            {row.requested.account.id}
            )
          </Button>
          <Button
            sx={{ marginTop: '5px' }}
            variant="subtle"
            color="red"
            compact
            onClick={() => {
              remove(row);
            }}
          >
            Remove
          </Button>
        </td>
      </tr>
    ))
    .filter((x) => x);

  let response;
  if (inProgress === false && rows.length) {
    response = (
      <Col span={12} key="connect">
      {
        !lite
          ? <Paper padding="sm" shadow="xs">
              <Box mx="auto" sx={{padding: '10px', paddingTop: '10px'}}>
                <Text size="md">
                  Which previously linked BEET account do you want to use?
                </Text>
                
                <ScrollArea sx={{ height: rows.length > 1 && rows.length < 3 ? rows.length * 55 : 120 }}>
                  <Table sx={{ minWidth: 700 }}>
                    <tbody>
                      {rows}
                    </tbody>
                  </Table>
                </ScrollArea>
                </Box>
            </Paper>
          : null
        }
        <br />
        <Paper padding="sm" shadow="xs">
          <Box mx="auto" sx={{ padding: '10px', paddingTop: '10px' }}>
            <Text size="md">Want to use a different account?</Text>
            <Button
              variant="light"
              sx={{ marginTop: '15px', marginRight: '5px', marginBottom: '5px' }}
              onClick={() => {
                connectToBeet();
              }}
            >
              Connect with new account
            </Button>
            <br />
            <Button
              variant="subtle"
              compact
              onClick={() => {
                back();
              }}
            >
              Go back
            </Button>
          </Box>
        </Paper>
      </Col>
    );
  } else if (inProgress === false && !relevantIdentities.length) {
    response = [];
    response.push(
      <Col span={12} key="connect">
        <Paper padding="sm" shadow="xs">
          <Box mx="auto" sx={{ padding: '10px', paddingTop: '10px' }}>
            <Text size="md">This tool is designed for use with the Bitshares BEET Wallet.</Text>
            <Text size="md">
              Launch and unlock it, then click the connect button below to proceed.
            </Text>
            <Button
              sx={{ marginTop: '15px', marginRight: '5px' }}
              onClick={() => {
                connectToBeet();
              }}
            >
              Connect to Beet
            </Button>
            <Button
              svariant="light"
              onClick={() => {
                back();
              }}
            >
              Go back
            </Button>
          </Box>
        </Paper>
      </Col>
    );

    if (!identities || !identities.length && !lite) {
      response.push(
        <Col span={12} key="download">
          <Paper padding="sm" shadow="xs">
            <Box mx="auto" sx={{ padding: '10px', paddingTop: '10px' }}>
              <Text size="md">
                Don&apos;t yet have the Bitshares BEET wallet installed? Follow the link below.
              </Text>
              <Text size="md">Once installed, create a wallet and proceed to connect above.</Text>
              <Button
                sx={{ marginTop: '15px', marginRight: '5px' }}
                onClick={() => {
                  beetDownload();
                }}
              >
                Download BEET
              </Button>
            </Box>
          </Paper>
        </Col>
      );
    }
  } else {
    response = (
      <Box mx="auto" sx={{ padding: '10px' }}>
        <span>
          <Loader variant="dots" />
          <Text size="md">Connecting to BEET</Text>
        </span>
      </Box>
    );
  }

  return response;
}