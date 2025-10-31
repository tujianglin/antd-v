<script setup lang="ts">
import { defineExpose, nextTick, reactive, watchEffect } from 'vue';

export type BatchTask = (key: string, callback: VoidFunction) => void;

export interface BatchUpdateRef {
  batch: BatchTask;
}

// 用于存储 key -> callback 映射
const batchInfo = reactive<Record<string, VoidFunction>>({});

// 当 batchInfo 有变化时执行所有回调
watchEffect(async () => {
  const keys = Object.keys(batchInfo);
  if (keys.length > 0) {
    // 等待 DOM 更新后再执行，类似 useLayoutEffect
    await nextTick();
    keys.forEach((key) => {
      batchInfo[key]?.();
    });
    // 清空任务
    for (const key of keys) {
      delete batchInfo[key];
    }
  }
});

// 暴露 batch 方法给父组件调用
const batch: BatchTask = (key, callback) => {
  batchInfo[key] = callback;
};

defineExpose<BatchUpdateRef>({
  batch,
});
</script>
<template>
  <div style="display: none"></div>
</template>
