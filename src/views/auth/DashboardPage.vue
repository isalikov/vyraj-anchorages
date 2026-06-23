<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

// `user` is populated by the router guard (auth.init → GET /auth/me).
const auth = useAuthStore()
</script>

<template>
  <main>
    <h1>Protected page</h1>
    <pre>{{ JSON.stringify(auth.user, null, 2) }}</pre>
  </main>
</template>
