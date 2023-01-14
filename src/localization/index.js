import i18next from 'i18next';
import { initReactI18next } from "react-i18next";

import { localePreferenceStore } from '../lib/states';

const languages = ['en','da', 'de', 'et', 'es', 'fr', 'it', 'ja', 'ko', 'pt', 'th'];
const pages = [
    'beet',
    'blockchain',
    'nft',
    'setup'
];

const translations = {};
languages.forEach((language) => {
  const localPages = {};
  pages.forEach((page) => {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const pageContents = require(`./src/localization/locales/${language}/${page}.json`);
    localPages[page] = pageContents;
  });
  translations[language] = localPages;
});

const oldLocale = localePreferenceStore.getState().locale;
const locale = oldLocale || 'en';

i18next
  .use(initReactI18next)
  .init({
    resources: translations,
    lng: locale,
    debug: true,
    defaultNS: pages,
    fallbackLng: ['en'],
    ns: pages
  }, (err, t) => {
    if (err) {
      console.log('something went wrong loading', err);
      return;
    };
  });

export default i18next;