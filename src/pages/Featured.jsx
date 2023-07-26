import React, { useEffect, useState, useMemo } from 'react';
import { Link, useParams } from "react-router-dom";
import { Button, Text, Col, Paper, Group, Title, Tooltip, Loader, SimpleGrid } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import {
  HiOutlineHome,
  HiArrowNarrowLeft,
  HiOutlineRefresh
} from "react-icons/hi";

import { appStore, tempStore } from '../lib/states';
import config from "../config/config.json";

import Environment from '../components/setup/Environment';
import Loading from '../components/setup/Loading';
import { env } from 'process';

export default function Featured(properties) {
  const { t, i18n } = useTranslation();
  const params = useParams();
  const {env} = params;

  let environment = appStore((state) => state.environment);
  let setEnvironment = appStore((state) => state.setEnvironment);
  const nodes = appStore((state) => state.nodes);

  let assets = tempStore((state) => state.assets);
  let fetchAssets = tempStore((state) => state.fetchAssets);
  let setAsset = tempStore((state) => state.setAsset);
  let eraseAsset = tempStore((state) => state.eraseAsset);
  let resetTemp = tempStore((state) => state.reset);

  const featuredNFTs = useMemo(() => {
    if (!environment) {
      return [];
    }
    return config[environment].featured;
  }, [environment]);

  useEffect(() => {
    resetTemp();
    if (env) { 
      setEnvironment(env);
    } else {
      setEnvironment();
    }
  }, []);
  
  useEffect(() => {
    if (!featuredNFTs || !featuredNFTs.length) {
      return;
    }
    const featuredIDs = featuredNFTs.map(item => item.id);
    fetchAssets(featuredIDs);
  }, [featuredNFTs]);

  const featuredNFTLinks = useMemo(() => {
    if (!assets || !assets.length || !environment) {
      return [];
    }
    return assets.map(item => {
      return <Link
              style={{ textDecoration: 'none' }}
              to={`/NFT/${environment}/${item.name ?? item.symbol}`}
              key={`button.${item.id}`}
            >
              <Button
                compact
                mt="sm"
                sx={{margin: '2px'}}
                variant="outline"
                onClick={() => {
                  setAsset(item);
                }}
              >
                {item.name ?? item.symbol}: {item.id}
              </Button>
            </Link>
    })
  }, [assets]);

  const homeButton  = <Link style={{ textDecoration: 'none' }} to="/">
                        <Button
                          compact
                          sx={{ margin: '2px' }}
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
          {t('headers:featured.environment')}
        </Title>
        <Environment />
        {homeButton}
      </>
    );
  }

  if (!nodes || !nodes[environment] || !nodes[environment].length) {
    return (
      <>
        <Title order={4} mb="md">
          {t('headers:portfolio.offline')}
        </Title>
        <Offline />
        <Center>
          <Group>
            {homeButton}
            <Button
              mt="sm"
              compact
              variant="outline"
              onClick={() => {
                setEnvironment();
              }}
              leftIcon={<HiArrowNarrowLeft />}
            >
              {t('setup:accountMode.back')}
            </Button>
          </Group>
        </Center>
      </>
    );
  }

  return (
    <>
      <Paper sx={{padding: '5px'}} shadow="xs">
          <Title order={4} mb="md">
            {t('blockchain:featured.heading')}
          </Title>
          {
            featuredNFTLinks && featuredNFTLinks.length
              ? <Text size="md">
                  {t("headers:featured.asset")}
                </Text>
              : null
          }
          {
            !featuredNFTLinks || !featuredNFTLinks.length
              ? <Loading />
              : <>
                  <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
                    {
                      featuredNFTLinks
                    }
                  </SimpleGrid>
                  <Button
                    compact
                    mt="sm"
                    sx={{ margin: '2px' }}
                    variant="outline"
                    onClick={() => {
                      resetTemp();
                      setEnvironment();
                    }}
                  >
                    {t("setup:mode.back")}
                  </Button>
              </>
          }
      </Paper>
      {homeButton}
    </>
  );

}
