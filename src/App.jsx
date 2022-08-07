import { useState } from "react";
import { Text, Container, Center, Group, Grid, Col, Paper, Button, Divider, Image } from '@mantine/core'
import { appStore, beetStore } from './lib/states';

import Mode from "./components/setup/Mode";
import Environment from "./components/setup/Environment";

import Connect from "./components/beet/Connect";
import BeetLink from "./components/beet/BeetLink";
import Buy from "./components/beet/Buy";

import SelectAsset from "./components/blockchain/SelectAsset";
import Search from "./components/blockchain/Search";
import Featured from "./components/blockchain/Featured";
import Portfolio from "./components/blockchain/Portfolio";
import NFT from "./components/NFT/NFT";

import './App.css'

function openURL() {
  window.electron.openURL('gallery');
}

function App() {
  let mode = appStore((state) => state.mode);
  let asset = appStore((state) => state.asset);

  let authenticated = beetStore((state) => state.authenticated);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let connection = beetStore((state) => state.connection);

  let environment = appStore((state) => state.environment);

  const resetApp = appStore((state) => state.reset);
  const resetBeet = beetStore((state) => state.reset);
  const resetNodes = appStore((state) => state.reset);

  function reset() {
    resetApp();
    resetBeet();
    resetNodes();
  }

  let initPrompt;
  if (!environment) {
    initPrompt = <Environment />;
  } else if (!mode) {
    initPrompt = <Mode />;
  } else if (mode === 'search' && !asset) {
    initPrompt = <Search />
  } else if (mode === 'featured' && !asset) {
      initPrompt = <Featured />
  } else if ((mode === 'balance' || mode === 'issued' || mode === 'buy') && !asset) {
    if (!connection) {
      initPrompt = <Connect />;
    } else if (connection && authenticated && !isLinked) {
      initPrompt = <BeetLink connection={connection} />;
    } else {
      let userID = identity.requested.account.id;
      if (mode === 'balance') {
        initPrompt = <Portfolio userID={userID}/>
      } else if (mode === 'issued') {
        initPrompt = <SelectAsset userID={userID} />
      } else if (mode === 'buy') {
        initPrompt = <Buy userID={userID} connection={connection} asset={asset} />
      }
    }
  } else if (asset) {
    initPrompt = <NFT asset={asset} />;
  } else {
    initPrompt = <Text size="md">An issue was encountered, reset and try again.</Text>
  }

  return (
    <div className="App">
      <header className="App-header">
        <Container>
          <Grid key={"about"} grow>
            <Col span={12}>
              <div style={{ width: 350, marginLeft: 'auto', marginRight: 'auto' }}>
                <Image
                  radius="md"
                  src="./logo2.png"
                  alt="Bitshares logo"
                  caption="Bitshares NFT Viewer - Created by NFTEA Gallery"
                />
              </div>
            </Col>
            
            {
              initPrompt
            }

            <Col span={12}>
              <span>
                <Divider></Divider>
                <Button 
                  variant="default" color="dark"
                  sx={{marginTop: '15px', marginRight: '5px'}}
                  onClick={() => {
                    openURL()
                  }}
                >
                  NFTEA Gallery
                </Button>
                {
                  environment
                  ? <Button 
                      variant="outline" color="dark"
                      sx={{marginTop: '15px', marginBottom: '5px'}}
                      onClick={() => {
                        reset()
                      }}
                    >
                      Reset app
                    </Button>
                  : null
                }
              </span>
            </Col>
          </Grid>
        </Container>
      </header>
    </div>
  );
}

export default App
