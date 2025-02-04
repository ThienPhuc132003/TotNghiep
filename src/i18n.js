import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enLogin from "./Language/English/enLogin.json";
import viLogin from "./Language/Vietnamese/viLogin.json";
import enRegister from "./Language/English/enRegister.json";
import viRegister from "./Language/Vietnamese/viRegister.json";
import enCommon from "./Language/English/enCommon.json";
import viCommon from "./Language/Vietnamese/viCommon.json";
import enDashboard from "./Language/English/enDashBoard.json";
import viDashboard from "./Language/Vietnamese/viDashBoard.json";
import enAdmin from "./Language/English/enAdmin.json";
import viAdmin from "./Language/Vietnamese/viAdmin.json";
import enMajor from "./Language/English/enMajor.json";
import viMajor from "./Language/Vietnamese/viMajor.json";
const enTranslate = {
  ...enLogin,
  ...enRegister,
  ...enCommon,
  ...enDashboard,
  ...enAdmin,
  ...enMajor,
};

const viTranslate = {
  ...viLogin,
  ...viRegister,
  ...viCommon,
  ...viDashboard,
  ...viAdmin,
  ...viMajor,
};

i18n.use(initReactI18next).init({
  resources: {
    en: {
      translate: enTranslate,
    },
    vi: {
      translate: viTranslate,
    },
  },
  lng: "vi",
  fallbackLng: "en",
  ns: ["translate"],
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
