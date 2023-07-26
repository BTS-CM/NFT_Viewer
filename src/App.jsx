import { useState, useEffect } from "react";
import {
  Container,
  Grid,
  Col,
  Button,
  Divider,
  Image,
  Menu,
  ScrollArea,
} from '@mantine/core';
import { useTranslation } from 'react-i18next';

import {
  Link,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';

import {
  HiOutlineQuestionMarkCircle,
  HiOutlineHome,
  HiWifi,
  HiMenu,
  HiOutlineChevronRight,
  HiOutlineHeart,
  HiOutlineCake,
  HiOutlineUserCircle,
  HiSearch,
  HiOutlineGlobe
} from "react-icons/hi";

import {
  HiOutlineWallet,
  HiLanguage,
} from "react-icons/hi2";

import { appStore, beetStore, identitiesStore, localePreferenceStore } from './lib/states';

import Home from "./pages/Home";
import Search from "./pages/Search";
import Featured from "./pages/Featured";
import Portfolio from "./pages/Portfolio";
import Issuer from "./pages/Issuer";
import NFT from "./pages/NFT";
import Favourites from "./pages/Favourites";
import Faq from "./pages/Faq";
import Nodes from "./pages/Nodes";

import ipfsJSON from './config/ipfs.json';

import './App.css'

/**
 * Tell electron to open a pre-approved external URL
 * @param {String} loc
 */
function openURL(loc) {
  if ([ 'gallery', 'viewer', 'airdrop', 'beet', 'nft_tool'].includes(loc)) {
    window.electron.openURL(loc);
  }
}

function App() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  let environment = appStore((state) => state.environment);

  let isLinked = beetStore((state) => state.isLinked);
  let identity = beetStore((state) => state.identity);
  let setIdentities = identitiesStore((state) => state.setIdentities);

  const locale = localePreferenceStore((state) => state.locale);
  const ipfsGateway = localePreferenceStore((state) => state.ipfsGateway);
  const changeLocale = localePreferenceStore((state) => state.changeLocale);
  const changeIPFSGateway = localePreferenceStore((state) => state.changeIPFSGateway);

  let resetApp = appStore((state) => state.reset);
  let resetBeet = beetStore((state) => state.reset);

  function reset() {
    resetApp();
    resetBeet();
    navigate(`/`)
  }

  useEffect(() => {
    if (isLinked && identity) {
      setIdentities(identity);
    }
  }, [isLinked, identity]);

  /**
   * Set the i18n locale
   * @param {String} newLocale
   */
  function setLanguage(newLocale) {
    try {
      i18n.changeLanguage(newLocale);
    } catch (error) {
      console.log(error);
      return;
    }

    try {
      changeLocale(newLocale);
    } catch (error) {
      console.log(error);
    }
  }

  function setIPFSGateway(newGateway) {
    try {
      changeIPFSGateway(newGateway);
    } catch (error) {
      console.log(error);
    }
  }

  let caption;
  if (environment) {
    caption = environment === 'bitshares' ? 'Bitshares' : 'Testnet BTS';
  }

  const languages = [
    { value: 'en', label: 'English' },
    { value: 'da', label: 'Dansk' },
    { value: 'de', label: 'Deutsche' },
    { value: 'et', label: 'Eesti' },
    { value: 'es', label: 'Español' },
    { value: 'fr', label: 'Français' },
    { value: 'it', label: 'Italiano' },
    { value: 'ja', label: '日本語' },
    { value: 'ko', label: '한국어' },
    { value: 'pt', label: 'Português' },
    { value: 'th', label: 'ไทย' },
  ];

  const localeItems = languages.map((lang) => (
    <Menu.Item key={`lang_${lang.value}`} onClick={() => setLanguage(lang.value)}>
      { lang.label }
    </Menu.Item>
  ));

  const ipfsItems = ipfsJSON.map((ipfs) => {
    return {
      value: ipfs,
      label: ipfs.replace('https://', '').replace('/', '')
    }
  })
  .map((ipfs) => (
    <Menu.Item
      key={`ipfs_${ipfs.value}`}
      onClick={() => setIPFSGateway(ipfs.value)}
    >
      {ipfs.value === ipfsGateway ? <HiOutlineChevronRight /> : ''} { ipfs.label }
    </Menu.Item>
  ));


  return (
    <div className="App">
      <header className="App-header">
        <Container>
          <Grid key={"about"} grow>
          <Col mt="xl" ta="left" span={1}>
              <Menu shadow="md" width={200} position="right-start">
                <Menu.Target>
                  <Button leftIcon={<HiMenu />} variant="gradient">
                    {t("app:menu.btn")}
                  </Button>
                </Menu.Target>

                <Menu.Dropdown>
                  <Menu.Label>{t("app:menu.label")}</Menu.Label>
                  <Link style={{ textDecoration: 'none' }} to="/">
                    <Menu.Item icon={<HiOutlineHome />}>
                      {t("app:menu.home")}
                    </Menu.Item>
                  </Link>
                  <Menu.Divider />
                  <Link style={{ textDecoration: 'none' }} to="./featured/">
                    <Menu.Item icon={<HiOutlineCake />}>
                      {t("app:menu.featured")}
                    </Menu.Item>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} to="./portfolio/">
                    <Menu.Item icon={<HiOutlineWallet />}>
                      {t("app:menu.portfolio")}
                    </Menu.Item>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} to="./issuer/">
                    <Menu.Item icon={<HiOutlineUserCircle />}>
                      {t("app:menu.issuer")}
                    </Menu.Item>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} to="./favourites/">
                    <Menu.Item icon={<HiOutlineHeart />}>
                      {t("app:menu.favourites")}
                    </Menu.Item>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} to="./search/">
                    <Menu.Item icon={<HiSearch />}>
                      {t("app:menu.search")}
                    </Menu.Item>
                  </Link>
                  <Menu.Divider />
                  <Link style={{ textDecoration: 'none' }} to="./faq">
                    <Menu.Item icon={<HiOutlineQuestionMarkCircle />}>
                      {t("app:menu.faq")}
                    </Menu.Item>
                  </Link>
                  <Link style={{ textDecoration: 'none' }} to="./nodes">
                    <Menu.Item icon={<HiWifi />}>
                      {t("app:menu.changeNodes")}
                    </Menu.Item>
                  </Link>
                </Menu.Dropdown>
              </Menu>
              <br />
              <Menu shadow="md" mt="sm" width={200} position="right-start">
                <Menu.Target>
                  <Button compact leftIcon={<HiLanguage />} variant="light">
                    { languages.find((x) => x.value === locale).label }
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <ScrollArea h={200}>
                    { localeItems }
                  </ScrollArea>
                </Menu.Dropdown>
              </Menu>
              <br />
              <Menu shadow="md" mt="sm" width={200} position="right-start">
                <Menu.Target>
                  <Button compact leftIcon={<HiOutlineGlobe />} variant="light">
                    IPFS
                  </Button>
                </Menu.Target>
                <Menu.Dropdown>
                  <ScrollArea h={200}>
                    { ipfsItems }
                  </ScrollArea>
                </Menu.Dropdown>
              </Menu>
            </Col>

            <Col ta="Center" span={9}>
              <div style={{ width: 350, marginLeft: 'auto', marginRight: 'auto' }}>
                <Image
                  radius="md"
                  src="./logo2.png"
                  alt="Bitshares logo"
                  caption={`${caption ?? ''} NFT viewer`}
                />
              </div>
            </Col>
            
            <Col span={12}>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/favourites" element={<Favourites />} />
                <Route path="/favourites/:env" element={<Favourites />} />
                <Route path="/featured" element={<Featured />} />
                <Route path="/featured/:env" element={<Featured />} />
                <Route path="/nft" element={<NFT />} />
                <Route path="/nft/:env/:symbol" element={<NFT />} />
                <Route path="/portfolio" element={<Portfolio />} />
                <Route path="/portfolio/:env/:id" element={<Portfolio />} />
                <Route path="/issuer" element={<Issuer />} />
                <Route path="/issuer/:env/:id" element={<Issuer />} />
                <Route path="/search" element={<Search />} />
                <Route path="/faq" element={<Faq />} />
                <Route path="/nodes" element={<Nodes />} />
              </Routes>
            </Col>

            <Col span={12}>
              <span>
                <Divider></Divider>
                <Button 
                  variant="default" color="dark"
                  sx={{marginTop: '15px', marginRight: '5px'}}
                  onClick={() => {
                    openURL('gallery')
                  }}
                >
                  NFTEA Gallery
                </Button>
                
                <Button
                  variant="default"
                  color="dark"
                  sx={{ marginTop: '15px', marginRight: '5px' }}
                  onClick={() => {
                    openURL('beet');
                  }}
                >
                  BEET wallet
                </Button>
                <Button
                  variant="default"
                  color="dark"
                  sx={{ marginTop: '15px', marginRight: '5px' }}
                  onClick={() => {
                    openURL('airdrop');
                  }}
                >
                  Airdrop Tool
                </Button>
                <Button
                  variant="default"
                  color="dark"
                  sx={{ marginTop: '15px', marginRight: '5px' }}
                  onClick={() => {
                    openURL('nft_tool');
                  }}
                >
                  NFT Tool
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
