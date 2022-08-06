import {
  Tooltip,
  Badge
} from '@mantine/core';
import { appStore } from '../../lib/states';

export default async function IssuerDetails(properties) {
  let environment = appStore((state) => state.environment);
  const issuer = properties.issuer;

  if (!issuer.includes("1.2.")) {
    return;
  }

  return await window.electron.fetchObject(environment, issuer).then(res => {
    let issuerName = res && res.name ? res.name : undefined;

    return (
      <Tooltip
        withArrow
        label={
          issuerName && issuerName === 'null-account'
            ? `Asset ownership has been 'burned' by being sent to 'null-account'; this NFT's settings are now final.`
            : `Warning: Asset ownership has not been transfered to 'null-account' yet; the settings and quantity issued could change after purchase.`
        }
      >
        <Badge color={issuerName && issuerName === 'null-account' ? 'primary' : 'secondary'}>
          {`Issuer: ${issuerName}`}
        </Badge>
      </Tooltip>
    );
  })
  .catch(error => {
    console.log(error);
    return;
  })
}
