import React from 'react';
import { Carousel } from '@mantine/carousel';
import { Image, Box, Paper, Container, Card, Center } from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';
import { appStore } from '../../lib/states';

export default function Media(properties) {
  const { t, i18n } = useTranslation();
  let asset_images = appStore((state) => state.asset_images);
  let ipfsGateway = appStore((state) => state.ipfsGateway);
  
  const height = 250;
  const width = 250;
  let response;
  if (!asset_images || !asset_images.length) {
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
                 sx={{ maxWidth: 680 }}
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
    <Box mx="auto" sx={{padding: '10px'}}>
      <Paper sx={{padding: '5px'}} shadow="xs">
        <Center>
          {
            response
          }
        </Center>
      </Paper>
    </Box>
  )
}
