import React from 'react';
import {
  TextInput,
  Checkbox,
  CopyButton,
  Button,
  Container,
  Box,
  Badge,
  Text,
  Tabs,
  Card,
  Divider,
  Title,
  Col,
  Paper,
  Group,
  Tooltip,
  Loader,
  Textarea,
  Code
} from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { TbHeart, TbHeartBroken } from 'react-icons/tb';

import { appStore, beetStore, favouritesStore } from '../../lib/states';
import IssuerDetails from './IssuerDetails';
import Quantity from './Quantity';
import Media from './Media';
import Buy from "../beet/Buy";

export default function NFT(properties) {
  const { t, i18n } = useTranslation();
  let asset = appStore((state) => state.asset);

  let setAccount = appStore((state) => state.setAccount);
  let resetBeet = beetStore((state) => state.reset);

  let back = appStore((state) => state.back);
  let environment = appStore((state) => state.environment);
  let setMode = appStore((state) => state.setMode);

  const favourites = favouritesStore((state) => state.favourites);
  const removeFavourite = favouritesStore((state) => state.removeFavourite);
  const addFavourite = favouritesStore((state) => state.addFavourite);

  function goBack() {
    setAccount();
    resetBeet();
    back();
  }

  function beetBuy() {
    setMode('buy');
  }

  function favouriteAsset() {
    const relevantChain = environment === 'production' ? 'BTS' : 'BTS_TEST';
    addFavourite({name: asset.symbol, id: asset.id, chain: relevantChain});
  }

  function launchDEX(args) {
    window.electron.openDEX(args)
  }

  let issuer = asset ? asset.issuer : undefined;
  let precision = asset ? asset.precision : undefined;
  let symbol = asset ? asset.symbol : undefined;
  let permissions = asset ? asset.permissions : undefined;
  let asset_flags = asset ? asset.flags : undefined;
  
  let description = asset
                    && asset.options.description
                    && asset.options.description.length ? JSON.parse(asset.options.description) : undefined;
  let main = description ? description.main : undefined;
  let market = description ? description.market : undefined;
  let short_name = description ? description.short_name : undefined;
  let nft_signature = description ? description.nft_signature : undefined;
  let nft_object = description ? description.nft_object : undefined;

  let type = nft_object && nft_object.type ? nft_object.type : undefined;
  let sig_pubkey_or_address = undefined;
  if (nft_object && nft_object.sig_pubkey_or_address) {
    sig_pubkey_or_address = nft_object.sig_pubkey_or_address;
  } else  if (nft_object && nft_object.pubkeyhex) {
    sig_pubkey_or_address = nft_object.pubkeyhex;
  }

  let title = nft_object && nft_object.title ? nft_object.title : undefined;
  let artist = nft_object && nft_object.artist ? nft_object.artist : undefined;
  let narrative = nft_object && nft_object.narrative ? nft_object.narrative : undefined;
  let attestation = nft_object && nft_object.attestation ? nft_object.attestation : undefined;
  let acknowledgments = nft_object && nft_object.acknowledgments ? nft_object.acknowledgments : undefined;
  let tags = nft_object && nft_object.tags ? nft_object.tags.split(',') : undefined;
  let nft_flags = nft_object && nft_object.flags ? nft_object.flags.split(",") : undefined;
  let encoding = nft_object && nft_object.encoding ? nft_object.encoding : undefined;
  
  let license = nft_object && nft_object.license ? nft_object.license : undefined;
  let holder_license = nft_object && nft_object.holder_license ? nft_object.holder_license : undefined;
  let password_multihash = nft_object && nft_object.password_multihash ? nft_object.password_multihash : undefined;

  return ([
            <Col span={12} key="media">
                <Media asset={asset} />
            </Col>,
            <Col span={12} key="Top">
              <Box mx="auto" sx={{padding: '10px'}}>
                <Paper sx={{padding: '5px'}} shadow="xs">
                  <Title order={2}>
                    &quot;{title}&quot; {t('nft:nft.by')} {artist}
                  </Title>                

                  <Tabs defaultValue="NFT">
                    <Tabs.List>
                      <Tabs.Tab value="NFT">
                        {t('nft:nft.tabs.nft')}
                      </Tabs.Tab>
                      <Tabs.Tab value="Asset">
                        {t('nft:nft.tabs.asset')}
                      </Tabs.Tab>
                      <Tabs.Tab value="Tags">
                        {t('nft:nft.tabs.tags')}
                      </Tabs.Tab>
                      <Tabs.Tab value="Buy">
                        {t('nft:nft.tabs.buy')}
                      </Tabs.Tab>
                      <Tabs.Tab value="Flags">
                        {t('nft:nft.tabs.flags')}
                      </Tabs.Tab>
                      <Tabs.Tab value="Permissions">
                        {t('nft:nft.tabs.permissions')}
                      </Tabs.Tab>
                      <Tabs.Tab value="Signature">
                        {t('nft:nft.tabs.signature')}
                      </Tabs.Tab>
                      <Tabs.Tab value="License">
                        {t('nft:nft.tabs.license')}
                      </Tabs.Tab>
                      <Tabs.Tab value="JSON">
                        {t('nft:nft.tabs.json')}
                      </Tabs.Tab>
                    </Tabs.List>
                    
                    <Tabs.Panel value="NFT" pt="xs">
                      <Text size="md">
                        <b>{t('nft:nft.nft.attestation')}</b>: &quot;{attestation}&quot;
                      </Text>
                      <Text size="md">
                        <b>{t('nft:nft.nft.narrative')}</b>: &quot;{narrative}&quot;
                      </Text>
                      <Text size="md">
                        <b>{t('nft:nft.nft.acknowledgements')}</b>: &quot;{acknowledgments ? acknowledgments : 'N/A'}&quot;
                      </Text>
                    </Tabs.Panel>

                    <Tabs.Panel value="Asset" pt="xs">
                      <Group position="center" sx={{marginTop: '5px'}}>
                        <Badge>
                          {t('nft:nft.asset.name', {name: symbol ?? '???'})}
                        </Badge>

                        <Quantity />

                        <Badge>
                          {t('nft:nft.asset.filetype', {filetype: type ?? '???'})}
                        </Badge>

                        {
                          issuer
                            ? <IssuerDetails issuer={issuer} />
                            : null
                        }

                        <Tooltip
                          withArrow
                          label={
                            encoding === "base64"
                              ? t('nft:nft.asset.onChain')
                              : t('nft:nft.asset.offChain')
                            }
                        >
                          <Badge>
                            {t('nft:nft.asset.encoding', {encoding: encoding ?? '???'})}
                          </Badge>
                        </Tooltip>

                        <Tooltip
                          withArrow
                          label={
                            precision === 0
                              ? t('nft:nft.asset.precision0', {short_name: short_name})
                              : t('nft:nft.asset.precision1')
                          }
                        >
                          <Badge>
                            {t('nft:nft.asset.precisionVal', {precision: precision})}
                          </Badge>
                        </Tooltip>
                      </Group>
                    </Tabs.Panel>

                    <Tabs.Panel value="Tags" pt="xs">
                      {
                        tags && tags.length
                          ? <Group sx={{marginTop: '5px'}} position="center">
                              {
                                tags && tags.length
                                ? tags.map((tag) => {
                                    return <Badge key={`tag: ${tag}`}>
                                              {tag}
                                            </Badge>
                                  })
                                : null
                              }
                            </Group>
                          : <Text size="md">
                              {t('nft:nft.tags.noTags')}
                            </Text>
                      }
                      <br/>
                      {
                        nft_flags && nft_flags.length
                          ? <Group sx={{marginTop: '5px'}} position="center">
                              {
                                nft_flags.map((flag) => {
                                  return <Badge key={`flagchip: ${flag}`}>{flag}</Badge>
                                })
                              }
                            </Group>
                          : <Text size="md">
                              {t('nft:nft.tags.noFlags')}
                            </Text>
                      }
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="Buy" pt="xs">
                      <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                        <Buy />
                      </Group>
                      {
                        environment === 'production'
                        ? [
                          <Text size="md">
                            {t('nft:nft.buy.buyHeader')}
                          </Text>,
                          <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                            <Button
                              onClick={() => {
                                launchDEX({target: 'BitsharesOrg', symbol: symbol, market: market})
                              }}
                              sx={{m: 0.25}}
                              variant="outline"
                            >
                              Bitshares.org
                            </Button>
                            <Button
                              onClick={() => {
                                launchDEX({target: 'XBTSIO', symbol: symbol, market: market})
                              }}
                              sx={{m: 0.25}}
                              variant="outline"
                            >
                              XBTS.io
                            </Button>
                            <Tooltip
                              label={t('nft:nft.buy.desktopTooltip', {symbol})}
                              withArrow
                            >
                              <Button
                                onClick={() => {
                                  launchDEX({target: 'lightClient', symbol: symbol, market: market})
                                }}
                                sx={{m: 0.25}}
                                variant="outline"
                              >
                                {t('nft:nft.buy.desktopApp')}
                              </Button>
                            </Tooltip>
                          </Group>,
                          <Text size="lg" style={{'paddingTop': '5px'}}>
                            {t('nft:nft.buy.explorerHeader')}
                          </Text>,
                          <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                            <Button
                              sx={{m: 0.25}}
                              variant="outline"
                              href={`https://blocksights.info/#/assets/${symbol}`}
                              component="a"
                            >
                              blocksights.info
                            </Button>
                          </Group>
                        ]
                        : null
                      }
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="Flags" pt="xs">
                      {
                        asset_flags
                          ? <Group position="center">
                              {
                                Object.keys(asset_flags).map(
                                  (flag) => {
                                    const flagValue = asset_flags[flag];
                                    return flagValue === true
                                      ? <Badge leftSection={flagValue ? <IoCheckmark/> : <IoClose/>}>{flag.replace(/_/g, ' ')}</Badge>
                                      : null;
                                  }
                                ).filter(x => x)
                              }
                            </Group>
                          : <Text size="md">
                              {t('nft:nft.flags.none')}
                            </Text>
                      }
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="Permissions" pt="xs">
                      {
                        permissions
                          ? <Group position="center">
                              {
                                Object.keys(permissions).map(
                                  (permission) => {
                                    const permissionValue = permissions[permission];
                                    return (
                                      <Tooltip
                                        withArrow
                                        label={
                                          permissionValue === true || permissionValue === 'true'
                                            ? t('nft:nft.permissions.permissionTips.enabled.' + permission)
                                            : t('nft:nft.permissions.permissionTips.disabled.' + permission)
                                          }
                                        key={permission + '_tooltip'}
                                      >
                                        <Badge
                                          leftSection={permissionValue ? <IoCheckmark/> : <IoClose/>}
                                          key={permission + '_chip'}
                                        >
                                          {permission.replace(/_/g, ' ')}
                                        </Badge>
                                      </Tooltip>
                                    );
                          
                                  }
                                )
                              }
                            </Group>
                          : <Text size="md">
                              {t('nft:nft.permissions.none')}
                            </Text>
                      }
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="Signature" pt="xs">
                      <Container size="md" px="xs">
                        <Card shadow="sm" p="sm" radius="md" withBorder m="sm">
                          <Textarea
                            placeholder={nft_signature ? nft_signature : 'N/A'}
                            label={t('nft:nft.signature.label')}
                            readOnly
                            value={nft_signature ? nft_signature : 'N/A'}
                          />
                          <CopyButton value={nft_signature}>
                            {({ copied, copy }) => (
                              <Button color={copied ? 'teal' : 'blue'} style={{marginTop: '5px'}} onClick={copy}>
                                {
                                  copied
                                    ? t('nft:nft.json.copied')
                                    : t('nft:nft.json.copy')
                                }
                              </Button>
                            )}
                          </CopyButton>
                        </Card>
                      </Container>
                      <Container size="md" px="xs">
                        <Card shadow="sm" p="lg" radius="md" withBorder m="sm">
                          <Textarea
                            placeholder={sig_pubkey_or_address ? sig_pubkey_or_address : 'N/A'}
                            label={t('nft:nft.signature.address')}
                            readOnly
                            value={sig_pubkey_or_address ? sig_pubkey_or_address : 'N/A'}
                          />
                          <CopyButton value={sig_pubkey_or_address}>
                            {({ copied, copy }) => (
                              <Button color={copied ? 'teal' : 'blue'} style={{marginTop: '5px'}} onClick={copy}>
                                {
                                  copied
                                    ? t('nft:nft.json.copied')
                                    : t('nft:nft.json.copy')
                                }
                              </Button>
                            )}
                          </CopyButton>
                        </Card>
                      </Container>
                      <Container size="md" px="xs">
                        <Card shadow="sm" p="lg" radius="md" withBorder m="sm">
                          <Textarea
                            placeholder={password_multihash ? password_multihash : 'N/A'}
                            label={t('nft:nft.signature.pwd')}
                            readOnly
                            value={password_multihash ? password_multihash : 'N/A'}
                          />
                          <CopyButton value={password_multihash}>
                            {({ copied, copy }) => (
                              <Button color={copied ? 'teal' : 'blue'} style={{marginTop: '5px'}} onClick={copy}>
                                {
                                  copied
                                    ? t('nft:nft.json.copied')
                                    : t('nft:nft.json.copy')
                                }
                              </Button>
                            )}
                          </CopyButton>
                        </Card>
                      </Container>
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="License" pt="xs">
                      <Text size="md">
                        <b>{t('nft:nft.license.header1')}</b>
                        {
                          license
                            ? license
                            : t('nft:nft.license.noLicense')
                        }
                      </Text>
                      <Text size="md">
                        <b>{t('nft:nft.license.header2')}</b>
                        {
                          holder_license
                            ? holder_license
                            : t('nft:nft.license.noHoldLicense')
                        }
                      </Text>
                    </Tabs.Panel>
                    
                    <Tabs.Panel value="JSON" pt="xs">
                      <Container size="md" px="xs">
                        <Card shadow="sm" p="sm" radius="md" withBorder m="sm">
                          <Textarea
                            placeholder={asset ? JSON.stringify(asset, null, 2) : 'N/A'}
                            minRows={5}
                            readOnly
                            label={t('nft:nft.json.label')}
                            value={asset ? JSON.stringify(asset, null, 2) : 'N/A'}
                          />
                          <CopyButton value={asset ? JSON.stringify(asset, null, 2) : 'N/A'}>
                            {({ copied, copy }) => (
                              <Button color={copied ? 'teal' : 'blue'} style={{marginTop: '5px'}} onClick={copy}>
                                {
                                  copied
                                    ? t('nft:nft.json.copied')
                                    : t('nft:nft.json.copy')
                                }
                              </Button>
                            )}
                          </CopyButton>
                        </Card>
                    </Container>
                    </Tabs.Panel>
                  </Tabs>
                </Paper>
              </Box>

            </Col>,
            <Col span={12} key="back">
              <Group position="center">
              {
                favourites && favourites.length && favourites.find(f => (f.id === asset.id))
                ? <Button
                    leftIcon={<TbHeartBroken />}
                    variant="light"
                    onClick={() => {
                      removeFavourite(asset.id);
                    }}
                  >
                    {t('nft:favourite.remove')}
                  </Button>
                : <Button
                    leftIcon={<TbHeart />}
                    variant="light"
                    onClick={() => {
                      favouriteAsset();
                    }}
                  >
                    {t('nft:favourite.save')}
                  </Button>
                }
                <Button
                  variant="light"
                  onClick={() => {
                    goBack()
                  }}
                >
                  {t('nft:nft.back')}
                </Button>  
              </Group>
            </Col>
          ])

}
