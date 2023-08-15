
import React, { useState } from 'react';
import { 
  TextInput,
  ActionIcon,
  useMantineTheme,
  Button,
  Box,
  Text,
  Loader,
  Col,
  SimpleGrid
} from '@mantine/core';
import { TbInputSearch, TbArrowNarrowRight } from 'react-icons/tb';
import { useTranslation } from 'react-i18next';

import { appStore, tempStore, beetStore, identitiesStore } from '../../lib/states';

export default function AccountSearch(properties) {
  const theme = useMantineTheme();
  const { t, i18n } = useTranslation();

  const setAccount = tempStore((state) => state.setAccount);
  const environment = appStore((state) => state.environment);
  const nodes = appStore((state) => state.nodes);

  const [searchInput, setSearchInput] = useState();
  const [inProgress, setInProgress] = useState(false);
  const [result, setResult] = useState();
  const [attempted, setAttempted] = useState();
  
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

    if (!nodes || !nodes[environment] || !nodes[environment].length) {
      console.log('No connected nodes');
      return;
    }

    let searchResult;
    try {
      searchResult = await window.electron.accountSearch(nodes[environment][0], searchInput)
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
                  {t('blockchain:accountSearch.inputPrompt')}
                </Text>
              </span>
  } else if (inProgress) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="md">
                  {t('blockchain:accounts.fetchingAccount')}
                </Text>
              </span>;
  } else if (!inProgress && !result && attempted) {
    topText = <span>
                <Text size="md">
                  {t('blockchain:accounts.noAccount')}
                </Text>
              </span>
  } else if (attempted && result) {
    topText = <span>
                <Text size="md">
                  {t('blockchain:accounts.searchResults')}
                </Text>
              </span>
  }

  if (!nodes) {
    return <span>
            <Loader variant="dots" />
            <Text size="md">
              {t('blockchain:accounts.loading')}
            </Text>
          </span>
  }

  return (
    <Col span={12}>
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }

          {
            !inProgress
              ? <TextInput
                  icon={<TbInputSearch />}
                  radius="xl"
                  size="md"
                  onKeyUp={e => {
                    if (e.key === 'Enter') {
                      performSearch();
                    }
                  }}
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
                        <TbArrowNarrowRight />
                    </ActionIcon>
                  }
                  placeholder={t('blockchain:accounts.accountID')}
                  rightSectionWidth={42}
                />
              : null
          }

          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {
              result
                ? <Button
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
                : null
            }
          </SimpleGrid>
        </Box>
    </Col>
  );
}
