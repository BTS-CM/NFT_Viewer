import {
  Badge
} from '@mantine/core';
import { appStore, translationStore } from '../../lib/states';

export default function Quantity(properties) {
  const t= translationStore((state) => state.t);
  let asset_quantity = appStore((state) => state.asset_quantity);
  return (
    <Badge>
        {t('nft:quantity')}: {asset_quantity ? asset_quantity : '???'}
    </Badge>
  );
}
