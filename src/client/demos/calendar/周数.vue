<script lang="tsx" setup>
import { Calendar } from '@/components';
</script>
<template>
  <Calendar fullscreen show-week />
  <br />
  <Calendar :fullscreen="false" show-week />
</template>
