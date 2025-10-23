<script lang="tsx" setup>
import { Alert } from '@/components';
</script>
<template>
  <Alert title="Warning text" banner />
  <br />
  <Alert title="Very long warning text warning text text text text text text text" banner closable />
  <br />
  <Alert :show-icon="false" title="Warning text without icon" banner />
  <br />
  <Alert type="error" title="Error text" banner />
</template>
