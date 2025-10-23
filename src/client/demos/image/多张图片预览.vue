<script lang="tsx" setup>
import { Image } from '@/components';
</script>
<template>
  <Image.PreviewGroup
    :preview="{
      onChange: (current, prev) => console.log(`current index: ${current}, prev index: ${prev}`),
    }"
  >
    <Image alt="svg image" :width="200" src="https://gw.alipayobjects.com/zos/rmsportal/KDpgvguMpGfqaHPjicRK.svg" />
    <Image :width="200" alt="svg image" src="https://gw.alipayobjects.com/zos/antfincdn/aPkFc8Sj7n/method-draw-image.svg" />
  </Image.PreviewGroup>
</template>
