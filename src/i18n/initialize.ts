import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import zhCN from "../locales/zh-CN/app.json";

export const DEFAULT_LANGUAGE = "zh-CN";

const resources = {
  [DEFAULT_LANGUAGE]: {
    translation: zhCN,
  },
} as const;

const initialization = i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: DEFAULT_LANGUAGE,
    supportedLngs: [DEFAULT_LANGUAGE],
    fallbackLng: false,
    defaultNS: "translation",
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
    detection: {
      order: ["localStorage", "htmlTag"],
      caches: ["localStorage"],
      lookupLocalStorage: "eye.language",
    },
  });

void initialization;

export { i18n };
