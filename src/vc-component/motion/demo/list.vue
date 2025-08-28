<script lang="tsx" setup>
import clsx from 'clsx';
import { onMounted, reactive } from 'vue';
import CSSMotionList from '../CSSMotionList.vue';
const state = reactive({
  count: 1,
  checkedMap: {},
  keyList: [],
});

const onCountChange = (e) => {
  state.count = Number(e.target.value);
};

const onFlushMotion = () => {
  const { count, checkedMap } = state;
  let keyList = [];
  for (let i = 0; i < count; i += 1) {
    if (checkedMap[i] !== false) {
      keyList.push(i);
    }
  }

  keyList = keyList.map((key) => {
    if (key === 3) {
      return { key, background: 'orange' };
    }
    return key;
  });

  state.keyList = keyList;
};

// Motion
const onCollapse = () => ({ width: 0, margin: '0 -5px 0 0' });

onMounted(() => {
  onFlushMotion();
});
</script>
<template>
  <div>
    key 3 is a different component with others.
    <div>
      <label>
        node count
        <input type="number" :min="0" :value="state.count" @change="onCountChange" />
      </label>
      <button type="button" @click="onFlushMotion">Flush Motion</button>
    </div>
    <div>
      <label v-for="(_, key) in new Array(state.count).fill(undefined)" :key="key">
        <input
          type="checkbox"
          :checked="state.checkedMap[key] !== false"
          @change="
            () => {
              state.checkedMap = { ...state.checkedMap, [key]: !(state.checkedMap[key] !== false) };
            }
          "
        />
        {{ key }}
      </label>
    </div>
    <CSSMotionList
      :keys="state.keyList"
      motion-name="transition"
      @appear-start="onCollapse"
      @enter-start="onCollapse"
      @leave-active="onCollapse"
      @visible-changed="
        (changedVisible, info) => {
          console.log('Visible Changed >>>', changedVisible, info);
        }
      "
    >
      <template #default="{ key, background, class: className, style, ref: motionRef }">
        <div :class="clsx('list-demo-block', className)" :style="{ ...style, background }" :ref="motionRef">
          <span>{{ key }}</span>
        </div>
      </template>
    </CSSMotionList>
  </div>
</template>
<style lang="less">
@import './list.less';
</style>
