<script lang="tsx" setup>
import clsx from 'clsx';
import { ref } from 'vue';
import CSSMotion from '..';
import { MotionProvider } from '../context';

const show = ref(true);
const motion = ref(false);

const onPrepare = (node: HTMLElement, a) => {
  console.log(`🔥 ${a}prepare`, node);

  return new Promise((resolve) => {
    setTimeout(resolve, 500);
  });
};
</script>
<template>
  <MotionProvider :value="{ motion }">
    <button @click="show = !show">show: {{ show }}</button>
    <button @click="motion = !motion">motion: {{ motion }}</button>
    <CSSMotion
      :visible="show"
      motion-name="transition"
      leaved-class-name="hidden"
      motion-appear
      @appear-prepare="(e) => onPrepare(e, 'appear')"
      @enter-prepare="(e) => onPrepare(e, 'enter')"
      @leave-prepare="(e) => onPrepare(e, 'leave')"
      @visible-changed="(visible) => console.log('Visible Changed:', visible)"
    >
      <template #default="{ style, class: className, ref: domRef }">
        <div :class="clsx('demo-block', className)" :style="style" :ref="domRef"></div>
        <ul>
          <li>Class: {{ className }}</li>
          <li>Style: {{ style }}</li>
        </ul>
      </template>
    </CSSMotion>
  </MotionProvider>
</template>
<style lang="less">
@import './basic.less';
</style>
