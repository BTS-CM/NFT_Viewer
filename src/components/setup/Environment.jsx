
import React, { useEffect, useState } from 'react';
import { Button, Box, Text, Col, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { appStore, beetStore, tempStore } from '../../lib/states';

export default function Mode(properties) {
  const { t, i18n } = useTranslation();
  const setEnvironment = appStore((state) => state.setEnvironment); 

  const resetTemp = tempStore((state) => state.reset);
  const resetBeet = beetStore((state => state.reset));

  useEffect(() => {
    resetTemp();
    resetBeet();
  }, []);

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          <span>
            <Text size="md">
              {t('setup:environment.header')}
            </Text>
            <Button
              sx={{marginTop: '15px', marginRight: '5px'}}
              onClick={() => {
                setEnvironment('bitshares');
              }}
            >
              {t('setup:environment.production')} (BTS)
            </Button>
            <Button
              sx={{marginTop: '15px', marginRight: '5px', marginLeft: '5px'}}
              onClick={() => {
                setEnvironment('bitshares_testnet');
              }}
            >
              {t('setup:environment.testnet')} (BTS_TEST)
            </Button>
          </span>
        </Box>
      </Paper>
    </Col>
  );
}
