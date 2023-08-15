import React, {useEffect, useMemo, useState} from 'react';
import { Carousel } from '@mantine/carousel';
import { 
  Image,
  Box,
  CopyButton,
  Paper,
  Group,
  Modal,
  Badge,
  Button,
  Card,
  Center
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { useTranslation } from 'react-i18next';

import {
  BsFileImage,
  BsFileEarmarkMusic,
  BsFileRichtext,
  BsFilm,
  BsBadge3D,
  BsQuestion,
} from "react-icons/bs";

import {
  HiOutlineClipboardCheck,
  HiOutlineClipboardCopy,
  HiSearch
} from "react-icons/hi";

import { tempStore, localePreferenceStore } from '../../lib/states';

let imageTypes = ["PNG", "JPEG", "GIF", "TIFF", "BMP", "WEBP"];
let audioTypes = ["MP3", "MP4", "M4A", "OGG", "FLAC", "WAV", "WMA", "AAC"];
let documentTypes = ["PDF", "DOCX", "ODT", "XLSX", "ODS", "PPTX", "TXT"]
let videoTypes = ["WEBM", "MOV", "QT", "AVI", "WMV", "MPEG"];
let modelTypes = ["OBJ", "FBX", "GLTF", "3DS", "STL", "COLLADA", "3MF", "BLEND", "SKP", "VOX"];

export default function Media(properties) {
  const { t, i18n } = useTranslation();
  let asset = tempStore((state) => state.asset);
  let asset_images = tempStore((state) => state.asset_images);
  const ipfsGateway = localePreferenceStore((state) => state.ipfsGateway);
  const [opened, { open, close }] = useDisclosure(false);

  const [zoomIndex, setZoomIndex] = useState(0);

  const height = 250;
  const width = 250;

  const updatedImages = useMemo(() => {
    return asset_images && asset_images.length
      ? asset_images.map((img) => {
          return img.ipfs && img.ipfs === true
            ? {...img, url: ipfsGateway + img.url}
            : img
        })
      : []
  }, [asset_images, ipfsGateway]);

  const [response, setResponse] = useState(null);
  useEffect(() => {
    async function testing() {
      if (!updatedImages || !updatedImages.length) {
        setResponse(
          <Image
            width={width}
            height={height}
            src={null}
            alt="NFT Image load failure"
            withPlaceholder
          />
        );
      } else if (updatedImages.length > 1) {
        const uuid = await window.electron.getUUID();
        setResponse(
          <Carousel
            slideSize="25%"
            sx={{ maxWidth: 925 }}
            slideGap="xs"
            controlsOffset="xs"
            align="center"
            loop
          >
            {
              updatedImages.map((image, i) => { 
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
    
                return <Carousel.Slide key={`cs_${uuid}`}>
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
                                    <>
                                      <Button
                                        compact
                                        variant="outline"
                                        color={copied ? 'teal' : 'blue'}
                                        onClick={copy}
                                      >
                                        {
                                          copied
                                            ? <HiOutlineClipboardCheck />
                                            : <HiOutlineClipboardCopy />
                                        }
                                      </Button>
                                    </>
                                  )}
                                </CopyButton>
                                <Button
                                  variant='outline'
                                  compact
                                  onClick={() => {
                                    setZoomIndex(i);
                                    open();
                                  }}
                                >
                                  <HiSearch />
                                </Button>
                                <Badge
                                  variant="light"
                                  leftSection={icon}
                                  size="lg"
                                >
                                  {image.type}
                                </Badge>
                              </Group>
                            </Card>
                          </Center>
                        </Carousel.Slide>;
              })
            }
          </Carousel>
        );
      } else {
        setResponse(
          <>
            <Center>
              <Image
                width={width}
                height={height}
                fit="contain"
                src={updatedImages[0].url}
              />
            </Center>
            <Center>
              <Group position="apart" mt="xs">
                <CopyButton value={updatedImages[0].url}>
                  {({ copied, copy }) => (
                    <>
                      <Button
                        compact
                        variant="outline"
                        color={copied ? 'teal' : 'blue'}
                        style={{marginTop: '5px'}}
                        onClick={copy}
                      >
                        {copied ? t('nft:nft.json.copied') : t('nft:nft.json.copy')}
                      </Button>
                      <Button
                        variant="outline"
                        compact
                        style={{marginTop: '5px'}}
                        onClick={() => {
                          setZoomIndex(0);
                          open();
                        }}
                      >
                        {t('nft:nft.image.zoom')}
                      </Button>
                    </>
                  )}
                </CopyButton>
              </Group>
            </Center>
          </>
        );
      }
    }

    testing();
  }, [updatedImages]);

  return (
    <>
      <Box mx="auto" sx={{padding: '10px'}}>
        <Paper sx={{padding: '5px'}} shadow="xs">
          {
            response ?? null
          }
        </Paper>
      </Box>
      <Modal
        opened={opened}
        onClose={() => {
          close();
        }}
        title={`${asset.symbol} ${zoomIndex + 1}/${updatedImages.length}`}
        size={"xl"}
      >
        <Image
          width="100%"
          height="100%"
          fit="contain"
          src={
            imageTypes.includes(updatedImages[zoomIndex].type)
              ? updatedImages[zoomIndex].url
              : null
          }
          sx={{border: '1px solid grey'}}
        />
      </Modal>
    </>
  )
}
