<script lang="tsx" setup>
import { defineComponent, onMounted, ref } from 'vue';
import Portal from '..';
const Child = defineComponent({
  setup() {
    const divRef = ref();

    onMounted(() => {
      const path: Element[] = [];

      for (let cur: HTMLElement = divRef.value; cur; cur = cur.parentElement) {
        path.push(cur);
      }

      console.log('Path:', path);
    });
    return () => (
      <pre ref={divRef} style={{ border: '1px solid red' }}>
        <p>Hello Child version</p>
      </pre>
    );
  },
});

const show1 = ref(false);
const show2 = ref(false);
</script>
<template>
  <button @click="show1 = !show1">Trigger Inner Child</button>
  <button @click="show2 = !show2">Trigger Outer Child</button>
  <Portal open>
    <div :style="{ border: '1px solid red' }">
      <p>Hello Root {version}</p>
      <Portal v-if="show1" open>
        <Child />
      </Portal>
    </div>
  </Portal>
  <Portal v-if="show2" open>
    <Child />
  </Portal>
</template>
