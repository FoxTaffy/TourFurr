<template>
  <router-view />
  <SpeedInsights />
</template>

<script setup lang="ts">
import { SpeedInsights } from '@vercel/speed-insights/vue';
</script>
