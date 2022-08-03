import { Button, Box, Text, Col, Paper } from '@mantine/core';

export default function Mode(properties) {
  const setMode = properties.setMode;
  
  return (
    <Col span={12}>
      <Paper padding="sm" shadow="xs">
        <Box mx="auto" sx={{padding: '10px'}}>
          <span>
            <Text size="md">
              What do you want to do?
            </Text>
            <Button
              sx={{marginTop: '15px', marginRight: '5px', marginLeft: '5px'}}
              onClick={() => {
                setMode('search');
              }}
            >
              Search for NFT
            </Button>
            <Button
              sx={{marginTop: '15px', marginRight: '5px'}}
              onClick={() => {
                setMode('balance');
              }}
            >
              View NFT portfolio
            </Button>
            <Button
              sx={{marginTop: '15px', marginRight: '5px'}}
              onClick={() => {
                setMode('issued');
              }}
            >
              View issued NFTs
            </Button>
            <Button
              sx={{marginTop: '15px', marginRight: '5px'}}
              onClick={() => {
                setMode('featured');
              }}
            >
              View featured
            </Button>
          </span>
        </Box>
      </Paper>
    </Col>
  );
}
