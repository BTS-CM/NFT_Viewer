import { useEffect, useState } from 'react';
import {
  Tooltip,
  Badge
} from '@mantine/core';
import { appStore } from '../../lib/states';

export default function IssuerDetails(properties) {
  let asset_issuer = appStore((state) => state.asset_issuer);

  return (
    <Tooltip
      withArrow
      label={
        asset_issuer && asset_issuer === 'null-account'
          ? `Asset ownership has been 'burned' by being sent to 'null-account'; this NFT's settings are now final.`
          : `Warning: Asset ownership has not been transfered to 'null-account' yet; the settings and quantity issued could change after purchase.`
      }
    >
      <Badge color={asset_issuer && asset_issuer === 'null-account' ? 'primary' : 'secondary'}>
        Issuer: {asset_issuer}
      </Badge>
    </Tooltip>
  );
}
