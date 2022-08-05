
import { useEffect, useState } from 'react';
import { 
  TextInput,
  ActionIcon,
  useMantineTheme,
  Button,
  Box,
  Text,
  Loader,
  Col,
  Paper
} from '@mantine/core';
import { IconSearch, IconArrowRight, IconArrowLeft } from '@tabler/icons';

//import { Apis } from "bitsharesjs-ws";

export default function Search(properties) {
  const theme = useMantineTheme();

  const setAsset = properties.setAsset;
  const setMode = properties.setMode;
  const setNodes = properties.setNodes;

  const setProdConnection = properties.setProdConnection;
  const setTestnetConnection = properties.setTestnetConnection;

  const environment = properties.environment;
  const nodes = properties.nodes;
  const wsURL = properties.wsURL;

  const [searchResult, setSearchResult] = useState();
  const [searchInput, setSearchInput] = useState();
  const [tries, setTries] = useState(0);
  const [inProgress, setInProgress] = useState(false);

  function increaseTries() {
    let newTries = tries + 1;
    setSearchResult();
    setTries(newTries);
  }
  
  function changeURL() {
    let nodesToChange = nodes;
    nodesToChange.push(nodesToChange.shift()); // Moving misbehaving node to end
    setNodes(nodesToChange);
    console.log(`Setting new node connection to: ${nodesToChange[0].url}`)
    if (environment === 'production') {
      setProdConnection(nodesToChange[0].url);
    } else {
      setTestnetConnection(nodesToChange[0].url);
    }
  }

  /**
   * @param {Object} asset 
   */
  function chosenAsset(asset) {
    setAsset(asset);    
  }

  /*
  async function performSearch() {
    setInProgress(true);
    setSearchResult();

    try {
      await Apis.instance(wsURL, true).init_promise;
    } catch (error) {
      console.log(error);
      changeURL();
      setInProgress(false);
      return;
    }
    
    let asset_search_results;
    try {
      asset_search_results = await Apis.instance().db_api().exec("lookup_asset_symbols", [[searchInput]])
    } catch (error) {
      console.log(error);
      setInProgress(false);
      return;
    }
    
    console.log(asset_search_results)

    

    let accountAssets = fullAccounts[0][1].assets;

    let identifiedNFTs = assetsDetails.filter(asset => {
      if (
          asset.options &&
          asset.options.description &&
          asset.options.description.length &&
          asset.options.description.includes("media_png_multihashes") || asset.options.description.includes("media_PNG_multihashes") ||
          asset.options.description.includes("media_gif_multihashes") || asset.options.description.includes("media_GIF_multihashes") ||
          asset.options.description.includes("media_jpeg_multihash") || asset.options.description.includes("media_JPEG_multihash")
      ) {
        return true;
      } else {
        return false;
      }
    })

    setSearchResult(identifiedNFTs);
    
    setInProgress(false);
  }
  */
  let topText;
  if (inProgress) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="md">
                  Searching
                </Text>
              </span>;
  } else if (!searchResult) {
    topText = <span>
                <Text size="md">
                  Search for NFTs
                </Text>
              </span>
  } else if (!inProgress && !searchResult.length) {
    topText = <span>
                <Text size="md">
                  No search results for input
                </Text>
              </span>
  } else {
    topText = <span>
                <Text size="md">
                  NFT search results
                </Text>
              </span>
  }

  /*

  let buttonList = searchResult && searchResult.length
                    ? searchResult.map(asset => {
                        return <Button
                                  compact
                                  sx={{margin: '2px'}}
                                  variant="outline"
                                  key={`button.${asset.id}`}
                                  onClick={() => {
                                    chosenAsset(asset)
                                  }}
                                >
                                  {asset.symbol}: {asset.id}
                                </Button>
                      })
                    : null;

  <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
    {
      buttonList
    }
  </SimpleGrid>

  */

  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          {
            topText
          }

          <TextInput
            icon={<IconSearch size={18} stroke={1.5} />}
            radius="xl"
            size="md"
            onChange={e => setSearchInput(e.target.value)}
            rightSection={
              <ActionIcon
                size={32}
                radius="xl"
                color={theme.primaryColor}
                onClick={() => {
                  performSearch()
                }}
                variant="filled"
              >
                  <IconArrowRight size={18} stroke={1.5} />
              </ActionIcon>
            }
            placeholder="Search questions"
            rightSectionWidth={42}
          />

          <Button
            sx={{marginTop: '15px', marginRight: '5px'}}
            onClick={() => {
              increaseTries()
            }}
          >
            Refresh
          </Button>
          <Button
            sx={{marginTop: '15px'}}
            onClick={() => {
              setMode()
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Col>
  );
}
