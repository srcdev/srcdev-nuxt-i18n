// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  modules: ["@nuxtjs/i18n"],
  i18n: {
    defaultLocale: "en",
    langDir: "i18n/locales",
    detectBrowserLanguage: {
      useCookie: true,
      cookieKey: "i18n_redirected",
      redirectOn: "root",
    },
    locales: [
      {
        code: "en",
        language: "en-GB",
        name: "English",
        file: "en-GB.ts",
        dir: "ltr",
      },
      {
        code: "cn",
        language: "zh-CN",
        name: "简体中文",
        file: "zh-CN.ts",
        dir: "ltr",
      },
      {
        code: "ary",
        language: "ar-YE",
        name: "العربية",
        file: "ar-YE.ts",
        dir: "rtl",
      },
    ],
  },
  components: [
    {
      path: "./components",
      pathPrefix: false,
    },
  ],
  typescript: {
    strict: true,
  },
})
