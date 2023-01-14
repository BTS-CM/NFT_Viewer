import React, { useEffect, useState } from 'react';
import { Button, Box, Text, Col, Group, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { appStore } from '../../lib/states';

export default function Mode(properties) {



  const { t, i18n } = useTranslation();
  const setMode = appStore((state) => state.setMode); 
  const setNodes = appStore((state) => state.setNodes);

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
              {t('setup:mode.header')}
            </Text>

            <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px', marginLeft: '5px'}}
                onClick={() => {
                  setMode('search');
                }}
              >
                {t('setup:mode.searchBtn')}
              </Button>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px'}}
                onClick={() => {
                  setMode('lookup');
                }}
              >
                {t('setup:mode.lookupBtn')}
              </Button>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px'}}
                onClick={() => {
                  setMode('featured');
                }}
              >
                {t('setup:mode.featuredBtn')}
              </Button>
              <Button
                variant="outline"
                sx={{marginTop: '15px', marginRight: '5px'}}
                onClick={() => {
                  setMode('favourites');
                }}
              >
                {t('setup:mode.favouritesBtn')}
              </Button>
            </Group>

            <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
              <Button
                variant="light"
                onClick={() => {
                  backCallback()
                }}
              >
                {t('setup:mode.back')}
              </Button>
            </Group>
          </span>
        </Box>
      </Paper>
    </Col>
  );
}
