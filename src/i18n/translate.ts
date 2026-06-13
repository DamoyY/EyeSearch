import { i18n } from "./initialize";

export type TranslationValue = boolean | null | number | string | undefined;
export type TranslationValues = Record<string, TranslationValue>;

export function translate(key: string, values: TranslationValues = {}): string {
  const translated = i18n.t(key, {
    ...values,
    defaultValue: key,
  });

  if (typeof translated !== "string" || translated === key) {
    throw new Error(`E_I18N_MISSING_KEY:${key}`);
  }

  return translated;
}
