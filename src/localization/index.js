import i18next from 'i18next';
import { initReactI18next } from "react-i18next";
import resources from 'virtual:i18next-loader'
import { localePreferenceStore } from '../lib/states';

const pages = [
    'beet',
    'blockchain',
    'nft',
    'setup',
    'getAccount',
    'modal'
];

const oldLocale = localePreferenceStore.getState().locale;
const locale = oldLocale || 'en';

i18next
  .use(initReactI18next)
  .init({
    resources: resources,
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