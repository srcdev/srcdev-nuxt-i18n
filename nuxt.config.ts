// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2026-05-20",
  modules: ["@nuxtjs/i18n"],
  i18n: {
    defaultLocale: "en",
    langDir: "locales",
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
  vite: {
    // Pre-bundle Nuxt DevTools' client deps so Vite doesn't discover them at runtime and
    // force a page reload on first dev load (matches srcdev-nuxt-components).
    optimizeDeps: {
      include: ["@vue/devtools-core", "@vue/devtools-kit"],
    },
  },
})
