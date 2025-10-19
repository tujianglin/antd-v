<script lang="tsx" setup>
import type { UploadProps } from './interface';
import Upload from './Upload.vue';

export type DraggerProps<T = any> = UploadProps<T> & { height?: number };

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { style, height, hasControlInside = false, ...restProps } = defineProps<DraggerProps>();
</script>
<template>
  <Upload :has-control-inside="hasControlInside" v-bind="restProps" type="drag" :style="{ ...style, height: `${height}px` }" />
</template>
