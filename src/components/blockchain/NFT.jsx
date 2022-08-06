import { useState } from 'react';
import { TextInput, Checkbox, Button, Box, Text, Tabs, Divider, Title, Col, Paper, Group, Tooltip, Loader } from '@mantine/core';
import { getImage } from '../../lib/images';
import { appStore, beetStore } from '../../lib/states';

function back() {
  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);
  setAsset();
  setMode();
}

    /*
    let description = JSON.parse(asset.options.description);

    let output;
    if (description.nft_object.media_png_multihashes || description.nft_object.media_PNG_multihashes) {
      let hashes = description.nft_object.media_png_multihashes ?? description.nft_object.media_PNG_multihashes;
      output = hashes.map(value => { return {url: value.url, type: 'PNG'}});
    } else if (description.nft_object.media_gif_multihashes || description.nft_object.media_GIF_multihashes) {
      let hashes = description.nft_object.media_png_multihashes ?? description.nft_object.media_PNG_multihashes;
      output = hashes.map(value => { return {url: value.url, type: 'GIF'}});
    } else if (description.nft_object.media_jpeg_multihash || description.nft_object.media_JPEG_multihash) {
      let hashes = description.nft_object.media_jpeg_multihash ?? description.nft_object.media_JPEG_multihash;
      output = hashes.map(value => { return {url: value.url, type: 'JPEG'}});
    }
    
    setImages(output);
    */

export default function NFT(properties) {
  const asset = properties.asset;
 
  let issuer = asset ? asset.issuer : undefined;
  let precision = asset ? asset.precision : undefined;
  let symbol = asset ? asset.symbol : undefined;

  let permissions = asset ? asset.permissions : undefined;
  let asset_flags = asset ? asset.flags : undefined;
  let dynamic_asset_data = asset ? asset.dynamic_asset_data : undefined;
  let current_supply = dynamic_asset_data ? dynamic_asset_data.current_supply : undefined;

  let description = asset && asset.description ? asset.description : undefined;
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
  let encoding = nft_object && nft_object.encoding ? nft_object.encoding : undefined;

  return (
    <Col span={12} key="Top">
      <Paper sx={{padding: '5px'}} shadow="xs">
          <Title order={2}>
            &quot;{title}&quot; by {artist}
          </Title>

          <Tabs defaultValue="">
            <Tabs.List>
              <Tabs.Tab value="NFT">NFT</Tabs.Tab>
              <Tabs.Tab value="Asset">Asset</Tabs.Tab>
              <Tabs.Tab value="Tags">Tags</Tabs.Tab>
              <Tabs.Tab value="Buy">Buy</Tabs.Tab>
              <Tabs.Tab value="Flags">Flags</Tabs.Tab>
              <Tabs.Tab value="Permissions">Permissions</Tabs.Tab>
              <Tabs.Tab value="Signature">Signature</Tabs.Tab>
              <Tabs.Tab value="License">License</Tabs.Tab>
              <Tabs.Tab value="JSON">JSON</Tabs.Tab>
            </Tabs.List>
            
            <Tabs.Panel value="NFT" pt="xs">
              <Text>
                <b>Attestation</b>: &quot;{attestation}&quot;
              </Text>
              <Text>
                <b>Narrative</b>: &quot;{narrative}&quot;
              </Text>
              <Text>
                <b>Acknowledgments</b>: &quot;{acknowledgments ? acknowledgments : 'N/A'}&quot;
              </Text>
            </Tabs.Panel>

            <Tabs.Panel value="Asset" pt="xs">
              <Group position="center" sx={{marginTop: '5px'}}>
                <Badge>
                  {`Name: ${symbol ? symbol : '???'}`}
                </Badge>

                {holder}

                <Badge>
                  {`Quantity: ${current_supply ? current_supply : '???'}`}
                </Badge>

                <Badge>
                  {`File type: ${type ? type : '???'}`}
                </Badge>

                <Tooltip
                  withArrow
                  label={
                    encoding === "base64"
                      ? 'on chain'
                      : 'off chain'
                    }
                >
                  <Badge>
                    {`Encoding: ${encoding ? encoding : '???'}`}
                  </Badge>
                </Tooltip>

                <Tooltip
                  withArrow
                  label={
                    precision === 0
                      ? t('nft.asset.precision_good', {short_name: short_name})
                      : t('nft.asset.precision_bad')
                    }
                >
                  <Badge>
                    {`${t('nft.asset.precision')}: ${precision}`}
                  </Badge>
                </Tooltip>

                {detailsOfIssuer}
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="Tags" pt="xs">
              {
                tagChips && tagChips.length
                  ? <Group sx={{marginTop: '5px'}} position="center">{tagChips}</Group>
                  : <Text>{t('nft.tags.no_tags')}</Text>
              }
              <br/>
              {
                nftFlagChips && nftFlagChips.length
                  ? <Group sx={{marginTop: '5px'}} position="center">{nftFlagChips}</Group>
                  : <Text>{t('nft.tags.no_nft_tags')}</Text>
              }
            </Tabs.Panel>
            
            <Tabs.Panel value="Buy" pt="xs">
              <Text size="lg">
                {t('nft.buy.header', {title: title, symbol: symbol})}
              </Text>
              <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                <Button
                  component="a"
                  href={`https://wallet.bitshares.org/#/market/${symbol}_${market ? market : 'BTS'}`}
                  sx={{m: 0.25}}
                  variant="outline"
                >
                  Bitshares.org
                </Button>
                <Button
                  component="a"
                  href={`https://ex.xbts.io/market/${symbol}_${market ? market : 'BTS'}`}
                  sx={{m: 0.25}}
                  variant="outline"
                >
                  XBTS.io
                </Button>
                <Button
                  component="a"
                  href={`https://dex.iobanker.com/market/${symbol}_${market ? market : 'BTS'}`}
                  sx={{m: 0.25}}
                  variant="outline"
                >
                  ioBanker DEX
                </Button>
                <Button
                  component="a"
                  href={`https://www.gdex.io/market/${symbol}_${market ? market : 'BTS'}`}
                  sx={{m: 0.25}}
                  variant="outline"
                >
                  GDEX.io
                </Button>
                <Tooltip
                  label={t('nft.buy.tooltip', {symbol: symbol})}
                  widthArrow
                >
                  <Button
                    component="a"
                    href={`https://github.com/bitshares/bitshares-ui/releases`}
                    sx={{m: 0.25}}
                    variant="outline"
                  >
                    {t('nft.buy.button')}
                  </Button>
                </Tooltip>
              </Group>


              <Text size="lg" style={{'paddingTop': '5px'}}>
                Bitshares explorers
              </Text>
              <Group position="center" sx={{marginTop: '5px', paddingTop: '5px'}}>
                <Button
                  component="a"
                  href={`https://cryptofresh.com/a/${symbol}`}
                  sx={{m: 0.25}}
                  variant="outline"
                >
                  cryptofresh
                </Button>
                <Button
                  sx={{m: 0.25}}
                  variant="outline"
                  href={`https://bts.ai/asset/${symbol}`}
                  component="a"
                >
                  bts.ai
                </Button>
                <Button
                  sx={{m: 0.25}}
                  variant="outline"
                  href={`https://blocksights.info/#/assets/${symbol}`}
                  component="a"
                >
                  blocksights.info
                </Button>
              </Group>
            </Tabs.Panel>
            
            <Tabs.Panel value="Flags" pt="xs">
              {
                flagChips && flagChips.length
                  ? <Group position="center">{flagChips}</Group>
                  : <Text>{t('nft.flags.none')}</Text>
              }
            </Tabs.Panel>
            
            <Tabs.Panel value="Permissions" pt="xs">
              {
                permissionChips && permissionChips.length
                  ? <Group position="center">{permissionChips}</Group>
                  : <Text>{t('nft.permissions.none')}</Text>
              }
            </Tabs.Panel>
            
            <Tabs.Panel value="Signature" pt="xs">
              <Text size="lg">
                <b>{t('nft.signature.header')}</b>
              </Text>
              <Text>
                {nft_signature ? nft_signature : 'N/A'}
              </Text>
              <Text size="lg">
                <b>Signature</b>
              </Text>
              <Text>
                {sig_pubkey_or_address}
              </Text>
              <Text size="lg">
                <b>password_multihash</b>
              </Text>
              <Text>
                {password_multihash}
              </Text>
            </Tabs.Panel>
            
            <Tabs.Panel value="License" pt="xs">
              <Text>
                <b>{t('nft.license.header1')}: </b>
                {
                  license
                    ? license
                    : t('nft.license.none1')
                }
              </Text>
              <Text>
                <b>{t('nft.license.header2')}: </b>
                {
                  holder_license
                    ? holder_license
                    : t('nft.license.none2')
                }
              </Text>
            </Tabs.Panel>
            
            <Tabs.Panel value="JSON" pt="xs">
              <Code block aria-label={"elasticSearchData"} style={{'maxWidth': '1000px'}}>
                {asset ? JSON.stringify(asset) : 'N/A'}
              </Code>
            </Tabs.Panel>
          </Tabs>

          <Button
            onClick={() => {
              back()
            }}
          >
            Go back
          </Button>   
      </Paper>
    </Col>
  )

}
