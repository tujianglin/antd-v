<script lang="tsx" setup>
import { reactiveComputed } from '@vueuse/core';
import { getCurrentInstance, type ImgHTMLAttributes } from 'vue';
import useStatus from '../hooks/useStatus';

interface PreviewImageProps extends /** @vue-ignore */ ImgHTMLAttributes {
  fallback?: string;
}

defineOptions({ inheritAttrs: false, compatConfig: { MODE: 3 } });

const { fallback, src, ...resetProps } = defineProps<PreviewImageProps>();

const [getImgRef, srcAndOnload] = useStatus(
  reactiveComputed(() => ({
    src,
    fallback,
  })),
);

const vm = getCurrentInstance();
const changeRef = (instance) => {
  getImgRef(instance);
  vm.exposed = instance || {};
  vm.exposeProxy = instance || {};
};
</script>
<template>
  <img :ref="changeRef" v-bind="{ ...resetProps, ...srcAndOnload, ...$attrs }" />
</template>
