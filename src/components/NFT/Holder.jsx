import { Badge } from '@mantine/core';
import { appStore } from '../../lib/states';

export default async function Holder(properties) {
  let environment = appStore((state) => state.environment);
  const id = properties.id;
  if (!id.includes("1.3.")) {
    return null;
  }

  return await window.electron.fetchHolder(environment, id).then(res => {
    if (!res) {
      return null;
    }

    console.log(res);

    return <Badge>
            {`Asset owner: ${!res || !res.length ? 'N/A' : res[0].name}`}
          </Badge>;
  })
  .catch(error => {
    console.log(error);
    return;
  })


}
