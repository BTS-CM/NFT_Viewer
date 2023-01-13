import { useEffect, useState } from 'react';
import { Button, Box, Text, Col, Paper, Group, Divider } from '@mantine/core';
import { appStore, beetStore, translationStore } from '../../lib/states';

import Connect from "../beet/Connect";
import BeetLink from "../beet/BeetLink";
import AccountSearch from "../blockchain/AccountSearch";

export default function AccountMode(properties) {
  const t= translationStore((state) => state.t);
  const setMode = appStore((state) => state.setMode); 
  const setAccount = appStore((state) => state.setAccount); 
  const setNodes = appStore((state) => state.setNodes);
  const nodes = appStore((state) => state.nodes);
  let account = appStore((state) => state.account);

  let backCallback = properties.backCallback;

  const [chosen, setChosen] = useState();
  const [inProgress, setInProgress] = useState(false);

  // for beet use
  let connection = beetStore((state) => state.connection);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let reset = beetStore((state) => state.reset);

  useEffect(() => {
    setNodes();
  }, []);

  useEffect(() => {
    if (!account && identity && identity.account && identity.account.id) {
      setAccount(identity.account.id)
    }
  }, [account, identity]);

  const prompt = <span>
                    <Text size="md">
                      {t('setup:accountMode.header', {account: account ?? '???'})}
                    </Text>
                    <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                      <Button
                        variant="outline"
                        sx={{marginTop: '15px', marginRight: '5px'}}
                        onClick={() => {
                          setMode('balance');
                        }}
                      >
                        {t('setup:accountMode.balance')}
                      </Button>
                      <Button
                        variant="outline"
                        sx={{marginTop: '15px', marginRight: '5px'}}
                        onClick={() => {
                          setMode('issued');
                        }}
                      >
                        {t('setup:accountMode.issued')}
                      </Button>
                    </Group>
                    <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                      <Button
                        variant="light"
                        onClick={() => {
                          backCallback()
                        }}
                      >
                        {t('setup:accountMode.back')}
                      </Button>
                    </Group>
                  </span>;

  let response;
  if (!chosen) {
    response = <span>
                  <Text size="md">
                    {t('setup:accountMode.header2')}
                    
                  </Text>
                  <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                    <Button
                      sx={{m: 0.25}}
                      variant="outline"
                      onClick={() => {
                        setChosen('BEET');
                      }}
                    >
                      {t('setup:accountMode.chooseBEET')}
                    </Button>
                    <Button
                      sx={{m: 0.25}}
                      variant="outline"
                      onClick={() => {
                        setChosen('Search');
                        setAccount();
                        reset();
                      }}
                    >
                      {t('setup:accountMode.chooseSearch')}
                    </Button>
                  </Group>
                  <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                    <Button
                      variant="light"
                      onClick={() => {
                        backCallback()
                      }}
                    >
                      {t('setup:accountMode.back')}
                    </Button>
                  </Group>
                </span>;
  } else if (chosen === "BEET") {
    if (!connection) {
      response = <span>
                  <Text size="md">
                    {t('setup:accountMode.beetPrompt')}
                  </Text>
                  <Connect nftPage={false} backCallback={() => setChosen()} />
                </span>
    } else if (!isLinked) {
      response = <span>
                  <Text size="md">
                    {t('setup:accountMode.linkPrompt')}
                  </Text>
                  <BeetLink />
                </span>;
    } else if (inProgress) {
      response = <span>
                    <Loader variant="dots" />
                    <Text size="md">
                      {t('setup:accountMode.waiting')}
                    </Text>
                </span>;
    } else {
      response = prompt;
    }
  } else if (chosen === "Search") {
    if (!account) {
      response = <span>
                  <AccountSearch />
                  <Button
                    onClick={() => {
                      setChosen()
                    }}
                  >
                    {t('setup:accountMode.back')}
                  </Button>
                </span>
    } else {
      response = prompt;
    }
  }
  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {response}
        </Box>
      </Paper>
    </Col>
  );
}
