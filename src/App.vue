<script setup lang="ts">
import { useHead } from '@unhead/vue'

useHead({
  htmlAttrs: { lang: 'en' },
  titleTemplate: (title) => (title ? `${title} — Vyraj` : 'Vyraj'),
})
</script>

<template>
  <router-view />
</template>
