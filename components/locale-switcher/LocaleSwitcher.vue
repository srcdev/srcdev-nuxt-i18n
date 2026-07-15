<template>
  <div class="locale-switcher">
    <button
      v-for="loc in locales"
      :key="loc.code"
      :class="{ active: loc.code === locale }"
      @click="switchLocale(loc.code)"
    >
      {{ loc.name }}
    </button>
  </div>
</template>

<script setup lang="ts">
const { locales, locale, setLocale } = useI18n()

const switchLocale = async (localeCode: string) => {
  await setLocale(localeCode as typeof locale.value)
}
</script>

<style lang="css">
.locale-switcher {
  display: flex;
  gap: 10px;
  padding: 10px;

  button {
    background-color: lightgray;
    color: black;
    border: none;
    padding: 5px 10px;
    cursor: pointer;
    transition: background-color 0.3s;

    &:hover {
      background-color: #c0c0c0;
    }

    &.active {
      background-color: #007acc;
      color: white;
    }
  }
}
</style>
