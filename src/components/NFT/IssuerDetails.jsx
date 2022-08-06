import { useEffect, useState } from 'react';
import {
  Tooltip,
  Badge
} from '@mantine/core';
import { appStore } from '../../lib/states';
import { fetchObject } from '../../lib/queries';

export default async function IssuerDetails(properties) {
  let nodes = appStore((state) => state.nodes);
  const issuer = properties.issuer;

  if (!issuer.includes("1.2.")) {
    return;
  }

  const [issuerName, setIssuerName] = useState();

  useEffect(() => {
    async function fetchIssuerName() {
      setTimeout(() => {
        return;
      }, 10000);

      console.log(nodes[0])

      let obj;
      try {
        obj = await fetchObject(nodes[0], issuer);
      } catch (error) {
        console.log(error);
        return;
      }

      console.log(obj)

      if (obj && obj.name) {
        setIssuerName(obj.name);
      }
    }
    fetchIssuerName()
  }, []);



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
}
