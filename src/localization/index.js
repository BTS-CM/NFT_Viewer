//const languages = ['en', 'fr', 'da', 'de', 'ee', 'es', 'it', 'ja', 'ko', 'pt', 'th', 'ukr', 'zhTW'];
const languages = ['en'];
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

export default {
  resources: translations,
  lng: 'en',
  debug: true,
  defaultNS: pages,
  fallbackLng: ['en'],
  ns: pages
};
