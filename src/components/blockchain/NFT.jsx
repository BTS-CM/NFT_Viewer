import { useState } from 'react';
import { TextInput, Checkbox, Button, Box, Text, Divider, Col, Paper, Group, Tooltip, Loader } from '@mantine/core';
import { getImage } from '../../lib/images';
import { appStore, beetStore } from '../../lib/states';

function back() {
  let setMode = appStore((state) => state.setMode);
  let setAsset = appStore((state) => state.setAsset);
  setAsset();
  setMode();
}

export default function NFT(properties) {
  const connection = properties.connection;
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
