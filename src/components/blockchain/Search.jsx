
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
  Paper,
  SimpleGrid
} from '@mantine/core';
import { IconSearch, IconArrowRight, IconArrowLeft } from '@tabler/icons';
import { appStore } from '../../lib/states';


export default function Search(properties) {
  const theme = useMantineTheme();

  let assets = appStore((state) => state.assets);

  let fetchAssets = appStore((state) => state.fetchAssets);
  let clearAssets = appStore((state) => state.clearAssets);
  let setAsset = appStore((state) => state.setAsset);
  let goBack = appStore((state) => state.back);

  const [searchInput, setSearchInput] = useState();
  const [inProgress, setInProgress] = useState(false);

  function back() {
    goBack();
  }
  
  /**
   * @param {Object} asset 
   */
  function chosenAsset(asset) {
    setAsset(asset);
  }

  async function performSearch() {
    setInProgress(true);
    clearAssets();

    if (!searchInput || !searchInput.length) {
      console.log('No search input')
      return;
    }

    try {
      await fetchAssets([searchInput.toUpperCase()])
    } catch (error) {
      console.log(error);
      setInProgress(false);
      performSearch();
      return;
    }
    
    setInProgress(false);
  }

  let topText;
  if (inProgress) {
    topText = <span>
                <Loader variant="dots" />
                <Text size="md">
                  Searching
                </Text>
              </span>;
  } else if (!assets) {
    topText = <span>
                <Text size="md">
                  Search for NFTs
                </Text>
              </span>
  } else if (!inProgress && !assets.length) {
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

  let buttonList = assets && assets.length
                    ? assets.map(asset => {
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
            placeholder="1.3.x or symbol"
            rightSectionWidth={42}
          />

          <SimpleGrid cols={3} sx={{marginTop: '10px'}}>
            {
              buttonList
            }
          </SimpleGrid>

          <Button
            variant="light"
            sx={{marginTop: '15px'}}
            onClick={() => {
              back()
            }}
          >
            Back
          </Button>
        </Box>
      </Paper>
    </Col>
  );
}
