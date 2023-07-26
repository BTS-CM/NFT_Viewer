import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Title,
  Text,
  SimpleGrid,
  Badge,
  Card,
  Radio,
  Table,
  Button,
  ScrollArea,
  Group,
  Center,
  Tooltip,
  Accordion,
  JsonInput,
  ActionIcon,
  TextInput,
} from '@mantine/core';

import {
  HiChevronUp,
  HiChevronDown,
  HiX,
  HiOutlineHome,
} from 'react-icons/hi';

import { appStore } from '../lib/states';

function array_move(arr, old_index, new_index) {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
}

export default function Nodes(properties) {
  const { t, i18n } = useTranslation();
  const nodes = appStore((state) => state.nodes);
  const replaceNodes = appStore((state) => state.replaceNodes);
  const removeURL = appStore((state) => state.removeURL);

  const [value, setValue] = useState('bitshares');
  const [itrValue, setItrValue] = useState(0);
  const [nodeURL, setNodeURL] = useState("");

  const referenceNodes = nodes[value];
  let tableRows = referenceNodes.map((item, i) => (
    <tr key={item}>
      <td>
        {item}
      </td>
      <td>
        <ActionIcon onClick={() => {
          setItrValue(i + 1);
          replaceNodes(value, array_move(referenceNodes, i, i - 1));
        }}
        >
          <HiChevronUp />
        </ActionIcon>
      </td>
      <td>
        <ActionIcon onClick={() => {
          setItrValue(i + 1);
          replaceNodes(value, array_move(referenceNodes, i, i + 1));
        }}
        >
          <HiChevronDown />
        </ActionIcon>
      </td>
      <td>
        <ActionIcon onClick={() => {
          setItrValue(i + 1);
          removeURL(value, item);
        }}
        >
          <HiX />
        </ActionIcon>
      </td>
    </tr>
  ));

  useEffect(() => {
    // Runs only on the first render
    tableRows = referenceNodes.map((item, i) => (
      <tr>
        <td>
          {item}
        </td>
        <td>
          <ActionIcon onClick={() => {
            setItrValue(i + 1);
            replaceNodes(value, array_move(referenceNodes, i, i - 1));
          }}
          >
            <HiChevronUp />
          </ActionIcon>
        </td>
        <td>
          <ActionIcon onClick={() => {
            setItrValue(i + 1);
            replaceNodes(value, array_move(referenceNodes, i, i + 1));
          }}
          >
            <HiChevronDown />
          </ActionIcon>
        </td>
        <td>
          <ActionIcon onClick={() => {
            setItrValue(i + 1);
            removeURL(value, item);
          }}
          >
            <HiX />
          </ActionIcon>
        </td>
      </tr>
    ));
  }, [itrValue]);

  return (
    <>
      <Card shadow="md" radius="md" padding="xl" style={{ marginTop: '25px' }}>
        <Title order={2} ta="center" mt="sm">
          {t("nodes:title")}
        </Title>
        <Center>
          <Radio.Group
            value={value}
            onChange={setValue}
            name="chosenBlockchain"
            label={t("nodes:radio.label")}
            description={t("nodes:radio.desc")}
            withAsterisk
          >
            <Group mt="xs">
              <Radio value="bitshares" label="Bitshares" />
              <Radio value="bitshares_testnet" label="Bitshares (Testnet)" />
            </Group>
          </Radio.Group>
        </Center>
      </Card>
      <Card shadow="md" radius="md" padding="xl" style={{ marginTop: '25px' }}>
        <Table>
          <thead>
            <tr>
              <th colSpan={4}>
                {t("nodes:th1", { value })}
              </th>
            </tr>
          </thead>
          <tbody>
            {tableRows}
          </tbody>
        </Table>
      </Card>

      <Card shadow="md" radius="md" padding="xl" style={{ marginTop: '25px' }}>
        <Title order={4} ta="center" mt="sm">
          {t("nodes:title2", { value })}
        </Title>
        <Center>
          <TextInput
            type="string"
            placeholder={nodeURL}
            label={t("nodes:urlLabel", { value })}
            style={{ maxWidth: '350px', marginTop: '20px' }}
            onChange={(event) => setNodeURL(event.currentTarget.value)}
          />
        </Center>
        <Center>
          <Button
            mt="sm"
            onClick={() => {
              setItrValue(itrValue + 1);
              replaceNodes(value, referenceNodes.push(nodeURL));
            }}
          >
            {t("nodes:btn")}
          </Button>
        </Center>
      </Card>

      <Link style={{ textDecoration: 'none' }} to="/">
        <Button
          compact
          mt="sm"
          sx={{ margin: '2px' }}
          variant="outline"
          leftIcon={<HiOutlineHome />}
        >
          {t("app:menu.home")}
        </Button>
      </Link>
    </>
  );
}
