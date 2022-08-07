import { Carousel } from '@mantine/carousel';
import { Image, Container, Card, Center } from '@mantine/core';
import { useId } from '@mantine/hooks';

import { appStore } from '../../lib/states';

export default function Media(properties) {
  let asset_images = appStore((state) => state.asset_images);
  let ipfsGateway = appStore((state) => state.ipfsGateway);
  
  const height = 250;
  const width = 250;
  let response;
  if (!asset_images) {
    response = <Image
                  width={width}
                  height={height}
                  src={null}
                  alt="NFT Image load failure"
                  withPlaceholder
                />;
  } else if (asset_images.length > 1) {
    response = <Carousel
                 slideSize="33%"
                 height={height + 5}
                 slideGap="xs"
                 controlsOffset="xs"
                 align="center"
                 loop
                >
                  {
                    asset_images.map(image => {
                      const uuid = useId(image);
                      return <Carousel.Slide key={uuid}>
                                <Center>
                                  <Image
                                    width={width}
                                    height={height}
                                    fit="contain"
                                    src={ipfsGateway + image}
                                    sx={{border: '1px solid grey'}}
                                  />
                                </Center>
                              </Carousel.Slide>;
                    })
                  }
                </Carousel>
  } else {
    response = <Image
                  width={width}
                  height={height}
                  fit="contain"
                  src={asset_images[0]}
                />
  }

  return (
    <Container size="md" px="xs">
      <Card shadow="sm" p="sm" radius="md" withBorder m="sm">
        <Center>
        {
          response
        }
        </Center>

      </Card>
    </Container>
  )
}
