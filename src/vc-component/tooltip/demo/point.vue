<script lang="tsx" setup>
import { ref } from 'vue';
import Tooltip from '../Tooltip.vue';
const scrollRef = ref(null);
</script>
<template>
  <div style="padding: 10px">
    <div
      ref="scrollRef"
      :style="{
        border: '1px solid black',
        width: '100%',
        height: 'calc(100vh - 40px)',
        boxSizing: 'border-box',
        overflow: 'auto',
      }"
    >
      <div
        :style="{
          background: 'rgba(255,0,0,0.05)',
          width: '300%',
          height: '200%',
          position: 'relative',
        }"
      >
        <Tooltip
          placement="top"
          :styles="{
            body: {
              width: '300px',
              height: '50px',
            },
          }"
          popup-visible
        >
          <template #overlay>111</template>
          <div
            :style="{
              background: 'rgba(0,255,0,0.3)',
              width: '100px',
              height: '50px',
              position: 'absolute',
              left: '30%',
              top: '30%',
            }"
          >
            Hover Me
          </div>
        </Tooltip>
      </div>
    </div>
  </div>
</template>
