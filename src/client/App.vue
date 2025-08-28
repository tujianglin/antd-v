<script lang="tsx" setup>
import { useNotification } from '../vc-component/notification';
import motion from './motion';

const [api, holder] = useNotification({ motion, closable: true, stack: true });
</script>
<template>
  <button
    @click="
      () => {
        api.open({
          content: `${new Date().toISOString()}`,
        });
      }
    "
  >
    basic
  </button>

  <holder />
</template>
