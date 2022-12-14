
import { useEffect, useState } from 'react';
import { 
  TextInput,
  ActionIcon,
  useMantineTheme,
  Button,
  Box,
  Text,
  Loader,
  Col,
  Alert,
  Paper,
  SimpleGrid
} from '@mantine/core';
import { IconSearch, IconArrowRight, IconAlertCircle } from '@tabler/icons';
import { appStore, beetStore, identitiesStore } from '../../lib/states';
import { fetchObject } from '../../lib/queries';

import Connect from '../beet/Connect'
import BeetLink from '../beet/BeetLink'

export default function Accounts(properties) {
  const theme = useMantineTheme();

  let identities = identitiesStore((state) => state.identities);
  let setAccount = appStore((state) => state.setAccount);
  let nodes = appStore((state) => state.nodes);
  let environment = appStore((state) => state.environment);
  let goBack = appStore((state) => state.back);

  let connection = beetStore((state) => state.connection);
  let reset = beetStore((state) => state.reset);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);

  const [searchInput, setSearchInput] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [accounts, setAccounts] = useState();
  const [result, setResult] = useState();
  const [attempted, setAttempted] = useState();

  function back() {
    goBack();
  }
  
  /**
   * @param {Object} account 
   */
  function chosenAccount(account) {
    setAccount(account);
  }

  async function performSearch() {
    setAttempted(true);
    setInProgress(true);
    setResult();

    if (!searchInput.includes("1.2.")) {
      console.log("Invalid account ID");
      setInProgress(false);
      return;
    }

    let searchResult;
    try {
      searchResult = await fetchObject(nodes[0], searchInput)
    } catch (error) {
      console.log(error);
      setInProgress(false);
      return;
    }
    
    if (searchResult) {
      setResult(searchResult[0])
    }

    setInProgress(false);
  }

  let topText;
  if (!searchInput || !attempted) {
    topText = <span>
                <Text size="md">
                  Enter an account ID to proceed
                </Text>
              </span>
  } else if (inProgress) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="md">
                  Looking up account
                </Text>
              </span>;
  } else if (!inProgress && !result && attempted) {
    topText = <span>
                <Text size="md">
                  No such account could be found, check input and try again.
                </Text>
              </span>
  } else if (attempted && result) {
    topText = <span>
                <Text size="md">
                  Search results
                </Text>
              </span>
  }

  let buttonList;
  if (result) {
    buttonList = <Button
                  compact
                  sx={{margin: '2px'}}
                  variant="outline"
                  key={`button.${result.name}`}
                  onClick={() => {
                    chosenAccount(result.id)
                  }}
                >
                  {result.id} ({result.name})
                </Button>
  }

  const relevantChain = environment === 'production' ? 'BTS' : 'BTS_TEST';
  let relevantIdentities = identities.filter(x => x.chain === relevantChain);

  const tempIDs = relevantIdentities.map(id => {
    return <Button
              compact
              sx={{margin: '2px'}}
              variant="outline"
              key={`button.${id.requested.account.name}`}
              onClick={() => {
                chosenAccount(id.requested.account.id)
              }}
            >
              {id.requested.account.name} ({id.requested.account.id})
            </Button>
  });

  const reg = new RegExp('^[0-9]*$');

  if (!nodes) {
    return <span>
            <Loader variant="dots" />
            <Text size="md">
              Loading...
            </Text>
          </span>
  }

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }

          {
            searchInput
              && searchInput.length > 4
              && (!searchInput.includes("1.2.")
              || reg.test(searchInput.split("1.2.")[1]) === false)
                ? <Alert
                    icon={<IconAlertCircle size={16} />}
                    title="Invalid Account ID - It must begin with '1.2.' and end in a number."
                    color="orange"
                    style={{margin: '5px'}}
                  />
                : null
          }

          {
            !inProgress
              ? <TextInput
                  icon={<IconSearch size={18} stroke={1.5} />}
                  radius="xl"
                  size="md"
                  onChange={e => {
                    setSearchInput(e.target.value)
                    setAttempted();
                  }}
                  rightSection={
                    <ActionIcon
                      size={32}
                      radius="xl"
                      color={theme.primaryColor}
                      onClick={() => {
                        performSearch()
                      }}
                      variant="filled"
                    >
                        <IconArrowRight size={18} stroke={1.5} />
                    </ActionIcon>
                  }
                  placeholder="Account ID (e.g. 1.2.0)"
                  rightSectionWidth={42}
                />
              : null
          }

          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {
              buttonList
            }
          </SimpleGrid>
        </Box>
      </Paper>

        {
          !isLinked && !identity
            ? <span>
                <Paper padding="sm" shadow="xs">
                  <Box mx="auto" sx={{padding: '10px', marginTop: '10px'}}>
                    {
                      tempIDs && tempIDs.length
                      ? <Box mx="auto" sx={{padding: '10px', marginTop: '10px'}}>
                          <Text size="md">
                            Proceed with an existing account ID from linked Beet account?
                          </Text>
                          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
                            { tempIDs }
                          </SimpleGrid>
                          {
                            !connection
                              ? <Connect lite="true" />
                              : <BeetLink />
                          }
                        </Box>
                      : <span>
                          <Text size="md">
                            Fetch account ID from Beet wallet
                          </Text>
                          <Box mx="auto" sx={{padding: '10px', marginTop: '10px'}}>
                            {
                              !connection
                                ? <Connect lite="true" />
                                : <BeetLink />
                            }
                          </Box>
                        </span>
                    }
                  </Box>
                </Paper>
              </span>
            : <Paper padding="sm" shadow="xs">
                <Text size="md">
                  Proceed with your Beet linked account
                </Text>
                <Box mx="auto" sx={{padding: '10px', marginTop: '10px'}}>
                  <Button
                    compact
                    sx={{margin: '2px'}}
                    variant="outline"
                    key={`button.${identity.requested.account.name}`}
                    onClick={() => {
                      chosenAccount(identity.requested.account.id)
                      reset()
                    }}
                  >
                    {identity.requested.account.name} ({identity.requested.account.id})
                  </Button>
                </Box>
              </Paper>
        }
    </Col>
  );
}
