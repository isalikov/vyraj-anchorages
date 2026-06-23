<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

// Wrapper for protected routes. The router guard guarantees a resolved session
// (GET /auth/me) before children render.
const auth = useAuthStore()
</script>

<template>
  <button @click="auth.logout()">Sign out</button>
  <router-view />
</template>
