<script lang="tsx" setup>
import { ref } from 'vue';
import Tooltip from '../Tooltip.vue';

const visible = ref(false);

const onVisibleChange = (val: boolean) => {
  visible.value = val;
};
</script>
<template>
  <div>
    <div :style="{ marginTop: '300px', marginLeft: '100px', marginBottom: '100px' }">
      <Tooltip
        :visible="visible"
        :motion="{ motionName: 'rc-tooltip-zoom' }"
        @visible-change="{ onVisibleChange }"
        trigger="click"
      >
        <template #overlay>1</template>
        <a href="#" @click.prevent=""> trigger </a>
      </Tooltip>
    </div>
    <button type="button" @click="visible = !visible">destroy</button>
  </div>
</template>
