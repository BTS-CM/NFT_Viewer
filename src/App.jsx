import { useState, useEffect } from "react";
import { Text, Container, Center, Group, Grid, Col, Paper, Button, Divider, Image } from '@mantine/core'
import { appStore, beetStore, identitiesStore } from './lib/states';

import Mode from "./components/setup/Mode";
import Environment from "./components/setup/Environment";
import Settings from "./components/setup/Settings";

import Connect from "./components/beet/Connect";
import BeetLink from "./components/beet/BeetLink";
import Buy from "./components/beet/Buy";

import SelectAsset from "./components/blockchain/SelectAsset";
import Search from "./components/blockchain/Search";
import Featured from "./components/blockchain/Featured";
import Portfolio from "./components/blockchain/Portfolio";
import NFT from "./components/NFT/NFT";
import Loading from "./components/setup/Loading";
import AccountMode from "./components/setup/AccountMode";
import Offline from "./components/setup/Offline";

import './App.css'

function openURL() {
  window.electron.openURL('gallery');
}

function App() {
  let environment = appStore((state) => state.environment);
  let mode = appStore((state) => state.mode);
  let asset = appStore((state) => state.asset);
  let nodes = appStore((state) => state.nodes);
  let setNodes = appStore((state) => state.setNodes);
  let setMode = appStore((state) => state.setMode);
  let setEnvironment = appStore((state) => state.setEnvironment);

  let connection = beetStore((state) => state.connection);
  let authenticated = beetStore((state) => state.authenticated);
  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let setIdentities = identitiesStore((state) => state.setIdentities);

  let resetApp = appStore((state) => state.reset);
  let resetBeet = beetStore((state) => state.reset);
  const resetNodes = appStore((state) => state.reset);

  function openSettings() {
    setMode('settings');
  }

  function reset() {
    resetApp();
    resetBeet();
    resetNodes();
  }

  const [loadingNodes, setLoadingNodes] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (environment && (!nodes || !nodes.length)) {
        setLoadingNodes(true);
        console.log('setting nodes')
        try {
          await setNodes();
        } catch (error) {
          console.log(error)
        }
        setLoadingNodes(false);
      }
    }

    fetchData();
  }, [environment, nodes]);

  useEffect(() => {
    if (nodes && nodes.length) {
      console.log({nodes})
      setLoadingNodes(false);
    }
  }, [nodes]);

  let initPrompt;
  if (!environment) {
    initPrompt = <Environment />
  } else if (loadingNodes) {
    initPrompt = <Loading />
  } else if (!loadingNodes && !nodes || !nodes.length) {
    initPrompt = <Offline />
  } else if (!mode) {
    initPrompt = <Mode 
                    backCallback={() => {
                      setEnvironment()
                      resetNodes()
                    }}
                  />
  } else if (mode === 'settings') {
    initPrompt = <Settings />
  } else if (mode === 'lookup') {
    initPrompt = <AccountMode backCallback={() => setMode()} />
  } else if (mode === 'search' && !asset) {
    initPrompt = <Search />
  } else if (mode === 'featured' && !asset) {
    initPrompt = <Featured />
  } else if (!asset) {
      if (mode === 'balance') {
        initPrompt = <Portfolio />
      } else if (mode === 'issued') {
        initPrompt = <SelectAsset />
      }
  } else if (asset) {
    initPrompt = <NFT />
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
                        sx={{marginTop: '15px', marginRight: '5px', marginBottom: '5px'}}
                        onClick={() => {
                          openSettings()
                        }}
                      >
                        Settings
                      </Button>
                    : null
                }
                
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
