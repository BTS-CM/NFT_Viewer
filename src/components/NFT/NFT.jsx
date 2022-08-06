import {
  TextInput,
  Checkbox,
  Button,
  Box,
  Badge,
  Text,
  Tabs,
  Divider,
  Title,
  Col,
  Paper,
  Group,
  Tooltip,
  Loader,
  Code
} from '@mantine/core';
import { getImage } from '../../lib/images';
import { appStore } from '../../lib/states';

import Holder from './Holder';
import IssuerDetails from './IssuerDetails';

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
  let acknowledgments = nft_object && nft_object.acknowledgments ? nft_object.acknowledgments : undefined;
  let tags = nft_object && nft_object.tags ? nft_object.tags : undefined;
  let nft_flags = nft_object && nft_object.flags ? nft_object.flags.split(",") : undefined;
  let encoding = nft_object && nft_object.encoding ? nft_object.encoding : undefined;
  
  let license = nft_object && nft_object.license ? nft_object.license : undefined;
  let holder_license = nft_object && nft_object.holder_license ? nft_object.holder_license : undefined;
  let password_multihash = nft_object && nft_object.password_multihash ? nft_object.password_multihash : undefined;


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

                <Holder id={asset.id} />

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
                      ? `With a precision of 0, '${short_name}' is a non-fungible token!`
                      : `Due to not having a precision of 0, this is a fungible token.`
                    }
                >
                  <Badge>
                    {`Precision: ${precision}`}
                  </Badge>
                </Tooltip>

                {
                  issuer
                    ? <IssuerDetails issuer={issuer} />
                    : null
                }
              </Group>
            </Tabs.Panel>

            <Tabs.Panel value="Tags" pt="xs">
              {
                tags && tags.length
                  ? <Group sx={{marginTop: '5px'}} position="center">
                      {
                        tags.map((tag) => {
                          return <Badge key={`tag: ${tag}`}>{tag}</Badge>
                        })
                      }
                    </Group>
                  : <Text>No topic/interest tags</Text>
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
                  : <Text>No NFT tags</Text>
              }
            </Tabs.Panel>
            
            <Tabs.Panel value="Buy" pt="xs">
              <Text size="lg">
                The NFT titled '${title}' (${symbol}) can be traded/transfered on the Bitshares decentralized exchange
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
                  label={`Within the desktop app search for the UIA '${symbol}'`}
                  widthArrow
                >
                  <Button
                    component="a"
                    href={`https://github.com/bitshares/bitshares-ui/releases`}
                    sx={{m: 0.25}}
                    variant="outline"
                  >
                    Desktop app
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
                  : <Text>No flags are currently enabled.</Text>
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
                                    ? t('nft.permissionTips.enabled.' + permission)
                                    : t('nft.permissionTips.disabled.' + permission)
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
                  : <Text>All permissions have been disabled.</Text>
              }
            </Tabs.Panel>
            
            <Tabs.Panel value="Signature" pt="xs">
              <Text size="lg">
                <b>Signature</b>
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
                <b>License: </b>
                {
                  license
                    ? license
                    : `The license under which this NFT has been released has not been provied.`
                }
              </Text>
              <Text>
                <b>Holder license: </b>
                {
                  holder_license
                    ? holder_license
                    : "Holder license information has not been provided."
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
