import en from './locales/en/translation.json';

export type TranslationSchema = typeof en;
export type TranslationKey = keyof TranslationSchema;
