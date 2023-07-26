import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Container, Title, Accordion, Text, Button } from '@mantine/core';
import { Link } from 'react-router-dom';
import {
  HiOutlineHome,
} from "react-icons/hi";

export default function FAQ(properties) {
  const { t, i18n } = useTranslation();
  const faqContent = [
    'bug',
    'featured',
    'storage',
    'fileTypes',
    'why',
    'sell',
    'purchase',
    'create',
    'beet',
    'blockchains',
  ];

  const contents = faqContent.map((x) => ({
    key: x,
    control: t(`faq:${x}.control`),
    panel: t(`faq:${x}.panel`),
  }));

  return (
    <Container size="sm">
      <Title order={2} ta="center" mt="sm" style={{ marginBottom: '20px' }}>
        {t("faq:title")}
      </Title>

      <Accordion variant="separated">
        {
          contents.map((item) => (
            <Accordion.Item key={`acc_${item.key}`} value={item.key}>
              <Accordion.Control>{item.control}</Accordion.Control>
              <Accordion.Panel>
                <Text size="sm" align="left">
                  {item.panel}
                </Text>
              </Accordion.Panel>
            </Accordion.Item>
          ))
        }
      </Accordion>

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
    </Container>
  );
}
