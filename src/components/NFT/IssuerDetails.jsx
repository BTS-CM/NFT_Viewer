import React from 'react';
import {
  Tooltip,
  Badge
} from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { tempStore } from '../../lib/states';

export default function IssuerDetails(properties) {
  const { t, i18n } = useTranslation();
  let asset_issuer = tempStore((state) => state.asset_issuer);

  return (
    <Tooltip
      withArrow
      label={
        asset_issuer && asset_issuer === 'null-account'
          ? t('nft:issuerDetails.tooltip1')
          : t('nft:issuerDetails.tooltip2')
      }
    >
      <Badge color={asset_issuer && asset_issuer === 'null-account' ? 'primary' : 'secondary'}>
        {t('nft:issuerDetails.issuer')}: {asset_issuer}
      </Badge>
    </Tooltip>
  );
}
