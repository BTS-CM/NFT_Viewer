import React, { useEffect, useState } from 'react';
import {
  Button, Group, Box, Text, Divider, Loader, Col, Paper,
} from '@mantine/core';
import { appStore, beetStore } from '../../lib/states';
import { useTranslation } from 'react-i18next';

export default function BeetLink(properties) {
  const { t, i18n } = useTranslation();

  const environment = appStore((state) => state.environment);

  const link = beetStore((state) => state.link);
  const setConnection = beetStore((state) => state.setConnection);
  const setAuthenticated = beetStore((state) => state.setAuthenticated);

  const [inProgress, setInProgress] = useState(false);

  /*
   * After connection attempt to link app to Beet client
   */
  async function _linkToBeet() {
    setInProgress(true);

    try {
      await link(environment);
    } catch (error) {
      console.error(error);
    }

    setInProgress(false);
  }

  const linkContents = inProgress === false ? (
    <span>
      <Text size="md">
        {t('beet:beetlink.connected')}
      </Text>
      <Text size="md">
        {t('beet:beetlink.linkPrompt')}
      </Text>
      <Button
        sx={{ marginTop: '15px', marginRight: '5px' }}
        onClick={() => {
          _linkToBeet();
        }}
      >
        {t('beet:beetlink.linkButton')}
      </Button>
    </span>
  ) : (
    <span>
      <Loader variant="dots" />
      <Text size="md">
        {t('beet:beetlink.beetWait')}
      </Text>
    </span>
  );

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{ padding: '10px' }}>
          {linkContents}
          <Link style={{ textDecoration: 'none' }} to="/">
            <Button
              sx={{ marginTop: '15px', marginRight: '5px' }}
              onClick={() => {
                setConnection();
                setAuthenticated();
              }}
            >
              {t('beet:beetlink.backButton')}
            </Button>
          </Link>
        </Box>
      </Paper>
    </Col>
  );
}
