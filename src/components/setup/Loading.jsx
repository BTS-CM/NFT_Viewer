import React from 'react';
import { Loader, Box, Text, Col, Paper } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { appStore } from '../../lib/states';

export default function Offline(properties) {
  const { t, i18n } = useTranslation();
  const setMode = appStore((state) => state.setMode);

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          <span>
            <Text size="md">
              {t('setup:loading.message')}
            </Text>
            <Loader variant="dots" />
          </span>
        </Box>
      </Paper>
    </Col>
  );
}
