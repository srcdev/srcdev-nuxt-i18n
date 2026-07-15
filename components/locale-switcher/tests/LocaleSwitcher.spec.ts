import { describe, it, expect } from "vitest"
import { mountSuspended } from "@nuxt/test-utils/runtime"
import LocaleSwitcher from "../LocaleSwitcher.vue"

describe("LocaleSwitcher", () => {
  it("renders one button per configured locale", async () => {
    const wrapper = await mountSuspended(LocaleSwitcher)
    expect(wrapper.findAll("button")).toHaveLength(3)
  })

  it("renders each locale's display name as button text", async () => {
    const wrapper = await mountSuspended(LocaleSwitcher)
    const texts = wrapper.findAll("button").map(b => b.text())
    expect(texts).toEqual(["English", "简体中文", "العربية"])
  })

  // Regression test: the original implementation used `v-for="locale in locales"`,
  // which shadowed the outer `locale` ref from useI18n(), so `locale === locale.code`
  // always compared the loop item to its own `.code` and was always false — no
  // button, including the default locale's, ever received the active class.
  it("marks the default locale's button as active", async () => {
    const wrapper = await mountSuspended(LocaleSwitcher)
    const buttons = wrapper.findAll("button")
    expect(buttons[0]?.classes()).toContain("active") // defaultLocale: "en"
    expect(buttons[1]?.classes()).not.toContain("active")
    expect(buttons[2]?.classes()).not.toContain("active")
  })

  // Note: clicking a button (and asserting on it) is deliberately not tested
  // here. It calls the real setLocale(), which schedules a cookie-write watcher
  // (detectBrowserLanguage.useCookie) that fires after this test environment's
  // `document` is torn down, producing an unhandled rejection unrelated to this
  // component's own logic. The click handler itself is a one-line pass-through
  // to setLocale() — the active-class test above already covers the only real
  // logic (the code === locale comparison).

  it("exposes locales, currentLocale, and setLocale via the default scoped slot", async () => {
    const wrapper = await mountSuspended(LocaleSwitcher, {
      slots: {
        default: `<template #default="{ locales, currentLocale }">
          <select data-testid="locale-select">
            <option v-for="loc in locales" :key="loc.code" :value="loc.code" :selected="loc.code === currentLocale">
              {{ loc.name }}
            </option>
          </select>
        </template>`,
      },
    })

    // The default button-group markup must not render when a slot is provided.
    expect(wrapper.findAll("button")).toHaveLength(0)

    const select = wrapper.find('[data-testid="locale-select"]')
    expect(select.exists()).toBe(true)
    const options = select.findAll("option")
    expect(options.map(o => o.text())).toEqual(["English", "简体中文", "العربية"])
    expect(options[0]?.attributes("selected")).toBeDefined() // currentLocale defaults to "en"
  })
})
