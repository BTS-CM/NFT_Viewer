import React from 'react';
import { Carousel } from '@mantine/carousel';
import { 
  Image,
  Box,
  CopyButton,
  Paper,
  Group,
  Badge,
  Button,
  Container,
  Card,
  Center
} from '@mantine/core';
import { useId } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

import {
  BsFileImage,
  BsFileEarmarkMusic,
  BsFileRichtext,
  BsFilm,
  BsBadge3D,
  BsQuestion,
} from "react-icons/bs";

import { appStore } from '../../lib/states';

let imageTypes = ["PNG", "JPEG", "GIF", "TIFF", "BMP"];
let audioTypes = ["MP3", "MP4", "M4A", "OGG", "FLAC", "WAV", "WMA", "AAC"];
let documentTypes = ["PDF", "DOCX", "ODT", "XLSX", "ODS", "PPTX", "TXT"]
let videoTypes = ["WEBM", "MOV", "QT", "AVI", "WMV", "MPEG"];
let modelTypes = ["OBJ", "FBX", "GLTF", "3DS", "STL", "COLLADA", "3MF", "BLEND", "SKP", "VOX"];

export default function Media(properties) {
  const { t, i18n } = useTranslation();
  let asset_images = appStore((state) => state.asset_images);
  let ipfsGateway = appStore((state) => state.ipfsGateway);
  
  const height = 250;
  const width = 250;
  let response;

  let updatedImages = asset_images.map((img) => {
    return img.ipfs
      ? {...img, url: ipfsGateway + img.url}
      : img
  });

  if (!updatedImages || !updatedImages.length) {
    response = <Image
                  width={width}
                  height={height}
                  src={null}
                  alt="NFT Image load failure"
                  withPlaceholder
                />;
  } else if (updatedImages.length > 1) {
    response = <Carousel
                 slideSize="33%"
                 sx={{ maxWidth: 680 }}
                 slideGap="xs"
                 controlsOffset="xs"
                 align="center"
                 loop
                >
                  {
                    updatedImages.map(image => {
                      const uuid = useId(image);

                      let icon;
                      if (imageTypes.includes(image.type)) {
                          icon = <BsFileImage />;
                      } else if (audioTypes.includes(image.type)) {
                          icon = <BsFileEarmarkMusic />;
                      } else if (documentTypes.includes(image.type)) {
                          icon = <BsFileRichtext />;
                      } else if (videoTypes.includes(image.type)) {
                          icon = <BsFilm />;
                      } else if (modelTypes.includes(image.type)) {
                          icon = <BsBadge3D />;
                      } else {
                          icon = <BsQuestion />;
                      }

                      return <Carousel.Slide key={uuid}>
                                <Center>
                                  <Card shadow="sm" radius="md" withBorder>
                                    <Card.Section>
                                      <Image
                                        width={width}
                                        height={height}
                                        fit="contain"
                                        src={
                                          imageTypes.includes(image.type)
                                            ? image.url
                                            : null
                                        }
                                        sx={{border: '1px solid grey'}}
                                      />
                                    </Card.Section>
                                    <Group position="apart" mt="xs">
                                      <CopyButton value={image.url}>
                                        {({ copied, copy }) => (
                                          <Button
                                            compact
                                            variant="outline"
                                            color={copied ? 'teal' : 'blue'}
                                            style={{marginTop: '5px'}}
                                            onClick={copy}
                                          >
                                            {
                                              copied
                                                ? t('nft:nft.json.copied')
                                                : t('nft:nft.json.copy')
                                            }
                                          </Button>
                                        )}
                                      </CopyButton>
                                      <Badge variant="light" leftSection={icon}>
                                        {image.type}
                                      </Badge>
                                    </Group>
                                  </Card>
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
                  src={updatedImages[0].url}
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
