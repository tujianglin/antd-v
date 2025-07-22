<script lang="tsx" setup>
import { defineComponent, onMounted, ref } from 'vue';
import Portal from '..';
const Content = defineComponent({
  setup() {
    onMounted(() => {
      console.log('mounted');
    });
    return () => <div>Content</div>;
  },
});

const divRef = ref();
</script>
<template>
  <div ref="divRef" class="holder" :style="{ minHeight: '10px', border: '1px solid blue' }">
    <Portal open :get-container="() => divRef">
      <Content />
    </Portal>
  </div>
</template>
