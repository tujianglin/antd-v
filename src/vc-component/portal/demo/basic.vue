<script lang="tsx" setup>
import clsx from 'clsx';
import { computed, onBeforeMount, ref } from 'vue';
import Portal from '../index.vue';

const show = ref(true);
const customizeContainer = ref(false);
const lock = ref(true);

const divRef = ref<HTMLDivElement>(null);

onBeforeMount(() => {
  console.log('Demo mount!!');
});
const getContainer = computed(() => (customizeContainer.value ? () => divRef.value : undefined));
const contentCls = computed(() => (customizeContainer.value ? '' : 'abs'));
</script>
<template>
  <div :style="{ height: '200vh' }">
    <div :style="{ border: '2px solid red' }">Real Version: VUE3</div>
    <div style="margin: 0 200px">
      <button @click="show = !show">show: {{ show }}</button>
      <button @click="customizeContainer = !customizeContainer">customizeContainer: {{ customizeContainer }}</button>
      <button @click="lock = !lock">lock: {{ lock }}</button>
    </div>
    <div id="customize" ref="divRef" :style="{ border: '1px solid green', minHeight: '10px' }"></div>
    <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
      <p :class="clsx(contentCls, 'root')">Hello Root</p>
      <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
        <p :class="clsx(contentCls, 'parent')">Hello Parent</p>
        <Portal :open="show" :get-container="getContainer" :auto-lock="lock">
          <p :class="clsx(contentCls, 'children')">Hello Children</p>
        </Portal>
      </Portal>
    </Portal>
  </div>
</template>
<style>
.root {
  top: 0;
}

.parent {
  top: 50px;
}

.children {
  top: 100px;
}

.abs {
  position: absolute;
  left: 0;
  z-index: 999999;
  background: red;
}
</style>
