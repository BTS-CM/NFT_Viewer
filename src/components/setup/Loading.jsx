import React from 'react';
import { Loader, Text } from '@mantine/core';
import { useTranslation } from 'react-i18next';

export default function Loading(properties) {
  const { t, i18n } = useTranslation();

  return (
    <span>
      <Text size="md">
        {t('setup:loading.message')}
      </Text>
      <Loader variant="dots" />
    </span>
  );
}
