<script lang="tsx" setup>
import { defineComponent, onMounted, onUnmounted, ref } from 'vue';
import CSSMotion from '../CSSMotion.vue';
import clsx from 'clsx';

const show = ref(true);
const forceRender = ref(false);
const removeOnLeave = ref(true);
const hasMotionClassName = ref(true);
const prepare = ref(false);

const onTrigger = () => {
  show.value = !show.value;
};

const onTriggerDelay = () => {
  prepare.value = !prepare.value;
};

const onForceRender = () => {
  forceRender.value = !forceRender.value;
};

const onRemoveOnLeave = () => {
  removeOnLeave.value = !removeOnLeave.value;
};

const onTriggerClassName = () => {
  hasMotionClassName.value = !hasMotionClassName.value;
};

const onCollapse = () => {
  return { height: 0 };
};

const skipColorTransition = (_, event) => {
  // CSSMotion support multiple transition.
  // You can return false to prevent motion end when fast transition finished.
  if (event.propertyName === 'background-color') {
    return false;
  }
  return true;
};

async function forceDelay(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 2000);
  });
}

const Div = defineComponent({
  setup(props, { attrs }) {
    onMounted(() => {
      console.log('DIV >>> Mounted!');
    });
    onUnmounted(() => {
      console.log('DIV >>> Unmounted!');
    });
    return () => <div {...props} {...attrs}></div>;
  },
});
</script>
<template>
  <div>
    <label>
      <input type="checkbox" @change="onTrigger" :checked="show" />
      Show Component
    </label>
    <label>
      <input type="checkbox" @change="onTriggerClassName" :checked="hasMotionClassName" />
      hasMotionClassName
    </label>
    <label>
      <input type="checkbox" @change="onForceRender" :checked="forceRender" />
      forceRender
    </label>
    <label>
      <input type="checkbox" @change="onRemoveOnLeave" :checked="removeOnLeave" />
      removeOnLeave
      {{ removeOnLeave ? '' : ' (use leavedClassName)' }}
    </label>
    <label>
      <input type="checkbox" @change="onTriggerDelay" :checked="prepare" />
      prepare before motion
    </label>
    <div class="grid">
      <div>
        <h2>With Transition Class</h2>
        <CSSMotion
          :visible="show"
          :force-render="forceRender"
          :motion-name="hasMotionClassName ? 'transition' : null"
          :remove-on-leave="removeOnLeave"
          leaved-class-name="hidden"
          :on-appear-prepare="prepare && forceDelay"
          :on-enter-prepare="prepare && forceDelay"
          @appear-start="onCollapse"
          @enter-start="onCollapse"
          @leave-active="onCollapse"
          @enter-end="skipColorTransition"
          @leave-end="skipColorTransition"
          @visible-changed="
            (visible) => {
              console.log('Visible Changed:', visible);
            }
          "
        >
          <template #default="{ style, class: className, ref: montionRef }">
            <Div :ref="montionRef" :class="clsx('demo-block', className)" :style="style" />
          </template>
        </CSSMotion>
      </div>
    </div>
  </div>
</template>
<style lang="less">
@import './basic.less';
</style>
