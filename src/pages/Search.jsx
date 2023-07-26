
import React, { useEffect, useMemo, useState } from 'react';
import {Link} from 'react-router-dom';
import { 
  TextInput,
  ActionIcon,
  useMantineTheme,
  Button,
  Box,
  Group,
  Title,
  Center,
  Paper,
  Divider,
  SimpleGrid
} from '@mantine/core';
import { TbInputSearch, TbArrowNarrowRight } from 'react-icons/tb';

import { HiOutlineHome, HiArrowNarrowLeft, HiOutlineRefresh } from "react-icons/hi";

import { useTranslation } from 'react-i18next';
import { appStore, tempStore } from '../lib/states';

import Loading from '../components/setup/Loading';
import Environment from '../components/setup/Environment';

export default function Search(properties) {
  const { t, i18n } = useTranslation();
  const theme = useMantineTheme();

  const environment = appStore((state) => state.environment);
  const setEnvironment = appStore((state) => state.setEnvironment);
  const nodes = appStore((state) => state.nodes);

  let assets = tempStore((state) => state.assets);

  let fetchAssets = tempStore((state) => state.fetchAssets);
  let clearAssets = tempStore((state) => state.clearAssets);
  let setAsset = tempStore((state) => state.setAsset);

  const [searchInput, setSearchInput] = useState();
  const [inProgress, setInProgress] = useState(false);
  
  /**
   * @param {Object} asset 
   */
  function chosenAsset(asset) {
    setAsset(asset);
  }

  async function performSearch() {
    setInProgress(true);
    clearAssets();

    if (!searchInput || !searchInput.length) {
      console.log('No search input')
      return;
    }

    try {
      await fetchAssets([searchInput.toUpperCase()])
    } catch (error) {
      console.log(error);
      setInProgress(false);
      performSearch();
      return;
    }
    
    setInProgress(false);
  }

  let topText;
  if (!assets) {
    topText = <span>
                <Title order={4} mb="md">
                  {t('blockchain:search.searchPrompt')}
                </Title>
              </span>
  } else if (assets && !assets.length) {
    topText = <span>
                <Title order={4} mb="md">
                  {t('blockchain:search.noResults')}
                </Title>
              </span>
  } else {
    topText = <span>
                <Title order={4} mb="md">
                  {t('blockchain:search.resultHeader')}
                </Title>
              </span>
  }

  useEffect(() => {
    clearAssets();
  }, []);

  const buttonList = useMemo(() => {
    return assets && assets.length && environment
      ? assets.map(asset => {
          return <Link
                  style={{ textDecoration: 'none' }}
                  to={`/NFT/${environment}/${asset.symbol}`}
                  key={`link.${asset.id}`}
                >
                  <Button
                    compact
                    sx={{margin: '2px'}}
                    variant="outline"
                    key={`button.${asset.id}`}
                    onClick={() => {
                      chosenAsset(asset)
                    }}
                  >
                    {asset.symbol}: {asset.id}
                  </Button>
                </Link>
        })
      : []
  }, [assets]);

  const homeButton = <Link style={{ textDecoration: 'none' }} to="/">
                      <Button
                        mt="sm"
                        compact
                        variant="outline"
                        leftIcon={<HiOutlineHome />}
                      >
                        {t("app:menu.home")}
                      </Button>
                    </Link>;

  if (!environment) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:search.environment')}
        </Title>
        <Environment />
        {homeButton}
      </>
    );
  }

  const backButton = <Button
                      mt="sm"
                      compact
                      variant="outline"
                      onClick={() => {
                        setEnvironment();
                      }}
                      leftIcon={<HiArrowNarrowLeft />}
                    >
                      {t('setup:accountMode.back')}
                    </Button>;

  if (!nodes || !nodes[environment] || !nodes[environment].length) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:search.offline')}
        </Title>
        <Offline />
        <Center>
          <Group>
            {homeButton}
            {backButton}
          </Group>
        </Center>
      </>
    );
  }

  if (inProgress) {
    return (
      <Loading />
    );
  };

  return (
    <Paper padding="sm" shadow="xs">
      <Box mx="auto" sx={{padding: '10px'}}>
        {
          topText
        }

        <Title order={6}>
          {t('headers:search.input')}
        </Title>

        <Center>
          <TextInput
            icon={<TbInputSearch size={18} stroke={1.5} />}
            radius="xl"
            size="md"
            mt="sm"
            style={{width: '350px'}}
            onChange={e => setSearchInput(e.target.value)}
            onKeyUp={e => {
              if (e.key === 'Enter') {
                performSearch();
              }
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
            placeholder="1.3.x or symbol"
            rightSectionWidth={42}
          />
        </Center>

        {
          buttonList && buttonList.length
            ? <SimpleGrid cols={1} sx={{marginTop: '10px'}}>
                {
                  buttonList
                }
              </SimpleGrid>
            : null
        }
        
        <Divider  mt="lg" variant="dashed" />

        <Center>
          <Group>
            {homeButton}
            {backButton}
          </Group>
        </Center>
      </Box>
    </Paper>
  )
}
