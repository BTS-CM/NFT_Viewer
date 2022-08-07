import {
  Badge
} from '@mantine/core';
import { appStore } from '../../lib/states';

export default function Quantity(properties) {
  let asset_quantity = appStore((state) => state.asset_quantity);
  return (
    <Badge>
        Quantity: {asset_quantity ? asset_quantity : '???'}
    </Badge>
  );
}
