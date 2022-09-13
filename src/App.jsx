import { useState } from "react";
import { Text, Container, Center, Group, Grid, Col, Paper, Button, Divider, Image } from '@mantine/core'
import { appStore, beetStore, identitiesStore } from './lib/states';

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
  let environment = appStore((state) => state.environment);
  let mode = appStore((state) => state.mode);
  let asset = appStore((state) => state.asset);
  let setNodes = appStore((state) => state.setNodes);

  let connection = beetStore((state) => state.connection);
  let authenticated = beetStore((state) => state.authenticated);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let setIdentities = identitiesStore((state) => state.setIdentities);

  let resetApp = appStore((state) => state.reset);
  let resetBeet = beetStore((state) => state.reset);
  //const resetNodes = appStore((state) => state.reset);

  function reset() {
    resetApp();
    resetBeet();
    //resetNodes();
  }

  let initPrompt;
  if (!environment) {
    initPrompt = <Environment />;
  } else if (!isLinked) {
    if (!connection) {
      setNodes();
      initPrompt = <Connect />
    } else {
      initPrompt = <BeetLink />;
    }
  } else if (!mode) {
    initPrompt = <Mode />;
  } else if (mode === 'search' && !asset) {
    initPrompt = <Search />
  } else if (mode === 'featured' && !asset) {
      initPrompt = <Featured />
  } else if (!asset) {
    let userID = identity.requested.account.id;
    if (mode === 'balance') {
      initPrompt = <Portfolio userID={userID}/>
    } else if (mode === 'issued') {
      initPrompt = <SelectAsset userID={userID} />
    }
  } else if (asset) {
    let userID = identity.requested.account.id;
    initPrompt = <NFT userID={userID} />;
  } else {
    initPrompt = <Text size="md">An issue was encountered, reset and try again.</Text>
  }

  useEffect(() => {
    if (isLinked && identity) {
      setIdentities(identity);
    }
  }, [isLinked, identity]);

  let caption;
  if (environment) {
    caption = environment === 'production' ? 'Bitshares' : 'Testnet BTS';
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
                  caption={`${caption ?? ''} NFT viewer`}
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
