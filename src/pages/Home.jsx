/* eslint-disable max-len */
import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import { useTranslation } from 'react-i18next';

import {
  Title,
  Text,
  SimpleGrid,
  Card,
  ThemeIcon,
} from '@mantine/core';

import {
  HiOutlineWifi,
  HiOutlineQuestionMarkCircle,
  HiOutlineHeart,
  HiOutlineCake,
  HiOutlineUserCircle,
  HiSearch
} from "react-icons/hi";

import {
  HiOutlineWallet
} from "react-icons/hi2";

import { tempStore, beetStore, appStore } from '../lib/states';

export default function Home(properties) {
  const { t, i18n } = useTranslation();

  const resetTemp = tempStore((state) => state.reset);
  const resetBeet = beetStore((state) => state.reset);
  const setEnvironment = appStore((state) => state.setEnvironment);

  useEffect(() => {
    resetTemp();
    resetBeet();
    setEnvironment();
  }, []);

  return (
    <>
      <Title order={2} ta="center" mt="sm">
        {t("home:title")}
      </Title>

      <Text c="dimmed" ta="center" mt="md" size="xl">
        {t("home:desc")}
      </Text>

      <SimpleGrid cols={3} spacing="xl" mt={25} breakpoints={[{ maxWidth: 'md', cols: 2 }, { maxWidth: 'sm', cols: 1 }]}>
        <Link style={{ textDecoration: 'none' }} to="/featured/">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiOutlineCake />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.featured.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.featured.desc")}
            </Text>
          </Card>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/portfolio/">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiOutlineWallet />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.portfolio.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.portfolio.desc")}
            </Text>
          </Card>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/issuer/">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiOutlineUserCircle />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.issuer.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.issuer.desc")}
            </Text>
          </Card>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/favourites/">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiOutlineHeart />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.favourites.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.favourites.desc")}
            </Text>
          </Card>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/search">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiSearch />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.search.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.search.desc")}
            </Text>
          </Card>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/faq">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiOutlineQuestionMarkCircle />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.faq.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.faq.desc")}
            </Text>
          </Card>
        </Link>
        <Link style={{ textDecoration: 'none' }} to="/nodes">
          <Card shadow="md" radius="md" padding="xl">
            <ThemeIcon variant="light" size={40} radius={40}>
              <HiOutlineWifi />
            </ThemeIcon>
            <Text fz="lg" fw={500} mt="sm">
              {t("home:grid.nodes.title")}
            </Text>
            <Text fz="sm" c="dimmed" mt="sm">
              {t("home:grid.nodes.desc")}
            </Text>
          </Card>
        </Link>
      </SimpleGrid>

      <Text c="dimmed" ta="center" mt="xl" size="xl">
        {t("home:footer")}
      </Text>
    </>
  );
}
