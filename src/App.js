import { useState } from "react";
import { Text, Container, Center, Group, Grid, Col, Paper, Button, Divider, Image } from '@mantine/core'

import states from './lib/states'

import Connect from "./components/Connect";
import BeetLink from "./components/BeetLink";
import Mode from "./components/Mode";
import SelectAsset from "./components/SelectAsset";
import Search from "./components/Search";
import Featured from "./components/Featured";
import Portfolio from "./components/Portfolio";
import Buy from "./components/Buy";
import NFT from "./components/NFT";

import './App.css'

function openURL() {
  window.electron.openURL('gallery');
}

function App() {

  const [nodes, setNodes] = useState();
  const [connection, setConnection] = useState(null);
  const [authenticated, setAuthenticated] = useState(false);
  const [isLinked, setIsLinked] = useState(false);

  const [mode, setMode] = useState();
  const [asset, setAsset] = useState();

  let identity = states((state) => state.beetIdentity);
  let setIdentity = states((state) => state.setBeetIdentity);;

  let environment = states((state) => state.environment);
  let setEnvironment = states((state) => state.setEnvironment);

  let prodConnection = states((state) => state.prodNetwork);
  let setProdConnection = states((state) => state.setProdNetwork);

  let testnetConnection = states((state) => state.testNetwork);
  let setTestnetConnection = states((state) => state.setTestNetwork);

  let wsURL = environment === 'production'
                ? prodConnection
                : testnetConnection;

  function reset() {
    setConnection();
    setAuthenticated();
    setIsLinked(false);
    setIdentity(null);
    setMode();
    setAsset();
    setNodes();
  }

  let initPrompt;
  if (!mode) {
    initPrompt = <Mode setMode={setMode} />;
  } else if (mode === 'search' && !asset) {
    initPrompt = <Search
                    wsURL={wsURL}
                    nodes={nodes}
                    environment={environment}
                    setProdConnection={setProdConnection}
                    setTestnetConnection={setTestnetConnection}
                    setAsset={setAsset}
                    setMode={setMode}
                    setNodes={setNodes}
                  />
  } else if (mode === 'featured' && !asset) {
      initPrompt = <Featured
                      environment={environment}
                      setAsset={setAsset}
                      setProdConnection={setProdConnection}
                      setTestnetConnection={setTestnetConnection}
                      setNodes={setNodes}
                      setMode={setMode}
                    />
  } else if ((mode === 'balance' || mode === 'issued' || mode === 'buy') && !asset) {
    if (!connection) {
      initPrompt = <Connect
                      connection={connection}
                      setConnection={setConnection}
                      setAuthenticated={setAuthenticated}
                      setMode={setMode}
                    />;
    } else if (connection && authenticated && !isLinked) {
      initPrompt = <BeetLink
                      connection={connection}
                      setCrypto={setCrypto}
                      setEnvironment={setEnvironment}
                      setIsLinked={setIsLinked}
                      setIdentity={setIdentity}
                      setConnection={setConnection}
                      setAuthenticated={setAuthenticated}
                      setMode={setMode}
                    />;
    } else {
      let userID = identity.requested.account.id;
      if (mode === 'balance') {
        initPrompt = <Portfolio
                        userID={userID}
                        nodes={nodes}
                        environment={environment}
                        setProdConnection={setProdConnection}
                        setTestnetConnection={setTestnetConnection}
                        setAsset={setAsset}
                        setMode={setMode}
                        setNodes={setNodes}
                      />
      } else if (mode === 'issued') {
        initPrompt = <SelectAsset
                        userID={userID}
                        wsURL={wsURL}
                        nodes={nodes}
                        environment={environment}
                        setProdConnection={setProdConnection}
                        setTestnetConnection={setTestnetConnection}
                        setAsset={setAsset}
                        setMode={setMode}
                        setNodes={setNodes}
                      />
      } else if (mode === 'buy') {
        initPrompt = <Buy 
                        userID={userID}
                        nodes={nodes}
                        environment={environment}
                        setProdConnection={setProdConnection}
                        setTestnetConnection={setTestnetConnection}
                        setNodes={setNodes}
                        connection={connection}
                        setConnection={setConnection}
                        setMode={setMode}
                      />
      }
    }
  } else if (asset) {
    initPrompt = <NFT
                    asset={asset}
                    setAsset={setAsset}
                    setMode={setMode}
                    wsURL={wsURL}
                    environment={environment}
                    setProdConnection={setProdConnection}
                    setTestnetConnection={setTestnetConnection}
                  />;
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
                  isLinked
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
