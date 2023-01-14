import { useState, useEffect } from "react";
import { Text, Container, Grid, Col, Button, Divider, Image } from '@mantine/core';
import { useTranslation } from 'react-i18next';

import { appStore, beetStore, identitiesStore } from './lib/states';

import Mode from "./components/setup/Mode";
import Environment from "./components/setup/Environment";
import Settings from "./components/setup/Settings";

import SelectAsset from "./components/blockchain/SelectAsset";
import Search from "./components/blockchain/Search";
import Featured from "./components/blockchain/Featured";
import Portfolio from "./components/blockchain/Portfolio";
import NFT from "./components/NFT/NFT";
import Loading from "./components/setup/Loading";
import AccountMode from "./components/setup/AccountMode";
import Offline from "./components/setup/Offline";
import Favourites from "./components/blockchain/Favourites";
import './App.css'

function openURL() {
  window.electron.openURL('gallery');
}

function App() {
  const { t, i18n } = useTranslation();
  let environment = appStore((state) => state.environment);
  let mode = appStore((state) => state.mode);
  let asset = appStore((state) => state.asset);
  let nodes = appStore((state) => state.nodes);
  let setNodes = appStore((state) => state.setNodes);
  let setMode = appStore((state) => state.setMode);
  let setEnvironment = appStore((state) => state.setEnvironment);

  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let setIdentities = identitiesStore((state) => state.setIdentities);

  let setIdentity = beetStore((state) => state.setIdentity);
  let setAccount = appStore((state) => state.setAccount);

  let resetApp = appStore((state) => state.reset);
  let resetBeet = beetStore((state) => state.reset);
  let resetNodes = appStore((state) => state.reset);

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
      setLoadingNodes(false);
    }
  }, [nodes]);

  let initPrompt;
  if (!environment) {
    // Prompt the user to select a network
    initPrompt = <Environment />
  } else if (loadingNodes) {
    initPrompt = <Loading />
  } else if (!loadingNodes && !nodes || !nodes.length) {
    initPrompt = <Offline />
  } else if (!mode && !asset) {
    // What would you like to do?
    initPrompt = <Mode 
                    backCallback={() => {
                      //setIdentity()
                      resetBeet()
                      setAccount()
                      setEnvironment()
                      resetNodes()
                    }}
                  />
  } else if (mode === 'settings') {
    initPrompt = <Settings />
  } else if (mode === 'lookup') {
    // Get an account reference
    initPrompt = <AccountMode
                    backCallback={() => {
                      resetBeet()
                      setAccount()
                      setMode()
                    }}
                  />
  } else if (mode === 'search' && !asset) {
    // Search for NFTs
    initPrompt = <Search />
  } else if (mode === 'featured' && !asset) {
    // Show featured NFTs
    initPrompt = <Featured />
  } else if (!asset && mode === 'balance') {
    // Show NFTs in an account balance
    initPrompt = <Portfolio />
  } else if (!asset && mode === 'issued') {
    // Show NFTs the account has created
    initPrompt = <SelectAsset />
  } else if (mode === 'favourites') {
    // Show NFTs the account has favorited
    initPrompt = <Favourites />
  } else if (asset) {
    // An NFT has been selected
    initPrompt = <NFT />
  } else {
    initPrompt = <Text size="md">
                  {t('setup:app.error')}
                 </Text>
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
                        {t('setup:settings.settings')}
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
                      {t('setup:app.reset')}
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
