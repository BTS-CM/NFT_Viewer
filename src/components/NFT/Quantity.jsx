import React from 'react';
import {
  Badge
} from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { appStore } from '../../lib/states';

export default function Quantity(properties) {
  const { t, i18n } = useTranslation();
  let asset_quantity = appStore((state) => state.asset_quantity);
  return (
    <Badge>
        {t('nft:quantity')}: {asset_quantity ? asset_quantity : '???'}
    </Badge>
  );
}
