import i18n from "i18next";
import { initReactI18next } from "react-i18next";
const enTranslate = {};

const viTranslate = {};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translate: enTranslate,
    },
    vi: {
      translate: viTranslate,
    },
  },
  lng: "en",
  fallbackLng: "en",
  ns: ["translate"],
  interpolation: {
    escapeValue: false,
  },
});
