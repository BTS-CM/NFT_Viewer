import { Button, Box, Text, Col, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { appStore, beetStore } from '../../lib/states';
import React, { useEffect } from 'react';

export default function Mode(properties) {
  const { t, i18n } = useTranslation();
  const setEnvironment = appStore((state) => state.setEnvironment); 

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          <span>
            <Text size="md">
              {t('setup:environment.header')}
            </Text>
            <Button
              sx={{marginTop: '15px', marginRight: '5px', marginLeft: '5px'}}
              onClick={() => {
                setEnvironment('testnet');
              }}
            >
              {t('setup:environment.testnet')} (BTS_TEST)
            </Button>
            <Button
              sx={{marginTop: '15px', marginRight: '5px'}}
              onClick={() => {
                setEnvironment('production');
              }}
            >
              {t('setup:environment.production')} (BTS)
            </Button>
          </span>
        </Box>
      </Paper>
    </Col>
  );
}
